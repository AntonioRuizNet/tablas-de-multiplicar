import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";

const personFields = "u.id, COALESCE(NULLIF(BTRIM(u.name),''),'Jugador') AS name, u.avatar_icon, u.avatar_color, COALESCE(p.points,0)::int AS points";

export default async function handler(req, res) {
  const user = await requireUser(req, res); if (!user) return;
  try {
    if (req.method === "GET") {
      if (req.query.summary === "1") {
        const pending = await db.query(`SELECT COUNT(*)::int AS count FROM friendships WHERE recipient_id=$1 AND status='pending'`, [user.id]);
        return res.status(200).json({ ok: true, pendingReceived: pending.rows[0].count });
      }
      const q = String(req.query.q || "").trim();
      const [search, received, sent, friends] = await Promise.all([
        q.length >= 2 ? db.query(`SELECT ${personFields} FROM users u LEFT JOIN user_progress p ON p.user_id=u.id WHERE u.id<>$1 AND u.name ILIKE $2 ORDER BY u.name ASC LIMIT 10`, [user.id, `%${q}%`]) : Promise.resolve({ rows: [] }),
        db.query(`SELECT f.id AS friendship_id, f.created_at, ${personFields} FROM friendships f JOIN users u ON u.id=f.requester_id LEFT JOIN user_progress p ON p.user_id=u.id WHERE f.recipient_id=$1 AND f.status='pending' ORDER BY f.created_at DESC`, [user.id]),
        db.query(`SELECT f.id AS friendship_id, f.created_at, ${personFields} FROM friendships f JOIN users u ON u.id=f.recipient_id LEFT JOIN user_progress p ON p.user_id=u.id WHERE f.requester_id=$1 AND f.status='pending' ORDER BY f.created_at DESC`, [user.id]),
        db.query(`SELECT f.id AS friendship_id, f.updated_at, ${personFields} FROM friendships f JOIN users u ON u.id=CASE WHEN f.requester_id=$1 THEN f.recipient_id ELSE f.requester_id END LEFT JOIN user_progress p ON p.user_id=u.id WHERE (f.requester_id=$1 OR f.recipient_id=$1) AND f.status='accepted' ORDER BY u.name ASC`, [user.id]),
      ]);
      return res.status(200).json({ ok:true, search:search.rows, pendingReceived:received.rows, pendingSent:sent.rows, friends:friends.rows });
    }
    if (req.method !== "POST") return res.status(405).json({ ok:false });
    const action = String(req.body?.action || ""); const friendshipId = Number(req.body?.friendshipId); const targetId = String(req.body?.targetId || "");
    if (action === "request") {
      if (!targetId || targetId === user.id) return res.status(400).json({ ok:false, error:"Jugador no válido." });
      await db.query(`INSERT INTO friendships (requester_id,recipient_id) VALUES ($1,$2) ON CONFLICT (LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id)) DO NOTHING`, [user.id,targetId]);
    } else if (action === "accept" || action === "reject") {
      const result = action === "accept" ? await db.query(`UPDATE friendships SET status='accepted',updated_at=NOW() WHERE id=$1 AND recipient_id=$2 AND status='pending'`, [friendshipId,user.id]) : await db.query(`DELETE FROM friendships WHERE id=$1 AND recipient_id=$2 AND status='pending'`, [friendshipId,user.id]);
      if (!result.rowCount) return res.status(404).json({ ok:false, error:"Solicitud no encontrada." });
    } else if (action === "remove") await db.query(`DELETE FROM friendships WHERE id=$1 AND (requester_id=$2 OR recipient_id=$2)`, [friendshipId,user.id]);
    else return res.status(400).json({ ok:false, error:"Acción no válida." });
    return res.status(200).json({ ok:true });
  } catch (error) { console.error("friends error",error); return res.status(500).json({ok:false,error:"No se ha podido actualizar las amistades."}); }
}
