import React, { useEffect, useMemo, useState, useRef } from "react";
import Head from "next/head";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";

import styles from "./[tabla].module.css";

import { MenuKeyboard } from "../components/keyboard";
import { MenuTablas } from "../components/menuTablas";
import { randomTip } from "../constants";
import { updateResume, updateOperationTimer, runningOperationTimer, updateStatus, hydrateUserConfig } from "../redux/reducers/userConfigSlice";

import { TableBoard } from "../components/tabla/TableBoard";
import { WinModal } from "../components/tabla/WinModal";
import { SideMenu } from "../components/SideMenu/SideMenu";
import { unlockMany, hydrateAchievements } from "../redux/reducers/achievementsSlice";
import { useAuth } from "../components/auth/AuthContext";
import Link from "next/link";
import { Breadcrumbs } from "../components/seo/Breadcrumbs";
import { AppHeader } from "../components/layout/AppHeader";

const SITE_URL = "https://tablasdemultiplicar.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const TABLE_GUIDES = {
  1: { trick: "Multiplicar por 1 deja el número igual.", example: "1 × 8 = 8" },
  2: { trick: "Multiplicar por 2 es calcular el doble.", example: "2 × 7 = 14" },
  3: { trick: "Puedes pensar en el doble más una copia del número.", example: "3 × 6 = 12 + 6 = 18" },
  4: { trick: "Es el doble del doble.", example: "4 × 7: 7 → 14 → 28" },
  5: { trick: "Los resultados terminan en 5 o en 0.", example: "5 × 9 = 45" },
  6: { trick: "Puedes partir de 5 veces el número y sumar una copia más.", example: "6 × 7 = 35 + 7 = 42" },
  7: { trick: "Relaciona los productos difíciles con otros cercanos que ya conoces.", example: "7 × 8 = 5 × 8 + 2 × 8 = 56" },
  8: { trick: "Puedes duplicar tres veces para multiplicar por 8.", example: "8 × 6: 6 → 12 → 24 → 48" },
  9: { trick: "Del 1 al 10, las decenas suben mientras las unidades bajan.", example: "9 × 7 = 63" },
  10: { trick: "Multiplicar un entero por 10 añade un cero al final.", example: "10 × 8 = 80" },
  11: { trick: "Del 1 al 9, los resultados repiten la cifra.", example: "11 × 7 = 77" },
  12: { trick: "Puedes calcular 10 veces el número y sumar 2 veces el número.", example: "12 × 7 = 70 + 14 = 84" },
};

function useRandomTip() {
  return useMemo(() => {
    const idx = Math.floor(Math.random() * randomTip.length);
    return randomTip[idx];
  }, []);
}

