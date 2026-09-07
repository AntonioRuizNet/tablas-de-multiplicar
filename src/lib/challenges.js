import crypto from "crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeChallengeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function normalizeChallengeTitle(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 140);
}

export function normalizeTables(value) {
  const input = Array.isArray(value) ? value : [];
  return [...new Set(input.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 12))].sort((a, b) => a - b);
}

export function randomChallengeCode(length = 7) {
  return Array.from({ length }, () => CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)]).join("");
}

export async function createUniqueChallengeCode(client) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = randomChallengeCode();
    const exists = await client.query(`SELECT 1 FROM classroom_challenges WHERE code=$1 LIMIT 1`, [code]);
    if (!exists.rowCount) return code;
  }
  throw new Error("No se ha podido generar un código de reto único.");
}

export function challengeUrl(code) {
  return `/reto/${normalizeChallengeCode(code)}`;
}
