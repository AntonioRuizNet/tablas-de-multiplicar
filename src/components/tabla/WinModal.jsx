import React from "react";
import PropTypes from "prop-types";
import styles from "./WinModal.module.css";

export function WinModal({ isOpen, onClose, points, tip, children }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Has completado la tabla">
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>¡Felicidades! Has pasado la prueba.</h2>
        <p className={styles.panelSubtitle}>Has obtenido {points} puntos.</p>

        <div className={styles.tip}>
          <p className={styles.tipTitle}>¿Sabías que...?</p>
          <p className={styles.tipText}>{tip}</p>
        </div>

        <p className={styles.panelSubtitle}>Elige otra tabla de multiplicar para continuar.</p>
        {children}

        <div className={styles.actions}>
          <button type="button" className={styles.link} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

WinModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  points: PropTypes.number.isRequired,
  tip: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
