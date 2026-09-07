import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../components/auth/AuthContext";
import styles from "../styles/auth.module.css";

export default function GuardarEmail() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [email,setEmail] = useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{ if(!loading && !user) router.replace("/login?next=/guardar-email"); },[loading,user,router]);
  async function submit(e){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/profile/email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});const d=await r.json();if(!r.ok) throw new Error(d.error);setUser(d.user);router.push("/perfil");}catch(err){setError(err.message||"No se ha podido guardar el email.");}finally{setBusy(false);}}
  if(loading||!user) return null;
  return <AppLayout title="Guardar email | Tablas de multiplicar"><Head><meta name="robots" content="noindex,follow" /></Head><div className={styles.page}><section className={styles.card}><h1 className={styles.title}>Añade un email de recuperación</h1><p className={styles.subtitle}>Lo usaremos únicamente para que puedas recuperar tu contraseña si la olvidas.</p><form className={styles.form} onSubmit={submit}>{error&&<p className={styles.error}>{error}</p>}<label className={styles.label}>Email<input className={styles.input} type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label><button className={styles.button} disabled={busy}>{busy?"Guardando…":"Guardar email"}</button></form></section></div></AppLayout>;
}
