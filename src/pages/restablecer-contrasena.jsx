import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AppLayout } from "../components/layout/AppLayout";
import styles from "../styles/auth.module.css";

export default function Reset() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: router.query.token, password }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "No se ha podido cambiar la contraseña.");
    else setDone(true);
    setBusy(false);
  }

  return (
    <AppLayout title="Nueva contraseña | Tablas de multiplicar" description="Establece una nueva contraseña para tu cuenta.">
      <Head><meta name="robots" content="noindex,follow" /></Head>
      <div className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Nueva contraseña</h1>
          {done ? (
            <><p className={styles.success}>Contraseña actualizada. Ya puedes iniciar sesión.</p><div className={styles.links}><Link href="/login">Ir al login</Link></div></>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              {error && <p className={styles.error}>{error}</p>}
              <label className={styles.label}>Nueva contraseña<input className={styles.input} type="password" minLength="8" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              <label className={styles.label}>Repite la contraseña<input className={styles.input} type="password" minLength="8" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
              <button className={styles.button} disabled={busy || !router.query.token}>{busy ? "Guardando…" : "Cambiar contraseña"}</button>
            </form>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
