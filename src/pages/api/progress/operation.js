import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const user = await requireUser(req, res); if (!user) return;
  const sessionId = String(req.body?.sessionId || "");
  const tableNumber = Number(req.body?.tableNumber);
  const multiplier = Number(req.body?.multiplier);
  const isCorrect = req.body?.isCorrect === true;
  const responseTime = Math.max(0, Math.min(3600, Number(req.body?.responseTime || 0)));
  if (!UUID_RE.test(sessionId) || !Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 12 || !Number.isInteger(multiplier) || multiplier < 1 || multiplier > 10) {
    return res.status(400).json({ ok: false, error: "Datos de práctica no válidos." });
  }
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const session = await client.query(
      `INSERT INTO practice_sessions (id, user_id, table_number)
       VALUES ($1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
       RETURNING user_id, table_number, completed_at`, [sessionId, user.id, tableNumber]
    );
    const row = session.rows[0];
    if (row.user_id !== user.id || Number(row.table_number) !== tableNumber || row.completed_at) {
      await client.query("ROLLBACK");
      return res.status(409).json({ ok: false, error: "La sesión de práctica no es válida." });
    }
    await client.query(
      `INSERT INTO practice_operations (user_id, session_id, table_number, multiplier, is_correct, response_time_seconds)
       VALUES ($1,$2,$3,$4,$5,$6)`, [user.id, sessionId, tableNumber, multiplier, isCorrect, responseTime]
    );
    await client.query("COMMIT");
    return res.status(201).json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(error);
    return res.status(500).json({ ok: false, error: "No se ha podido guardar la operación." });
  } finally { client.release(); }
}
