import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { useAuth } from "../components/auth/AuthContext";
import { UserAvatar } from "../components/avatar/UserAvatar";
import styles from "./estadisticas-aula.module.css";

const PERIODS = [{ id: "today", label: "Hoy" }, { id: "week", label: "7 días" }, { id: "month", label: "30 días" }];

export default function EstadisticasAula() {
  const { user, loading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    if (!user || !isTeacher) return;
    fetch("/api/classrooms", { cache: "no-store" }).then((r) => r.json()).then((result) => {
      if (!result.ok) throw new Error(result.error);
      const owned = result.owned || [];
      setRooms(owned);
      if (owned.length) setClassroomId((current) => current || owned[0].id);
    }).catch((e) => setError(e.message || "No se han podido cargar las aulas."));
  }, [user, isTeacher]);

  const load = useCallback(async () => {
    if (!classroomId) return;
    setError("");
    try {
      const response = await fetch(`/api/classrooms/dashboard?classroomId=${encodeURIComponent(classroomId)}&period=${period}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
    } catch (e) { setError(e.message || "No se han podido cargar las estadísticas."); }
  }, [classroomId, period]);

  useEffect(() => { load(); }, [load]);

  const selectedRoom = rooms.find((room) => String(room.id) === String(classroomId));
  const attention = useMemo(() => data?.students?.filter((student) => student.needs_attention || student.inactive) || [], [data]);

  return <ResourceLayout title="Estadísticas del aula" description="Panel pedagógico para profesores" path="/estadisticas-aula">
    <main className={styles.page}>
      <header className={styles.hero}><span>👨‍🏫 Panel del profesor</span><h1>Estadísticas del aula</h1><p>Detecta rápidamente qué alumnos necesitan apoyo y qué tablas conviene reforzar.</p></header>
      {loading && <p>Cargando…</p>}
      {!loading && (!user || !isTeacher) && <section className={styles.card}><h2>Área para profesores</h2><p>Activa el perfil de profesor desde Mi aula para consultar estas estadísticas.</p></section>}
      {isTeacher && <>
        <section className={styles.toolbar}>
          <label>Aula<select value={classroomId} onChange={(e) => setClassroomId(e.target.value)}>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
          <div className={styles.periods}>{PERIODS.map((item) => <button key={item.id} className={period === item.id ? styles.active : ""} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div>
        </section>
        {error && <p className={styles.error}>{error}</p>}
        {!rooms.length && <section className={styles.card}><p>Primero crea un aula desde Mi aula.</p></section>}
        {data && selectedRoom && <>
          <section className={styles.summary}>
            <div><strong>{data.summary.students}</strong><span>Alumnos</span></div><div><strong>{data.summary.operations}</strong><span>Operaciones</span></div><div><strong>{data.summary.accuracy}%</strong><span>Aciertos</span></div><div className={data.summary.needsAttention ? styles.warning : ""}><strong>{data.summary.needsAttention}</strong><span>Necesitan apoyo</span></div><div className={data.summary.inactive ? styles.warning : ""}><strong>{data.summary.inactive}</strong><span>Sin practicar 7 días</span></div>
          </section>
          <section className={styles.card}><h2>Atención recomendada</h2>{attention.length ? <div className={styles.people}>{attention.map((student) => <article key={student.id}><UserAvatar icon={student.avatar_icon} color={student.avatar_color} size={44} /><div><strong>{student.name || "Jugador"}</strong><p>{student.inactive ? "Sin actividad reciente" : `${student.accuracy}% de aciertos en el periodo`}</p></div><span>{student.needs_attention ? "Reforzar" : "Inactivo"}</span></article>)}</div> : <p>No hay alumnos que requieran atención según los datos de este periodo.</p>}</section>
          <section className={styles.card}><h2>Tablas que más cuestan</h2><p>Ordenadas por menor porcentaje de aciertos durante el periodo seleccionado.</p>{data.tables.length ? <div className={styles.tables}>{data.tables.map((item) => <div key={item.table_number}><strong>Tabla del {item.table_number}</strong><span>{item.accuracy}% aciertos</span><small>{item.errors} fallos de {item.operations} operaciones</small></div>)}</div> : <p>Aún no hay suficientes operaciones de multiplicación en este periodo.</p>}</section>
          <section className={styles.card}><h2>Todos los alumnos</h2><div className={styles.tableWrap}><table><thead><tr><th>Alumno</th><th>Operaciones</th><th>Aciertos</th><th>Última actividad</th><th>Estado</th></tr></thead><tbody>{data.students.map((student) => <tr key={student.id}><td><span className={styles.student}><UserAvatar icon={student.avatar_icon} color={student.avatar_color} size={32} />{student.name || "Jugador"}</span></td><td>{student.operations}</td><td>{student.accuracy}%</td><td>{student.last_activity ? new Date(student.last_activity).toLocaleDateString("es-ES") : "Sin actividad"}</td><td>{student.needs_attention ? "⚠️ Reforzar" : student.inactive ? "💤 Inactivo" : "✅ Bien"}</td></tr>)}</tbody></table></div></section>
        </>}
      </>}
    </main>
  </ResourceLayout>;
}
