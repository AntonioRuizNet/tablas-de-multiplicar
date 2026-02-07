import React from "react";
import PropTypes from "prop-types";
import styles from "./HistoryModal.module.css";

function getTableNumber(table) {
  return Number(String(table).match(/\d+/)?.[0] || "");
}

function prettyTableName(table) {
  const n = getTableNumber(table);
  return Number.isFinite(n) ? `Tabla ${n}` : String(table);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function HistoryModal({ isOpen, onClose, rows }) {
  if (!isOpen) return null;

  // rows: array con { table, operation, state, time }
  // Insertamos separador por bloque (cambio de table).
  let lastTable = null;

  // Helper: calcula stats del bloque actual (misma tabla desde idx hasta antes de que cambie)
  const calcStatsForBlock = (startIdx) => {
    const table = rows[startIdx]?.table;
    if (!table) return null;

    let total = 0;
    let ok = 0;
    let timeSum = 0;
    let timeCount = 0;

    for (let i = startIdx; i < rows.length; i += 1) {
      const r = rows[i];
      if (r.table !== table) break;

      total += 1;
      if (r.state === "Bien") ok += 1;

      const t = Number(r.time);
      if (Number.isFinite(t)) {
        timeSum += t;
        timeCount += 1;
      }
    }

    const percent = total > 0 ? Math.round((ok / total) * 100) : 0;
    const avgTime = timeCount > 0 ? round1(timeSum / timeCount) : 0;

    return { table, total, ok, percent, avgTime };
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Historial de operaciones">
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Historial</h2>
          <button type="button" className={styles.link} onClick={onClose}>
            Cerrar
          </button>
        </div>

        <ul className={styles.historyList}>
          {rows.map((row, idx) => {
            const showSeparator = row.table !== lastTable;

            let stats = null;
            if (showSeparator) {
              stats = calcStatsForBlock(idx);
              lastTable = row.table;
            }

            return (
              <React.Fragment key={`${row.table}-${row.operation}-${idx}`}>
                {showSeparator && stats && (
                  <li className={styles.separator} aria-label={`Resumen de ${prettyTableName(stats.table)}`}>
                    <div className={styles.separatorTop}>
                      <span className={styles.separatorChip}>{prettyTableName(stats.table)}</span>

                      <span className={styles.kpi}>
                        <strong>Aciertos:</strong> {stats.ok}/{stats.total} ({stats.percent}%)
                      </span>

                      <span className={styles.kpi}>
                        <strong>Media:</strong> {stats.avgTime}s
                      </span>
                    </div>
                    <div className={styles.separatorLine} />
                  </li>
                )}

                <li className={styles.historyRow}>
                  <span className={styles.historyOp}>{row.operation}</span>
                  <span className={row.state === "Mal" ? styles.bad : ""}>{row.state}</span>
                  <span className={styles.time}>{row.time}s</span>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

HistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rows: PropTypes.array.isRequired,
};
