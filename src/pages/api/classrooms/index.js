import crypto from "crypto";
import { db } from "../../../lib/db";
import { requireUser, publicUser } from "../../../lib/auth";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function randomCode(length = 6) {
  return Array.from({ length }, () => CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)]).join("");
}

async function createUniqueCode(client) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomCode();
    const exists = await client.query(`SELECT 1 FROM classrooms WHERE code=$1 LIMIT 1`, [code]);
    if (!exists.rowCount) return code;
  }
  throw new Error("No se ha podido generar un código de aula único.");
}

async function getOverview(user) {
  const teacher = user.role === "teacher" || user.role === "admin";
  const owned = teacher
    ? await db.query(
        `SELECT c.id,c.name,c.code,c.created_at,COUNT(cs.student_id)::int AS students
         FROM classrooms c
         LEFT JOIN classroom_students cs ON cs.classroom_id=c.id
         WHERE c.teacher_id=$1
         GROUP BY c.id
         ORDER BY c.created_at DESC`,
        [user.id]
      )
    : { rows: [] };

  const joined = await db.query(
    `SELECT c.id,c.name,c.code,c.created_at,u.name AS teacher_name,cs.joined_at
     FROM classroom_students cs
     JOIN classrooms c ON c.id=cs.classroom_id
     JOIN users u ON u.id=c.teacher_id
     WHERE cs.student_id=$1
     ORDER BY cs.joined_at DESC`,
    [user.id]
  );

  return { owned: owned.rows, joined: joined.rows };
}

