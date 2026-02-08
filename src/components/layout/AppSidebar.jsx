import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import styles from "./AppSidebar.module.css";

export function AppSidebar({ onNavigate }) {
  const handleNavigate = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      <Link href="/" className={styles.link} onClick={handleNavigate}>
        Tablas de multiplicar
      </Link>

      <Link href="/articulos" className={styles.link} onClick={handleNavigate}>
        Artículos
      </Link>
    </nav>
  );
}

AppSidebar.propTypes = {
  onNavigate: PropTypes.func, // opcional (solo se usa en el drawer móvil)
};
