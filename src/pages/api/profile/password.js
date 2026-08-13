import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import {
  RECOVERY_COOKIE,
  clearRecoveryCookie,
  createSession,
  parseCookies,
  requireUser,
  setSessionCookie,
} from "../../../lib/auth";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const user = await requireUser(req, res);
  if (!user) return;

  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  if (newPassword.length < 8) {
    return res.status(400).json({ ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres." });
  }

  const account = await db.query(`SELECT password_hash FROM users WHERE id = $1 LIMIT 1`, [user.id]);
  if (!account.rowCount) return res.status(404).json({ ok: false, error: "Usuario no encontrado." });

  let authorizedByRecovery = false;
  const recoveryToken = parseCookies(req)[RECOVERY_COOKIE];
  if (recoveryToken) {
    const recovery = await db.query(
      `SELECT id FROM password_reset_tokens
       WHERE user_id = $1 AND token_hash = $2 AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [user.id, hashToken(recoveryToken)]
    );
    authorizedByRecovery = recovery.rowCount > 0;
  }

  if (!authorizedByRecovery) {
    const validCurrent = currentPassword && await bcrypt.compare(currentPassword, account.rows[0].password_hash);
    if (!validCurrent) {
      return res.status(400).json({ ok: false, error: "La contraseña actual no es correcta." });
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(`UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`, [user.id, passwordHash]);
    await client.query(`DELETE FROM auth_sessions WHERE user_id = $1`, [user.id]);
    await client.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`, [user.id]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(error);
    return res.status(500).json({ ok: false, error: "No se ha podido actualizar la contraseña." });
  } finally {
    client.release();
  }

  const session = await createSession(user.id);
  setSessionCookie(res, session.token, session.expiresAt);
  clearRecoveryCookie(res);
  return res.status(200).json({ ok: true, message: "Contraseña actualizada correctamente." });
}
