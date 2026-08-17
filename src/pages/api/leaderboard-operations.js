import { db } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  try {
    let result;
    try {
      result = await db.query(`
        SELECT u.id, COALESCE(NULLIF(TRIM(u.name), ''), 'Jugador') AS name, COUNT(o.id)::int AS operations
        FROM users u
        JOIN (
          SELECT ('p-' || id::text) AS id, user_id FROM practice_operations
          UNION ALL
          SELECT ('a-' || id::text) AS id, user_id FROM activity_operations
        ) o ON o.user_id=u.id
        GROUP BY u.id,u.name HAVING COUNT(o.id)>0
        ORDER BY operations DESC,name ASC LIMIT 10
      `);
    } catch (error) {
      if (error?.code !== "42P01") throw error;
      result = await db.query(`
        SELECT u.id, COALESCE(NULLIF(TRIM(u.name), ''), 'Jugador') AS name, COUNT(o.id)::int AS operations
        FROM users u JOIN practice_operations o ON o.user_id=u.id
        GROUP BY u.id,u.name HAVING COUNT(o.id)>0 ORDER BY operations DESC,name ASC LIMIT 10
      `);
    }
    return res.status(200).json({ ok:true, users:result.rows });
  } catch (error) {
    console.error("operations leaderboard error", error);
    return res.status(500).json({ ok:false, users:[] });
  }
}
