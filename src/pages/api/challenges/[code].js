import crypto from "crypto";
import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import { normalizeChallengeCode } from "../../../lib/challenges";
import { updatePoints } from "../../../lib/progress";

async function loadChallenge(code) {
  const result = await db.query(
    `SELECT ch.id,ch.classroom_id,ch.title,ch.code,ch.tables,ch.question_count,ch.due_at,ch.is_active,ch.created_at,
            c.name AS classroom_name,c.teacher_id,u.name AS teacher_name
     FROM classroom_challenges ch
     JOIN classrooms c ON c.id=ch.classroom_id
     JOIN users u ON u.id=c.teacher_id
     WHERE ch.code=$1 LIMIT 1`,
    [normalizeChallengeCode(code)]
  );
  return result.rows[0] || null;
}

function challengeClosed(challenge) {
  return !challenge.is_active || (challenge.due_at && new Date(challenge.due_at).getTime() < Date.now());
}

async function teacherResults(challenge) {
  const students = await db.query(
    `SELECT u.id,u.name,a.started_at,a.completed_at,a.correct_count,a.wrong_count,a.duration_seconds,
            CASE WHEN a.completed_at IS NULL THEN NULL
                 ELSE ROUND(100.0*a.correct_count/NULLIF(a.correct_count+a.wrong_count,0))::int END AS accuracy
     FROM classroom_students cs
     JOIN users u ON u.id=cs.student_id
     LEFT JOIN challenge_attempts a ON a.challenge_id=$2 AND a.user_id=u.id
     WHERE cs.classroom_id=$1
     ORDER BY a.completed_at DESC NULLS LAST,u.name ASC`,
    [challenge.classroom_id, challenge.id]
  );
  const hardest = await db.query(
    `SELECT table_number,multiplier,COUNT(*)::int AS answers,
            SUM(CASE WHEN is_correct=false THEN 1 ELSE 0 END)::int AS errors,
            ROUND(100.0*SUM(CASE WHEN is_correct=false THEN 1 ELSE 0 END)/COUNT(*))::int AS error_rate
     FROM challenge_attempt_questions q
     JOIN challenge_attempts a ON a.id=q.attempt_id
     WHERE a.challenge_id=$1 AND q.answered_at IS NOT NULL
     GROUP BY table_number,multiplier
     ORDER BY errors DESC,error_rate DESC,table_number,multiplier
     LIMIT 10`,
    [challenge.id]
  );
  return { students: students.rows, hardest: hardest.rows };
}

async function studentAttempt(challenge, userId) {
  const attempt = await db.query(
    `SELECT id,started_at,completed_at,correct_count,wrong_count,duration_seconds FROM challenge_attempts WHERE challenge_id=$1 AND user_id=$2 LIMIT 1`,
    [challenge.id, userId]
  );
  if (!attempt.rowCount) return null;
  const questions = await db.query(
    `SELECT id,position,table_number,multiplier,user_answer,is_correct,response_time_seconds,answered_at
     FROM challenge_attempt_questions WHERE attempt_id=$1 ORDER BY position`,
    [attempt.rows[0].id]
  );
  return { ...attempt.rows[0], questions: questions.rows };
}

async function ensureMembership(challenge, user) {
  if (challenge.teacher_id === user.id || user.role === "admin") return "owner";
  const member = await db.query(`SELECT 1 FROM classroom_students WHERE classroom_id=$1 AND student_id=$2`, [challenge.classroom_id, user.id]);
  return member.rowCount ? "member" : "guest";
}

