import { db } from "../../../lib/db";
import { calcProgression } from "../../../lib/progression";
import { rankName } from "../../../lib/progress";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  const name = String(req.query.id || "").trim();
  if (!name || name.length > 30) return res.status(400).json({ ok: false, error: "Jugador no válido." });
  try {
    const user = await db.query(
      `SELECT id, COALESCE(NULLIF(TRIM(name),''),'Jugador') AS name, avatar_icon, avatar_color, created_at
       FROM users WHERE LOWER(BTRIM(name))=LOWER(BTRIM($1)) LIMIT 1`,
      [name]
    );
    if (!user.rowCount) return res.status(404).json({ ok: false, error: "Jugador no encontrado." });

    const id = user.rows[0].id;
    const [progress, completed, achievements] = await Promise.all([
      db.query(`SELECT points FROM user_progress WHERE user_id=$1`, [id]),
      db.query(`SELECT COUNT(*)::int count FROM practice_sessions WHERE user_id=$1 AND completed_at IS NOT NULL`, [id]),
      db.query(`SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id=$1 ORDER BY unlocked_at ASC`, [id]),
    ]);

    let ops;
    try {
      ops = await db.query(`SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE is_correct=true)::int correct FROM (
        SELECT is_correct FROM practice_operations WHERE user_id=$1
        UNION ALL SELECT is_correct FROM activity_operations WHERE user_id=$1
      ) o`, [id]);
    } catch (error) {
      if (error?.code !== "42P01") throw error;
      ops = await db.query(`SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE is_correct=true)::int correct FROM practice_operations WHERE user_id=$1`, [id]);
    }

    const points = Number(progress.rows[0]?.points || 0);
    const { level, rank } = calcProgression(points);
    const total = Number(ops.rows[0]?.total || 0);
    const correct = Number(ops.rows[0]?.correct || 0);
    return res.status(200).json({ ok: true, player: {
      id,
      name: user.rows[0].name,
      avatarIcon: user.rows[0].avatar_icon,
      avatarColor: user.rows[0].avatar_color,
      joinedAt: user.rows[0].created_at,
      points,
      level,
      rank,
      rankName: rankName(rank),
      operations: total,
      accuracy: total ? Math.round(correct * 100 / total) : 0,
      completedTables: Number(completed.rows[0]?.count || 0),
      achievements: achievements.rows.map((a) => ({ id: a.achievement_id, unlockedAt: a.unlocked_at })),
    }});
  } catch (error) {
    console.error("public player error", error);
    return res.status(500).json({ ok: false, error: "No se ha podido cargar el jugador." });
  }
}
