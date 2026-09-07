import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ResourceLayout } from "../../components/resources/ResourceLayout";
import { useAuth } from "../../components/auth/AuthContext";
import styles from "./reto.module.css";

function formatDuration(seconds) {
  const value = Number(seconds || 0);
  if (!value) return "—";
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return minutes ? `${minutes}m ${rest}s` : `${rest}s`;
}

export default function RetoPage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const code = typeof router.query.code === "string" ? router.query.code : "";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const questionStartedAt = useRef(Date.now());

  const request = useCallback(async (options = {}) => {
    const response = await fetch(`/api/challenges/${encodeURIComponent(code)}`, {
      method: options.method || "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se ha podido cargar el reto.");
    return result;
  }, [code]);

  const load = useCallback(async () => {
    if (!code || !user) return;
    try {
      setLoading(true);
      setData(await request());
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }, [code, request, user]);

  useEffect(() => { load(); }, [load]);

  const currentQuestion = useMemo(() => data?.attempt?.questions?.find((question) => !question.answered_at) || null, [data]);
  const answered = useMemo(() => data?.attempt?.questions?.filter((question) => question.answered_at).length || 0, [data]);

  useEffect(() => {
    if (currentQuestion?.id) {
      questionStartedAt.current = Date.now();
      setAnswer("");
    }
  }, [currentQuestion?.id]);

  const start = async () => {
    try {
      setBusy(true); setMessage("");
      const result = await request({ method: "POST", body: { action: "start" } });
      setData((current) => ({ ...current, attempt: result.attempt, access: "member" }));
      await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const submitAnswer = async (event) => {
    event.preventDefault();
    if (!currentQuestion) return;
    const numericAnswer = Number(answer);
    if (!Number.isInteger(numericAnswer)) { setMessage("Escribe una respuesta válida."); return; }
    try {
      setBusy(true); setMessage("");
      const responseTime = Math.max(0, Math.round((Date.now() - questionStartedAt.current) / 10) / 100);
      const result = await request({ method: "POST", body: { action: "answer", questionId: currentQuestion.id, answer: numericAnswer, responseTime } });
      setData((current) => ({ ...current, attempt: result.attempt }));
      setMessage(result.isCorrect ? `✅ ¡Correcto! +${result.pointsAwarded} punto` : "❌ No era correcto. Sigue con la siguiente.");
      if (result.pointsAwarded) await refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  const challenge = data?.challenge;
  const attempt = data?.attempt;
  const totalQuestions = Number(challenge?.question_count || 0);
  const completed = Boolean(attempt?.completed_at);
  const score = completed && totalQuestions ? Math.round(Number(attempt.correct_count || 0) * 100 / totalQuestions) : 0;
  const nextUrl = `/reto/${encodeURIComponent(code)}`;

  return (
    <ResourceLayout title={challenge?.title || "Reto de tablas"} description="Reto de tablas de multiplicar creado por un profesor." path={`/reto/${code || ""}`}>
      <main className={styles.page}>
        {authLoading && <section className={styles.card}><p>Cargando...</p></section>}
        {!authLoading && !user && <section className={styles.card}>
          <span className={styles.eyebrow}>🎯 Reto de clase</span>
          <h1>Entra para realizar el reto</h1>
          <p>Solo necesitas tu cuenta de tablasdemultiplicar.app. Si el profesor te ha enviado este enlace, al empezar quedarás añadido automáticamente a su aula.</p>
          <div className={styles.actions}><Link className={styles.primaryLink} href={`/login?next=${encodeURIComponent(nextUrl)}`}>Iniciar sesión</Link><Link className={styles.secondaryLink} href={`/registro?next=${encodeURIComponent(nextUrl)}`}>Crear cuenta</Link></div>
        </section>}

        {user && loading && <section className={styles.card}><p>Cargando reto...</p></section>}
        {user && message && <div className={styles.message}>{message}</div>}

        {user && challenge && <>
          <header className={styles.hero}>
            <div><span className={styles.eyebrow}>🎯 {challenge.classroom_name}</span><h1>{challenge.title}</h1><p>Profesor: {challenge.teacher_name || "Profesor"}</p></div>
            <div className={styles.meta}><span>{challenge.question_count} operaciones</span><span>Tablas {challenge.tables.join(", ")}</span>{challenge.due_at && <span>Hasta {new Date(challenge.due_at).toLocaleDateString("es-ES")}</span>}</div>
          </header>

          {data.isOwner && <section className={styles.card}>
            <div className={styles.sectionHeader}><div><span className={styles.eyebrow}>Resultados</span><h2>Seguimiento del reto</h2></div><span className={data.closed ? styles.closedBadge : styles.activeBadge}>{data.closed ? "Cerrado" : "Activo"}</span></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Alumno</th><th>Estado</th><th>Aciertos</th><th>Nota</th><th>Tiempo</th></tr></thead><tbody>
              {(data.students || []).map((student) => {
                const total = Number(student.correct_count || 0) + Number(student.wrong_count || 0);
                const accuracy = student.accuracy == null ? "—" : `${student.accuracy}%`;
                return <tr key={student.id}><td>{student.name || "Jugador"}</td><td>{student.completed_at ? "Completado" : student.started_at ? "En curso" : "Pendiente"}</td><td>{student.completed_at ? `${student.correct_count}/${total}` : "—"}</td><td>{accuracy}</td><td>{formatDuration(student.duration_seconds)}</td></tr>;
              })}
            </tbody></table></div>
            {!!data.hardest?.length && <div className={styles.hardest}><h3>Operaciones que más cuestan</h3><div className={styles.pills}>{data.hardest.map((item) => <span key={`${item.table_number}-${item.multiplier}`}>{item.table_number} × {item.multiplier} · {item.errors} fallo{Number(item.errors) === 1 ? "" : "s"}</span>)}</div></div>}
          </section>}

          {!data.isOwner && !attempt && <section className={styles.card}>
            <h2>{data.closed ? "Este reto ya no está disponible" : "¿Preparado para empezar?"}</h2>
            <p>{data.closed ? "El profesor ha cerrado el reto o ha finalizado su fecha límite." : `Tendrás ${challenge.question_count} operaciones. Cada respuesta correcta suma 1 punto a tu perfil.`}</p>
            {!data.closed && <button className={styles.primary} onClick={start} disabled={busy}>{busy ? "Preparando..." : "Empezar reto"}</button>}
          </section>}

          {!data.isOwner && attempt && !completed && <section className={styles.quiz}>
            <div className={styles.progressRow}><span>Operación {answered + 1} de {totalQuestions}</span><strong>{Math.round(answered * 100 / Math.max(totalQuestions, 1))}%</strong></div>
            <div className={styles.progress}><span style={{ width: `${answered * 100 / Math.max(totalQuestions, 1)}%` }} /></div>
            {currentQuestion && <form onSubmit={submitAnswer} className={styles.questionCard}>
              <div className={styles.operation}>{currentQuestion.table_number} × {currentQuestion.multiplier}</div>
              <input autoFocus inputMode="numeric" pattern="-?[0-9]*" value={answer} onChange={(event) => setAnswer(event.target.value)} aria-label="Respuesta" disabled={busy} />
              <button className={styles.primary} disabled={busy}>{busy ? "Comprobando..." : "Responder"}</button>
            </form>}
          </section>}

          {!data.isOwner && completed && <section className={styles.resultCard}>
            <span className={styles.resultIcon}>{score >= 80 ? "🏆" : score >= 50 ? "👏" : "💪"}</span>
            <h2>¡Reto completado!</h2>
            <strong className={styles.score}>{score}%</strong>
            <p>{attempt.correct_count} aciertos de {totalQuestions} operaciones · {formatDuration(attempt.duration_seconds)}</p>
            <Link className={styles.secondaryLink} href="/mi-aula">Volver a Mi aula</Link>
          </section>}
        </>}
      </main>
    </ResourceLayout>
  );
}
