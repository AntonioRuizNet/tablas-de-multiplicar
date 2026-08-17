import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import { loadProgress, updatePoints } from "../../../lib/progress";
import { activityAward } from "../../../lib/progression";
import { achievementBonus } from "../../../lib/achievementRewards";

const TYPES = new Set(["timed", "quiz", "diploma", "memory", "error_practice"]);
const int = (v, min, max) => Math.min(max, Math.max(min, Math.floor(Number(v) || 0)));
function cleanOperations(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 200).map((op) => ({
    table: int(op?.table, 1, 12), multiplier: int(op?.multiplier, 1, 12),
    answer: Number(op?.answer), time: Math.max(0, Math.min(600, Number(op?.time) || 0)),
  })).filter((op) => Number.isFinite(op.answer));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Método no permitido." });
  const user = await requireUser(req, res); if (!user) return;
  const type = String(req.body?.type || "");
  if (!TYPES.has(type)) return res.status(400).json({ ok:false, error:"Actividad no válida." });

  const operations = cleanOperations(req.body?.operations);
  const moves = int(req.body?.moves, 0, 500);
  if (type === "quiz" && operations.length !== 30) return res.status(400).json({ ok:false, error:"La prueba debe tener 30 preguntas." });
  if (type === "diploma" && operations.length !== 40) return res.status(400).json({ ok:false, error:"El diploma debe tener 40 preguntas." });
  if (type === "timed" && operations.length > 120) return res.status(400).json({ ok:false, error:"Resultado no válido." });
  if (type === "memory" && moves < 6) return res.status(400).json({ ok:false, error:"Partida de memoria no válida." });
  if (type === "error_practice" && operations.length !== 1) return res.status(400).json({ ok:false, error:"Repaso no válido." });

  const evaluated = operations.map((op) => ({ ...op, isCorrect: op.answer === op.table * op.multiplier }));
  const correct = type === "memory" ? 6 : evaluated.filter((op) => op.isCorrect).length;
  const total = type === "memory" ? 6 : evaluated.length;
  const wrong = Math.max(0, total - correct);
  const percentage = total ? Math.round(correct * 100 / total) : 0;
  let award = activityAward(type, { correct, wrong, total, moves, percentage });
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    if (type === "error_practice") {
      if (!evaluated[0]?.isCorrect) award = 0;
      const today = await client.query(
        `SELECT COALESCE(SUM(points_awarded),0)::int AS points FROM activity_sessions
         WHERE user_id=$1 AND activity_type='error_practice' AND created_at >= CURRENT_DATE`, [user.id]
      );
      award = Math.min(award, Math.max(0, 25 - Number(today.rows[0].points || 0)));
    }
    const session = await client.query(
      `INSERT INTO activity_sessions (user_id, activity_type, correct_count, wrong_count, total_count, score_percent, moves, points_awarded)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, [user.id,type,correct,wrong,total,percentage,moves,award]
    );
    for (const op of evaluated) {
      await client.query(
        `INSERT INTO activity_operations (session_id,user_id,table_number,multiplier,is_correct,response_time_seconds)
         VALUES ($1,$2,$3,$4,$5,$6)`, [session.rows[0].id,user.id,op.table,op.multiplier,op.isCorrect,op.time]
      );
    }
    const achievementIds = [];
    if (type === "timed" && correct >= 20) achievementIds.push("timed_20");
    if (type === "quiz" && percentage >= 90) achievementIds.push("quiz_90");
    if (type === "diploma" && percentage >= 90) achievementIds.push("diploma_earned");
    if (type === "memory") achievementIds.push("memory_completed");
    let bonusAward = 0;
    const newlyUnlocked = [];
    for (const id of achievementIds) {
      const inserted = await client.query(
        `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1,$2)
         ON CONFLICT (user_id, achievement_id) DO NOTHING RETURNING achievement_id`, [user.id,id]
      );
      if (inserted.rowCount) { newlyUnlocked.push(id); bonusAward += achievementBonus(id); }
    }
    const totalAward = award + bonusAward;
    await client.query(`UPDATE activity_sessions SET points_awarded=$2 WHERE id=$1`, [session.rows[0].id,totalAward]);
    const pointState = await updatePoints(user.id, totalAward, client);
    await client.query("COMMIT");
    return res.status(200).json({ ok:true, pointsAwarded:totalAward, basePoints:award, achievementBonus:bonusAward, newlyUnlocked, pointState, progress:await loadProgress(user.id) });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("activity reward error", error);
    return res.status(500).json({ ok:false, error:"No se ha podido guardar la recompensa." });
  } finally { client.release(); }
}