async function getClassroom(user, classroomId) {
  const classroom = await db.query(
    `SELECT c.id,c.name,c.code,c.teacher_id,c.created_at,u.name AS teacher_name
     FROM classrooms c JOIN users u ON u.id=c.teacher_id
     WHERE c.id=$1 LIMIT 1`,
    [classroomId]
  );
  if (!classroom.rowCount) return { status: 404, error: "El aula no existe." };

  const room = classroom.rows[0];
  const isOwner = room.teacher_id === user.id || user.role === "admin";
  const membership = isOwner
    ? { rowCount: 1 }
    : await db.query(`SELECT 1 FROM classroom_students WHERE classroom_id=$1 AND student_id=$2`, [classroomId, user.id]);
  if (!membership.rowCount) return { status: 403, error: "No perteneces a esta aula." };

  if (!isOwner) return { status: 200, classroom: room, students: null };

  const students = await db.query(
    `WITH operations AS (
       SELECT user_id,is_correct,created_at FROM practice_operations
       UNION ALL SELECT user_id,is_correct,created_at FROM activity_operations
       UNION ALL SELECT user_id,is_correct,created_at FROM addition_operations
       UNION ALL SELECT user_id,is_correct,created_at FROM arithmetic_operations
       UNION ALL
       SELECT a.user_id,q.is_correct,q.answered_at AS created_at
       FROM challenge_attempt_questions q
       JOIN challenge_attempts a ON a.id=q.attempt_id
       WHERE q.answered_at IS NOT NULL
     )
     SELECT u.id,u.name,cs.joined_at,
            COALESCE(up.points,0)::int AS points,
            COALESCE(up.level,1)::int AS level,
            COUNT(o.user_id)::int AS operations,
            COALESCE(ROUND(100.0*SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END)/NULLIF(COUNT(o.user_id),0)),0)::int AS accuracy,
            MAX(o.created_at) AS last_activity
     FROM classroom_students cs
     JOIN users u ON u.id=cs.student_id
     LEFT JOIN user_progress up ON up.user_id=u.id
     LEFT JOIN operations o ON o.user_id=u.id
     WHERE cs.classroom_id=$1
     GROUP BY u.id,u.name,cs.joined_at,up.points,up.level
     ORDER BY points DESC,u.name ASC`,
    [classroomId]
  );
  return { status: 200, classroom: room, students: students.rows };
}

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      if (req.query.classroomId) {
        const result = await getClassroom(user, req.query.classroomId);
        if (result.error) return res.status(result.status).json({ ok: false, error: result.error });
        return res.status(200).json({ ok: true, classroom: result.classroom, students: result.students });
      }
      return res.status(200).json({ ok: true, ...(await getOverview(user)) });
    }

    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });

    const action = String(req.body?.action || "");

    if (action === "activate-teacher") {
      if (user.role === "admin" || user.role === "teacher") return res.status(200).json({ ok: true, user: publicUser(user) });
      const updated = await db.query(`UPDATE users SET role='teacher' WHERE id=$1 RETURNING id,email,name,role,name_changed_at`, [user.id]);
      return res.status(200).json({ ok: true, user: publicUser(updated.rows[0]) });
    }

    if (action === "create") {
      if (user.role !== "teacher" && user.role !== "admin") return res.status(403).json({ ok: false, error: "Activa primero tu perfil de profesor." });
      const name = normalizeName(req.body?.name);
      if (name.length < 2) return res.status(400).json({ ok: false, error: "Indica un nombre para el aula." });
      const client = await db.connect();
      try {
        await client.query("BEGIN");
        const code = await createUniqueCode(client);
        const created = await client.query(`INSERT INTO classrooms(teacher_id,name,code) VALUES($1,$2,$3) RETURNING id,name,code,created_at`, [user.id, name, code]);
        await client.query("COMMIT");
        return res.status(201).json({ ok: true, classroom: { ...created.rows[0], students: 0 } });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally { client.release(); }
    }

    if (action === "join") {
      const code = normalizeCode(req.body?.code);
      if (code.length < 4) return res.status(400).json({ ok: false, error: "Introduce un código de aula válido." });
      const room = await db.query(`SELECT id,name FROM classrooms WHERE code=$1 LIMIT 1`, [code]);
      if (!room.rowCount) return res.status(404).json({ ok: false, error: "No existe ningún aula con ese código." });
      await db.query(`INSERT INTO classroom_students(classroom_id,student_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, [room.rows[0].id, user.id]);
      return res.status(200).json({ ok: true, classroom: room.rows[0] });
    }

    if (action === "leave") {
      await db.query(`DELETE FROM classroom_students WHERE classroom_id=$1 AND student_id=$2`, [req.body?.classroomId, user.id]);
      return res.status(200).json({ ok: true });
    }

    if (action === "remove-student") {
      const room = await db.query(`SELECT teacher_id FROM classrooms WHERE id=$1`, [req.body?.classroomId]);
      if (!room.rowCount || (room.rows[0].teacher_id !== user.id && user.role !== "admin")) return res.status(403).json({ ok: false, error: "No puedes modificar esta aula." });
      await db.query(`DELETE FROM classroom_students WHERE classroom_id=$1 AND student_id=$2`, [req.body?.classroomId, req.body?.studentId]);
      return res.status(200).json({ ok: true });
    }

    if (action === "delete") {
      const classroomId = req.body?.classroomId;
      const owned = await db.query(`SELECT id FROM classrooms WHERE id=$1 AND (teacher_id=$2 OR $3='admin')`, [classroomId, user.id, user.role]);
      if (!owned.rowCount) return res.status(403).json({ ok: false, error: "No puedes eliminar esta aula." });
      const attempts = await db.query(
        `SELECT COUNT(*)::int AS count
         FROM challenge_attempts a
         JOIN classroom_challenges ch ON ch.id=a.challenge_id
         WHERE ch.classroom_id=$1`,
        [classroomId]
      );
      if (Number(attempts.rows[0]?.count || 0) > 0) return res.status(409).json({ ok: false, error: "Esta aula ya tiene resultados de retos. No puede eliminarse para conservar el historial y los puntos de los alumnos." });
      await db.query(`DELETE FROM classrooms WHERE id=$1`, [classroomId]);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "Acción no válida." });
  } catch (error) {
    console.error("classrooms error", error);
    return res.status(500).json({ ok: false, error: "No se ha podido completar la operación." });
  }
}
