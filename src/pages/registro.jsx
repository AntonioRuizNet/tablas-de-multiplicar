import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../components/auth/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";
import styles from "../styles/auth.module.css";

export default function Registro() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await register(form);
      router.push("/perfil");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout title="Crear cuenta | Tablas de multiplicar" description="Crea una cuenta para guardar tu progreso en las tablas de multiplicar.">
      <Head><meta name="robots" content="noindex,follow" /></Head>
      <div className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Tu progreso quedará guardado en tu cuenta. Elige un nombre único y respetuoso.</p>
          <form className={styles.form} onSubmit={submit}>
            {error && <p className={styles.error}>{error}</p>}
            <label className={styles.label}>Nombre de usuario<input className={styles.input} name="name" autoComplete="nickname" minLength={2} maxLength={30} required value={form.name} onChange={change} /></label>
            <label className={styles.label}>Email<input className={styles.input} name="email" type="email" autoComplete="email" required value={form.email} onChange={change} /></label>
            <label className={styles.label}>Contraseña<input className={styles.input} name="password" type="password" minLength="8" autoComplete="new-password" required value={form.password} onChange={change} /></label>
            <label className={styles.label}>Repite la contraseña<input className={styles.input} name="confirm" type="password" minLength="8" autoComplete="new-password" required value={form.confirm} onChange={change} /></label>
            <button className={styles.button} disabled={busy}>{busy ? "Creando…" : "Crear cuenta"}</button>
          </form>
          <div className={styles.links}><Link href="/login">Ya tengo cuenta</Link></div>
        </section>
      </div>
    </AppLayout>
  );
}
