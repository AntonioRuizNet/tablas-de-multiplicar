import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./SideMenu.module.css";
import { APP_NAV_LINKS } from "../layout/AppSidebar";

function isLinkActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href === "/todas-las-tablas-de-multiplicar" && /^\/tabla-del-\d+$/.test(pathname)) return true;
  if (href === "/articulos") return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export function SideMenu({ isOpen, onOpen, onClose }) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className={styles.mobileOnly}>
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

      <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`} onClick={onClose} aria-hidden={!isOpen} />

      <aside id="side-menu" className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`} aria-hidden={!isOpen}>
        <div className={styles.panelHeader}>
          <p className={styles.panelTitle}>Menú</p>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar menú">✕</button>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          {APP_NAV_LINKS.map(([href, icon, label]) => {
            const active = isLinkActive(router.asPath.split("?")[0], href);
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.menuLink} ${active ? styles.menuLinkActive : ""}`}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
              >
                <span className={styles.menuIcon}>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

SideMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
