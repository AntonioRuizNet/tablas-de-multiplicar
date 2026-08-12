import React from "react";
import PropTypes from "prop-types";
import styles from "./Resource.module.css";

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export function TableSelector({ selected, onToggle, onStart, title = "¿Qué tablas quieres practicar?", startLabel = "Iniciar" }) {
  return (
    <div className={styles.gameSetup}>
      <h2>{title}</h2>
      <p>Activa una o varias tablas. Por defecto está seleccionada la tabla del 1.</p>
      <div className={styles.tableSelector} role="group" aria-label="Seleccionar tablas">
        {TABLES.map((n) => {
          const active = selected.includes(n);
          return (
            <button
              key={n}
              type="button"
              className={`${styles.tableToggle} ${active ? styles.tableToggleActive : ""}`}
              aria-pressed={active}
              onClick={() => onToggle(n)}
            >
              {n}
            </button>
          );
        })}
      </div>
      <button className={styles.button} type="button" onClick={onStart} disabled={!selected.length}>
        {startLabel}
      </button>
      {!selected.length ? <p className={styles.selectionWarning}>Selecciona al menos una tabla para continuar.</p> : null}
    </div>
  );
}

TableSelector.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.number).isRequired,
  onToggle: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
  title: PropTypes.string,
  startLabel: PropTypes.string,
};