export const Tabla = ({ tabla }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const hasAwardedRef = useRef(false);
  const practiceSessionRef = useRef(null);

  const segundos = useSelector((state) => state.aplicationConfig.userConfig.operationTimer);
  const resume = useSelector((state) => state.aplicationConfig.userConfig.resume);

  const numero = useMemo(() => Number(tabla.match(/\d+/)?.[0] || 1), [tabla]);
  const tip = useRandomTip();
  const guide = TABLE_GUIDES[numero];

  const [active, setActive] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showError, setShowError] = useState(false);
  const [isWinOpen, setIsWinOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);

  const safeResume = Array.isArray(resume) ? resume : [];

  const newPracticeSession = () => {
    practiceSessionRef.current = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : null;
  };

  // Temporizador global de la operación
  useEffect(() => {
    const id = setInterval(() => {
      dispatch(runningOperationTimer());
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  // Reset cuando cambia tabla
  useEffect(() => {
    dispatch(updateOperationTimer(0));
    setActive(1);
    setAnswers({});
    setShowError(false);
    setIsWinOpen(false);
    setIsMenuOpen(false);
    setAwardedPoints(0);
    hasAwardedRef.current = false;
    newPracticeSession();
  }, [dispatch, tabla]);

  const handleReset = () => {
    setActive(1);
    setAnswers({});
    setIsWinOpen(false);
    setAwardedPoints(0);
    // si vuelves a empezar en la misma tabla, permite volver a premiar al completar
    hasAwardedRef.current = false;
    newPracticeSession();
  };

  const pointsForTable = useMemo(() => {
    const multiplicador = numero * 2.5 * 17;
    const base = 5;
    return Math.floor(Math.sqrt(multiplicador) * base);
  }, [numero]);

  const unlockOnTableComplete = (resumeSnapshot) => {
    const snapshot = Array.isArray(resumeSnapshot) ? resumeSnapshot : [];

    // stats de la tabla actual (últimas 10)
    const rowsForThisTable = snapshot.filter((r) => r.table === tabla).slice(-10);
    const total = rowsForThisTable.length;
    const ok = rowsForThisTable.filter((r) => r.state === "Bien").length;
    const percent = total > 0 ? Math.round((ok / total) * 100) : 0;
    const avgTime = total > 0 ? rowsForThisTable.reduce((acc, r) => acc + (Number(r.time) || 0), 0) / total : 999;

    // stats globales
    const totalCorrect = snapshot.filter((r) => r.state === "Bien").length;

    // “tablas completadas” como número de finalizaciones (no únicas)
    const tableCounts = {};
    snapshot.forEach((r) => {
      tableCounts[r.table] = (tableCounts[r.table] || 0) + 1;
    });
    const completedTablesTotal = Object.values(tableCounts).reduce((acc, count) => acc + Math.floor(count / 10), 0);

    const ids = [];

    // 1) primera tabla completada (solo si has completado una tabla)
    if (total === 10) ids.push("first_table_completed");

    // 2) tabla concreta
    const n = Number(tabla.match(/\d+/)?.[0] || "");
    if (Number.isFinite(n) && total === 10) ids.push(`complete_table_${n}`);

    // 3) perfecta
    if (total === 10 && percent === 100) ids.push("perfect_table");

    // 4) velocidad
    if (total === 10 && avgTime <= 3) ids.push("speedster");

    // 5) completar X tablas (total de finalizaciones)
    if (completedTablesTotal >= 5) ids.push("complete_5_tables");
    if (completedTablesTotal >= 10) ids.push("complete_10_tables");
    if (completedTablesTotal >= 25) ids.push("complete_25_tables");
    if (completedTablesTotal >= 50) ids.push("complete_50_tables");

    // 6) aciertos totales
    if (totalCorrect >= 50) ids.push("get_50_correct");
    if (totalCorrect >= 100) ids.push("get_100_correct");

    if (ids.length) dispatch(unlockMany(ids));
  };

  const persistOperation = async ({ multiplier, isCorrect, responseTime }) => {
    if (!user || !practiceSessionRef.current) return;
    const response = await fetch("/api/progress/operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: practiceSessionRef.current, tableNumber: numero, multiplier, isCorrect, responseTime }),
    });
    if (!response.ok) throw new Error("No se ha podido guardar el progreso.");
  };

  const finalizeTableAndAward = async (resumeSnapshot) => {
    if (hasAwardedRef.current) return;
    hasAwardedRef.current = true;

    if (!user || !practiceSessionRef.current) {
      unlockOnTableComplete(resumeSnapshot);
      dispatch(updateStatus(pointsForTable));
      setAwardedPoints(pointsForTable);
      return;
    }

    const response = await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: practiceSessionRef.current }),
    });
    const data = await response.json();
    if (!response.ok) {
      hasAwardedRef.current = false;
      throw new Error(data.error || "No se ha podido guardar la tabla completada.");
    }
    setAwardedPoints(Number(data.pointsAwarded || pointsForTable));
    if (data.progress) {
      dispatch(hydrateUserConfig(data.progress.userConfig));
      dispatch(hydrateAchievements(data.progress.unlocked));
    }
  };

  const handleKey = async (value) => {
    if (isWinOpen || isMenuOpen) return;

    if (value === "Enviar") {
      const current = Number(answers[active] || NaN);
      const expected = numero * active;

      if (current === expected) {
        const nextRow = { table: tabla, operation: `${numero}x${active}`, state: "Bien", time: segundos };

        // Guarda de forma optimista en Redux y, si hay sesión iniciada, también en PostgreSQL.
        dispatch(updateResume(nextRow));
        try { await persistOperation({ multiplier: active, isCorrect: true, responseTime: segundos }); }
        catch (error) { console.error(error); }

        if (active < 10) {
          setActive((p) => p + 1);
        } else {
          // ✅ IMPORTANTE: calcula logros con snapshot que incluye la 10ª operación
          const nextResumeSnapshot = [...safeResume, nextRow];

          try { await finalizeTableAndAward(nextResumeSnapshot); }
          catch (error) { console.error(error); }
          setIsWinOpen(true);
        }
      } else {
        const nextRow = { table: tabla, operation: `${numero}x${active}`, state: "Mal", time: segundos };
        dispatch(updateResume(nextRow));
        try { await persistOperation({ multiplier: active, isCorrect: false, responseTime: segundos }); }
        catch (error) { console.error(error); }

        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
        setAnswers((prev) => ({ ...prev, [active]: "" }));
      }

      dispatch(updateOperationTimer(0));
      return;
    }

    if (value === "Borrar") {
      setAnswers((prev) => ({ ...prev, [active]: "" }));
      return;
    }

    setAnswers((prev) => ({ ...prev, [active]: `${prev[active] || ""}${String(value)}` }));
  };

  // Ahora solo resetea/cierra
  const handleAwardAndClose = () => {
    handleReset();
  };

  const pageTitle = `Tabla del ${numero} | Tablas de multiplicar`;
  const description = `Practica la tabla del ${numero} con un juego para niños: resuelve multiplicaciones, mejora tu tiempo y gana puntos.`;
  const canonical = `${SITE_URL}/${tabla}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={OG_IMAGE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: `Tabla de multiplicar del ${numero}`,
              url: canonical,
              inLanguage: "es-ES",
              isAccessibleForFree: true,
              teaches: ["tablas de multiplicar", `tabla del ${numero}`],
              educationalLevel: "Primary education",
              description,
            }),
          }}
        />
      </Head>

      <AppHeader />
      <div className={styles.root}>
        <div className={styles.breadcrumbTop}>
          <Breadcrumbs items={[
            { name: "Inicio", href: "/" },
            { name: "Todas las tablas", href: "/todas-las-tablas-de-multiplicar" },
            { name: `Tabla del ${numero}`, href: `/tabla-del-${numero}` },
          ]} />
        </div>
        <section className={styles.gameViewport} aria-label={`Práctica interactiva de la tabla del ${numero}`}>
        <div className={styles.wall}>
          <div className={styles.header}>
            <span />
            <SideMenu
              isOpen={isMenuOpen}
              onOpen={() => setIsMenuOpen(true)}
              onClose={() => setIsMenuOpen(false)}
            />
          </div>

          <h1 className={styles.title}>Aprende la {tabla.replaceAll("-", " ")}</h1>

          <TableBoard numero={numero} active={active} answers={answers} />
        </div>

        <div className={styles.wooden}>
          <MenuKeyboard callback={handleKey} />
        </div>

        {showError && <div className={styles.toast}>¡Incorrecta!</div>}

        <WinModal isOpen={isWinOpen} onClose={() => setIsWinOpen(false)} points={awardedPoints || pointsForTable} tip={tip}>
          <MenuTablas callbackButton={handleAwardAndClose} />
        </WinModal>
        </section>

        <section className={styles.seoContent}>
          <h2>Cómo aprender la tabla del {numero}</h2>
          <p>Empieza entendiendo cada multiplicación, repasa la tabla completa y practica recuperando el resultado de memoria. Cuando puedas responder en orden, mezcla las operaciones para evitar depender de la secuencia.</p>
          <div className={styles.tableTip}><strong>Truco para la tabla del {numero}:</strong> {guide.trick} <span>Ejemplo: {guide.example}.</span></div>

          <div className={styles.seoCards}>
            <article><h3>Practica sin mirar</h3><p>Intenta responder antes de consultar el resultado. Equivocarse sirve para detectar qué operaciones necesitan más repaso.</p></article>
            <article><h3>Mezcla operaciones</h3><p>Cuando completes la tabla con soltura, usa la prueba y el contrarreloj para entrenar resultados fuera de orden.</p></article>
            <article><h3>Repite los errores</h3><p>Dedica más intentos a las multiplicaciones que te cuestan y menos a las que ya respondes automáticamente.</p></article>
          </div>

          <h2>Ejercicios de la tabla del {numero}</h2>
          <div className={styles.resourceLinks}>
            <Link href="/contrarreloj">Practicar contrarreloj</Link>
            <Link href="/prueba-tablas-de-multiplicar">Hacer una prueba mezclada</Link>
            <Link href="/juego-memoria-multiplicaciones">Jugar al memory de multiplicaciones</Link>
            <Link href="/tabla-pitagorica">Consultar la tabla pitagórica</Link>
          </div>

          <h2>Preguntas frecuentes sobre la tabla del {numero}</h2>
          <div className={styles.faq}>
            <details><summary>¿Hasta qué número se practica la tabla del {numero}?</summary><p>En esta web mostramos la tabla del {numero} del 1 al 12. El juego principal trabaja primero las operaciones del 1 al 10 y los recursos de repaso incluyen también 11 y 12.</p></details>
            <details><summary>¿Cómo memorizar la tabla del {numero}?</summary><p>Combina consulta y recuperación activa: mira los resultados, tapa la respuesta e intenta recordarla. Después practica las operaciones en orden aleatorio.</p></details>
            <details><summary>¿Cómo puedo practicar la tabla del {numero} de otra forma?</summary><p>Puedes usar el contrarreloj, una prueba mezclada o el juego de memoria para practicar los resultados fuera del orden habitual.</p></details>
          </div>

          <nav className={styles.bottomNav} aria-label="Recursos relacionados">
            {numero > 1 ? <Link href={`/tabla-del-${numero - 1}`}>← Tabla del {numero - 1}</Link> : <span />}
            <Link href="/todas-las-tablas-de-multiplicar">Todas las tablas</Link>
            {numero < 12 ? <Link href={`/tabla-del-${numero + 1}`}>Tabla del {numero + 1} →</Link> : <span />}
          </nav>
        </section>
      </div>
    </>
  );
};

export function getStaticPaths() {
  return {
    paths: Array.from({ length: 12 }, (_, i) => ({ params: { tabla: `tabla-del-${i + 1}` } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const match = params.tabla.match(/^tabla-del-(\d+)$/);
  const numero = match ? Number(match[1]) : null;
  if (!numero || numero < 1 || numero > 12) return { notFound: true };
  return { props: { tabla: params.tabla } };
}

Tabla.propTypes = {
  tabla: PropTypes.string.isRequired,
};

export default Tabla;
