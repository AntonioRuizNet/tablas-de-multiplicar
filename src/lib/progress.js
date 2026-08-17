import { db } from "./db";
import { rangos } from "../constants";
import { calcProgression, pointsForTable } from "./progression";

export { pointsForTable };

export async function ensureProgress(userId, client = db) {
  await client.query(`INSERT INTO user_progress (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [userId]);
}

export async function loadProgress(userId, client = db) {
  await ensureProgress(userId, client);
  const progress = await client.query(`SELECT points FROM user_progress WHERE user_id = $1`, [userId]);
  let operations;
  try {
    operations = await client.query(
      `SELECT table_number, multiplier, is_correct, response_time_seconds, created_at FROM (
         SELECT table_number, multiplier, is_correct, response_time_seconds, created_at FROM practice_operations WHERE user_id=$1
         UNION ALL
         SELECT table_number, multiplier, is_correct, response_time_seconds, created_at FROM activity_operations WHERE user_id=$1
       ) combined ORDER BY created_at ASC LIMIT 5000`, [userId]
    );
  } catch (error) {
    if (error?.code !== "42P01") throw error;
    operations = await client.query(
      `SELECT table_number, multiplier, is_correct, response_time_seconds, created_at
       FROM practice_operations WHERE user_id=$1 ORDER BY created_at ASC LIMIT 5000`, [userId]
    );
  }
  const achievements = await client.query(
    `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1 ORDER BY unlocked_at ASC`, [userId]
  );
  const points = Number(progress.rows[0]?.points || 0);
  const { level, rank } = calcProgression(points);
  // Mantiene sincronizados los campos derivados de instalaciones anteriores.
  await client.query(`UPDATE user_progress SET level=$2, rank=$3 WHERE user_id=$1 AND (level IS DISTINCT FROM $2 OR rank IS DISTINCT FROM $3)`, [userId, level, rank]);
  return {
    userConfig: {
      puntos: points, nivel: level, rango: rank, rate: 1, operationTimer: 0, componentActive: null,
      resume: operations.rows.map((row) => ({
        table: `tabla-del-${row.table_number}`,
        operation: `${row.table_number}x${row.multiplier}`,
        state: row.is_correct ? "Bien" : "Mal",
        time: Number(row.response_time_seconds || 0),
      })),
    },
    unlocked: Object.fromEntries(achievements.rows.map((a) => [a.achievement_id, { unlockedAt: new Date(a.unlocked_at).getTime() }])),
  };
}

export function rankName(rank) { return rangos[rank] || rangos[rangos.length - 1]; }

export async function updatePoints(userId, delta, client = db) {
  await ensureProgress(userId, client);
  const current = await client.query(`SELECT points FROM user_progress WHERE user_id = $1 FOR UPDATE`, [userId]);
  const points = Math.max(0, Number(current.rows[0]?.points || 0) + Number(delta || 0));
  const { level, rank } = calcProgression(points);
  await client.query(`UPDATE user_progress SET points=$2, level=$3, rank=$4, updated_at=NOW() WHERE user_id=$1`, [userId, points, level, rank]);
  return { puntos: points, nivel: level, rango: rank };
}
