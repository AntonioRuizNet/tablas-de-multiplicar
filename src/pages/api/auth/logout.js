import { clearSessionCookie, deleteCurrentSession } from "../../../lib/auth";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  await deleteCurrentSession(req);
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
