import React from "react";
import PropTypes from "prop-types";
import styles from "./AchievementChip.module.css";

export function AchievementChip({ icon, title, description, isUnlocked, border, background }) {
  return (
    <div
      className={`${styles.chip} ${isUnlocked ? styles.unlocked : styles.locked}`}
      style={{
        borderColor: border,
        background: background,
      }}
      aria-label={isUnlocked ? `Logro conseguido: ${title}` : `Logro bloqueado: ${title}`}
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.text}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          <span className={styles.badge}>{isUnlocked ? "✓" : "🔒"}</span>
        </div>
        <div className={styles.desc}>{description}</div>
      </div>
    </div>
  );
}

AchievementChip.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isUnlocked: PropTypes.bool.isRequired,
  border: PropTypes.string,
  background: PropTypes.string,
};

AchievementChip.defaultProps = {
  border: "rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.6)",
};
