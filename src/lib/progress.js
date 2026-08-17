import { db } from "./db";
import { rangos } from "../constants";

function calcLevel(points) {
  const level = Math.floor(Math.max(0, points) / 100);
  const rank = Math.floor(level / 2);
  return { level, rank };
}

export function pointsForTable(tableNumber) {
  return Math.floor(Math.sqrt(tableNumber * 2.5 * 17) * 5);
}

export async function ensureProgress(userId, client = db) {
  await client.query(`INSERT INTO user_progress (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [userId]);
}

export async function loadProgress(userId, client = db) {
  await ensureProgress(userId, client);
  const progress = await client.query(
    `SELECT points, level, rank FROM user_progress WHERE user_id = $1`, [userId]
  );
  const operations = await client.query(
    `SELECT table_number, multiplier, is_correct, response_time_seconds, created_at
     FROM practice_operations WHERE user_id = $1 ORDER BY created_at ASC LIMIT 5000`, [userId]
  );
  const achievements = await client.query(
    `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1 ORDER BY unlocked_at ASC`, [userId]
  );
  const p = progress.rows[0] || { points: 0, level: 0, rank: 0 };
  return {
    userConfig: {
      puntos: Number(p.points || 0),
      nivel: Number(p.level || 0),
      rango: Number(p.rank || 0),
      rate: 1,
      operationTimer: 0,
      componentActive: null,
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

export function rankName(rank) {
  return rangos[rank] || rangos[rangos.length - 1];
}

export async function updatePoints(userId, delta, client = db) {
  await ensureProgress(userId, client);
  const current = await client.query(`SELECT points FROM user_progress WHERE user_id = $1 FOR UPDATE`, [userId]);
  const points = Math.max(0, Number(current.rows[0]?.points || 0) + Number(delta || 0));
  const { level, rank } = calcLevel(points);
  await client.query(
    `UPDATE user_progress SET points = $2, level = $3, rank = $4, updated_at = NOW() WHERE user_id = $1`,
    [userId, points, level, rank]
  );
  return { puntos: points, nivel: level, rango: rank };
}
