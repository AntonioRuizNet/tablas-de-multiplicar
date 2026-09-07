import { db } from "../../../lib/db";
import { publicUser, requireUser } from "../../../lib/auth";
import { normalizeAvatar, AVATAR_ICON_NAMES, AVATAR_COLORS } from "../../../lib/avatars";

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;
  if (req.method !== "PATCH") return res.status(405).json({ ok: false, error: "Método no permitido." });

  const requestedIcon = String(req.body?.avatarIcon || "");
  const requestedColor = String(req.body?.avatarColor || "").toUpperCase();
  if (!AVATAR_ICON_NAMES.includes(requestedIcon)) return res.status(400).json({ ok: false, error: "El avatar seleccionado no es válido." });
  const color = AVATAR_COLORS.find((item) => item.toUpperCase() === requestedColor);
  if (!color) return res.status(400).json({ ok: false, error: "El color seleccionado no es válido." });

  const avatar = normalizeAvatar(requestedIcon, color);
  const result = await db.query(
    `UPDATE users SET avatar_icon=$2, avatar_color=$3, updated_at=NOW()
     WHERE id=$1
     RETURNING id,email,name,role,avatar_icon,avatar_color,name_changed_at`,
    [user.id, avatar.icon, avatar.color]
  );
  return res.status(200).json({ ok: true, user: publicUser(result.rows[0]), message: "Avatar actualizado correctamente." });
}
