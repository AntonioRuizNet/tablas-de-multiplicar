import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { useAuth } from "../components/auth/AuthContext";
import styles from "./mi-aula.module.css";

const TABLES = Array.from({ length: 12 }, (_, index) => index + 1);

export default function MiAulaPage() {
  const { user, loading, refresh } = useAuth();
  const [overview, setOverview] = useState({ owned: [], joined: [] });
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [hardest, setHardest] = useState([]);
  const [className, setClassName] = useState("");
  const [code, setCode] = useState("");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeTables, setChallengeTables] = useState([2, 3, 4, 5]);
  const [questionCount, setQuestionCount] = useState(20);
  const [dueAt, setDueAt] = useState("");
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
    const [classroomData, challengeData] = await Promise.all([
      api(),
      api({ url: "/api/challenges" }),
    ]);
    setOverview({ owned: classroomData.owned || [], joined: classroomData.joined || [] });
    setMyChallenges(challengeData.challenges || []);
  }, [api, user]);

  useEffect(() => { loadOverview().catch((error) => setMessage(error.message)); }, [loadOverview]);

  const loadChallengeOverview = useCallback(async (classroomId) => {
    const data = await api({ url: `/api/challenges?classroomId=${classroomId}` });
    setChallenges(data.challenges || []);
    setHardest(data.hardest || []);
  }, [api]);

  const openClassroom = async (classroom) => {
    try {
      setBusy(true); setMessage("");
      const [classroomData] = await Promise.all([
        api({ url: `/api/classrooms?classroomId=${classroom.id}` }),
        loadChallengeOverview(classroom.id),
      ]);
      setSelected(classroomData.classroom);
      setStudents(classroomData.students || []);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const post = async (body, success, url = "/api/classrooms") => {
    try {
      setBusy(true); setMessage("");
      const data = await api({ url, method: "POST", body });
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
    if (!window.confirm("¿Seguro que quieres eliminar esta aula? Los alumnos y retos dejarán de pertenecer a ella.")) return;
    post({ action: "delete", classroomId }, async () => { setSelected(null); setStudents([]); setChallenges([]); await loadOverview(); });
  };

  const toggleChallengeTable = (table) => {
    setChallengeTables((current) => current.includes(table) ? current.filter((value) => value !== table) : [...current, table].sort((a, b) => a - b));
  };

  const createChallenge = (event) => {
    event.preventDefault();
    return post({
      action: "create",
      classroomId: selected.id,
      title: challengeTitle,
      tables: challengeTables,
      questionCount: Number(questionCount),
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
    }, async () => {
      setChallengeTitle("");
      setDueAt("");
      await loadChallengeOverview(selected.id);
    }, "/api/challenges");
  };

  const changeChallenge = (challengeId, action) => {
    if (action === "delete" && !window.confirm("¿Seguro que quieres eliminar este reto y todos sus resultados?")) return;
    post({ action, challengeId }, () => loadChallengeOverview(selected.id), "/api/challenges");
  };

  const copyChallengeLink = async (challenge) => {
    const url = `${window.location.origin}${challenge.url}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Enlace del reto copiado. Ya puedes pegarlo en Classroom, Moodle, Séneca o WhatsApp.");
    } catch {
      window.prompt("Copia este enlace", url);
    }
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
          <div><span className={styles.eyebrow}>👨‍🏫 Modo aula</span><h1>Mi aula</h1><p>Crea una clase, comparte su código, manda retos y sigue el progreso de tus alumnos sin necesitar sus correos electrónicos.</p></div>
        </header>

        {loading && <p>Cargando...</p>}
        {!loading && !user && <section className={styles.card}><h2>Inicia sesión para usar las aulas</h2><p>Los profesores pueden crear clases y los alumnos unirse mediante un código.</p></section>}

        {user && <>
          {message && <div className={styles.message}>{message}</div>}

          {!isTeacher && <section className={styles.card}>
            <h2>¿Eres maestro o maestra?</h2>
            <p>Activa el perfil de profesor para crear aulas, enviar actividades y consultar el progreso de tus alumnos.</p>
            <button className={styles.primary} onClick={activateTeacher} disabled={busy}>Activar perfil de profesor</button>
          </section>}

          {isTeacher && <section className={styles.grid2}>
            <form className={styles.card} onSubmit={createClassroom}>
              <h2>Crear una nueva aula</h2><p>Por ejemplo: 3ºB · Matemáticas.</p>
              <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Nombre del aula" maxLength={120} required />
              <button className={styles.primary} disabled={busy}>Crear aula</button>
            </form>
            <div className={styles.card}><h2>Cómo funciona</h2><p>Cada aula recibe un código único. Además puedes crear retos con enlace directo para compartirlos con tus alumnos.</p></div>
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
              <div className={styles.actions}><button onClick={() => openClassroom(room)}>Gestionar aula</button><button className={styles.danger} onClick={() => deleteClassroom(room.id)}>Eliminar</button></div>
            </article>)}</div>
            {!overview.owned.length && <p className={styles.empty}>Todavía no has creado ninguna aula.</p>}
          </section>}

          {!!overview.joined.length && <section>
            <div className={styles.sectionTitle}><h2>Aulas a las que pertenezco</h2></div>
            <div className={styles.classGrid}>{overview.joined.map((room) => <article key={room.id} className={styles.classCard}><div><h3>{room.name}</h3><p>Profesor: {room.teacher_name || "Profesor"}</p></div><div className={styles.code}>{room.code}</div><button className={styles.danger} onClick={() => leaveClassroom(room.id)}>Salir del aula</button></article>)}</div>
          </section>}

          {!!myChallenges.length && <section>
            <div className={styles.sectionTitle}><h2>Mis retos</h2><span>{myChallenges.length}</span></div>
            <div className={styles.challengeGrid}>{myChallenges.map((challenge) => {
              const total = Number(challenge.correct_count || 0) + Number(challenge.wrong_count || 0);
              const score = challenge.completed_at && total ? Math.round(Number(challenge.correct_count) * 100 / total) : null;
              const expired = challenge.due_at && new Date(challenge.due_at).getTime() < Date.now();
              return <article key={challenge.id} className={styles.challengeCard}>
                <div><span className={styles.challengeClass}>{challenge.classroom_name}</span><h3>{challenge.title}</h3><p>Tablas {challenge.tables.join(", ")} · {challenge.question_count} operaciones</p></div>
                <div className={styles.challengeStatus}>{challenge.completed_at ? `✅ Completado · ${score}%` : (!challenge.is_active || expired) ? "🔒 Cerrado" : challenge.started_at ? "▶️ En curso" : "🎯 Pendiente"}</div>
                <Link className={styles.challengeLink} href={challenge.url}>{challenge.completed_at ? "Ver resultado" : "Abrir reto"}</Link>
              </article>;
            })}</div>
          </section>}

          {selected && isTeacher && <section className={styles.detail}>
            <div className={styles.detailHeader}><div><span className={styles.eyebrow}>Código {selected.code}</span><h2>{selected.name}</h2></div><button onClick={() => setSelected(null)}>Cerrar</button></div>
            <div className={styles.stats}><div><strong>{students.length}</strong><span>Alumnos</span></div><div><strong>{summary.operations}</strong><span>Operaciones</span></div><div><strong>{summary.accuracy}%</strong><span>Aciertos</span></div></div>

            <div className={styles.tableWrap}><table><thead><tr><th>Alumno</th><th>Nivel</th><th>Puntos</th><th>Operaciones</th><th>Aciertos</th><th>Última actividad</th><th></th></tr></thead><tbody>
              {students.map((student) => <tr key={student.id}><td>{student.name || "Jugador"}</td><td>{student.level}</td><td>{student.points}</td><td>{student.operations}</td><td>{student.accuracy}%</td><td>{student.last_activity ? new Date(student.last_activity).toLocaleDateString("es-ES") : "Sin actividad"}</td><td><button className={styles.dangerText} onClick={() => removeStudent(student.id)}>Sacar</button></td></tr>)}
            </tbody></table>{!students.length && <p className={styles.empty}>Aún no hay alumnos en esta aula. Comparte el código <strong>{selected.code}</strong>.</p>}</div>

            <div className={styles.teacherSection}>
              <div><span className={styles.eyebrow}>Actividades</span><h2>Crear un reto</h2><p>Elige las tablas y el número de operaciones. El enlace resultante se puede compartir directamente.</p></div>
              <form className={styles.challengeForm} onSubmit={createChallenge}>
                <label>Título<input value={challengeTitle} onChange={(event) => setChallengeTitle(event.target.value)} placeholder="Ej. Repaso de las tablas 6, 7 y 8" maxLength={140} required /></label>
                <div><span className={styles.formLabel}>Tablas</span><div className={styles.tablePicker}>{TABLES.map((table) => <button type="button" key={table} className={challengeTables.includes(table) ? styles.tableActive : ""} onClick={() => toggleChallengeTable(table)}>{table}</button>)}</div></div>
                <div className={styles.formGrid}><label>Operaciones<input type="number" min="5" max="100" value={questionCount} onChange={(event) => setQuestionCount(event.target.value)} required /></label><label>Fecha límite (opcional)<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label></div>
                <button className={styles.primary} disabled={busy || !challengeTables.length}>Crear reto</button>
              </form>
            </div>

            <div className={styles.teacherSection}>
              <div className={styles.sectionTitle}><h2>Retos del aula</h2><span>{challenges.length}</span></div>
              <div className={styles.challengeList}>{challenges.map((challenge) => <article key={challenge.id} className={styles.challengeRow}>
                <div><h3>{challenge.title}</h3><p>Tablas {challenge.tables.join(", ")} · {challenge.question_count} operaciones{challenge.due_at ? ` · hasta ${new Date(challenge.due_at).toLocaleDateString("es-ES")}` : ""}</p><div className={styles.miniStats}><span>{challenge.completed}/{students.length} completados</span><span>{challenge.accuracy || 0}% aciertos</span><span>{challenge.avg_duration ? `${challenge.avg_duration}s de media` : "Sin tiempos"}</span></div></div>
                <div className={styles.challengeActions}><Link href={challenge.url}>Resultados</Link><button onClick={() => copyChallengeLink(challenge)}>Copiar enlace</button><button onClick={() => changeChallenge(challenge.id, challenge.is_active ? "close" : "reopen")}>{challenge.is_active ? "Cerrar" : "Reabrir"}</button><button className={styles.dangerText} onClick={() => changeChallenge(challenge.id, "delete")}>Eliminar</button></div>
              </article>)}</div>
              {!challenges.length && <p className={styles.empty}>Todavía no has creado retos para esta aula.</p>}
            </div>

            {!!hardest.length && <div className={styles.teacherSection}><h2>Operaciones que más cuestan al aula</h2><p>Calculado a partir de las respuestas de los retos.</p><div className={styles.hardestGrid}>{hardest.map((item) => <div key={`${item.table_number}-${item.multiplier}`}><strong>{item.table_number} × {item.multiplier}</strong><span>{item.errors} fallos · {item.error_rate}% error</span></div>)}</div></div>}
          </section>}
        </>}
      </main>
    </ResourceLayout>
  );
}
