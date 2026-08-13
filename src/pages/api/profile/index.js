import { db } from "../../../lib/db";
import { publicUser, requireUser } from "../../../lib/auth";
import { loadProgress, rankName } from "../../../lib/progress";

export default async function handler(req, res) {
  const user = await requireUser(req, res); if (!user) return;
  if (req.method === "PATCH") {
    const name = String(req.body?.name || "").trim().slice(0, 100);
    const result = await db.query(`UPDATE users SET name = $2, updated_at = NOW() WHERE id = $1 RETURNING id,email,name,role`, [user.id, name || null]);
    return res.status(200).json({ ok: true, user: publicUser(result.rows[0]) });
  }
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  const progress = await loadProgress(user.id);
  const total = progress.userConfig.resume.length;
  const correct = progress.userConfig.resume.filter((r) => r.state === "Bien").length;
  const wrong = total - correct;
  const avg = total ? progress.userConfig.resume.reduce((a, r) => a + Number(r.time || 0), 0) / total : 0;
  const completed = await db.query(`SELECT COUNT(*)::int AS count FROM practice_sessions WHERE user_id=$1 AND completed_at IS NOT NULL`, [user.id]);
  return res.status(200).json({
    ok: true, user: publicUser(user), progress,
    stats: { totalOperations: total, correct, wrong, accuracy: total ? Math.round(correct * 100 / total) : 0, averageTime: Math.round(avg * 10) / 10, completedTables: completed.rows[0].count, achievements: Object.keys(progress.unlocked).length, rankName: rankName(progress.userConfig.rango) }
  });
}
