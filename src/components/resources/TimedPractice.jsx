import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./Resource.module.css";
import { MenuKeyboard } from "../keyboard";
import { updateResume } from "../../redux/reducers/userConfigSlice";
import { TableSelector } from "./TableSelector";

const ALL_TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

function randomOperation(tables) {
  const table = tables[Math.floor(Math.random() * tables.length)];
  const multiplier = Math.floor(Math.random() * 12) + 1;
  return { table, multiplier, answer: table * multiplier };
}

export function TimedPractice() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState([1]);
  const [phase, setPhase] = useState("setup");
  const [seconds, setSeconds] = useState(60);
  const [operation, setOperation] = useState({ table: 1, multiplier: 1, answer: 1 });
  const [value, setValue] = useState("");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const running = phase === "playing";

  useEffect(() => {
    if (!running || seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, seconds]);

  useEffect(() => {
    if (running && seconds === 0) setPhase("finished");
  }, [running, seconds]);

  const toggle = (n) => setSelected((current) => current.includes(n) ? current.filter((v) => v !== n) : [...current, n]);

  const start = () => {
    if (!selected.length) return;
    setSeconds(60);
    setCorrect(0);
    setWrong(0);
    setValue("");
    setOperation(randomOperation(selected));
    setPhase("playing");
  };

  const submitAnswer = () => {
    if (!running || !value) return;
    const isCorrect = Number(value) === operation.answer;
    if (isCorrect) setCorrect((n) => n + 1); else setWrong((n) => n + 1);
    dispatch(updateResume({
      table: `tabla-del-${operation.table}`,
      operation: `${operation.table}x${operation.multiplier}`,
      state: isCorrect ? "Bien" : "Mal",
      time: 0,
    }));
    setValue("");
    setOperation(randomOperation(selected));
  };

  const handleKey = (key) => {
    if (key === "Enviar") return submitAnswer();
    if (key === "Borrar") return setValue("");
    setValue((current) => `${current}${key}`);
  };

  if (phase === "setup") {
    return <TableSelector selected={selected} onToggle={toggle} onStart={start} title="Elige las tablas para el contrarreloj" startLabel="Iniciar contrarreloj" />;
  }

  if (phase === "finished") {
    return <div className={styles.practiceBox}>
      <p className={styles.result}>Has conseguido {correct} aciertos y {wrong} errores en 60 segundos.</p>
      <div className={styles.resultActions}>
        <button className={styles.button} type="button" onClick={() => setPhase("setup")}>Elegir tablas y jugar otra vez</button>
      </div>
    </div>;
  }

  return <div className={styles.practiceBox}>
    <div className={styles.score}><span>Tiempo: {seconds}s</span><span>Aciertos: {correct}</span><span>Errores: {wrong}</span></div>
    <div className={styles.operation}>{operation.table} × {operation.multiplier} = ?</div>
    <div className={styles.answerDisplay} aria-live="polite">{value || "_"}</div>
    <div className={styles.keyboardWrap}><MenuKeyboard callback={handleKey} /></div>
  </div>;
}
