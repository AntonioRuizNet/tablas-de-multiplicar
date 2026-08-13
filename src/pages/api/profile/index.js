import { db } from "../../../lib/db";
import { publicUser, requireUser } from "../../../lib/auth";
import { loadProgress, rankName } from "../../../lib/progress";
import { usernameExists, validateUsername } from "../../../lib/usernames";

const NAME_CHANGE_DAYS = 30;

function nextNameChangeDate(lastChangedAt) {
  if (!lastChangedAt) return null;
  const date = new Date(lastChangedAt);
  date.setDate(date.getDate() + NAME_CHANGE_DAYS);
  return date;
}

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === "PATCH") {
    const username = validateUsername(req.body?.name);
    if (!username.ok) return res.status(400).json({ ok: false, error: username.error });

    const current = await db.query(
      `SELECT id, email, name, role, name_changed_at FROM users WHERE id = $1 LIMIT 1`,
      [user.id]
    );
    if (!current.rowCount) return res.status(404).json({ ok: false, error: "Usuario no encontrado." });

    const currentUser = current.rows[0];
    if ((currentUser.name || "") === username.name) {
      return res.status(200).json({
        ok: true,
        user: publicUser(currentUser),
        message: "El nombre ya estaba actualizado. No se ha realizado ningún cambio.",
      });
    }

    const nextChange = nextNameChangeDate(currentUser.name_changed_at);
    if (nextChange && nextChange.getTime() > Date.now()) {
      return res.status(429).json({
        ok: false,
        error: `Solo puedes cambiar tu nombre una vez cada 30 días. Podrás volver a cambiarlo a partir del ${nextChange.toLocaleDateString("es-ES")}.`,
        nextNameChangeAt: nextChange.toISOString(),
      });
    }

    if (await usernameExists(db, username.name, user.id)) {
      return res.status(409).json({ ok: false, error: "Ese nombre ya está en uso. Elige otro." });
    }

    try {
      const result = await db.query(
        `UPDATE users
         SET name = $2, name_changed_at = NOW(), updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, name, role, name_changed_at`,
        [user.id, username.name]
      );
      return res.status(200).json({
        ok: true,
        user: publicUser(result.rows[0]),
        message: "Nombre actualizado correctamente. Podrás volver a cambiarlo dentro de 30 días.",
      });
    } catch (error) {
      if (error?.code === "23505") {
        return res.status(409).json({ ok: false, error: "Ese nombre ya está en uso. Elige otro." });
      }
      console.error(error);
      return res.status(500).json({ ok: false, error: "No se ha podido actualizar el nombre." });
    }
  }

  if (req.method !== "GET") return res.status(405).json({ ok: false });
  const progress = await loadProgress(user.id);
  const total = progress.userConfig.resume.length;
  const correct = progress.userConfig.resume.filter((r) => r.state === "Bien").length;
  const wrong = total - correct;
  const avg = total ? progress.userConfig.resume.reduce((a, r) => a + Number(r.time || 0), 0) / total : 0;
  const completed = await db.query(`SELECT COUNT(*)::int AS count FROM practice_sessions WHERE user_id=$1 AND completed_at IS NOT NULL`, [user.id]);
  const nextChange = nextNameChangeDate(user.name_changed_at);
  return res.status(200).json({
    ok: true,
    user: publicUser(user),
    progress,
    nameChange: {
      canChange: !nextChange || nextChange.getTime() <= Date.now(),
      nextChangeAt: nextChange?.toISOString() || null,
    },
    stats: { totalOperations: total, correct, wrong, accuracy: total ? Math.round(correct * 100 / total) : 0, averageTime: Math.round(avg * 10) / 10, completedTables: completed.rows[0].count, achievements: Object.keys(progress.unlocked).length, rankName: rankName(progress.userConfig.rango) }
  });
}
