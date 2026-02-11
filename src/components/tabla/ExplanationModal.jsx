// components/tabla/ExplanationModal.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Link from "next/link";

import styles from "./ExplanationModal.module.css";

/**
 * Modal "Explicación"
 * - Contenido único por número (intro + como calcular + patrones + micro-ejercicios)
 * - Enlaces internos estratégicos
 * - Poca duplicidad: solo 1 bloque global corto + 1 FAQ específica por tabla
 */

function buildExplanation(n) {
  const N = Number.isFinite(n) ? n : 1;

  // Bloque global corto (mínimo común, sin relleno)
  const global = {
    base: "Idea clave: aprende 2–3 anclas (×5, ×10, dobles) y calcula el resto con sumas/restas rápidas. Practicar poco y constante funciona mejor que sesiones largas.",
  };

  const examples = [
    { q: `${N}×4`, a: `${N * 4}` },
    { q: `${N}×7`, a: `${N * 7}` },
    { q: `${N}×9`, a: `${N * 9}` },
  ];

  const byN = {
    1: {
      title: "Qué significa multiplicar por 1",
      intro:
        "Multiplicar por 1 significa conservar la misma cantidad. Es la regla más básica y sirve para empezar a automatizar el formato de las operaciones.",
      how: "Regla: 1×n = n. Si ves 1×8, el resultado es 8 sin hacer cuentas.",
      patterns: ["No cambia el número.", "Es útil para ganar confianza y velocidad al empezar."],
      faq: { q: "¿Por qué 1×n siempre es n?", a: "Porque 1 representa “una vez”. Una vez un número es ese mismo número." },
      related: { label: "Refuerza dobles", href: "/tabla-del-2" },
    },
    2: {
      title: "La tabla del 2 son dobles",
      intro:
        "La tabla del 2 se entiende como “doblar”. Si sabes doblar un número, sabes resolver la mayoría de operaciones al instante.",
      how: "Cálculo rápido: 2×n = n+n. Por ejemplo, 2×7 = 7+7 = 14.",
      patterns: ["Siempre da números pares.", "Se puede aprender como una secuencia: 2, 4, 6, 8, 10…"],
      faq: { q: "¿Qué hago si me cuesta doblar mentalmente?", a: "Practica con números pequeños y usa anclas: 2×5=10, 2×10=20." },
      related: { label: "Doble del doble", href: "/tabla-del-4" },
    },
    3: {
      title: "La tabla del 3 con sumas y relación con el 6",
      intro:
        "La tabla del 3 se puede calcular sumando 3 repetidamente. Además, la tabla del 6 es el doble, así que puedes usarla para comprobar.",
      how: "Cálculo rápido: 3×n = n+n+n. Alternativa: si sabes 6×n, divide entre 2 para obtener 3×n.",
      patterns: ["Resultados en pasos de 3.", "Relación: 6×n = 2×(3×n)."],
      faq: { q: "¿Cómo verifico 3×n rápido?", a: "Calcula 6×n y divide entre 2; o suma 3 otra vez al resultado anterior." },
      related: { label: "Usa el doble (tabla del 6)", href: "/tabla-del-6" },
    },
    4: {
      title: "La tabla del 4 como doble del doble",
      intro: "La tabla del 4 es muy rápida si dominas la del 2: basta con doblar dos veces.",
      how: "Cálculo rápido: 4×n = 2×(2×n). Ejemplo: 4×7 → 2×7=14 → doble=28.",
      patterns: ["Muchos resultados terminan en 0, 2, 4, 6 u 8.", "Relación con 8: 8×n es el doble de 4×n."],
      faq: { q: "¿Qué ancla recomiendas en la tabla del 4?", a: "4×5=20 y 4×10=40, y desde ahí ajusta sumando/restando 4." },
      related: { label: "Doblado triple (tabla del 8)", href: "/tabla-del-8" },
    },
    5: {
      title: "La tabla del 5: finales 0 o 5",
      intro:
        "La tabla del 5 es de las más agradecidas: los resultados terminan en 0 o 5 y puedes decidirlo mirando si el multiplicador es par o impar.",
      how: "Cálculo rápido: 5×n = (10×n)/2. Si sabes 10×n, lo partes por la mitad.",
      patterns: ["Si n es par, acaba en 0; si n es impar, acaba en 5.", "Ancla: 5×10=50 y 5×2=10."],
      faq: { q: "¿Cómo saco 5×8 sin memorizar?", a: "10×8=80 y la mitad es 40 → 5×8=40." },
      related: { label: "Comprueba con la tabla del 10", href: "/tabla-del-10" },
    },
    6: {
      title: "La tabla del 6: 5×n + n",
      intro:
        "La tabla del 6 se vuelve sencilla con un truco práctico: calcula 5×n y súmale n. También es el doble de la tabla del 3.",
      how: "Cálculo rápido: 6×n = (5×n) + n. Ejemplo: 6×7 = 35 + 7 = 42.",
      patterns: ["Relación con 3: 6×n = 2×(3×n).", "Anclas: 6×5=30 y 6×10=60."],
      faq: { q: "¿Cuál es el método más estable para 6×n?", a: "5×n + n es muy fiable y rápido, sobre todo con n entre 6 y 10." },
      related: { label: "Aprende la base (tabla del 3)", href: "/tabla-del-3" },
    },
    7: {
      title: "La tabla del 7 con anclas y 10−2",
      intro:
        "La tabla del 7 suele costar más porque no hay un patrón tan evidente. Lo mejor es usar anclas (×5 y ×10) y descomponer.",
      how: "Cálculo rápido: 7×n = (10×n) − (3×n) o 7×8 = 7×(10−2) = 70−14 = 56.",
      patterns: ["Anclas: 7×5=35 y 7×10=70.", "Si sabes 14×n, la mitad es 7×n (útil para comprobar)."],
      faq: { q: "¿Cómo memorizo 7×8 y 7×9?", a: "Usa el ancla 7×10=70: 7×9=63 (70−7) y 7×8=56 (70−14)." },
      related: { label: "Apóyate en 10−n (tabla del 9)", href: "/tabla-del-9" },
    },
    8: {
      title: "La tabla del 8 con dobles (2×2×2)",
      intro: "La tabla del 8 encaja perfecto con dobles repetidos: 8 es 2×2×2. Si sabes doblar tres veces, la tabla sale sola.",
      how: "Cálculo rápido: 8×n = doble de 4×n = doble del doble de 2×n. Ej.: 8×6 → 6×2=12 → 24 → 48.",
      patterns: ["Muchos resultados terminan en 0, 2, 4, 6 u 8.", "Anclas: 8×5=40 y 8×10=80."],
      faq: { q: "¿Qué ancla ayuda más en la tabla del 8?", a: "8×5=40. Desde ahí: 8×6=48, 8×7=56, 8×8=64..." },
      related: { label: "Doble del doble (tabla del 4)", href: "/tabla-del-4" },
    },
    9: {
      title: "La tabla del 9 como 10×n − n",
      intro:
        "La tabla del 9 es muy rápida si la conviertes en una resta: 10×n menos n. Además, hay patrones fáciles para comprobar.",
      how: "Cálculo rápido: 9×n = (10×n) − n. Ej.: 9×8 = 80 − 8 = 72.",
      patterns: ["Suele cumplirse que la suma de cifras da 9 (63 → 6+3=9).", "Ancla: 9×10=90 (para comprobar 9×9=81)."],
      faq: {
        q: "¿Cómo compruebo un resultado del 9 rápido?",
        a: "Suma las cifras: si da 9 (o múltiplo de 9), suele estar bien. Y también puedes usar 10×n−n.",
      },
      related: { label: "Usa el 10 como base (tabla del 10)", href: "/tabla-del-10" },
    },
    10: {
      title: "La tabla del 10 para calcular otras",
      intro:
        "La tabla del 10 no solo es fácil; también sirve como herramienta para calcular otras tablas (9, 12, 15...) con sumas y restas.",
      how: "Cálculo rápido: 10×n es n con un 0. Ej.: 10×7=70. Luego puedes hacer 9×n = 10×n − n.",
      patterns: ["Es una base excelente para trucos (10±algo).", "Ancla: 10×12=120 para conectar con la tabla del 12."],
      faq: {
        q: "¿Para qué me sirve aprender bien la del 10?",
        a: "Para calcular rápido 9×n, 12×n (10×n + 2×n) y muchas descomposiciones.",
      },
      related: { label: "Prueba el 12 como 10+2", href: "/tabla-del-12" },
    },
    11: {
      title: "La tabla del 11: 10×n + n",
      intro: "La tabla del 11 se entiende como sumar una vez más: 11×n es 10×n + n. Del 1 al 9, el patrón es muy directo.",
      how: "Cálculo rápido: 11×n = (10×n) + n. Ej.: 11×7 = 70 + 7 = 77.",
      patterns: ["Del 1 al 9: 11×4=44.", "Con dos cifras: 11×23=253 (2, 2+3, 3)."],
      faq: { q: "¿Cómo calculo 11×23 mentalmente?", a: "Coloca 2 y 3 y suma en medio: 2(2+3)3 → 253." },
      related: { label: "Usa el 10 como base", href: "/tabla-del-10" },
    },
    12: {
      title: "La tabla del 12 como 10×n + 2×n",
      intro: "La tabla del 12 se domina descomponiendo: 12 = 10 + 2. Así puedes calcular casi todo sin memorizar.",
      how: "Cálculo rápido: 12×n = (10×n) + (2×n). Ej.: 12×8 = 80 + 16 = 96.",
      patterns: ["Otra descomposición: 12 = 3×4, útil si te sale más cómodo.", "Anclas: 12×5=60 y 12×10=120."],
      faq: { q: "¿Qué descomposición recomiendas para 12×n?", a: "10×n + 2×n es la más rápida y fácil de automatizar." },
      related: { label: "Refuerza dobles (tabla del 2)", href: "/tabla-del-2" },
    },
  };

  const content = byN[N] || byN[1];

  return {
    base: global.base,
    title: content.title,
    intro: content.intro,
    how: content.how,
    patterns: content.patterns,
    examples,
    faq: content.faq,
    related: content.related,
  };
}

