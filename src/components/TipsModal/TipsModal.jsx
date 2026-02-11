// components/tabla/TipsModal.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Link from "next/link";

import styles from "./TipsModal.module.css";

/**
 * Objetivo SEO/UX:
 * - Poco contenido global repetido
 * - Contenido específico por tabla (intro + tips + ejemplos + 1 FAQ específica)
 * - Mantenerlo dentro de un modal accesible (contenido real para el usuario)
 */

function buildTableContent(n) {
  const N = Number.isFinite(n) ? n : 1;

  const base = {
    intro:
      "Practica en sesiones cortas (5–10 min) y combina orden (para memorizar) con mezclado (para ganar velocidad). Si fallas, repite esa operación 2–3 veces y sigue.",
    globalFaq: [
      {
        q: "¿En orden o mezclado?",
        a: "En orden sirve para memorizar la secuencia. Mezclado entrena agilidad mental. Lo ideal es combinar ambos.",
      },
      {
        q: "¿Cuánto tiempo practicar al día?",
        a: "Con 5–10 minutos diarios suele ser suficiente si eres constante. Mejor poco cada día que mucho un solo día.",
      },
    ],
  };

  // Helpers
  const examples = [`${N}×3=${N * 3}`, `${N}×6=${N * 6}`, `${N}×9=${N * 9}`];

  // Contenido específico por tabla (1..12)
  const byN = {
    1: {
      intro:
        "La tabla del 1 es la base: cualquier número multiplicado por 1 se queda igual. Úsala para ganar confianza y coger ritmo en el juego.",
      tips: [
        "Regla clave: 1×n = n.",
        "Lee en voz alta el resultado para automatizar: 1×7=7, 1×9=9…",
        "Si dudas, piensa: “multiplicar por 1 no cambia nada”.",
      ],
      faq: {
        q: "¿Por qué la tabla del 1 es tan fácil?",
        a: "Porque multiplicar por 1 mantiene el mismo número. Es una propiedad básica de la multiplicación.",
      },
      examples: ["1×4=4", "1×7=7", "1×10=10"],
    },
    2: {
      intro: "La tabla del 2 se aprende rápido porque equivale a “doblar”. Si controlas los dobles, controlas la tabla del 2.",
      tips: [
        "Piensa en dobles: 2×6 es el doble de 6 (12).",
        "Suma el número consigo mismo: 2×7 = 7+7.",
        "Practica en parejas: 2, 4, 6, 8… para interiorizar el patrón.",
      ],
      faq: {
        q: "¿Cuál es el truco más rápido para la tabla del 2?",
        a: "Doblar el número (sumarlo consigo mismo).",
      },
      examples,
    },
    3: {
      intro:
        "La tabla del 3 funciona muy bien con sumas repetidas y patrones. Si te cuesta, apóyate en la del 6 (doble de la del 3).",
      tips: [
        "Suma 3 en 3: 3, 6, 9, 12, 15…",
        "Relaciona: 6×n es el doble de 3×n (si sabes 3×7=21, entonces 6×7=42).",
        "Memoriza anclas: 3×5=15 y 3×10=30; el resto es ajustar.",
      ],
      faq: {
        q: "¿Cómo uso la tabla del 6 para aprender la del 3?",
        a: "Si sabes 6×n, divide entre 2 para obtener 3×n (por ejemplo, 6×8=48 → 3×8=24).",
      },
      examples,
    },
    4: {
      intro: "La tabla del 4 es ideal para aprender con dobles: es el doble del doble. Si dominas la del 2, la del 4 cae sola.",
      tips: [
        "Doble del doble: 4×n = 2×(2×n).",
        "Ejemplo mental: 4×7 → 2×7=14 → doble otra vez = 28.",
        "Memoriza 4×5=20 y 4×10=40 como puntos de referencia.",
      ],
      faq: {
        q: "¿Truco rápido para 4×n?",
        a: "Dobla el número dos veces: n→2n→4n.",
      },
      examples,
    },
    5: {
      intro: "La tabla del 5 es de las más rápidas: casi siempre verás finales en 0 o 5. Perfecta para coger velocidad.",
      tips: [
        "Los resultados terminan siempre en 0 o 5.",
        "Si el multiplicador es par, acaba en 0 (6×5=30). Si es impar, acaba en 5 (7×5=35).",
        "Relación útil: 10×n es el doble de 5×n (si 5×8=40, entonces 10×8=80).",
      ],
      faq: {
        q: "¿Cómo sé si termina en 0 o en 5?",
        a: "Si el número por el que multiplicas es par, termina en 0; si es impar, termina en 5.",
      },
      examples,
    },
    6: {
      intro: "La tabla del 6 se aprende fácil si conectas con la del 3: es el doble. También puedes verla como 5×n + 1×n.",
      tips: [
        "Doble de la del 3: 6×n = 2×(3×n).",
        "Suma rápida: 6×n = (5×n) + n.",
        "Anclas: 6×5=30 y 6×10=60. El resto es ajustar.",
      ],
      faq: {
        q: "¿Truco rápido para 6×n?",
        a: "Calcula 5×n y súmale n (por ejemplo 6×7 = 35 + 7 = 42).",
      },
      examples,
    },
    7: {
      intro:
        "La tabla del 7 suele costar más porque no tiene un patrón tan obvio. La clave es usar “anclas” (7×5, 7×10) y descomponer.",
      tips: [
        "Anclas: 7×5=35 y 7×10=70. Desde ahí ajustas sumando o restando 7.",
        "Descompón: 7×8 = 7×(10−2) = 70−14 = 56.",
        "Relaciona con 14: 7×n es la mitad de 14×n (útil si te sale más cómodo doblar y dividir).",
      ],
      faq: {
        q: "¿Cómo memorizar más rápido la tabla del 7?",
        a: "Empieza por 7×5 y 7×10, y calcula el resto sumando o restando 7 (por ejemplo 7×9=70−7=63).",
      },
      examples,
    },
    8: {
      intro: "La tabla del 8 es perfecta para el truco de dobles repetidos: 8 es 2×2×2. Si sabes doblar, sabes la tabla del 8.",
      tips: [
        "Dobles: 8×n = doble de 4×n = doble del doble de 2×n.",
        "Ejemplo mental: 8×6 → 6×2=12 → doble=24 → doble=48.",
        "Anclas: 8×5=40 y 8×10=80 para verificar resultados.",
      ],
      faq: {
        q: "¿Truco rápido para 8×n?",
        a: "Dobla tres veces: n→2n→4n→8n.",
      },
      examples,
    },
    9: {
      intro:
        "La tabla del 9 tiene trucos muy conocidos. Úsalos para ganar velocidad, pero no olvides practicar para automatizar.",
      tips: [
        "Truco de dedos: baja el dedo del número (9×3 → baja el 3) y tendrás 2 y 7 → 27.",
        "La suma de cifras del resultado suele dar 9 (9×7=63 → 6+3=9).",
        "Descomposición: 9×n = (10×n) − n.",
      ],
      faq: {
        q: "¿Cómo calcular 9×n sin memorizar?",
        a: "Haz 10×n y resta n (por ejemplo 9×8=80−8=72).",
      },
      examples,
    },
    10: {
      intro: "La tabla del 10 es inmediata: solo añade un cero. Es ideal para comprobar resultados con otras tablas.",
      tips: [
        "Añade un 0 al final (8×10=80).",
        "Relación: 5×n es la mitad de 10×n; 20×n es el doble de 10×n.",
        "Usa 10×n para trucos como 9×n = 10×n − n.",
      ],
      faq: {
        q: "¿Por qué es tan fácil la tabla del 10?",
        a: "Porque en base 10 multiplicar por 10 desplaza un lugar y añade un 0 al final.",
      },
      examples: ["10×3=30", "10×6=60", "10×9=90"],
    },
    11: {
      intro:
        "La tabla del 11 tiene un patrón muy simple del 1 al 9 (n→nn). Para números de dos cifras, hay un truco de suma intermedia.",
      tips: [
        "Del 1 al 9: repite el número (11×4=44).",
        "Con dos cifras: 11×23=253 (2, 2+3, 3).",
        "Verificación: 11×n = 10×n + n.",
      ],
      faq: {
        q: "¿Cómo calculo 11×n rápido?",
        a: "Haz 10×n y súmale n (por ejemplo 11×7=70+7=77).",
      },
      examples: ["11×3=33", "11×6=66", "11×9=99"],
    },
    12: {
      intro: "La tabla del 12 se domina descomponiendo: 12 = 10 + 2. Con eso puedes calcular muy rápido sin memorizar todo.",
      tips: [
        "Piensa en 12 como 10 + 2: (12×7) = (10×7) + (2×7) = 70 + 14.",
        "También puedes usar 12 = 3×4: (12×n) = (3×n)×4.",
        "Ancla: 12×5=60 y 12×10=120 para comprobar.",
      ],
      faq: {
        q: "¿Truco rápido para 12×n?",
        a: "Calcula 10×n + 2×n (por ejemplo 12×8=80+16=96).",
      },
      examples,
    },
  };

  const content = byN[N] || byN[1];

  // Añadimos ejemplos por defecto si no se definieron específicos
  const finalExamples = content.examples?.length ? content.examples : examples;

  return {
    intro: content.intro,
    tips: content.tips,
    examples: finalExamples,
    faq: content.faq,
    globalFaq: base.globalFaq,
  };
}

