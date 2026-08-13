import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../components/auth/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";
import styles from "../styles/auth.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.push(typeof router.query.next === "string" ? router.query.next : "/perfil");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout title="Iniciar sesión | Tablas de multiplicar" description="Inicia sesión para acceder a tu progreso en las tablas de multiplicar.">
      <Head><meta name="robots" content="noindex,follow" /></Head>
      <div className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Iniciar sesión</h1>
          <p className={styles.subtitle}>Accede a tu progreso, puntos, nivel, historial y logros.</p>
          <form className={styles.form} onSubmit={submit}>
            {error && <p className={styles.error}>{error}</p>}
            <label className={styles.label}>Email<input className={styles.input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className={styles.label}>Contraseña<input className={styles.input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            <button className={styles.button} disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
          </form>
          <div className={styles.links}><Link href="/registro">Crear cuenta</Link><Link href="/recuperar-contrasena">He olvidado mi contraseña</Link></div>
        </section>
      </div>
    </AppLayout>
  );
}
