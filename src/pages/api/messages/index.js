import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";

const MAX_LENGTH = 280;
const BLOCKED_WORDS = ["puta", "puto", "mierda", "gilipollas", "cabrón", "cabron", "polla", "porno", "subnormal", "imbecil", "idiota", "fuck", "shit", "bitch", "asshole"];
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const isFriend = (userId, otherId) => db.query(`SELECT 1 FROM friendships WHERE status='accepted' AND ((requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1))`, [userId, otherId]);
const isBlocked = (userId, otherId) => db.query(`SELECT 1 FROM user_blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1)`, [userId, otherId]);

export default async function handler(req, res) {
  const user = await requireUser(req, res); if (!user) return;
  try {
    if (req.method === "GET") {
      if (req.query.summary === "1") {
        const result = await db.query(`SELECT COUNT(*)::int AS count FROM friend_messages WHERE recipient_id=$1 AND read_at IS NULL`, [user.id]);
        return res.status(200).json({ ok:true, unread:result.rows[0].count });
      }
      const otherId = String(req.query.with || "");
      if (otherId) {
        const [friend, blocked] = await Promise.all([isFriend(user.id, otherId), isBlocked(user.id, otherId)]);
        if (!friend.rowCount) return res.status(403).json({ ok:false, error:"Solo puedes hablar con amigos." });
        await db.query(`UPDATE friend_messages SET read_at=NOW() WHERE sender_id=$1 AND recipient_id=$2 AND read_at IS NULL`, [otherId, user.id]);
        const [person, messages] = await Promise.all([
          db.query(`SELECT id,COALESCE(NULLIF(BTRIM(name),''),'Jugador') AS name,avatar_icon,avatar_color FROM users WHERE id=$1`, [otherId]),
          db.query(`SELECT id,sender_id,body,created_at,read_at FROM friend_messages WHERE (sender_id=$1 AND recipient_id=$2) OR (sender_id=$2 AND recipient_id=$1) ORDER BY created_at ASC LIMIT 200`, [user.id, otherId]),
        ]);
        return res.status(200).json({ ok:true, person:person.rows[0], messages:messages.rows, blocked:Boolean(blocked.rowCount) });
      }
      const conversations = await db.query(`
        SELECT u.id,COALESCE(NULLIF(BTRIM(u.name),''),'Jugador') AS name,u.avatar_icon,u.avatar_color,
          last_message.body AS last_body,last_message.created_at AS last_at,
          COUNT(m.id) FILTER (WHERE m.recipient_id=$1 AND m.read_at IS NULL)::int AS unread
        FROM friendships f JOIN users u ON u.id=CASE WHEN f.requester_id=$1 THEN f.recipient_id ELSE f.requester_id END
        LEFT JOIN LATERAL (SELECT body,created_at FROM friend_messages WHERE (sender_id=$1 AND recipient_id=u.id) OR (sender_id=u.id AND recipient_id=$1) ORDER BY created_at DESC LIMIT 1) last_message ON true
        LEFT JOIN friend_messages m ON ((m.sender_id=$1 AND m.recipient_id=u.id) OR (m.sender_id=u.id AND m.recipient_id=$1))
        WHERE f.status='accepted' AND (f.requester_id=$1 OR f.recipient_id=$1)
        GROUP BY u.id,u.name,u.avatar_icon,u.avatar_color,last_message.body,last_message.created_at
        ORDER BY last_message.created_at DESC NULLS LAST,u.name ASC`, [user.id]);
      return res.status(200).json({ ok:true, conversations:conversations.rows });
    }
    if (req.method !== "POST") return res.status(405).json({ ok:false });
    const action = String(req.body?.action || "send");
    if (action === "report") {
      const messageId = Number(req.body?.messageId);
      const report = await db.query(`INSERT INTO friend_message_reports (message_id,reporter_id) SELECT id,$2 FROM friend_messages WHERE id=$1 AND (sender_id=$2 OR recipient_id=$2) ON CONFLICT DO NOTHING`, [messageId,user.id]);
      if (!report.rowCount) return res.status(404).json({ok:false,error:"Mensaje no encontrado."});
      return res.status(201).json({ok:true});
    }
    const otherId = String(req.body?.recipientId || req.body?.userId || "");
    if (!otherId || otherId === user.id) return res.status(400).json({ ok:false,error:"Usuario no válido." });
    if (action === "block" || action === "unblock") {
      if (action === "block") await db.query(`INSERT INTO user_blocks (blocker_id,blocked_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [user.id,otherId]);
      else await db.query(`DELETE FROM user_blocks WHERE blocker_id=$1 AND blocked_id=$2`, [user.id,otherId]);
      return res.status(200).json({ok:true});
    }
    const body = String(req.body?.body || "").trim();
    if (!body || body.length > MAX_LENGTH) return res.status(400).json({ok:false,error:`El mensaje debe tener entre 1 y ${MAX_LENGTH} caracteres.`});
    if (/https?:\/\/|www\./i.test(body)) return res.status(400).json({ok:false,error:"No se permiten enlaces en los mensajes."});
    if (BLOCKED_WORDS.some((word) => normalize(body).includes(normalize(word)))) return res.status(400).json({ok:false,error:"El mensaje contiene lenguaje no permitido."});
    const [friend,blocked] = await Promise.all([isFriend(user.id,otherId),isBlocked(user.id,otherId)]);
    if (!friend.rowCount) return res.status(403).json({ok:false,error:"Solo puedes enviar mensajes a amigos."});
    if (blocked.rowCount) return res.status(403).json({ok:false,error:"No puedes enviar mensajes a este usuario."});
    const result = await db.query(`INSERT INTO friend_messages (sender_id,recipient_id,body) VALUES ($1,$2,$3) RETURNING id,sender_id,body,created_at,read_at`, [user.id,otherId,body]);
    return res.status(201).json({ok:true,message:result.rows[0]});
  } catch (error) { console.error("messages error",error); return res.status(500).json({ok:false,error:"No se ha podido gestionar la mensajería."}); }
}
