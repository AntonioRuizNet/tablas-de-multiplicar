export const ACHIEVEMENT_POINT_BONUS = {
  first_table_completed: 50,
  complete_5_tables: 75,
  complete_10_tables: 100,
  complete_25_tables: 175,
  complete_50_tables: 250,
  perfect_table: 50,
  get_50_correct: 50,
  get_100_correct: 100,
  speedster: 75,
  timed_20: 50,
  quiz_90: 75,
  diploma_earned: 100,
  memory_completed: 30,
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`complete_table_${i + 1}`, 25])),
};

export function achievementBonus(id) { return ACHIEVEMENT_POINT_BONUS[id] || 0; }
