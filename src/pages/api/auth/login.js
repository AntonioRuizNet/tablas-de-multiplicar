import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { createSession, normalizeEmail, publicUser, setSessionCookie } from "../../../lib/auth";
import { loadProgress } from "../../../lib/progress";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const { rows } = await db.query(`SELECT id, email, name, role, password_hash FROM users WHERE email = $1 LIMIT 1`, [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos." });
  }
  const session = await createSession(user.id);
  setSessionCookie(res, session.token, session.expiresAt);
  const progress = await loadProgress(user.id);
  return res.status(200).json({ ok: true, user: publicUser(user), progress });
}
