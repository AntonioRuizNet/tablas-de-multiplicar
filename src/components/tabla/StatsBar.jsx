import React from "react";
import { useSelector } from "react-redux";
import styles from "./StatsBar.module.css";
import { rangos } from "../../constants";

export function StatsBar() {
  const nivel = useSelector((state) => state.aplicationConfig.userConfig.nivel);
  const puntos = useSelector((state) => state.aplicationConfig.userConfig.puntos);
  const rango = useSelector((state) => state.aplicationConfig.userConfig.rango);

  const width = puntos > 100 ? puntos - nivel * 100 : puntos;

  return (
    <div className={styles.stats} aria-label={`Nivel ${nivel}, ${puntos} puntos`}>
      <strong className={styles.level}>Nivel {nivel}</strong>
      <span className={styles.rangeName}>{rangos[rango] || rangos[rangos.length - 1]}</span>
      <span className={styles.pointsLabel}>{puntos} pts</span>
      <div className={styles.points} aria-hidden="true">
        <div className={styles.pointsFill} style={{ width: `${Math.min(Math.max(width, 0), 100)}%` }} />
      </div>
    </div>
  );
}
