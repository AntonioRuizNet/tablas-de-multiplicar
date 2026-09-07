import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./AppSidebar.module.css";
import { Leaderboard } from "./Leaderboard";
import { OperationsLeaderboard } from "./OperationsLeaderboard";
import { useAuth } from "../auth/AuthContext";

export const APP_NAV_LINKS = [
  ["/", "🏠", "Inicio"],
  ["/todas-las-tablas-de-multiplicar", "✖️", "Todas las tablas"],
  ["/juegos-tablas-de-multiplicar", "🎮", "Juegos de multiplicar"],
  ["/otros-juegos", "🧮", "Otros juegos", "otherGames"],
  ["/contrarreloj", "⏱️", "Contrarreloj"],
  ["/tabla-pitagorica", "🧩", "Tabla pitagórica"],
  ["/practicar-errores", "⭐", "Mis errores"],
  ["/aprender-tablas-de-multiplicar", "💡", "Aprender"],
  ["/articulos", "📚", "Artículos"],
];

function isLinkActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href === "/todas-las-tablas-de-multiplicar" && /^\/tabla-del-\d+$/.test(pathname)) return true;
  if (href === "/articulos") return pathname === href || pathname.startsWith(`${href}/`);
  if (href === "/otros-juegos") return ["/otros-juegos", "/sumas", "/restas", "/divisiones"].includes(pathname);
  return pathname === href;
}

export function AppSidebar({ onNavigate }) {
  const router = useRouter();
  const { user } = useAuth();
  const handleNavigate = () => { if (onNavigate) onNavigate(); };
  const classroomLabel = user?.role === "teacher" || user?.role === "admin" ? "Mis aulas" : "Mi aula";
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const links = user
    ? [...APP_NAV_LINKS, ["/mi-aula", "👨‍🏫", classroomLabel, "classroom"], ...(isTeacher ? [["/estadisticas-aula", "📊", "Estadísticas del aula", "classroom"]] : [])]
    : APP_NAV_LINKS;

  return (
    <div className={styles.panel}>
      <nav className={styles.nav} aria-label="Navegación principal">
        {links.map(([href, icon, label, variant]) => {
          const active = isLinkActive(router.asPath.split("?")[0], href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${active ? styles.active : ""} ${variant === "otherGames" ? styles.otherGamesLink : ""} ${variant === "classroom" ? styles.classroomLink : ""}`}
              onClick={handleNavigate}
              aria-current={active ? "page" : undefined}
            >
              <span className={styles.icon}>{icon}</span><span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <Leaderboard />
      <OperationsLeaderboard />
    </div>
  );
}
AppSidebar.propTypes = { onNavigate: PropTypes.func };
