import React from "react";
import PropTypes from "prop-types";

export const MilestoneBar = ({ totalMilestones, highlightUntil }) => {
  const milestones = Array.from({ length: totalMilestones }, (_, i) => i + 1);

  // Calcula el ancho como porcentaje
  const highlightedWidth = `${(highlightUntil / (totalMilestones - 1)) * 100}%`;

  return (
    <>
      <div className="milestone-bar" style={{ "--highlight-width": highlightedWidth }}></div>
      <div className="milestone-container" style={{ "--highlight-width": highlightedWidth }}>
        {milestones.map((milestone) => (
          <div key={milestone} className={`milestone ${milestone <= highlightUntil ? "highlight" : ""}`} />
        ))}
      </div>
    </>
  );
};

MilestoneBar.propTypes = {
  totalMilestones: PropTypes.number.isRequired,
  highlightUntil: PropTypes.number.isRequired,
};
