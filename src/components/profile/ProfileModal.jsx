import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import styles from "./ProfileModal.module.css";
import { rangos } from "../../constants";

function getTableNumber(table) {
  return Number(String(table).match(/\d+/)?.[0] || "");
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function ProfileModal({ isOpen, onClose }) {
  const userConfig = useSelector((state) => state.aplicationConfig.userConfig);
  const resume = useSelector((state) => state.aplicationConfig.userConfig.resume || []);
  const unlocked = useSelector((state) => state.achievements?.unlocked || {});

  const stats = useMemo(() => {
    const totalOps = resume.length;
    const okOps = resume.filter((r) => r.state === "Bien").length;
    const badOps = resume.filter((r) => r.state === "Mal").length;

    const percent = totalOps > 0 ? Math.round((okOps / totalOps) * 100) : 0;

    const times = resume.map((r) => Number(r.time)).filter((t) => Number.isFinite(t));
    const avgTime = times.length ? round1(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    // Tablas completadas = tablas en las que existen 10 operaciones (últimas 10 cuentan)
    const byTable = new Map();
    resume.forEach((r) => {
      if (!byTable.has(r.table)) byTable.set(r.table, []);
      byTable.get(r.table).push(r);
    });

    const completedTables = [];
    const tableSummaries = [];

    byTable.forEach((rows, table) => {
      // Tomamos los últimos 10 intentos de esa tabla (los más recientes)
      const last10 = rows.slice(-10);
      const tTotal = last10.length;
      const tOk = last10.filter((x) => x.state === "Bien").length;
      const tPercent = tTotal ? Math.round((tOk / tTotal) * 100) : 0;

      const tTimes = last10.map((x) => Number(x.time)).filter((t) => Number.isFinite(t));
      const tAvg = tTimes.length ? round1(tTimes.reduce((a, b) => a + b, 0) / tTimes.length) : 0;

      const n = getTableNumber(table);
      const tableLabel = Number.isFinite(n) ? `Tabla ${n}` : table;

      tableSummaries.push({
        table,
        tableLabel,
        percent: tPercent,
        avgTime: tAvg,
        attempts: tTotal,
      });

      if (tTotal === 10) completedTables.push(table);
    });

    tableSummaries.sort((a, b) => {
      // Primero mejor % y luego menor tiempo
      if (b.percent !== a.percent) return b.percent - a.percent;
      return a.avgTime - b.avgTime;
    });

    const topTables = tableSummaries.slice(0, 3);

    const unlockedCount = Object.keys(unlocked).length;

    return {
      totalOps,
      okOps,
      badOps,
      percent,
      avgTime,
      completedCount: completedTables.length,
      topTables,
      unlockedCount,
    };
  }, [resume, unlocked]);

  if (!isOpen) return null;

  const nivel = userConfig?.nivel ?? 1;
  const puntos = userConfig?.puntos ?? 0;
  const rangoIndex = userConfig?.rango ?? 0;
  const rangoName = rangos[rangoIndex] || rangos[rangos.length - 1];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Perfil">
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Perfil</h2>
            <p className={styles.subtitle}>Tu progreso en Tablas de multiplicar</p>
            <small className={styles.subtitle}>Estos se eliminarán periódicamente</small>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar perfil">
            ✕
          </button>
        </div>

        <div className={styles.kpis}>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Nivel</div>
            <div className={styles.cardValue}>{nivel}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>Rango</div>
            <div className={styles.cardValue}>{rangoName}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>Puntos</div>
            <div className={styles.cardValue}>{puntos}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>Logros</div>
            <div className={styles.cardValue}>{stats.unlockedCount}</div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.h3}>Estadísticas</h3>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Operaciones</span>
              <span className={styles.statValue}>{stats.totalOps}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Aciertos</span>
              <span className={styles.statValue}>{stats.okOps}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Fallos</span>
              <span className={styles.statValue}>{stats.badOps}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Precisión</span>
              <span className={styles.statValue}>{stats.percent}%</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Tiempo medio</span>
              <span className={styles.statValue}>{stats.avgTime}s</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Tablas completadas</span>
              <span className={styles.statValue}>{stats.completedCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.h3}>Tus mejores tablas</h3>

          {stats.topTables.length === 0 ? (
            <p className={styles.empty}>Completa alguna tabla para ver tus estadísticas.</p>
          ) : (
            <ul className={styles.topList}>
              {stats.topTables.map((t) => (
                <li key={t.table} className={styles.topRow}>
                  <span className={styles.topName}>{t.tableLabel}</span>
                  <span className={styles.topMeta}>{t.percent}%</span>
                  <span className={styles.topMeta}>{t.avgTime}s</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
