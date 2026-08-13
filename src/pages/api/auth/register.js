import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { createSession, normalizeEmail, publicUser, setSessionCookie } from "../../../lib/auth";
import { ensureProgress, loadProgress } from "../../../lib/progress";
import { usernameExists, validateUsername } from "../../../lib/usernames";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });
  const email = normalizeEmail(req.body?.email);
  const username = validateUsername(req.body?.name);
  const password = String(req.body?.password || "");

  if (!username.ok) return res.status(400).json({ ok: false, error: username.error });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ ok: false, error: "Email no válido." });
  if (password.length < 8) return res.status(400).json({ ok: false, error: "La contraseña debe tener al menos 8 caracteres." });

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const exists = await client.query(`SELECT 1 FROM users WHERE email = $1`, [email]);
    if (exists.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ ok: false, error: "Ya existe una cuenta con ese email." });
    }
    if (await usernameExists(client, username.name)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ ok: false, error: "Ese nombre ya está en uso. Elige otro." });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await client.query(
      `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, email, name, role, name_changed_at`,
      [email, username.name, hash]
    );
    await ensureProgress(result.rows[0].id, client);
    await client.query("COMMIT");
    const session = await createSession(result.rows[0].id);
    setSessionCookie(res, session.token, session.expiresAt);
    const progress = await loadProgress(result.rows[0].id);
    return res.status(201).json({ ok: true, user: publicUser(result.rows[0]), progress });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error?.code === "23505") {
      return res.status(409).json({ ok: false, error: "El email o el nombre ya están en uso." });
    }
    console.error(error);
    return res.status(500).json({ ok: false, error: "No se ha podido crear la cuenta." });
  } finally {
    client.release();
  }
}
