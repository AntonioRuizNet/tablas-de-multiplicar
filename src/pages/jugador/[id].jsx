import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AppLayout } from "../../components/layout/AppLayout";
import { ACHIEVEMENTS_BY_ID } from "../../constants/achievements";
import styles from "../../styles/player.module.css";

export default function PublicPlayer() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!router.isReady) return;
    fetch(`/api/public/player?id=${encodeURIComponent(router.query.id)}`, { cache:"no-store" })
      .then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.error || "Jugador no encontrado."); return d; })
      .then(d => setPlayer(d.player)).catch(e => setError(e.message));
  }, [router.isReady, router.query.id]);

  return <AppLayout title={`${player?.name || "Jugador"} | Tablas de multiplicar`} description="Perfil público de jugador.">
    <Head><meta name="robots" content="noindex,follow" /></Head>
    <main className={styles.page}>
      {error ? <section className={styles.card}><h1>Jugador no encontrado</h1><p>{error}</p></section> : !player ? <section className={styles.card}><p>Cargando jugador…</p></section> : <section className={styles.card}>
        <div className={styles.hero}><div><span className={styles.eyebrow}>Perfil público</span><h1>{player.name}</h1><p>{player.rankName} · Nivel {player.level}</p></div><strong className={styles.points}>{player.points} pts</strong></div>
        <div className={styles.grid}>
          <div><span>Nivel</span><strong>{player.level}</strong></div><div><span>Rango</span><strong>{player.rankName}</strong></div>
          <div><span>Operaciones</span><strong>{player.operations}</strong></div><div><span>Precisión</span><strong>{player.accuracy}%</strong></div>
          <div><span>Tablas completadas</span><strong>{player.completedTables}</strong></div><div><span>Logros</span><strong>{player.achievements.length}</strong></div>
        </div>
        <h2>Logros conseguidos</h2>
        {player.achievements.length ? <div className={styles.achievements}>{player.achievements.map(item => { const a=ACHIEVEMENTS_BY_ID[item.id]; return a ? <article key={item.id}><span>{a.icon}</span><div><strong>{a.title}</strong><p>{a.description}</p></div></article> : null; })}</div> : <p>Aún no ha desbloqueado logros.</p>}
      </section>}
    </main>
  </AppLayout>;
}
