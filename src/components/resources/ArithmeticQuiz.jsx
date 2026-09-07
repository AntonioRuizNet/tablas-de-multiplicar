import React, { useMemo, useState } from "react";
import styles from "./Resource.module.css";
import levelStyles from "./ArithmeticQuiz.module.css";
import { MenuKeyboard } from "../keyboard";
import { useAuth } from "../auth/AuthContext";

const TOTAL = 20;
const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const ADDITION_LEVELS = [
  { id:1, name:"Primeras sumas", text:"Resultados hasta 10.", make:()=>{const a=rand(0,10);return [a,rand(0,10-a)];} },
  { id:2, name:"Hasta 20", text:"Sumas básicas para ganar agilidad mental.", make:()=>{const a=rand(0,20);return [a,rand(0,20-a)];} },
  { id:3, name:"Dos cifras sin llevadas", text:"Sumas hasta 99 sin llevadas.", make:()=>{const a1=rand(0,9),b1=rand(0,9-a1),a10=rand(1,9),b10=rand(0,9-a10);return [a10*10+a1,b10*10+b1];} },
  { id:4, name:"Dos cifras con llevadas", text:"Sumas de dos cifras con llevadas.", make:()=>{let a,b;do{a=rand(10,89);b=rand(10,99-a);}while((a%10)+(b%10)<10);return[a,b];} },
  { id:5, name:"Tres cifras", text:"Sumas con resultados hasta 999.", make:()=>{const a=rand(100,899);return[a,rand(10,999-a)];} },
  { id:6, name:"Miles", text:"Sumas con resultados hasta 9.999.", make:()=>{const a=rand(1000,8999);return[a,rand(100,9999-a)];} },
  { id:7, name:"Experto", text:"Números grandes y varias llevadas.", make:()=>[rand(10000,499999),rand(10000,499999)] },
];

const SUBTRACTION_LEVELS = [
  { id:1, name:"Primeras restas", text:"Restas sencillas con números hasta 10.", make:()=>{const a=rand(1,10);return[a,rand(0,a)];} },
  { id:2, name:"Hasta 20", text:"Restas básicas para ganar agilidad mental.", make:()=>{const a=rand(5,20);return[a,rand(0,a)];} },
  { id:3, name:"Dos cifras sin llevadas", text:"Restas de dos cifras sin pedir prestado.", make:()=>{const a10=rand(2,9),b10=rand(1,a10),a1=rand(0,9),b1=rand(0,a1);return[a10*10+a1,b10*10+b1];} },
  { id:4, name:"Dos cifras con llevadas", text:"Restas de dos cifras con llevadas.", make:()=>{let a,b;do{a=rand(20,99);b=rand(10,a-1);}while((a%10)>=(b%10));return[a,b];} },
  { id:5, name:"Tres cifras", text:"Restas con números de hasta tres cifras.", make:()=>{const a=rand(100,999);return[a,rand(10,a)];} },
  { id:6, name:"Miles", text:"Restas con números de hasta 9.999.", make:()=>{const a=rand(1000,9999);return[a,rand(100,a)];} },
  { id:7, name:"Experto", text:"Restas con números grandes y varias llevadas.", make:()=>{const a=rand(10000,999999);return[a,rand(1000,a)];} },
];

const DIVISION_LEVELS = [
  { id:1, name:"Primeras divisiones", text:"Repartos sencillos con divisores del 2 al 5.", make:()=>{const b=rand(2,5),q=rand(1,5);return[b*q,b];} },
  { id:2, name:"Tablas de dividir", text:"Divisiones exactas relacionadas con las tablas del 2 al 10.", make:()=>{const b=rand(2,10),q=rand(1,10);return[b*q,b];} },
  { id:3, name:"Dos cifras", text:"Dividendos de dos cifras entre una cifra.", make:()=>{const b=rand(2,9),q=rand(6,11);return[b*q,b];} },
  { id:4, name:"Tres cifras", text:"Dividendos de tres cifras entre una cifra.", make:()=>{const b=rand(2,9),q=rand(12,99);return[b*q,b];} },
  { id:5, name:"Divisor de dos cifras", text:"Divisiones exactas con divisores de dos cifras.", make:()=>{const b=rand(10,25),q=rand(2,30);return[b*q,b];} },
  { id:6, name:"Miles", text:"Dividendos de hasta cuatro cifras.", make:()=>{const b=rand(2,25),q=rand(20,250);return[b*q,b];} },
  { id:7, name:"Experto", text:"Divisiones exactas con números más grandes.", make:()=>{const b=rand(10,99),q=rand(20,999);return[b*q,b];} },
];

