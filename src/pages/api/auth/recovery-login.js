import crypto from "crypto";
import { db } from "../../../lib/db";
import { createSession, setRecoveryCookie, setSessionCookie } from "../../../lib/auth";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const token = String(req.query?.token || "");
  if (!token) return res.redirect(302, "/login?recovery=invalid");

  const tokenHash = sha256(token);
  const consumed = await db.query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE id = (
       SELECT id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1
     )
     RETURNING user_id`,
    [tokenHash]
  );

  if (!consumed.rowCount) return res.redirect(302, "/login?recovery=expired");
  const userId = consumed.rows[0].user_id;

  await db.query(`DELETE FROM auth_sessions WHERE user_id = $1`, [userId]);
  const session = await createSession(userId);
  setSessionCookie(res, session.token, session.expiresAt);

  const recoveryToken = crypto.randomBytes(32).toString("hex");
  const recoveryExpires = new Date(Date.now() + 15 * 60 * 1000);
  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, sha256(recoveryToken), recoveryExpires]
  );
  setRecoveryCookie(res, recoveryToken, recoveryExpires);

  return res.redirect(302, "/perfil?recuperacion=1");
}
