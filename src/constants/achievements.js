export const ACHIEVEMENTS = [
  {
    id: "first_table_completed",
    icon: "🏁",
    title: "¡Primera tabla!",
    description: "Completa tu primera tabla de multiplicar.",
    border: "rgba(14, 165, 233, 0.45)",
    background: "rgba(14, 165, 233, 0.12)",
  },
  {
    id: "complete_5_tables",
    icon: "🧩",
    title: "¡5 tablas completas!",
    description: "Completa 5 tablas de multiplicar.",
    border: "rgba(99, 102, 241, 0.45)",
    background: "rgba(99, 102, 241, 0.12)",
  },
  {
    id: "complete_10_tables",
    icon: "🏅",
    title: "¡10 tablas completas!",
    description: "Completa 10 tablas de multiplicar.",
    border: "rgba(168, 85, 247, 0.45)",
    background: "rgba(168, 85, 247, 0.12)",
  },
  {
    id: "complete_25_tables",
    icon: "🏆",
    title: "¡25 tablas completas!",
    description: "Completa 25 tablas de multiplicar.",
    border: "rgba(245, 158, 11, 0.55)",
    background: "rgba(245, 158, 11, 0.12)",
  },
  {
    id: "complete_50_tables",
    icon: "👑",
    title: "¡50 tablas completas!",
    description: "Completa 50 tablas de multiplicar.",
    border: "rgba(239, 68, 68, 0.45)",
    background: "rgba(239, 68, 68, 0.12)",
  },
  {
    id: "perfect_table",
    icon: "🎯",
    title: "Tabla perfecta",
    description: "Completa una tabla con 10/10 aciertos.",
    border: "rgba(34, 197, 94, 0.45)",
    background: "rgba(34, 197, 94, 0.12)",
  },
  {
    id: "get_50_correct",
    icon: "✅",
    title: "50 aciertos",
    description: "Consigue 50 aciertos en total.",
    border: "rgba(34, 197, 94, 0.45)",
    background: "rgba(34, 197, 94, 0.12)",
  },
  {
    id: "get_100_correct",
    icon: "💯",
    title: "100 aciertos",
    description: "Consigue 100 aciertos en total.",
    border: "rgba(14, 165, 233, 0.45)",
    background: "rgba(14, 165, 233, 0.12)",
  },
  {
    id: "speedster",
    icon: "⚡",
    title: "¡Qué velocidad!",
    description: "Tiempo medio ≤ 3.0s en una tabla completada.",
    border: "rgba(245, 158, 11, 0.55)",
    background: "rgba(245, 158, 11, 0.12)",
  },

  // Tablas 1..12
  ...Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
    id: `complete_table_${n}`,
    icon: "📚",
    title: `Tabla del ${n}`,
    description: `Completa la tabla del ${n}.`,
    border: "rgba(139, 90, 43, 0.35)",
    background: "rgba(255, 255, 255, 0.45)",
    meta: { table: n },
  })),
];

// Helper para acceso rápido
export const ACHIEVEMENTS_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
