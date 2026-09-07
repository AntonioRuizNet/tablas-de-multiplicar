import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import { createUniqueChallengeCode, challengeUrl, normalizeChallengeTitle, normalizeTables } from "../../../lib/challenges";

async function classroomAccess(user, classroomId) {
  const room = await db.query(`SELECT id,teacher_id,name,code FROM classrooms WHERE id=$1 LIMIT 1`, [classroomId]);
  if (!room.rowCount) return null;
  const classroom = room.rows[0];
  const isOwner = classroom.teacher_id === user.id || user.role === "admin";
  if (isOwner) return { classroom, isOwner: true };
  const member = await db.query(`SELECT 1 FROM classroom_students WHERE classroom_id=$1 AND student_id=$2`, [classroomId, user.id]);
  return member.rowCount ? { classroom, isOwner: false } : null;
}

async function listClassroomChallenges(user, classroomId) {
  const access = await classroomAccess(user, classroomId);
  if (!access) return { status: 403, error: "No puedes consultar los retos de esta aula." };

  if (!access.isOwner) {
    const result = await db.query(
      `SELECT ch.id,ch.title,ch.code,ch.tables,ch.question_count,ch.due_at,ch.is_active,ch.created_at,
              a.completed_at,a.correct_count,a.wrong_count,a.duration_seconds
       FROM classroom_challenges ch
       LEFT JOIN challenge_attempts a ON a.challenge_id=ch.id AND a.user_id=$2
       WHERE ch.classroom_id=$1
       ORDER BY ch.created_at DESC`,
      [classroomId, user.id]
    );
    return { status: 200, classroom: access.classroom, challenges: result.rows.map((row) => ({ ...row, url: challengeUrl(row.code) })) };
  }

  const challenges = await db.query(
    `SELECT ch.id,ch.title,ch.code,ch.tables,ch.question_count,ch.due_at,ch.is_active,ch.created_at,
            COUNT(a.id)::int AS started,
            COUNT(a.completed_at)::int AS completed,
            COALESCE(ROUND(AVG(CASE WHEN a.completed_at IS NOT NULL THEN 100.0*a.correct_count/NULLIF(a.correct_count+a.wrong_count,0) END)),0)::int AS accuracy,
            COALESCE(ROUND(AVG(CASE WHEN a.completed_at IS NOT NULL THEN a.duration_seconds END)),0)::int AS avg_duration
     FROM classroom_challenges ch
     LEFT JOIN challenge_attempts a ON a.challenge_id=ch.id
     WHERE ch.classroom_id=$1
     GROUP BY ch.id
     ORDER BY ch.created_at DESC`,
    [classroomId]
  );

  const hardest = await db.query(
    `SELECT q.table_number,q.multiplier,
            COUNT(*)::int AS answers,
            SUM(CASE WHEN q.is_correct=false THEN 1 ELSE 0 END)::int AS errors,
            ROUND(100.0*SUM(CASE WHEN q.is_correct=false THEN 1 ELSE 0 END)/COUNT(*))::int AS error_rate
     FROM challenge_attempt_questions q
     JOIN challenge_attempts a ON a.id=q.attempt_id
     JOIN classroom_challenges ch ON ch.id=a.challenge_id
     WHERE ch.classroom_id=$1 AND q.answered_at IS NOT NULL
     GROUP BY q.table_number,q.multiplier
     HAVING COUNT(*) >= 2
     ORDER BY errors DESC,error_rate DESC,q.table_number,q.multiplier
     LIMIT 8`,
    [classroomId]
  );

  return {
    status: 200,
    classroom: access.classroom,
    challenges: challenges.rows.map((row) => ({ ...row, url: challengeUrl(row.code) })),
    hardest: hardest.rows,
  };
}

