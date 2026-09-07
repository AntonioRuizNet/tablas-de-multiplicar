import { db } from "../../../lib/db";
import { normalizeEmail, publicUser, requireUser } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });
  const user = await requireUser(req, res); if (!user) return;
  const email = normalizeEmail(req.body?.email);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ ok:false, error:"Email no válido." });
  try {
    const exists = await db.query(`SELECT 1 FROM users WHERE email=$1 AND id<>$2`, [email, user.id]);
    if (exists.rowCount) return res.status(409).json({ ok:false, error:"Ese email ya está asociado a otra cuenta." });
    const result = await db.query(`UPDATE users SET email=$2, updated_at=NOW() WHERE id=$1 RETURNING id,email,name,role,name_changed_at`, [user.id,email]);
    return res.status(200).json({ ok:true, user:publicUser(result.rows[0]) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok:false, error:"No se ha podido guardar el email." });
  }
}
