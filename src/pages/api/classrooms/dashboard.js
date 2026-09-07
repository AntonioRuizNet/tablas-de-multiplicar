import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";

const PERIODS = { today: 1, week: 7, month: 30 };

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Método no permitido." });

  const classroomId = String(req.query.classroomId || "");
  const period = PERIODS[req.query.period] ? String(req.query.period) : "week";
  const days = PERIODS[period];
  if (!classroomId) return res.status(400).json({ ok: false, error: "Falta el aula." });

  try {
    const room = await db.query(`SELECT id FROM classrooms WHERE id=$1 AND (teacher_id=$2 OR $3='admin')`, [classroomId, user.id, user.role]);
    if (!room.rowCount) return res.status(403).json({ ok: false, error: "No puedes consultar esta aula." });

    const students = await db.query(
      `WITH operations AS (
         SELECT user_id,is_correct,created_at,table_number FROM practice_operations
         UNION ALL SELECT user_id,is_correct,created_at,table_number FROM activity_operations
         UNION ALL SELECT user_id,is_correct,created_at,NULL::int AS table_number FROM addition_operations
         UNION ALL SELECT user_id,is_correct,created_at,NULL::int AS table_number FROM arithmetic_operations
         UNION ALL
         SELECT a.user_id,q.is_correct,q.answered_at AS created_at,q.table_number
         FROM challenge_attempt_questions q JOIN challenge_attempts a ON a.id=q.attempt_id
         WHERE q.answered_at IS NOT NULL
       ), filtered AS (
         SELECT * FROM operations WHERE created_at >= NOW() - ($2::int * INTERVAL '1 day')
       ), all_activity AS (
         SELECT user_id,MAX(created_at) AS last_activity FROM operations GROUP BY user_id
       )
       SELECT u.id,u.name,u.avatar_icon,u.avatar_color,
              COUNT(f.user_id)::int AS operations,
              COALESCE(ROUND(100.0*SUM(CASE WHEN f.is_correct THEN 1 ELSE 0 END)/NULLIF(COUNT(f.user_id),0)),0)::int AS accuracy,
              a.last_activity,
              CASE WHEN a.last_activity IS NULL OR a.last_activity < NOW() - INTERVAL '7 days' THEN true ELSE false END AS inactive,
              CASE WHEN COUNT(f.user_id) >= 5 AND COALESCE(100.0*SUM(CASE WHEN f.is_correct THEN 1 ELSE 0 END)/NULLIF(COUNT(f.user_id),0),100) < 70 THEN true ELSE false END AS needs_attention
       FROM classroom_students cs
       JOIN users u ON u.id=cs.student_id
       LEFT JOIN filtered f ON f.user_id=u.id
       LEFT JOIN all_activity a ON a.user_id=u.id
       WHERE cs.classroom_id=$1
       GROUP BY u.id,u.name,u.avatar_icon,u.avatar_color,a.last_activity
       ORDER BY needs_attention DESC,inactive DESC,accuracy ASC,u.name ASC`,
      [classroomId, days]
    );

    const tables = await db.query(
      `WITH operations AS (
         SELECT user_id,is_correct,created_at,table_number FROM practice_operations
         UNION ALL SELECT user_id,is_correct,created_at,table_number FROM activity_operations
         UNION ALL
         SELECT a.user_id,q.is_correct,q.answered_at AS created_at,q.table_number
         FROM challenge_attempt_questions q JOIN challenge_attempts a ON a.id=q.attempt_id
         WHERE q.answered_at IS NOT NULL
       )
       SELECT o.table_number::int AS table_number,COUNT(*)::int AS operations,
              SUM(CASE WHEN NOT o.is_correct THEN 1 ELSE 0 END)::int AS errors,
              COALESCE(ROUND(100.0*SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0)),0)::int AS accuracy
       FROM operations o
       JOIN classroom_students cs ON cs.student_id=o.user_id AND cs.classroom_id=$1
       WHERE o.created_at >= NOW() - ($2::int * INTERVAL '1 day') AND o.table_number BETWEEN 1 AND 12
       GROUP BY o.table_number
       ORDER BY accuracy ASC,operations DESC,o.table_number ASC`,
      [classroomId, days]
    );

    const rows = students.rows;
    const operations = rows.reduce((sum, student) => sum + Number(student.operations || 0), 0);
    const correct = rows.reduce((sum, student) => sum + Number(student.operations || 0) * Number(student.accuracy || 0) / 100, 0);
    return res.status(200).json({ ok: true, period, summary: { students: rows.length, operations, accuracy: operations ? Math.round(correct * 100 / operations) : 0, needsAttention: rows.filter((student) => student.needs_attention).length, inactive: rows.filter((student) => student.inactive).length }, students: rows, tables: tables.rows });
  } catch (error) {
    console.error("classroom dashboard error", error);
    return res.status(500).json({ ok: false, error: "No se han podido cargar las estadísticas del aula." });
  }
}
