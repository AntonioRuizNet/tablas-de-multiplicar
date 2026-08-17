import { db } from "../../../lib/db";
import { calcProgression } from "../../../lib/progression";
import { rankName } from "../../../lib/progress";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok:false });
  const id = String(req.query.id || "");
  if (!UUID_RE.test(id)) return res.status(400).json({ ok:false, error:"Jugador no válido." });
  try {
    const user = await db.query(`SELECT id, COALESCE(NULLIF(TRIM(name),''),'Jugador') AS name, created_at FROM users WHERE id=$1 LIMIT 1`, [id]);
    if (!user.rowCount) return res.status(404).json({ ok:false, error:"Jugador no encontrado." });
    const [progress, completed, achievements] = await Promise.all([
      db.query(`SELECT points FROM user_progress WHERE user_id=$1`, [id]),
      db.query(`SELECT COUNT(*)::int count FROM practice_sessions WHERE user_id=$1 AND completed_at IS NOT NULL`, [id]),
      db.query(`SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id=$1 ORDER BY unlocked_at ASC`, [id]),
    ]);
    let ops;
    try {
      ops = await db.query(`SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE is_correct=true)::int correct FROM (
        SELECT is_correct FROM practice_operations WHERE user_id=$1 UNION ALL SELECT is_correct FROM activity_operations WHERE user_id=$1
      ) o`, [id]);
    } catch (error) {
      if (error?.code !== "42P01") throw error;
      ops = await db.query(`SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE is_correct=true)::int correct FROM practice_operations WHERE user_id=$1`, [id]);
    }
    const points = Number(progress.rows[0]?.points || 0);
    const { level, rank } = calcProgression(points);
    const total = Number(ops.rows[0]?.total || 0), correct = Number(ops.rows[0]?.correct || 0);
    return res.status(200).json({ ok:true, player:{
      id, name:user.rows[0].name, joinedAt:user.rows[0].created_at,
      points, level, rank, rankName:rankName(rank), operations:total,
      accuracy:total ? Math.round(correct * 100 / total) : 0,
      completedTables:Number(completed.rows[0]?.count || 0),
      achievements:achievements.rows.map(a => ({ id:a.achievement_id, unlockedAt:a.unlocked_at })),
    }});
  } catch (error) {
    console.error("public player error", error);
    return res.status(500).json({ ok:false, error:"No se ha podido cargar el jugador." });
  }
}
