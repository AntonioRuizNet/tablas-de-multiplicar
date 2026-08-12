import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import styles from "./AppSidebar.module.css";
import { StatsBar } from "../tabla/StatsBar";

const links = [
  ["/", "🏠", "Inicio"],
  ["/todas-las-tablas-de-multiplicar", "✖️", "Todas las tablas"],
  ["/juegos-tablas-de-multiplicar", "🎮", "Juegos"],
  ["/contrarreloj", "⏱️", "Contrarreloj"],
  ["/tabla-pitagorica", "🧩", "Tabla pitagórica"],
  ["/practicar-errores", "⭐", "Mis errores"],
  ["/aprender-tablas-de-multiplicar", "💡", "Aprender"],
  ["/articulos", "📚", "Artículos"],
];

export function AppSidebar({ onNavigate }) {
  const handleNavigate = () => { if (onNavigate) onNavigate(); };
  return (
    <div className={styles.panel}>
      <div className={styles.welcome}>
        <StatsBar />
      </div>
      <nav className={styles.nav} aria-label="Navegación principal">
        {links.map(([href, icon, label], index) => (
          <Link key={href} href={href} className={`${styles.link} ${index === 0 ? styles.featured : ""}`} onClick={handleNavigate}>
            <span className={styles.icon}>{icon}</span><span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
AppSidebar.propTypes = { onNavigate: PropTypes.func };
