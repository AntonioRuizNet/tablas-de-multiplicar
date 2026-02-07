import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import styles from "./AchievementsModal.module.css";
import { ACHIEVEMENTS } from "../../constants/achievements";
import { AchievementChip } from "../AchievementChip/AchievementChip";

export function AchievementsModal({ isOpen, onClose }) {
  const unlocked = useSelector((state) => state.achievements.unlocked);

  if (!isOpen) return null;

  const unlockedCount = Object.keys(unlocked || {}).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Logros">
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.title}>Logros</h2>
            <p className={styles.subtitle}>
              Conseguidos: <strong>{unlockedCount}</strong> / {totalCount}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar logros">
            ✕
          </button>
        </div>

        <div className={styles.grid} role="list">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} role="listitem">
              <AchievementChip
                icon={a.icon}
                title={a.title}
                description={a.description}
                isUnlocked={Boolean(unlocked?.[a.id])}
                border={a.border}
                background={a.background}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

AchievementsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
