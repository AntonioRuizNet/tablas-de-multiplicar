import crypto from "crypto";
import { db } from "./db";

export const SESSION_COOKIE = "tdm_session";
export const RECOVERY_COOKIE = "tdm_recovery";
const SESSION_DAYS = 30;

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function publicUser(row) {
  return row ? { id: row.id, email: row.email, name: row.name || "", role: row.role, nameChangedAt: row.name_changed_at || null } : null;
}

export function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return Object.fromEntries(
    raw.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
      const idx = part.indexOf("=");
      return [decodeURIComponent(part.slice(0, idx)), decodeURIComponent(part.slice(idx + 1))];
    })
  );
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
  return { token, expiresAt };
}

export function setSessionCookie(res, token, expiresAt) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`
  );
}


export function setRecoveryCookie(res, token, expiresAt) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  const cookie = `${RECOVERY_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
  const current = res.getHeader("Set-Cookie");
  res.setHeader("Set-Cookie", current ? ([]).concat(current, cookie) : cookie);
}

export function clearRecoveryCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const cookie = `${RECOVERY_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  const current = res.getHeader("Set-Cookie");
  res.setHeader("Set-Cookie", current ? ([]).concat(current, cookie) : cookie);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

export async function getSessionUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.name, u.role, u.name_changed_at
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

export async function deleteCurrentSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await db.query(`DELETE FROM auth_sessions WHERE token_hash = $1`, [tokenHash]);
}

export async function requireUser(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: "Debes iniciar sesión." });
    return null;
  }
  return user;
}
