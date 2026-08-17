import React, { useEffect, useState } from "react";
import styles from "./Resource.module.css";
import { TableSelector } from "./TableSelector";
import { useActivityReward } from "./useActivityReward";

function shuffle(list) { return [...list].sort(() => Math.random() - 0.5); }

function buildPairs(tables) {
  const pairs = [];
  const usedResults = new Set();
  let cursor = 0;
  while (pairs.length < 6 && cursor < 144) {
    const a = tables[cursor % tables.length];
    const b = ((cursor * 5 + 1) % 12) + 1;
    const result = a * b;
    if (!usedResults.has(result)) {
      usedResults.add(result);
      pairs.push({ a, b });
    }
    cursor += 1;
  }
  return pairs;
}

function makeDeck(tables) {
  return shuffle(buildPairs(tables).flatMap((q, i) => [
    { id: `o${i}`, pair: i, label: `${q.a} × ${q.b}` },
    { id: `r${i}`, pair: i, label: String(q.a * q.b) },
  ]));
}

export function MemoryGame() {
  const { awardActivity, reward } = useActivityReward();
  const [rewarded, setRewarded] = useState(false);
  const [selected, setSelected] = useState([1]);
  const [phase, setPhase] = useState("setup");
  const [deck, setDeck] = useState([]);
  const [open, setOpen] = useState([]);
  const [done, setDone] = useState([]);
  const [moves, setMoves] = useState(0);

  const toggle = (n) => setSelected((current) => current.includes(n) ? current.filter((v) => v !== n) : [...current, n]);
  const start = () => {
    if (!selected.length) return;
    setDeck(makeDeck(selected));
    setOpen([]);
    setDone([]);
    setMoves(0);
    setRewarded(false);
    setPhase("playing");
  };


  useEffect(() => {
    const complete = phase === "playing" && deck.length > 0 && done.length === deck.length / 2;
    if (!complete || rewarded) return;
    setRewarded(true);
    awardActivity("memory", { moves }).catch(console.error);
  }, [phase, deck.length, done.length, moves, rewarded, awardActivity]);

  const choose = (card) => {
    if (open.length === 2 || open.some((c) => c.id === card.id) || done.includes(card.pair)) return;
    const next = [...open, card];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      setTimeout(() => {
        if (next[0].pair === next[1].pair) setDone((d) => [...d, next[0].pair]);
        setOpen([]);
      }, 550);
    }
  };

  if (phase === "setup") {
    return <TableSelector selected={selected} onToggle={toggle} onStart={start} title="Elige las tablas para el juego de memoria" startLabel="Iniciar juego" />;
  }

  return <div className={styles.practiceBox}>
    <p>Encuentra cada multiplicación y su resultado. Movimientos: <strong>{moves}</strong></p>
    <div className={styles.memoryGrid}>{deck.map((card) => {
      const visible = open.some((c) => c.id === card.id) || done.includes(card.pair);
      return <button key={card.id} type="button" className={styles.memoryCard} onClick={() => choose(card)} disabled={done.includes(card.pair)} aria-label={visible ? card.label : "Carta oculta"}>{visible ? card.label : "?"}</button>;
    })}</div>
    {done.length && done.length === deck.length / 2 ? <><p className={styles.result}>¡Has completado el juego!</p>{reward !== null ? <p className={styles.reward}>+{reward} puntos</p> : null}</> : null}
    <div className={styles.actions}>
      <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={() => setPhase("setup")}>Elegir otras tablas</button>
    </div>
  </div>;
}
