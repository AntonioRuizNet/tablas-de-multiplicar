import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./Resource.module.css";
import { MenuKeyboard } from "../keyboard";
import { TableSelector } from "./TableSelector";
import { updateResume } from "../../redux/reducers/userConfigSlice";
import { useActivityReward } from "./useActivityReward";
import { useAuth } from "../auth/AuthContext";

function makeQuestions(selected, count) {
  return Array.from({ length: count }, (_, i) => {
    const a = selected[(i * 7 + 3) % selected.length];
    const b = ((i * 5 + 8) % 12) + 1;
    return { a, b, result: a * b };
  });
}

function formatDiplomaDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function Quiz({ diploma = false }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { awardActivity, reward } = useActivityReward();
  const [rewarded, setRewarded] = useState(false);
  const totalQuestions = diploma ? 40 : 30;
  const [selected, setSelected] = useState([1]);
  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [completedAt, setCompletedAt] = useState(null);

  useEffect(() => {
    if (diploma && user?.name) setName(user.name);
  }, [diploma, user?.name]);

  const diplomaName = user?.name?.trim() || name.trim() || "________________";
  const diplomaDate = completedAt ? formatDiplomaDate(completedAt) : "";
  const selectedTablesLabel =
    selected.length === 12 ? "Todas las tablas del 1 al 12" : `Tablas ${[...selected].sort((a, b) => a - b).join(", ")}`;

  const toggle = (n) => setSelected((current) => (current.includes(n) ? current.filter((v) => v !== n) : [...current, n]));

  const start = () => {
    if (!selected.length) return;
    setQuestions(makeQuestions(selected, totalQuestions));
    setCurrentIndex(0);
    setScore(0);
    setValue("");
    setResults([]);
    setRewarded(false);
    setCompletedAt(null);
    setPhase("playing");
  };

  const current = questions[currentIndex];
  const percentage = useMemo(
    () => (phase === "finished" ? Math.round((score / totalQuestions) * 100) : null),
    [phase, score, totalQuestions],
  );

  const submitAnswer = () => {
    if (!current || !value) return;
    const isCorrect = Number(value) === current.result;
    if (isCorrect) setScore((n) => n + 1);
    const resultRow = { table: current.a, multiplier: current.b, answer: Number(value), time: 0 };
    const finalResults = [...results, resultRow];
    setResults(finalResults);
    dispatch(
      updateResume({
        table: `tabla-del-${current.a}`,
        operation: `${current.a}x${current.b}`,
        state: isCorrect ? "Bien" : "Mal",
        time: 0,
      }),
    );
    setValue("");
    if (currentIndex + 1 >= questions.length) {
      setCompletedAt(new Date());
      setPhase("finished");
      if (!rewarded) {
        setRewarded(true);
        awardActivity(diploma ? "diploma" : "quiz", { operations: finalResults }).catch(console.error);
      }
    } else setCurrentIndex((n) => n + 1);
  };

  const handleKey = (key) => {
    if (key === "Enviar") return submitAnswer();
    if (key === "Borrar") return setValue("");
    setValue((currentValue) => `${currentValue}${key}`);
  };

  if (phase === "setup") {
    return (
      <>
        {diploma ? (
          user?.name ? (
            <div className={styles.diplomaRecipientNotice}>
              El diploma se emitirá a nombre de <strong>{user.name}</strong>.
            </div>
          ) : (
            <div className={styles.controls}>
              <label className={styles.control}>
                Nombre para el diploma
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Escribe tu nombre" />
              </label>
            </div>
          )
        ) : null}
        <TableSelector
          selected={selected}
          onToggle={toggle}
          onStart={start}
          title={diploma ? "Elige las tablas para el reto del diploma" : "Elige las tablas para la prueba"}
          startLabel={diploma ? "Iniciar reto" : "Iniciar prueba"}
        />
      </>
    );
  }

  if (phase === "finished") {
    return (
      <div className={`${styles.practiceBox} ${diploma ? styles.diplomaResultBox : ""}`}>
        {diploma && percentage >= 90 ? (
          <section className={styles.diplomaPrint} aria-label="Diploma de las tablas de multiplicar">
            <div className={styles.diplomaCornerTop} aria-hidden="true" />
            <div className={styles.diplomaCornerBottom} aria-hidden="true" />
            <div className={styles.diplomaInner}>
              <div className={styles.diplomaBrand}>tablasdemultiplicar.app</div>
              <div className={styles.diplomaStars} aria-hidden="true">
                ✦ · ✦ · ✦
              </div>
              <p className={styles.diplomaKicker}>Reconocimiento al aprendizaje</p>
              <h2 className={styles.diplomaTitle}>
                Diploma de las tablas
                <br />
                de multiplicar
              </h2>
              <p className={styles.diplomaIntro}>Se concede este diploma a</p>
              <div className={styles.diplomaName}>{diplomaName}</div>
              <p className={styles.diplomaCopy}>
                por superar con éxito el reto de las tablas de multiplicar, demostrando esfuerzo, constancia y dominio del
                cálculo.
              </p>

              <div className={styles.diplomaStats}>
                <div className={styles.diplomaStat}>
                  <strong>{percentage}%</strong>
                  <span>de aciertos</span>
                </div>
                <div className={`${styles.diplomaSeal} ${percentage === 100 ? styles.diplomaSealPerfect : ""}`}>
                  <span>{percentage === 100 ? "★" : "✓"}</span>
                  <strong>{percentage === 100 ? "¡Perfecto!" : "¡Superado!"}</strong>
                </div>
                <div className={styles.diplomaStat}>
                  <strong>
                    {score}/{totalQuestions}
                  </strong>
                  <span>respuestas correctas</span>
                </div>
              </div>

              <div className={styles.diplomaDetails}>
                <span>{selectedTablesLabel}</span>
                <span>{diplomaDate}</span>
              </div>

              <div className={styles.diplomaFooter}>
                <div className={styles.diplomaSignature}>
                  <span>Aprender · practicar · mejorar</span>
                  <strong>Tablas de Multiplicar</strong>
                </div>
                <div className={styles.diplomaMiniMark} aria-hidden="true">
                  ×
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div className={styles.noPrint}>
          <p className={styles.result}>
            Has acertado {score} de {totalQuestions}: {percentage}%.
          </p>
          {reward !== null ? <p className={styles.reward}>+{reward} puntos</p> : null}
          {diploma && percentage >= 90 ? (
            <p className={styles.diplomaCongrats}>¡Enhorabuena, {diplomaName}! Tu diploma está listo para imprimir.</p>
          ) : null}
          {diploma && percentage < 90 ? (
            <p>Necesitas al menos un 90% para conseguir el diploma. Puedes volver a intentarlo cuando quieras.</p>
          ) : null}
          <div className={styles.resultActions}>
            <button className={styles.button} type="button" onClick={() => setPhase("setup")}>
              Elegir tablas y repetir
            </button>
            {diploma && percentage >= 90 ? (
              <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={() => window.print()}>
                Imprimir diploma
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.practiceBox}>
      <p className={styles.questionProgress}>
        Pregunta {currentIndex + 1} de {questions.length}
      </p>
      <div className={styles.operation}>
        {current.a} × {current.b} = ?
      </div>
      <div className={styles.answerDisplay} aria-live="polite">
        {value || "_"}
      </div>
      <div className={styles.keyboardWrap}>
        <MenuKeyboard callback={handleKey} />
      </div>
      <div className={styles.score}>
        <span>Aciertos: {score}</span>
      </div>
    </div>
  );
}
