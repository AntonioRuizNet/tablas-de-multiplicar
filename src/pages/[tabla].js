import React, { useEffect, useMemo, useState } from "react";
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
  }, [dispatch, tabla]);

  const handleReset = () => {
    setActive(1);
    setAnswers({});
    setIsWinOpen(false);
  };

  const handleKey = (value) => {
    if (isWinOpen || isHistoryOpen) return;

    if (value === "Enviar") {
      const current = Number(answers[active] || NaN);
      const expected = numero * active;

      if (current === expected) {
        dispatch(updateResume({ table: tabla, operation: `${numero}x${active}`, state: "Bien", time: segundos }));
        if (active < 10) setActive((p) => p + 1);
        else setIsWinOpen(true);
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

  const pointsForTable = useMemo(() => {
    const multiplicador = numero * 2.5 * 17;
    const base = 5;
    return Math.floor(Math.sqrt(multiplicador) * base);
  }, [numero]);

  const handleAwardAndClose = () => {
    dispatch(updateStatus(pointsForTable));
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

        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} rows={[...resume].slice(-200).reverse()} />
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
