import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { useAuth } from "../components/auth/AuthContext";
import { UserAvatar } from "../components/avatar/UserAvatar";
import styles from "./historial.module.css";

const TYPES = [
  ["all", "Todas"], ["multiplication", "Multiplicaciones"], ["addition", "Sumas"],
  ["subtraction", "Restas"], ["division", "Divisiones"], ["challenge", "Retos"],
];

function operationText(op) {
  if (op.kind === "addition") return `${op.table_number} + ${op.multiplier}`;
  if (op.kind === "subtraction") return `${op.table_number} − ${op.multiplier}`;
  if (op.kind === "division") return `${op.table_number} ÷ ${op.multiplier}`;
  return `${op.table_number} × ${op.multiplier}`;
}

export default function Historial() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [type, setType] = useState("all");
  const [table, setTable] = useState("");
  const [result, setResult] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const targetUserId = typeof router.query.userId === "string" ? router.query.userId : "";

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams({ type, result, page: String(page) });
    if (table) params.set("table", table);
    if (targetUserId) params.set("userId", targetUserId);
    setError("");
    fetch(`/api/history?${params.toString()}`, { cache: "no-store" })
      .then(async (r) => { const body = await r.json(); if (!r.ok) throw new Error(body.error); return body; })
      .then(setData)
      .catch((e) => setError(e.message || "No se ha podido cargar el historial."));
  }, [user, type, table, result, page, targetUserId]);

  const pages = useMemo(() => Math.max(1, Math.ceil(Number(data?.total || 0) / Number(data?.pageSize || 50))), [data]);
  if (loading) return <ResourceLayout title="Historial"><p>Cargando…</p></ResourceLayout>;

  return <ResourceLayout title={targetUserId ? "Historial del alumno" : "Mi historial"} description="Historial de operaciones realizadas" path="/historial">
    <main className={styles.page}>
      <header className={styles.hero}><span>🕘 Historial</span><h1>{targetUserId ? "Historial del alumno" : "Mi historial"}</h1><p>Consulta tus operaciones con fecha, actividad, resultado y tiempo de respuesta.</p></header>
      {!user && <section className={styles.card}><p>Inicia sesión para consultar tu historial.</p></section>}
      {user && <>
        {targetUserId && data?.user && <section className={styles.person}><UserAvatar icon={data.user.avatar_icon} color={data.user.avatar_color} size={44}/><strong>{data.user.name || "Jugador"}</strong></section>}
        <section className={styles.filters}>
          <label>Actividad<select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>{TYPES.map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <label>Tabla<select value={table} onChange={(e) => { setTable(e.target.value); setPage(1); }}><option value="">Todas</option>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>Tabla del {i+1}</option>)}</select></label>
          <label>Resultado<select value={result} onChange={(e) => { setResult(e.target.value); setPage(1); }}><option value="all">Todos</option><option value="correct">Correctas</option><option value="wrong">Incorrectas</option></select></label>
        </section>
        {error && <p className={styles.error}>{error}</p>}
        {data && <section className={styles.card}>
          <div className={styles.tableWrap}><table><thead><tr><th>Fecha y hora</th><th>Actividad</th><th>Operación</th><th>Respuesta</th><th>Resultado</th><th>Tiempo</th></tr></thead><tbody>
            {(data.operations || []).map((op) => <tr key={op.id}><td>{new Date(op.created_at).toLocaleString("es-ES")}</td><td>{op.activity}</td><td>{operationText(op)}</td><td>{op.user_answer ?? "—"}</td><td>{op.is_correct ? "✅ Correcta" : "❌ Incorrecta"}</td><td>{op.response_time_seconds == null ? "—" : `${Number(op.response_time_seconds).toFixed(2)} s`}</td></tr>)}
          </tbody></table></div>
          {!data.operations?.length && <p className={styles.empty}>No hay operaciones que coincidan con estos filtros.</p>}
          <div className={styles.pagination}><button disabled={page<=1} onClick={()=>setPage((p)=>p-1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={page>=pages} onClick={()=>setPage((p)=>p+1)}>Siguiente</button></div>
        </section>}
      </>}
    </main>
  </ResourceLayout>;
}
