import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";
import { updatePoints } from "../../../lib/progress";

const TYPES = new Set(["addition", "subtraction", "division"]);

function expectedResult(type, a, b) {
  if (type === "addition") return a + b;
  if (type === "subtraction") return a - b;
  if (type === "division") return a / b;
  return NaN;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const user = await requireUser(req, res); if (!user) return;

  const operationType = String(req.body?.operationType || "");
  const level = Number(req.body?.level);
  const a = Number(req.body?.a);
  const b = Number(req.body?.b);
  const answer = Number(req.body?.answer);

  if (!TYPES.has(operationType) || !Number.isInteger(level) || level < 1 || level > 7 || ![a, b, answer].every(Number.isInteger) || a < 0 || b <= 0) {
    return res.status(400).json({ ok: false, error: "Datos de operación no válidos." });
  }
  if (operationType === "subtraction" && a < b) {
    return res.status(400).json({ ok: false, error: "La resta no puede dar un resultado negativo." });
  }
  if (operationType === "division" && a % b !== 0) {
    return res.status(400).json({ ok: false, error: "La división debe tener un resultado entero." });
  }

  const isCorrect = answer === expectedResult(operationType, a, b);
  const pointsAwarded = isCorrect ? 1 : 0;
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO arithmetic_operations (user_id, operation_type, level, operand_a, operand_b, answer, is_correct, points_awarded)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [user.id, operationType, level, a, b, answer, isCorrect, pointsAwarded]
    );
    const pointState = pointsAwarded ? await updatePoints(user.id, pointsAwarded, client) : null;
    await client.query("COMMIT");
    return res.status(201).json({ ok: true, isCorrect, pointsAwarded, pointState });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("arithmetic operation error", error);
    return res.status(500).json({ ok: false, error: "No se ha podido guardar la operación." });
  } finally {
    client.release();
  }
}
