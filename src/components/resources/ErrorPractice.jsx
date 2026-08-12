import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import styles from "./Resource.module.css";
import { MenuKeyboard } from "../keyboard";
import { TableSelector } from "./TableSelector";
import { updateResume } from "../../redux/reducers/userConfigSlice";

function unresolvedMistakes(resume) {
  const latest = new Map();
  (Array.isArray(resume) ? resume : []).forEach((row) => {
    if (row?.operation) latest.set(row.operation, row);
  });
  return [...latest.values()]
    .filter((row) => row.state === "Mal")
    .map((row) => ({ operation: row.operation, table: Number(row.operation.split("x")[0]) }))
    .filter((row) => Number.isFinite(row.table));
}

export function ErrorPractice() {
  const dispatch = useDispatch();
  const resume = useSelector((state) => state.aplicationConfig.userConfig.resume);
  const allMistakes = useMemo(() => unresolvedMistakes(resume), [resume]);
  const [selected, setSelected] = useState([1]);
  const [phase, setPhase] = useState("setup");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  const mistakes = useMemo(() => allMistakes.filter((item) => selected.includes(item.table)), [allMistakes, selected]);
  const current = mistakes[0];

  const toggle = (n) => setSelected((currentSelected) => currentSelected.includes(n) ? currentSelected.filter((v) => v !== n) : [...currentSelected, n]);
  const start = () => { if (selected.length) { setValue(""); setMessage(""); setPhase("playing"); } };

  const submitAnswer = () => {
    if (!current || !value) return;
    const [a, b] = current.operation.split("x").map(Number);
    const expected = a * b;
    const isCorrect = Number(value) === expected;
    dispatch(updateResume({ table: `tabla-del-${a}`, operation: current.operation, state: isCorrect ? "Bien" : "Mal", time: 0 }));
    if (isCorrect) {
      setMessage("¡Correcto! Esta operación sale de tu lista de errores.");
    } else {
      setMessage(`Todavía no: ${a} × ${b} = ${expected}. Volverá a aparecer hasta que la resuelvas bien.`);
    }
    setValue("");
  };

  const handleKey = (key) => {
    if (key === "Enviar") return submitAnswer();
    if (key === "Borrar") return setValue("");
    setValue((currentValue) => `${currentValue}${key}`);
  };

  if (phase === "setup") {
    return <>
      {!allMistakes.length ? <div className={styles.notice}>No tienes errores pendientes. Practica alguna <Link href="/tabla-del-1"><strong>tabla de multiplicar</strong></Link> o haz una prueba; si fallas una operación aparecerá aquí.</div> : null}
      <TableSelector selected={selected} onToggle={toggle} onStart={start} title="Elige de qué tablas quieres repasar errores" startLabel="Iniciar repaso" />
    </>;
  }

  if (!current) {
    return <div className={styles.practiceBox}>
      <p className={styles.result}>No quedan errores pendientes en las tablas seleccionadas.</p>
      <p>Una operación solo volverá a esta lista si la fallas de nuevo en una práctica o prueba.</p>
      <div className={styles.actions}><button className={styles.button} type="button" onClick={() => setPhase("setup")}>Elegir otras tablas</button></div>
    </div>;
  }

  const [a, b] = current.operation.split("x").map(Number);
  return <div className={styles.practiceBox}>
    <p>Quedan <strong>{mistakes.length}</strong> errores pendientes en las tablas seleccionadas.</p>
    <div className={styles.operation}>{a} × {b} = ?</div>
    <div className={styles.answerDisplay} aria-live="polite">{value || "_"}</div>
    <div className={styles.keyboardWrap}><MenuKeyboard callback={handleKey} /></div>
    {message ? <p className={styles.result}>{message}</p> : null}
  </div>;
}
