import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import styles from "./AppHeader.module.css";

export function AppHeader({ onOpenMenu }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button type="button" className={styles.menuBtn} onClick={onOpenMenu} aria-label="Abrir menú">
          {/* icono simple */}
          <span className={styles.bars} />
        </button>

        <Link href="/" className={styles.brand}>
          Tablas de multiplicar
        </Link>
      </div>

      <div className={styles.right}>{/* aquí luego puedes meter perfil, etc */}</div>
    </header>
  );
}

AppHeader.propTypes = {
  onOpenMenu: PropTypes.func, // opcional (solo se usa en el drawer móvil)
};
