import React, { useEffect, useState } from "react";
import Head from "next/head";
import styles from "./AppLayout.module.css";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileDrawer } from "./MobileDrawer";
import PropTypes from "prop-types";

export function AppLayout({
  children,
  title = "Tablas de multiplicar",
  description = "Aprende y practica las tablas de multiplicar.",
  canonical,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Cerrar con ESC
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
      </Head>

      <div className={styles.shell}>
        <AppHeader onOpenMenu={openDrawer} />

        <div className={styles.body}>
          <aside className={styles.sidebarDesktop}>
            <AppSidebar />
          </aside>

          <main className={styles.main}>{children}</main>
        </div>

        <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer}>
          <AppSidebar onNavigate={closeDrawer} />
        </MobileDrawer>
      </div>
    </>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
};
