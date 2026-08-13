import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { AppLayout } from "../components/layout/AppLayout";
import styles from "../styles/auth.module.css";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json();
    setMessage(data.message || "Revisa tu correo.");
    setBusy(false);
  }

  return (
    <AppLayout title="Recuperar contraseña | Tablas de multiplicar" description="Recupera el acceso a tu cuenta de Tablas de multiplicar.">
      <Head><meta name="robots" content="noindex,follow" /></Head>
      <div className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Recuperar contraseña</h1>
          <p className={styles.subtitle}>Escribe tu email y te enviaremos un enlace de un solo uso para entrar en tu cuenta. Una vez dentro podrás cambiar tu contraseña desde el perfil.</p>
          <form className={styles.form} onSubmit={submit}>
            {message && <p className={styles.success}>{message}</p>}
            <label className={styles.label}>Email<input className={styles.input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <button className={styles.button} disabled={busy}>{busy ? "Enviando…" : "Enviar enlace de acceso"}</button>
          </form>
          <div className={styles.links}><Link href="/login">Volver al login</Link></div>
        </section>
      </div>
    </AppLayout>
  );
}