export function ExplanationButton({ onClick }) {
  return (
    <button type="button" className={styles.explButton} onClick={onClick} aria-label="Abrir explicación">
      Explicación
    </button>
  );
}

ExplanationButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export function ExplanationModal({ isOpen, onClose, numero }) {
  const n = Number(numero) || 1;

  const data = useMemo(() => buildExplanation(n), [n]);

  const prev = n > 1 ? n - 1 : null;
  const next = n < 12 ? n + 1 : null;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={`Explicación de la tabla del ${n}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.top}>
          <h2 className={styles.title}>Explicación: tabla del {n}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar explicación">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.p}>{data.base}</p>

          <h3 className={styles.h3}>{data.title}</h3>
          <p className={styles.p}>{data.intro}</p>

          <h3 className={styles.h3}>Cómo calcular {n}×número</h3>
          <p className={styles.p}>{data.how}</p>

          <h3 className={styles.h3}>Patrones y relaciones</h3>
          <ul className={styles.list}>
            {data.patterns.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>

          <h3 className={styles.h3}>Mini-ejercicios (con solución)</h3>
          <ul className={styles.list}>
            {data.examples.map((ex, idx) => (
              <li key={idx}>
                <strong>{ex.q}</strong> = {ex.a}
              </li>
            ))}
          </ul>

          <h3 className={styles.h3}>Pregunta frecuente</h3>
          <div className={styles.faq}>
            <details>
              <summary>{data.faq.q}</summary>
              <p>{data.faq.a}</p>
            </details>
          </div>

          <div className={styles.links} aria-label="Enlaces recomendados">
            {/* Enlace estratégico relacionado (por tabla) */}
            {data.related?.href ? (
              <Link className={styles.link} href={data.related.href}>
                {data.related.label}
              </Link>
            ) : null}

            {/* Navegación interna */}
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

ExplanationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  numero: PropTypes.number.isRequired,
};
