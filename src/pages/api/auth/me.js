import { getSessionUser, publicUser } from "../../../lib/auth";
import { loadProgress } from "../../../lib/progress";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  const user = await getSessionUser(req);
  if (!user) return res.status(200).json({ ok: true, user: null, progress: null });
  return res.status(200).json({ ok: true, user: publicUser(user), progress: await loadProgress(user.id) });
}
