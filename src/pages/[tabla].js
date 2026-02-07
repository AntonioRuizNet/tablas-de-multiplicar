import React, { useEffect, useMemo, useState, useRef } from "react";
import Head from "next/head";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";

import styles from "./[tabla].module.css";

import { MenuKeyboard } from "../components/keyboard";
import { MenuTablas } from "../components/menuTablas";
import { randomTip } from "../constants";
import { updateResume, updateOperationTimer, runningOperationTimer, updateStatus } from "../redux/reducers/userConfigSlice";

import { StatsBar } from "../components/tabla/StatsBar";
import { TableBoard } from "../components/tabla/TableBoard";
import { WinModal } from "../components/tabla/WinModal";
import { HistoryModal } from "../components/tabla/HistoryModal";
import { SideMenu } from "../components/SideMenu/SideMenu";
import { AchievementsModal } from "../components/tabla/AchievementsModal";
import { unlockMany } from "../redux/reducers/achievementsSlice";
import { ProfileModal } from "../components/profile/ProfileModal";

const SITE_URL = "https://tablasdemultiplicar.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function useRandomTip() {
  return useMemo(() => {
    const idx = Math.floor(Math.random() * randomTip.length);
    return randomTip[idx];
  }, []);
}

export const Tabla = ({ tabla }) => {
  const dispatch = useDispatch();
  const hasAwardedRef = useRef(false);

  const segundos = useSelector((state) => state.aplicationConfig.userConfig.operationTimer);
  const resume = useSelector((state) => state.aplicationConfig.userConfig.resume);

  const numero = useMemo(() => Number(tabla.match(/\d+/)?.[0] || 1), [tabla]);
  const tip = useRandomTip();

  const [active, setActive] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showError, setShowError] = useState(false);
  const [isWinOpen, setIsWinOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
    setIsHistoryOpen(false);
    setIsMenuOpen(false);
    setIsAchievementsOpen(false);
    setIsProfileOpen(false);
    hasAwardedRef.current = false;
  }, [dispatch, tabla]);

  const handleReset = () => {
    setActive(1);
    setAnswers({});
    setIsWinOpen(false);
    // 👇 importante: si vuelves a empezar en la misma tabla, permite volver a premiar al completar
    hasAwardedRef.current = false;
  };

  const pointsForTable = useMemo(() => {
    const multiplicador = numero * 2.5 * 17;
    const base = 5;
    return Math.floor(Math.sqrt(multiplicador) * base);
  }, [numero]);

  const unlockOnTableComplete = () => {
    const safeResume = Array.isArray(resume) ? resume : [];

    // ✅ stats de la tabla actual (últimas 10)
    const rowsForThisTable = safeResume.filter((r) => r.table === tabla).slice(-10);
    const total = rowsForThisTable.length;
    const ok = rowsForThisTable.filter((r) => r.state === "Bien").length;
    const percent = total > 0 ? Math.round((ok / total) * 100) : 0;
    const avgTime = total > 0 ? rowsForThisTable.reduce((acc, r) => acc + (Number(r.time) || 0), 0) / total : 999;

    // ✅ stats globales
    const totalCorrect = safeResume.filter((r) => r.state === "Bien").length;

    // ✅ “tablas completadas” como número de finalizaciones (no únicas)
    // Definición: cada vez que hay 10 operaciones registradas para una tabla, cuenta como 1 "tabla completada".
    // Contamos por tabla: Math.floor(rows.length / 10), sumado.
    const tableCounts = {};
    safeResume.forEach((r) => {
      tableCounts[r.table] = (tableCounts[r.table] || 0) + 1;
    });

    const completedTablesTotal = Object.values(tableCounts).reduce((acc, count) => acc + Math.floor(count / 10), 0);

    const ids = [];

    // 1) primera tabla completada (solo tiene sentido si has completado una)
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

    dispatch(unlockMany(ids));
  };

  // ✅ Aquí se aplica TODO al momento de completar la tabla (no al cambiar de tabla)
  const finalizeTableAndAward = () => {
    if (hasAwardedRef.current) return;
    hasAwardedRef.current = true;

    unlockOnTableComplete();
    dispatch(updateStatus(pointsForTable));
  };

  const handleKey = (value) => {
    if (isWinOpen || isHistoryOpen || isMenuOpen || isAchievementsOpen || isProfileOpen) return;

    if (value === "Enviar") {
      const current = Number(answers[active] || NaN);
      const expected = numero * active;

      if (current === expected) {
        dispatch(updateResume({ table: tabla, operation: `${numero}x${active}`, state: "Bien", time: segundos }));

        if (active < 10) {
          setActive((p) => p + 1);
        } else {
          // ✅ Completa tabla: premia + logros + abre modal
          finalizeTableAndAward();
          setIsWinOpen(true);
        }
      } else {
        dispatch(updateResume({ table: tabla, operation: `${numero}x${active}`, state: "Mal", time: segundos }));
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

  // ✅ Ahora solo resetea/cierra (ya no otorga puntos ni logros)
  const handleAwardAndClose = () => {
    handleReset();
  };

  const pageTitle = `Tabla del ${numero} | Tablas de multiplicar`;
  const description = `Practica la tabla del ${numero} con un juego para niños: resuelve multiplicaciones, mejora tu tiempo y gana puntos.`;
  const canonical = `${SITE_URL}/${tabla}`;

  const safeResume = Array.isArray(resume) ? resume : [];

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

      <div className={styles.page}>
        <div className={styles.wall}>
          <div className={styles.header}>
            <StatsBar />

            <SideMenu
              isOpen={isMenuOpen}
              onOpen={() => setIsMenuOpen(true)}
              onClose={() => setIsMenuOpen(false)}
              onOpenHistory={() => {
                setIsMenuOpen(false);
                setIsHistoryOpen(true);
              }}
              currentTabla={tabla}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          </div>

          <h1 className={styles.title}>Aprende la {tabla.replaceAll("-", " ")}</h1>

          <TableBoard numero={numero} active={active} answers={answers} />
        </div>

        <div className={styles.wooden}>
          <MenuKeyboard callback={handleKey} />
        </div>

        {showError && <div className={styles.toast}>¡Incorrecta!</div>}

        <WinModal isOpen={isWinOpen} onClose={() => setIsWinOpen(false)} points={pointsForTable} tip={tip}>
          <MenuTablas callbackButton={handleAwardAndClose} />
        </WinModal>

        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          rows={[...safeResume].slice(-200).reverse()}
        />
        <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const { tabla } = context.params;
  return { props: { tabla } };
}

Tabla.propTypes = {
  tabla: PropTypes.string.isRequired,
};

export default Tabla;
