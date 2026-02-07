import React from "react";
import PropTypes from "prop-types";
import styles from "./milestoneBar.module.css";

export const MilestoneBar = ({ totalMilestones, highlightUntil }) => {
  const milestones = Array.from({ length: totalMilestones }, (_, i) => i + 1);

  // Calcula el ancho como porcentaje
  const highlightedWidth = `${(highlightUntil / (totalMilestones - 1)) * 100}%`;

  return (
    <>
      <div className={styles.bar} style={{ "--highlight-width": highlightedWidth }} />
      <div className={styles.container} style={{ "--highlight-width": highlightedWidth }}>
        {milestones.map((milestone) => (
          <div
            key={milestone}
            className={`${styles.milestone} ${milestone <= highlightUntil ? styles.highlight : ""}`}
          />
        ))}
      </div>
    </>
  );
};

MilestoneBar.propTypes = {
  totalMilestones: PropTypes.number.isRequired,
  highlightUntil: PropTypes.number.isRequired,
};
