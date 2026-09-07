import { db } from "../../lib/db";
import { requireUser } from "../../lib/auth";

const TYPES = new Set(["all", "multiplication", "addition", "subtraction", "division", "challenge"]);

async function canViewUser(viewer, targetUserId) {
  if (viewer.id === targetUserId || viewer.role === "admin") return true;
  if (viewer.role !== "teacher") return false;
  const result = await db.query(
    `SELECT 1 FROM classrooms c
     JOIN classroom_students cs ON cs.classroom_id=c.id
     WHERE c.teacher_id=$1 AND cs.student_id=$2 LIMIT 1`,
    [viewer.id, targetUserId]
  );
  return result.rowCount > 0;
}

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Método no permitido." });

  const targetUserId = String(req.query.userId || user.id);
  if (!(await canViewUser(user, targetUserId))) return res.status(403).json({ ok: false, error: "No puedes consultar este historial." });

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;
  const type = TYPES.has(String(req.query.type || "all")) ? String(req.query.type || "all") : "all";
  const table = Number(req.query.table || 0);
  const resultFilter = String(req.query.result || "all");
  const params = [targetUserId];
  const filters = [];

  if (type !== "all") { params.push(type); filters.push(`kind=$${params.length}`); }
  if (Number.isInteger(table) && table >= 1 && table <= 12) { params.push(table); filters.push(`table_number=$${params.length}`); }
  if (resultFilter === "correct") filters.push(`is_correct=true`);
  if (resultFilter === "wrong") filters.push(`is_correct=false`);
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const base = `WITH history AS (
      SELECT 'p-'||p.id AS id,'multiplication'::text AS kind,'Práctica de tablas'::text AS activity,p.table_number,p.multiplier,NULL::int AS user_answer,p.is_correct,p.response_time_seconds,p.created_at
      FROM practice_operations p WHERE p.user_id=$1
      UNION ALL
      SELECT 'a-'||o.id AS id,'multiplication'::text AS kind,COALESCE(s.activity_type,'Actividad')::text AS activity,o.table_number,o.multiplier,NULL::int AS user_answer,o.is_correct,o.response_time_seconds,o.created_at
      FROM activity_operations o LEFT JOIN activity_sessions s ON s.id=o.session_id WHERE o.user_id=$1
      UNION ALL
      SELECT 'm-'||o.id AS id,o.operation_type::text AS kind,
        CASE o.operation_type WHEN 'addition' THEN 'Sumas' WHEN 'subtraction' THEN 'Restas' WHEN 'division' THEN 'Divisiones' ELSE 'Otros juegos' END::text AS activity,
        o.operand_a AS table_number,o.operand_b AS multiplier,o.answer AS user_answer,o.is_correct,NULL::numeric AS response_time_seconds,o.created_at
      FROM arithmetic_operations o WHERE o.user_id=$1
      UNION ALL
      SELECT 'c-'||q.id AS id,'challenge'::text AS kind,ch.title::text AS activity,q.table_number,q.multiplier,q.user_answer,q.is_correct,q.response_time_seconds,q.answered_at AS created_at
      FROM challenge_attempt_questions q
      JOIN challenge_attempts ca ON ca.id=q.attempt_id
      JOIN classroom_challenges ch ON ch.id=ca.challenge_id
      WHERE ca.user_id=$1 AND q.answered_at IS NOT NULL
    )`;
    const count = await db.query(`${base} SELECT COUNT(*)::int AS total FROM history ${where}`, params);
    const rows = await db.query(`${base} SELECT * FROM history ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, params);
    const person = await db.query(`SELECT id,name,avatar_icon,avatar_color FROM users WHERE id=$1`, [targetUserId]);
    return res.status(200).json({ ok: true, user: person.rows[0] || null, page, pageSize: limit, total: count.rows[0]?.total || 0, operations: rows.rows });
  } catch (error) {
    console.error("history error", error);
    return res.status(500).json({ ok: false, error: "No se ha podido cargar el historial." });
  }
}
