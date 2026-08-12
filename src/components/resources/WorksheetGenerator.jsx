import React, { useMemo, useState } from "react";
import styles from "./Resource.module.css";

export function WorksheetGenerator() {
  const tables = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const [selected, setSelected] = useState([2,3,4,5]);
  const [count, setCount] = useState(20);
  const [seed, setSeed] = useState(1);
  const toggle = (n) => setSelected((s) => s.includes(n) ? s.filter((v) => v !== n) : [...s,n]);
  const pool = selected.length ? selected : tables;
  const questions = useMemo(() => Array.from({length:count}, (_, i) => {
    const a = pool[(i * 7 + seed * 3) % pool.length];
    const b = ((i * 5 + seed * 7) % 12) + 1;
    return {a,b};
  }), [count, pool.join(","), seed]);
  return <>
    <div className={`${styles.noPrint}`}>
      <div className={styles.checkGrid}>{tables.map((n)=><label key={n} className={styles.check}><input type="checkbox" checked={selected.includes(n)} onChange={()=>toggle(n)} /> Tabla {n}</label>)}</div>
      <div className={styles.controls}><label className={styles.control}>Número de ejercicios<select value={count} onChange={(e)=>setCount(Number(e.target.value))}><option>20</option><option>30</option><option>40</option><option>50</option></select></label></div>
      <div className={styles.actions}><button className={styles.button} onClick={()=>setSeed((s)=>s+1)}>Generar otros ejercicios</button><button className={`${styles.button} ${styles.buttonSecondary}`} onClick={()=>window.print()}>Imprimir ficha</button></div>
    </div>
    <div className={styles.sheet}><h2>Ficha de tablas de multiplicar</h2><p>Nombre: ____________________________ Fecha: ______________</p><div className={styles.sheetGrid}>{questions.map((q,i)=><div className={styles.sheetItem} key={i}>{i+1}. {q.a} × {q.b} = __________</div>)}</div></div>
  </>;
}
