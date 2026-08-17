import React from "react";
import { useSelector } from "react-redux";
import styles from "./StatsBar.module.css";
import { rangos } from "../../constants";
import { calcProgression } from "../../lib/progression";

export function StatsBar() {
  const puntos = useSelector((state) => state.aplicationConfig.userConfig.puntos);
  const storedLevel = useSelector((state) => state.aplicationConfig.userConfig.nivel);
  const storedRank = useSelector((state) => state.aplicationConfig.userConfig.rango);
  const calculated = calcProgression(puntos);
  const nivel = Number.isFinite(storedLevel) ? storedLevel : calculated.level;
  const rango = Number.isFinite(storedRank) ? storedRank : calculated.rank;

  return (
    <div className={styles.stats} aria-label={`Nivel ${nivel}, ${puntos} puntos`}>
      <strong className={styles.level}>Nivel {nivel}</strong>
      <span className={styles.rangeName}>{rangos[rango] || rangos[rangos.length - 1]}</span>
      <span className={styles.pointsLabel}>{puntos} pts</span>
      <div className={styles.points} aria-hidden="true">
        <div className={styles.pointsFill} style={{ width: `${calculated.percent}%` }} />
      </div>
    </div>
  );
}
