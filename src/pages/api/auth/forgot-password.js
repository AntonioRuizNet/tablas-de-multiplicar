import crypto from "crypto";
import { db } from "../../../lib/db";
import { normalizeEmail } from "../../../lib/auth";
import { sendPasswordResetEmail } from "../../../lib/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const email = normalizeEmail(req.body?.email);
  const generic = { ok: true, message: "Si existe una cuenta con ese email, recibirás un enlace para entrar en tu cuenta." };
  if (!email) return res.status(200).json(generic);

  const found = await db.query(`SELECT id, email FROM users WHERE email = $1 LIMIT 1`, [email]);
  if (!found.rowCount) return res.status(200).json(generic);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await db.query(`DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at <= NOW()`, [found.rows[0].id]);
  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
    [found.rows[0].id, tokenHash]
  );

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${req.headers.host}`;
  const sendResult = await sendPasswordResetEmail({
    to: found.rows[0].email,
    recoveryUrl: `${baseUrl}/api/auth/recovery-login?token=${token}`,
  });

  if (!sendResult.ok) {
    // No revelamos al navegador si el email existe, pero evitamos conservar
    // un token que nunca ha llegado al usuario. El error real queda en consola.
    await db.query(`DELETE FROM password_reset_tokens WHERE token_hash = $1`, [tokenHash]);
  }

  return res.status(200).json(generic);
}
