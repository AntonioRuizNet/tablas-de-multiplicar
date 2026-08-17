import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../components/auth/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";
import styles from "../styles/auth.module.css";
import { ACHIEVEMENTS_BY_ID } from "../constants/achievements";

export default function Perfil() {
  const { user, loading, logout, setUser } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
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
    setNameBusy(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "No se ha podido guardar el nombre.");
        return;
      }
      setUser(result.user);
      const nextNameChangeAt = result.user.nameChangedAt
        ? new Date(new Date(result.user.nameChangedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;
      setData((current) => current ? {
        ...current,
        user: result.user,
        nameChange: { canChange: !nextNameChangeAt, nextChangeAt: nextNameChangeAt },
      } : current);
      setMessage(result.message || "Nombre actualizado correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError("No se ha podido conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setNameBusy(false);
    }
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
              <label className={styles.label}>Nombre de usuario<input className={styles.input} value={name} maxLength={30} onChange={(e) => setName(e.target.value)} /></label>
              <p className={styles.helpText}>Debe ser único y respetuoso. Solo puedes cambiarlo una vez cada 30 días.</p>
              {data?.nameChange?.canChange === false && data?.nameChange?.nextChangeAt ? <p className={styles.helpText}>Próximo cambio disponible: <strong>{new Date(data.nameChange.nextChangeAt).toLocaleDateString("es-ES")}</strong>.</p> : null}
              <button className={styles.button} disabled={nameBusy}>{nameBusy ? "Guardando…" : "Guardar nombre"}</button>
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



          <section className={styles.achievementsSection}>
            <div className={styles.achievementsHeading}>
              <div><h2 className={styles.sectionTitle}>Mis logros</h2><p className={styles.helpText}>Los logros desbloqueados aparecen aquí y también en tu perfil público.</p></div>
              <strong>{stats?.achievements ?? 0}</strong>
            </div>
            {data?.progress?.unlocked && Object.keys(data.progress.unlocked).length ? (
              <div className={styles.achievementsGrid}>
                {Object.entries(data.progress.unlocked).map(([id, info]) => {
                  const achievement = ACHIEVEMENTS_BY_ID[id];
                  if (!achievement) return null;
                  return <article className={styles.achievementCard} key={id}>
                    <span className={styles.achievementIcon}>{achievement.icon}</span>
                    <div><strong>{achievement.title}</strong><p>{achievement.description}</p>{info?.unlockedAt ? <small>Conseguido el {new Date(info.unlockedAt).toLocaleDateString("es-ES")}</small> : null}</div>
                  </article>;
                })}
              </div>
            ) : <p className={styles.helpText}>Todavía no has desbloqueado ningún logro. Completa tablas y retos para conseguirlos.</p>}
          </section>

          <div className={styles.links}><button type="button" onClick={exit} className={styles.button}>Cerrar sesión</button></div>
        </section>
      </div>
    </AppLayout>
  );
}
