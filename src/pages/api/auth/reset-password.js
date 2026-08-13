import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  if (!token || password.length < 8) return res.status(400).json({ ok: false, error: "Enlace o contraseña no válidos." });
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT id, user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE`,
      [tokenHash]
    );
    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ ok: false, error: "El enlace ha caducado o ya se ha utilizado." });
    }
    const hash = await bcrypt.hash(password, 12);
    const userId = result.rows[0].user_id;
    await client.query(`UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`, [userId, hash]);
    await client.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [result.rows[0].id]);
    await client.query(`DELETE FROM auth_sessions WHERE user_id = $1`, [userId]);
    await client.query("COMMIT");
    return res.status(200).json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(error);
    return res.status(500).json({ ok: false, error: "No se ha podido restablecer la contraseña." });
  } finally { client.release(); }
}
