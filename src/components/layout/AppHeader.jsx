import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import styles from "./AppHeader.module.css";

export function AppHeader({ onOpenMenu }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button type="button" className={styles.menuBtn} onClick={onOpenMenu} aria-label="Abrir menú">
            <span className={styles.bars} />
          </button>
          <Link href="/" className={styles.brand} aria-label="Ir al inicio">
            <span className={styles.brandMark} aria-hidden="true">×</span>
            <span className={styles.brandText}>Tablas de multiplicar</span>
          </Link>
        </div>
        <nav className={styles.quick} aria-label="Accesos rápidos">
          <Link href="/juegos-tablas-de-multiplicar">🎮 <span>Juegos</span></Link>
          <Link href="/todas-las-tablas-de-multiplicar">✖️ <span>Tablas</span></Link>
          <Link href="/practicar-errores">⭐ <span>Repasar</span></Link>
        </nav>
      </div>
    </header>
  );
}

AppHeader.propTypes = { onOpenMenu: PropTypes.func };