async function listMyChallenges(user) {
  const result = await db.query(
    `SELECT ch.id,ch.title,ch.code,ch.tables,ch.question_count,ch.due_at,ch.is_active,ch.created_at,
            c.id AS classroom_id,c.name AS classroom_name,u.name AS teacher_name,
            a.completed_at,a.correct_count,a.wrong_count,a.duration_seconds
     FROM classroom_students cs
     JOIN classrooms c ON c.id=cs.classroom_id
     JOIN classroom_challenges ch ON ch.classroom_id=c.id
     JOIN users u ON u.id=c.teacher_id
     LEFT JOIN challenge_attempts a ON a.challenge_id=ch.id AND a.user_id=$1
     WHERE cs.student_id=$1
     ORDER BY ch.created_at DESC`,
    [user.id]
  );
  return result.rows.map((row) => ({ ...row, url: challengeUrl(row.code) }));
}

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      if (req.query.classroomId) {
        const result = await listClassroomChallenges(user, req.query.classroomId);
        if (result.error) return res.status(result.status).json({ ok: false, error: result.error });
        return res.status(200).json({ ok: true, classroom: result.classroom, challenges: result.challenges, hardest: result.hardest || [] });
      }
      return res.status(200).json({ ok: true, challenges: await listMyChallenges(user) });
    }

    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });
    const action = String(req.body?.action || "");

    if (action === "create") {
      const access = await classroomAccess(user, req.body?.classroomId);
      if (!access?.isOwner) return res.status(403).json({ ok: false, error: "No puedes crear retos en esta aula." });

      const title = normalizeChallengeTitle(req.body?.title);
      const tables = normalizeTables(req.body?.tables);
      const questionCount = Number(req.body?.questionCount);
      if (title.length < 2) return res.status(400).json({ ok: false, error: "Escribe un título para el reto." });
      if (!tables.length) return res.status(400).json({ ok: false, error: "Selecciona al menos una tabla." });
      if (!Number.isInteger(questionCount) || questionCount < 5 || questionCount > 100) return res.status(400).json({ ok: false, error: "El reto debe tener entre 5 y 100 operaciones." });

      let dueAt = null;
      if (req.body?.dueAt) {
        dueAt = new Date(req.body.dueAt);
        if (Number.isNaN(dueAt.getTime())) return res.status(400).json({ ok: false, error: "La fecha límite no es válida." });
      }

      const client = await db.connect();
      try {
        await client.query("BEGIN");
        const code = await createUniqueChallengeCode(client);
        const created = await client.query(
          `INSERT INTO classroom_challenges(classroom_id,created_by,title,code,tables,question_count,due_at)
           VALUES($1,$2,$3,$4,$5,$6,$7)
           RETURNING id,title,code,tables,question_count,due_at,is_active,created_at`,
          [access.classroom.id, user.id, title, code, tables, questionCount, dueAt]
        );
        await client.query("COMMIT");
        return res.status(201).json({ ok: true, challenge: { ...created.rows[0], url: challengeUrl(code) }, message: "Reto creado correctamente." });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally { client.release(); }
    }

    if (["close", "reopen", "delete"].includes(action)) {
      const challenge = await db.query(
        `SELECT ch.id,ch.classroom_id,c.teacher_id FROM classroom_challenges ch JOIN classrooms c ON c.id=ch.classroom_id WHERE ch.id=$1`,
        [req.body?.challengeId]
      );
      if (!challenge.rowCount || (challenge.rows[0].teacher_id !== user.id && user.role !== "admin")) return res.status(403).json({ ok: false, error: "No puedes modificar este reto." });
      if (action === "delete") {
        await db.query(`DELETE FROM classroom_challenges WHERE id=$1`, [req.body.challengeId]);
        return res.status(200).json({ ok: true, message: "Reto eliminado." });
      }
      await db.query(`UPDATE classroom_challenges SET is_active=$2 WHERE id=$1`, [req.body.challengeId, action === "reopen"]);
      return res.status(200).json({ ok: true, message: action === "reopen" ? "Reto reabierto." : "Reto cerrado." });
    }

    return res.status(400).json({ ok: false, error: "Acción no válida." });
  } catch (error) {
    console.error("challenges error", error);
    return res.status(500).json({ ok: false, error: "No se ha podido completar la operación." });
  }
}
