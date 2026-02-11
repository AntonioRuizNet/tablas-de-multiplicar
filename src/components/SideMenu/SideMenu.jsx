import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import styles from "./SideMenu.module.css";

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export function SideMenu({ isOpen, onOpen, onClose, onOpenHistory, onOpenAchievements, onOpenProfile, currentTabla }) {
  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <button
        type="button"
        className={styles.burger}
        onClick={isOpen ? onClose : onOpen}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="side-menu"
      >
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
      </button>

      {/* Overlay cristal */}
      <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`} onClick={onClose} aria-hidden={!isOpen} />

      {/* Panel lateral */}
      <aside id="side-menu" className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`} aria-hidden={!isOpen}>
        <div className={styles.panelHeader}>
          <p className={styles.panelTitle}>Menú</p>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <nav className={styles.nav} aria-label="Navegación">
          <button
            type="button"
            className={styles.itemButton}
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
          >
            Perfil
          </button>
          <button type="button" className={styles.itemButton} onClick={onOpenHistory}>
            Historial
          </button>
          <button
            type="button"
            className={styles.itemButton}
            onClick={() => {
              onClose();
              onOpenAchievements();
            }}
          >
            Logros
          </button>

          <div className={styles.divider} />

          <p className={styles.sectionTitle}>Ir a la tabla</p>

          <div className={styles.tablesGrid}>
            {TABLES.map((n) => {
              const href = `/tabla-del-${n}`;
              const isActive = currentTabla === `tabla-del-${n}`;
              return (
                <Link
                  key={n}
                  href={href}
                  className={`${styles.tableLink} ${isActive ? styles.tableLinkActive : ""}`}
                  onClick={onClose}
                  aria-label={`Ir a la tabla del ${n}`}
                >
                  {n}
                </Link>
              );
            })}
          </div>
        </nav>

        <p className={styles.hint}>Consejo: empieza por 1, 2, 5 y 10.</p>
      </aside>
    </>
  );
}

SideMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenHistory: PropTypes.func.isRequired,
  onOpenAchievements: PropTypes.func.isRequired,
  onOpenProfile: PropTypes.func.isRequired,
  currentTabla: PropTypes.string.isRequired,
};
