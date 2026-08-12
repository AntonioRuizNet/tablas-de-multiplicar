import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./Resource.module.css";
import { MenuKeyboard } from "../keyboard";
import { TableSelector } from "./TableSelector";
import { updateResume } from "../../redux/reducers/userConfigSlice";

function makeQuestions(selected, count) {
  return Array.from({ length: count }, (_, i) => {
    const a = selected[(i * 7 + 3) % selected.length];
    const b = ((i * 5 + 8) % 12) + 1;
    return { a, b, result: a * b };
  });
}

export function Quiz({ diploma = false }) {
  const dispatch = useDispatch();
  const totalQuestions = diploma ? 40 : 30;
  const [selected, setSelected] = useState([1]);
  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");

  const toggle = (n) => setSelected((current) => current.includes(n) ? current.filter((v) => v !== n) : [...current, n]);

  const start = () => {
    if (!selected.length) return;
    setQuestions(makeQuestions(selected, totalQuestions));
    setCurrentIndex(0);
    setScore(0);
    setValue("");
    setPhase("playing");
  };

  const current = questions[currentIndex];
  const percentage = useMemo(() => phase === "finished" ? Math.round((score / totalQuestions) * 100) : null, [phase, score, totalQuestions]);

  const submitAnswer = () => {
    if (!current || !value) return;
    const isCorrect = Number(value) === current.result;
    if (isCorrect) setScore((n) => n + 1);
    dispatch(updateResume({
      table: `tabla-del-${current.a}`,
      operation: `${current.a}x${current.b}`,
      state: isCorrect ? "Bien" : "Mal",
      time: 0,
    }));
    setValue("");
    if (currentIndex + 1 >= questions.length) setPhase("finished");
    else setCurrentIndex((n) => n + 1);
  };

  const handleKey = (key) => {
    if (key === "Enviar") return submitAnswer();
    if (key === "Borrar") return setValue("");
    setValue((currentValue) => `${currentValue}${key}`);
  };

  if (phase === "setup") {
    return <>
      {diploma ? <div className={styles.controls}><label className={styles.control}>Nombre para el diploma<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" /></label></div> : null}
      <TableSelector selected={selected} onToggle={toggle} onStart={start} title={diploma ? "Elige las tablas para el reto del diploma" : "Elige las tablas para la prueba"} startLabel={diploma ? "Iniciar reto" : "Iniciar prueba"} />
    </>;
  }

  if (phase === "finished") {
    return <div className={styles.practiceBox}>
      {diploma && percentage >= 90 ? <div className={styles.sheet}><h2>Diploma de las tablas de multiplicar</h2><p>Se concede a <strong>{name || "________________"}</strong> por superar la prueba con un {percentage}% de aciertos.</p></div> : null}
      <p className={styles.result}>Has acertado {score} de {totalQuestions}: {percentage}%.</p>
      {diploma && percentage < 90 ? <p>Necesitas al menos un 90% para conseguir el diploma. Puedes volver a intentarlo cuando quieras.</p> : null}
      <div className={`${styles.resultActions} ${styles.noPrint}`}>
        <button className={styles.button} type="button" onClick={() => setPhase("setup")}>Elegir tablas y repetir</button>
        {diploma && percentage >= 90 ? <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={() => window.print()}>Imprimir diploma</button> : null}
      </div>
    </div>;
  }

  return <div className={styles.practiceBox}>
    <p className={styles.questionProgress}>Pregunta {currentIndex + 1} de {questions.length}</p>
    <div className={styles.operation}>{current.a} × {current.b} = ?</div>
    <div className={styles.answerDisplay} aria-live="polite">{value || "_"}</div>
    <div className={styles.keyboardWrap}><MenuKeyboard callback={handleKey} /></div>
    <div className={styles.score}><span>Aciertos: {score}</span></div>
  </div>;
}
