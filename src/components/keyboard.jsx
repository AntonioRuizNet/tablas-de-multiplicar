import React from "react";
import PropTypes from "prop-types";
import styles from "./keyboard.module.css";

const list = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },

  // acciones
  { value: "Borrar", label: "⟲", aria: "Borrar número" },
  { value: "Enviar", label: "✓", aria: "Enviar respuesta" },
];

export const MenuKeyboard = ({ callback }) => {
  return (
    <ul className={styles.keyboard} aria-label="Teclado numérico">
      {list.map((key) => (
        <li key={key.value} className={styles.item}>
          <button
            type="button"
            className={`${styles.key} ${key.value === "Enviar" ? styles.primary : ""}`}
            aria-label={key.aria || `Tecla ${key.label}`}
            onClick={() => callback(key.value)}
          >
            {key.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

MenuKeyboard.propTypes = {
  callback: PropTypes.func.isRequired,
};
