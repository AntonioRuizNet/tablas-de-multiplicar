import React, { useEffect, useState } from "react";
import Head from "next/head";
import styles from "./AppLayout.module.css";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileDrawer } from "./MobileDrawer";
import PropTypes from "prop-types";
import Link from "next/link";
import { useAuth } from "../auth/AuthContext";

export function AppLayout({ children, title="Tablas de multiplicar", description="Aprende y practica las tablas de multiplicar.", canonical }) {
  const [isDrawerOpen,setIsDrawerOpen]=useState(false);
  const { user, loading } = useAuth();
  const closeDrawer=()=>setIsDrawerOpen(false);
  useEffect(()=>{if(!isDrawerOpen)return;const onKeyDown=(e)=>e.key==="Escape"&&closeDrawer();window.addEventListener("keydown",onKeyDown);return()=>window.removeEventListener("keydown",onKeyDown);},[isDrawerOpen]);
  return <><Head><title>{title}</title><meta name="description" content={description}/>{canonical?<link rel="canonical" href={canonical}/>:null}</Head>
    <div className={styles.shell}><AppHeader onOpenMenu={()=>setIsDrawerOpen(true)} />
      {!loading && !user ? <div className={styles.accountNotice}>🎯 <span><strong>Guarda tu progreso.</strong> Crea una cuenta gratis para conservar puntos, logros y resultados.</span> <Link href="/registro">Registrarme</Link></div> : null}
      {!loading && user && !user.email ? <div className={`${styles.accountNotice} ${styles.emailNotice}`}>🔐 <span><strong>Protege tu cuenta.</strong> Añade un email para poder recuperar tu contraseña si la olvidas.</span> <Link href="/guardar-email">Guardar email</Link></div> : null}
      <div className={styles.body}><aside className={styles.sidebarDesktop}><AppSidebar/></aside><main className={styles.main}>{children}</main></div>
      <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer}><AppSidebar onNavigate={closeDrawer}/></MobileDrawer>
      <footer className={styles.footer}><div className={styles.footerBrand}><img src="/og-image.png" alt="Tablas de multiplicar" className={styles.footerLogo}/><p>Recursos gratuitos para aprender y practicar multiplicaciones.</p></div><nav aria-label="Enlaces informativos"><Link href="/como-usar-la-aplicacion">Cómo usar la aplicación</Link><Link href="/metodologia">Metodología</Link><Link href="/para-profesores">Profesores</Link><Link href="/para-padres">Familias</Link><Link href="/sobre-nosotros">Sobre nosotros</Link></nav></footer>
    </div></>;
}
AppLayout.propTypes={children:PropTypes.node.isRequired,title:PropTypes.string,description:PropTypes.string,canonical:PropTypes.string};
