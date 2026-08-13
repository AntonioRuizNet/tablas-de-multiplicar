const BLOCKED_TERMS = [
  "puta", "puto", "mierda", "joder", "gilipollas", "cabron", "cabrona",
  "cojones", "polla", "pene", "vagina", "sexo", "porno", "pornografia",
  "maricon", "maricona", "subnormal", "retrasado", "retrasada", "idiota",
  "imbecil", "estupido", "estupida", "zorra", "bastardo", "bastarda",
  "fuck", "fucker", "fucking", "shit", "bitch", "asshole", "dick", "penis",
  "vagina", "porn", "sex", "nigger", "nigga", "faggot", "retard"
];

const LEET_MAP = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
};

export function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function comparableUsername(value) {
  return normalizeUsername(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split("")
    .map((char) => LEET_MAP[char] || char)
    .join("")
    .replace(/[^a-z0-9]/g, "");
}

export function validateUsername(value) {
  const name = normalizeUsername(value);

  if (name.length < 2) {
    return { ok: false, error: "El nombre debe tener al menos 2 caracteres." };
  }
  if (name.length > 30) {
    return { ok: false, error: "El nombre no puede superar los 30 caracteres." };
  }
  if (!/^[\p{L}\p{N} _-]+$/u.test(name)) {
    return { ok: false, error: "El nombre solo puede contener letras, números, espacios, guiones y guiones bajos." };
  }

  const comparable = comparableUsername(name);
  if (BLOCKED_TERMS.some((term) => comparable.includes(term))) {
    return { ok: false, error: "Ese nombre no está permitido. Elige otro nombre." };
  }

  return { ok: true, name };
}

export async function usernameExists(dbClient, name, excludeUserId = null) {
  const params = [name];
  let sql = `SELECT 1 FROM users WHERE LOWER(BTRIM(name)) = LOWER(BTRIM($1))`;
  if (excludeUserId) {
    params.push(excludeUserId);
    sql += ` AND id <> $2`;
  }
  sql += ` LIMIT 1`;
  const result = await dbClient.query(sql, params);
  return result.rowCount > 0;
}
