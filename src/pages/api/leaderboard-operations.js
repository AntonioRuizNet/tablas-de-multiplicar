import { db } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false });

  try {
    const result = await db.query(`
      SELECT
        u.id,
        COALESCE(NULLIF(TRIM(u.name), ''), 'Jugador') AS name,
        COUNT(o.id)::int AS operations
      FROM users u
      JOIN practice_operations o ON o.user_id = u.id
      WHERE u.role = 'user'
      GROUP BY u.id, u.name
      HAVING COUNT(o.id) > 0
      ORDER BY operations DESC, name ASC
      LIMIT 10
    `);

    return res.status(200).json({ ok: true, users: result.rows });
  } catch (error) {
    console.error("operations leaderboard error", error);
    return res.status(500).json({ ok: false, users: [] });
  }
}