export function TipsButton({ onClick }) {
  return (
    <button type="button" className={styles.tipButton} onClick={onClick} aria-label="Abrir consejos">
      Consejos
    </button>
  );
}

TipsButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export function TipsModal({ isOpen, onClose, numero }) {
  const n = Number(numero) || 1;

  const data = useMemo(() => buildTableContent(n), [n]);

  const prev = n > 1 ? n - 1 : null;
  const next = n < 12 ? n + 1 : null;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={`Consejos para la tabla del ${n}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.top}>
          <h2 className={styles.title}>Consejos: tabla del {n}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar consejos">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {/* Intro específico por tabla */}
          <p className={styles.p}>{data.intro}</p>

          <h3 className={styles.h3}>Trucos para la tabla del {n}</h3>
          <ul className={styles.list}>
            {data.tips.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>

          <h3 className={styles.h3}>Ejemplos rápidos</h3>
          <ul className={styles.list}>
            {data.examples.map((ex, idx) => (
              <li key={idx}>{ex}</li>
            ))}
          </ul>

          <h3 className={styles.h3}>Preguntas frecuentes</h3>
          <div className={styles.faq}>
            {/* 1 FAQ específica por tabla (diferenciación por URL) */}
            <details>
              <summary>{data.faq.q}</summary>
              <p>{data.faq.a}</p>
            </details>

            {/* 2 FAQs globales (poco repetitivas y útiles) */}
            {data.globalFaq.map((item, idx) => (
              <details key={idx}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>

          <div className={styles.links} aria-label="Navegación recomendada">
            {prev ? (
              <Link className={styles.link} href={`/tabla-del-${prev}`}>
                Repasar tabla del {prev}
              </Link>
            ) : (
              <span className={styles.linkDisabled} aria-hidden="true">
                Repasar tabla anterior
              </span>
            )}

            {next ? (
              <Link className={styles.link} href={`/tabla-del-${next}`}>
                Siguiente: tabla del {next}
              </Link>
            ) : (
              <span className={styles.linkDisabled} aria-hidden="true">
                Siguiente tabla
              </span>
            )}

            <Link className={styles.link} href="/#elige-tabla">
              Ver todas las tablas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

TipsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  numero: PropTypes.number.isRequired,
};
