import { rangos } from "../constants";

export function pointsRequiredForLevel(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 100 * n + 10 * n * (n - 1);
}

export function calcProgression(points) {
  const safePoints = Math.max(0, Math.floor(Number(points) || 0));
  let level = 0;
  while (pointsRequiredForLevel(level + 1) <= safePoints) level += 1;
  const rank = Math.min(rangos.length - 1, Math.floor(level / 3));
  const currentFloor = pointsRequiredForLevel(level);
  const nextFloor = pointsRequiredForLevel(level + 1);
  const levelPoints = safePoints - currentFloor;
  const levelSpan = Math.max(1, nextFloor - currentFloor);
  return { level, rank, levelPoints, levelSpan, percent: Math.min(100, Math.round(levelPoints * 100 / levelSpan)) };
}

export function pointsForTable(tableNumber) {
  return Math.floor(Math.sqrt(Number(tableNumber) * 2.5 * 17) * 5);
}

export function tableAward({ tableNumber, correct, wrong, priorCompletions = 0 }) {
  const base = pointsForTable(tableNumber);
  const attempts = Math.max(1, Number(correct || 0) + Number(wrong || 0));
  const accuracy = Number(correct || 0) / attempts;
  const accuracyFactor = accuracy >= 1 ? 1.25 : accuracy >= 0.9 ? 1.1 : accuracy >= 0.75 ? 1 : accuracy >= 0.5 ? 0.8 : 0.6;
  const repeat = Number(priorCompletions || 0);
  const repeatFactor = repeat === 0 ? 1.25 : repeat <= 2 ? 1 : repeat === 3 ? 0.8 : repeat === 4 ? 0.6 : 0.5;
  return Math.max(1, Math.round(base * accuracyFactor * repeatFactor));
}

export function activityAward(type, { correct = 0, wrong = 0, total = 0, moves = 0, percentage } = {}) {
  const attempts = Math.max(1, Number(total || 0) || Number(correct || 0) + Number(wrong || 0));
  const pct = Number.isFinite(Number(percentage)) ? Number(percentage) : Math.round(Number(correct || 0) * 100 / attempts);
  if (type === "timed") {
    const accuracyFactor = pct >= 95 ? 1.2 : pct >= 85 ? 1 : pct >= 70 ? 0.8 : 0.6;
    return Math.min(70, Math.max(0, Math.round(Number(correct || 0) * 2 * accuracyFactor)));
  }
  if (type === "quiz") return Math.max(0, Math.min(100, Math.round(pct)));
  if (type === "diploma") return pct === 100 ? 200 : pct >= 90 ? 150 : Math.min(75, Math.round(pct * 0.75));
  if (type === "memory") return Number(moves || 0) <= 10 ? 30 : Number(moves || 0) <= 15 ? 25 : 20;
  if (type === "error_practice") return Number(correct || 0) > 0 ? 5 : 0;
  return 0;
}