const CONFIG = {
  addition: { symbol:"+", levels:ADDITION_LEVELS, theme:"addition" },
  subtraction: { symbol:"−", levels:SUBTRACTION_LEVELS, theme:"subtraction" },
  division: { symbol:"÷", levels:DIVISION_LEVELS, theme:"division" },
};

function resultFor(type, a, b) {
  if (type === "addition") return a + b;
  if (type === "subtraction") return a - b;
  return a / b;
}

export function ArithmeticQuiz({ type }) {
  const { user } = useAuth();
  const config = CONFIG[type];
  const [level, setLevel] = useState(null);
  const [question, setQuestion] = useState(null);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const currentLevel = useMemo(() => config.levels.find((item) => item.id === level), [config.levels, level]);

  const nextQuestion = (selectedLevel = currentLevel) => {
    const [a,b] = selectedLevel.make();
    setQuestion({ a,b });
    setValue("");
  };

  const start = (id) => {
    const selectedLevel = config.levels.find((item) => item.id === id);
    setLevel(id);
    setIndex(0);
    setScore(0);
    setEarnedPoints(0);
    setFinished(false);
    nextQuestion(selectedLevel);
  };

  const submit = async () => {
    if (!question || value === "") return;
    const answer = Number(value);
    const correct = answer === resultFor(type, question.a, question.b);
    if (correct) setScore((current) => current + 1);

    if (user) {
      try {
        const response = await fetch("/api/progress/arithmetic", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({ operationType:type, level, a:question.a, b:question.b, answer }),
        });
        const data = await response.json();
        if (response.ok && data.pointsAwarded) setEarnedPoints((current) => current + Number(data.pointsAwarded));
      } catch (_) {}
    }

    if (index + 1 >= TOTAL) {
      setFinished(true);
      setValue("");
    } else {
      setIndex((current) => current + 1);
      nextQuestion();
    }
  };

  const handleKey = (key) => {
    if (key === "Enviar") return submit();
    if (key === "Borrar") return setValue("");
    setValue((current) => `${current}${key}`);
  };

  if (!level) {
    return <div className={`${levelStyles.grid} ${levelStyles[config.theme]}`}>
      {config.levels.map((item) => <button type="button" className={levelStyles.card} key={item.id} onClick={() => start(item.id)}>
        <span className={levelStyles.levelNumber}>Nivel {item.id}</span>
        <strong className={levelStyles.levelName}>{item.name}</strong>
        <span className={levelStyles.description}>{item.text}</span>
      </button>)}
    </div>;
  }

  if (finished) {
    return <div className={styles.practiceBox}>
      <p className={styles.result}>Has acertado {score} de {TOTAL}: {Math.round(score * 100 / TOTAL)}%.</p>
      {user ? <p className={styles.reward}>+{earnedPoints} puntos conseguidos</p> : null}
      <div className={styles.resultActions}>
        <button className={styles.button} onClick={() => start(level)}>Repetir nivel</button>
        <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setLevel(null)}>Cambiar nivel</button>
      </div>
    </div>;
  }

  return <div className={styles.practiceBox}>
    <p className={styles.questionProgress}><strong>{currentLevel.name}</strong> · Pregunta {index + 1} de {TOTAL}</p>
    <div className={styles.operation}>{question.a} {config.symbol} {question.b}</div>
    <div className={styles.answerDisplay}>{value || "?"}</div>
    <div className={styles.keyboardWrap}><MenuKeyboard callback={handleKey}/></div>
  </div>;
}
