import { db } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Método no permitido." });
  }

  try {
    const result = await db.query(`
      SELECT
        u.id,
        COALESCE(NULLIF(TRIM(u.name), ''), 'Usuario') AS name,
        p.points
      FROM user_progress p
      INNER JOIN users u ON u.id = p.user_id
      ORDER BY p.points DESC, p.updated_at ASC, u.id ASC
      LIMIT 10
    `);

    return res.status(200).json({ ok: true, users: result.rows });
  } catch (error) {
    console.error("leaderboard error", error);
    return res.status(500).json({ ok: false, error: "No se ha podido cargar la clasificación." });
  }
}
