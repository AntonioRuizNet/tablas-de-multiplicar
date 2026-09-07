import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { createSession, normalizeEmail, publicUser, setSessionCookie } from "../../../lib/auth";
import { loadProgress } from "../../../lib/progress";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });
  const identifier = String(req.body?.identifier ?? req.body?.email ?? "").trim();
  const password = String(req.body?.password || "");
  const normalizedEmail = normalizeEmail(identifier);
  const { rows } = await db.query(
    `SELECT id, email, name, role, name_changed_at, password_hash
     FROM users
     WHERE LOWER(name) = LOWER($1) OR email = $2
     LIMIT 1`,
    [identifier, normalizedEmail]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ ok: false, error: "Nick/email o contraseña incorrectos." });
  }
  const session = await createSession(user.id);
  setSessionCookie(res, session.token, session.expiresAt);
  const progress = await loadProgress(user.id);
  return res.status(200).json({ ok: true, user: publicUser(user), progress });
}
