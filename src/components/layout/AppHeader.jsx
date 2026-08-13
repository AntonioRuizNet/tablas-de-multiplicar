import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import styles from "./AppHeader.module.css";
import { useAuth } from "../auth/AuthContext";
import { StatsBar } from "../tabla/StatsBar";

export function AppHeader({ onOpenMenu }) {
  const { user, loading } = useAuth();
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {onOpenMenu ? (
            <button type="button" className={styles.menuBtn} onClick={onOpenMenu} aria-label="Abrir menú">
              <span className={styles.bars} />
            </button>
          ) : null}
          <Link href="/" className={styles.brand} aria-label="Ir al inicio">
            <img src="/og-image.png" alt="Tablas de multiplicar" className={styles.logo} />
          </Link>
        </div>

        <div className={styles.right}>
          {!loading && user ? <div className={styles.progress}><StatsBar /></div> : null}
          <nav className={styles.quick} aria-label="Accesos rápidos">
            <Link href="/juegos-tablas-de-multiplicar">🎮 <span>Juegos</span></Link>
            <Link href="/todas-las-tablas-de-multiplicar">✖️ <span>Tablas</span></Link>
            <Link href="/practicar-errores">⭐ <span>Repasar</span></Link>
            {!loading && (user ? <Link href="/perfil">👤 <span>Perfil</span></Link> : <Link href="/login">👤 <span>Entrar</span></Link>)}
          </nav>
        </div>
      </div>
    </header>
  );
}

AppHeader.propTypes = { onOpenMenu: PropTypes.func };