async function startAttempt(challenge, user) {
  if (challenge.teacher_id === user.id) throw Object.assign(new Error("Como profesor puedes consultar los resultados, pero no realizar tu propio reto."), { status: 400 });
  if (challengeClosed(challenge)) throw Object.assign(new Error("Este reto ya está cerrado o ha superado su fecha límite."), { status: 410 });

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(`INSERT INTO classroom_students(classroom_id,student_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, [challenge.classroom_id, user.id]);
    let attempt = await client.query(`SELECT id FROM challenge_attempts WHERE challenge_id=$1 AND user_id=$2 FOR UPDATE`, [challenge.id, user.id]);
    if (!attempt.rowCount) {
      attempt = await client.query(`INSERT INTO challenge_attempts(challenge_id,user_id) VALUES($1,$2) RETURNING id`, [challenge.id, user.id]);
      const tables = challenge.tables.map(Number);
      for (let position = 1; position <= Number(challenge.question_count); position += 1) {
        const table = tables[crypto.randomInt(0, tables.length)];
        const multiplier = crypto.randomInt(1, 13);
        await client.query(
          `INSERT INTO challenge_attempt_questions(attempt_id,position,table_number,multiplier,expected_answer)
           VALUES($1,$2,$3,$4,$5)`,
          [attempt.rows[0].id, position, table, multiplier, table * multiplier]
        );
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
  return studentAttempt(challenge, user.id);
}

async function answerQuestion(challenge, user, body) {
  if (challengeClosed(challenge)) throw Object.assign(new Error("El plazo de este reto ha finalizado."), { status: 410 });
  const answer = Number(body?.answer);
  const questionId = Number(body?.questionId);
  const responseTime = Math.max(0, Math.min(3600, Number(body?.responseTime || 0)));
  if (!Number.isInteger(answer) || !Number.isInteger(questionId)) throw Object.assign(new Error("Respuesta no válida."), { status: 400 });

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const question = await client.query(
      `SELECT q.id,q.expected_answer,q.answered_at,a.id AS attempt_id,a.completed_at
       FROM challenge_attempt_questions q
       JOIN challenge_attempts a ON a.id=q.attempt_id
       WHERE q.id=$1 AND a.challenge_id=$2 AND a.user_id=$3
       FOR UPDATE OF q,a`,
      [questionId, challenge.id, user.id]
    );
    if (!question.rowCount) throw Object.assign(new Error("La operación no pertenece a este reto."), { status: 404 });
    const row = question.rows[0];
    if (row.completed_at) throw Object.assign(new Error("Este reto ya está completado."), { status: 409 });
    if (row.answered_at) throw Object.assign(new Error("Esta operación ya fue respondida."), { status: 409 });

    const isCorrect = answer === Number(row.expected_answer);
    await client.query(
      `UPDATE challenge_attempt_questions
       SET user_answer=$2,is_correct=$3,response_time_seconds=$4,points_awarded=$5,answered_at=NOW()
       WHERE id=$1`,
      [questionId, answer, isCorrect, responseTime, isCorrect ? 1 : 0]
    );
    if (isCorrect) await updatePoints(user.id, 1, client);

    const totals = await client.query(
      `SELECT COUNT(*) FILTER (WHERE answered_at IS NOT NULL)::int AS answered,
              COUNT(*) FILTER (WHERE is_correct=true)::int AS correct,
              COUNT(*) FILTER (WHERE is_correct=false)::int AS wrong,
              COALESCE(ROUND(SUM(response_time_seconds))::int,0) AS duration
       FROM challenge_attempt_questions WHERE attempt_id=$1`,
      [row.attempt_id]
    );
    const total = totals.rows[0];
    const completed = Number(total.answered) >= Number(challenge.question_count);
    await client.query(
      `UPDATE challenge_attempts SET correct_count=$2,wrong_count=$3,duration_seconds=$4,
              completed_at=CASE WHEN $5 THEN COALESCE(completed_at,NOW()) ELSE completed_at END
       WHERE id=$1`,
      [row.attempt_id, total.correct, total.wrong, total.duration, completed]
    );
    await client.query("COMMIT");
    return { isCorrect, pointsAwarded: isCorrect ? 1 : 0, completed };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const challenge = await loadChallenge(req.query.code);
    if (!challenge) return res.status(404).json({ ok: false, error: "El reto no existe." });
    const access = await ensureMembership(challenge, user);
    const isOwner = challenge.teacher_id === user.id || user.role === "admin";

    if (req.method === "GET") {
      if (isOwner) {
        const results = await teacherResults(challenge);
        return res.status(200).json({ ok: true, challenge, isOwner: true, closed: challengeClosed(challenge), ...results });
      }
      const attempt = await studentAttempt(challenge, user.id);
      return res.status(200).json({ ok: true, challenge, isOwner: false, access, closed: challengeClosed(challenge), attempt });
    }

    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });
    const action = String(req.body?.action || "");
    if (action === "start") {
      const attempt = await startAttempt(challenge, user);
      return res.status(200).json({ ok: true, attempt });
    }
    if (action === "answer") {
      const result = await answerQuestion(challenge, user, req.body);
      return res.status(200).json({ ok: true, ...result, attempt: await studentAttempt(challenge, user.id) });
    }
    return res.status(400).json({ ok: false, error: "Acción no válida." });
  } catch (error) {
    console.error("challenge detail error", error);
    return res.status(error?.status || 500).json({ ok: false, error: error?.status ? error.message : "No se ha podido completar la operación." });
  }
}
