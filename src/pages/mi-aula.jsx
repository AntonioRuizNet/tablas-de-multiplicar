import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { useAuth } from "../components/auth/AuthContext";
import styles from "./mi-aula.module.css";

export default function MiAulaPage() {
  const { user, loading, refresh } = useAuth();
  const [overview, setOverview] = useState({ owned: [], joined: [] });
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const api = useCallback(async (options = {}) => {
    const response = await fetch(options.url || "/api/classrooms", {
      method: options.method || "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se ha podido completar la operación.");
    return data;
  }, []);

  const loadOverview = useCallback(async () => {
    if (!user) return;
    const data = await api();
    setOverview({ owned: data.owned || [], joined: data.joined || [] });
  }, [api, user]);

  useEffect(() => { loadOverview().catch((error) => setMessage(error.message)); }, [loadOverview]);

  const openClassroom = async (classroom) => {
    try {
      setBusy(true); setMessage("");
      const data = await api({ url: `/api/classrooms?classroomId=${classroom.id}` });
      setSelected(data.classroom);
      setStudents(data.students || []);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const post = async (body, success) => {
    try {
      setBusy(true); setMessage("");
      const data = await api({ method: "POST", body });
      if (success) await success(data);
      setMessage(data.message || "Cambios guardados correctamente.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const activateTeacher = () => post({ action: "activate-teacher" }, async () => { await refresh(); await loadOverview(); });
  const createClassroom = (event) => {
    event.preventDefault();
    return post({ action: "create", name: className }, async () => { setClassName(""); await loadOverview(); });
  };
  const joinClassroom = (event) => {
    event.preventDefault();
    return post({ action: "join", code }, async () => { setCode(""); await loadOverview(); });
  };
  const removeStudent = (studentId) => post({ action: "remove-student", classroomId: selected.id, studentId }, async () => openClassroom(selected));
  const leaveClassroom = (classroomId) => post({ action: "leave", classroomId }, loadOverview);
  const deleteClassroom = (classroomId) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta aula? Los alumnos dejarán de pertenecer a ella.")) return;
    post({ action: "delete", classroomId }, async () => { setSelected(null); setStudents([]); await loadOverview(); });
  };

  const summary = useMemo(() => {
    if (!students.length) return { operations: 0, accuracy: 0 };
    const operations = students.reduce((sum, student) => sum + Number(student.operations || 0), 0);
    const correctWeighted = students.reduce((sum, student) => sum + Number(student.operations || 0) * Number(student.accuracy || 0), 0);
    return { operations, accuracy: operations ? Math.round(correctWeighted / operations) : 0 };
  }, [students]);

  return (
    <ResourceLayout title="Mi aula" description="Aulas para profesores y alumnos de tablasdemultiplicar.app" path="/mi-aula">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div><span className={styles.eyebrow}>👨‍🏫 Modo aula</span><h1>Mi aula</h1><p>Crea una clase, comparte su código y sigue el progreso de tus alumnos sin necesitar sus correos electrónicos.</p></div>
        </header>

        {loading && <p>Cargando...</p>}
        {!loading && !user && <section className={styles.card}><h2>Inicia sesión para usar las aulas</h2><p>Los profesores pueden crear clases y los alumnos unirse mediante un código.</p></section>}

        {user && <>
          {message && <div className={styles.message}>{message}</div>}

          {!isTeacher && <section className={styles.card}>
            <h2>¿Eres maestro o maestra?</h2>
            <p>Activa el perfil de profesor para crear aulas y consultar el progreso de tus alumnos.</p>
            <button className={styles.primary} onClick={activateTeacher} disabled={busy}>Activar perfil de profesor</button>
          </section>}

          {isTeacher && <section className={styles.grid2}>
            <form className={styles.card} onSubmit={createClassroom}>
              <h2>Crear una nueva aula</h2><p>Por ejemplo: 3ºB · Matemáticas.</p>
              <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Nombre del aula" maxLength={120} required />
              <button className={styles.primary} disabled={busy}>Crear aula</button>
            </form>
            <div className={styles.card}><h2>Cómo funciona</h2><p>Cada aula recibe un código único. Compártelo con tus alumnos para que se unan desde esta misma página.</p></div>
          </section>}

          <section className={styles.card}>
            <h2>Unirse a un aula</h2>
            <form className={styles.inlineForm} onSubmit={joinClassroom}>
              <input className={styles.codeInput} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" maxLength={8} required />
              <button className={styles.secondary} disabled={busy}>Unirme</button>
            </form>
          </section>

          {isTeacher && <section>
            <div className={styles.sectionTitle}><h2>Mis aulas</h2><span>{overview.owned.length}</span></div>
            <div className={styles.classGrid}>{overview.owned.map((room) => <article key={room.id} className={styles.classCard}>
              <div><h3>{room.name}</h3><p>{room.students} alumno{room.students === 1 ? "" : "s"}</p></div>
              <div className={styles.code}>{room.code}</div>
              <div className={styles.actions}><button onClick={() => openClassroom(room)}>Ver aula</button><button className={styles.danger} onClick={() => deleteClassroom(room.id)}>Eliminar</button></div>
            </article>)}</div>
            {!overview.owned.length && <p className={styles.empty}>Todavía no has creado ninguna aula.</p>}
          </section>}

          {!!overview.joined.length && <section>
            <div className={styles.sectionTitle}><h2>Aulas a las que pertenezco</h2></div>
            <div className={styles.classGrid}>{overview.joined.map((room) => <article key={room.id} className={styles.classCard}><div><h3>{room.name}</h3><p>Profesor: {room.teacher_name || "Profesor"}</p></div><div className={styles.code}>{room.code}</div><button className={styles.danger} onClick={() => leaveClassroom(room.id)}>Salir del aula</button></article>)}</div>
          </section>}

          {selected && isTeacher && <section className={styles.detail}>
            <div className={styles.detailHeader}><div><span className={styles.eyebrow}>Código {selected.code}</span><h2>{selected.name}</h2></div><button onClick={() => setSelected(null)}>Cerrar</button></div>
            <div className={styles.stats}><div><strong>{students.length}</strong><span>Alumnos</span></div><div><strong>{summary.operations}</strong><span>Operaciones</span></div><div><strong>{summary.accuracy}%</strong><span>Aciertos</span></div></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Alumno</th><th>Nivel</th><th>Puntos</th><th>Operaciones</th><th>Aciertos</th><th>Última actividad</th><th></th></tr></thead><tbody>
              {students.map((student) => <tr key={student.id}><td>{student.name || "Jugador"}</td><td>{student.level}</td><td>{student.points}</td><td>{student.operations}</td><td>{student.accuracy}%</td><td>{student.last_activity ? new Date(student.last_activity).toLocaleDateString("es-ES") : "Sin actividad"}</td><td><button className={styles.dangerText} onClick={() => removeStudent(student.id)}>Sacar</button></td></tr>)}
            </tbody></table>{!students.length && <p className={styles.empty}>Aún no hay alumnos en esta aula. Comparte el código <strong>{selected.code}</strong>.</p>}</div>
          </section>}
        </>}
      </main>
    </ResourceLayout>
  );
}
