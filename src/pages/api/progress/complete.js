import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import { loadProgress, updatePoints } from "../../../lib/progress";
import { tableAward } from "../../../lib/progression";
import { achievementBonus } from "../../../lib/achievementRewards";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const user = await requireUser(req, res); if (!user) return;
  const sessionId = String(req.body?.sessionId || "");
  if (!UUID_RE.test(sessionId)) return res.status(400).json({ ok: false, error: "Sesión no válida." });

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const sessionResult = await client.query(
      `SELECT id, table_number, completed_at FROM practice_sessions WHERE id=$1 AND user_id=$2 FOR UPDATE`, [sessionId, user.id]
    );
    if (!sessionResult.rowCount) { await client.query("ROLLBACK"); return res.status(404).json({ ok:false, error:"Sesión no encontrada." }); }
    const session = sessionResult.rows[0];
    if (session.completed_at) {
      await client.query("COMMIT");
      return res.status(200).json({ ok: true, alreadyCompleted: true, progress: await loadProgress(user.id) });
    }

    const ops = await client.query(
      `SELECT multiplier, is_correct, response_time_seconds FROM practice_operations WHERE session_id=$1 AND user_id=$2 ORDER BY created_at ASC`, [sessionId, user.id]
    );
    const correctMultipliers = new Set(ops.rows.filter((o) => o.is_correct).map((o) => Number(o.multiplier)));
    if ([1,2,3,4,5,6,7,8,9,10].some((n) => !correctMultipliers.has(n))) {
      await client.query("ROLLBACK");
      return res.status(400).json({ ok: false, error: "La tabla aún no está completada." });
    }

    const tableNumber = Number(session.table_number);
    const correctRows = ops.rows.filter((o) => o.is_correct);
    const wrongCount = ops.rows.length - correctRows.length;
    const avgTime = correctRows.length ? correctRows.reduce((a,o) => a + Number(o.response_time_seconds || 0), 0) / correctRows.length : 0;
    const isPerfect = wrongCount === 0 && correctRows.length === 10;
    const priorResult = await client.query(
      `SELECT COUNT(*)::int AS count FROM practice_sessions WHERE user_id=$1 AND table_number=$2 AND completed_at IS NOT NULL`, [user.id, tableNumber]
    );
    const baseAward = tableAward({ tableNumber, correct: correctRows.length, wrong: wrongCount, priorCompletions: priorResult.rows[0].count });

    await client.query(
      `UPDATE practice_sessions SET completed_at=NOW(), points_awarded=$2, correct_count=$3, wrong_count=$4, average_time_seconds=$5 WHERE id=$1`,
      [sessionId, baseAward, correctRows.length, wrongCount, avgTime]
    );

    const totals = await client.query(
      `SELECT
        (SELECT COUNT(*)::int FROM practice_sessions WHERE user_id=$1 AND completed_at IS NOT NULL) completed,
        (SELECT COUNT(*)::int FROM practice_operations WHERE user_id=$1 AND is_correct=true) correct`, [user.id]
    );
    const completed = totals.rows[0].completed;
    const totalCorrect = totals.rows[0].correct;
    const ids = ["first_table_completed", `complete_table_${tableNumber}`];
    if (isPerfect) ids.push("perfect_table");
    if (avgTime <= 3) ids.push("speedster");
    if (completed >= 5) ids.push("complete_5_tables");
    if (completed >= 10) ids.push("complete_10_tables");
    if (completed >= 25) ids.push("complete_25_tables");
    if (completed >= 50) ids.push("complete_50_tables");
    if (totalCorrect >= 50) ids.push("get_50_correct");
    if (totalCorrect >= 100) ids.push("get_100_correct");

    let bonusAward = 0;
    const newlyUnlocked = [];
    for (const id of ids) {
      const inserted = await client.query(
        `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1,$2)
         ON CONFLICT (user_id, achievement_id) DO NOTHING RETURNING achievement_id`, [user.id,id]
      );
      if (inserted.rowCount) { newlyUnlocked.push(id); bonusAward += achievementBonus(id); }
    }

    const totalAward = baseAward + bonusAward;
    await client.query(`UPDATE practice_sessions SET points_awarded=$2 WHERE id=$1`, [sessionId, totalAward]);
    const pointState = await updatePoints(user.id, totalAward, client);
    await client.query("COMMIT");
    const progress = await loadProgress(user.id);
    return res.status(200).json({ ok:true, pointsAwarded:totalAward, basePoints:baseAward, achievementBonus:bonusAward, newlyUnlocked, pointState, progress });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(error);
    return res.status(500).json({ ok:false, error:"No se ha podido completar la tabla." });
  } finally { client.release(); }
}
