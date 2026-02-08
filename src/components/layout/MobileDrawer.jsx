import React, { useEffect } from "react";
import styles from "./MobileDrawer.module.css";
import PropTypes from "prop-types";

export function MobileDrawer({ isOpen, onClose, children }) {
  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
      aria-hidden={!isOpen}
      onMouseDown={(e) => {
        // cerrar si clicas el fondo
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ""}`} role="dialog" aria-modal="true" aria-label="Menú">
        <div className={styles.top}>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <div className={styles.content}>{children}</div>
      </aside>
    </div>
  );
}

MobileDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};
