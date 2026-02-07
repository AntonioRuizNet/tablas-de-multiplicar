import React from "react";
import PropTypes from "prop-types";
import styles from "./TableBoard.module.css";

export function TableBoard({ numero, active, answers }) {
  return (
    <div className={styles.tableZone}>
      <div className={styles.tableGrid} aria-label={`Tabla del ${numero} en orden`}>
        <div className={styles.col}>
          {[1, 2, 3, 4, 5].map((n) => {
            const isActive = active === n;
            const value = answers[n] || "";
            return (
              <div key={`c1-${n}`} className={styles.row}>
                <div>{numero}</div>
                <div>x</div>
                <div>{n}</div>
                <div>=</div>
                <div className={`${styles.result} ${isActive ? styles.activeResult : ""}`}>{value}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.col}>
          {[6, 7, 8, 9, 10].map((n) => {
            const isActive = active === n;
            const value = answers[n] || "";
            return (
              <div key={`c2-${n}`} className={styles.row}>
                <div>{numero}</div>
                <div>x</div>
                <div>{n}</div>
                <div>=</div>
                <div className={`${styles.result} ${isActive ? styles.activeResult : ""}`}>{value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

TableBoard.propTypes = {
  numero: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  answers: PropTypes.object.isRequired,
};
