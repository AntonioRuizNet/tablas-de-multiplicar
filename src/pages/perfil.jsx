import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../components/auth/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";
import styles from "../styles/auth.module.css";

export default function Perfil() {
  const { user, loading, logout, setUser } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const recoveryMode = router.query.recuperacion === "1";

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/perfil");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    fetch("/api/profile", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => { if (result.ok) setData(result); })
      .catch(() => {});
  }, [user]);

  async function save(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "No se ha podido guardar.");
      return;
    }
    setUser(result.user);
    setMessage("Perfil actualizado.");
  }

  async function changePassword(e) {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setPasswordBusy(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        setPasswordError(result.error || "No se ha podido cambiar la contraseña.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage(result.message || "Contraseña actualizada correctamente.");
      if (recoveryMode) router.replace("/perfil", undefined, { shallow: true });
    } finally {
      setPasswordBusy(false);
    }
  }

  async function exit() {
    await logout();
    router.push("/");
  }

  if (loading || !user) {
    return <AppLayout title="Mi perfil | Tablas de multiplicar"><div className={styles.profilePage}><section className={styles.profileCard}><p>Cargando…</p></section></div></AppLayout>;
  }

  const stats = data?.stats;
  const progress = data?.progress?.userConfig;

  return (
    <AppLayout title="Mi perfil | Tablas de multiplicar" description="Consulta y actualiza tu perfil y progreso.">
      <Head><meta name="robots" content="noindex,follow" /></Head>
      <div className={styles.profilePage}>
        <section className={styles.profileCard}>
          <h1 className={styles.title}>Mi perfil</h1>
          <p className={styles.subtitle}>{user.email}</p>

          {recoveryMode ? <p className={styles.success}>Has entrado mediante el enlace de recuperación. Ahora puedes crear una nueva contraseña sin indicar la anterior.</p> : null}

          <div className={styles.profileColumns}>
            <form className={styles.form} onSubmit={save}>
              <h2 className={styles.sectionTitle}>Datos de la cuenta</h2>
              {message && <p className={styles.success}>{message}</p>}
              {error && <p className={styles.error}>{error}</p>}
              <label className={styles.label}>Nombre<input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} /></label>
              <button className={styles.button}>Guardar nombre</button>
            </form>

            <form className={styles.form} onSubmit={changePassword}>
              <h2 className={styles.sectionTitle}>Cambiar contraseña</h2>
              {passwordMessage && <p className={styles.success}>{passwordMessage}</p>}
              {passwordError && <p className={styles.error}>{passwordError}</p>}
              {!recoveryMode ? (
                <label className={styles.label}>Contraseña actual<input className={styles.input} type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></label>
              ) : null}
              <label className={styles.label}>Nueva contraseña<input className={styles.input} type="password" minLength="8" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
              <label className={styles.label}>Repite la nueva contraseña<input className={styles.input} type="password" minLength="8" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
              <button className={styles.button} disabled={passwordBusy}>{passwordBusy ? "Guardando…" : "Actualizar contraseña"}</button>
            </form>
          </div>

          <div className={styles.profileGrid}>
            <div className={styles.stat}><span>Nivel</span><strong>{progress?.nivel ?? 0}</strong></div>
            <div className={styles.stat}><span>Rango</span><strong>{stats?.rankName || "Explorador"}</strong></div>
            <div className={styles.stat}><span>Puntos</span><strong>{progress?.puntos ?? 0}</strong></div>
            <div className={styles.stat}><span>Logros</span><strong>{stats?.achievements ?? 0}</strong></div>
            <div className={styles.stat}><span>Operaciones</span><strong>{stats?.totalOperations ?? 0}</strong></div>
            <div className={styles.stat}><span>Precisión</span><strong>{stats?.accuracy ?? 0}%</strong></div>
            <div className={styles.stat}><span>Tiempo medio</span><strong>{stats?.averageTime ?? 0}s</strong></div>
            <div className={styles.stat}><span>Tablas completadas</span><strong>{stats?.completedTables ?? 0}</strong></div>
          </div>

          <div className={styles.links}><button type="button" onClick={exit} className={styles.button}>Cerrar sesión</button></div>
        </section>
      </div>
    </AppLayout>
  );
}
