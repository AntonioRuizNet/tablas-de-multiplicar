import React,{useMemo,useState} from "react";
import styles from "./Resource.module.css";
import { MenuKeyboard } from "../keyboard";
import { useAuth } from "../auth/AuthContext";

const LEVELS=[
{id:1,title:"Nivel 1 · Primeras sumas",text:"Resultados hasta 10.",make:()=>{const a=Math.floor(Math.random()*6),b=Math.floor(Math.random()*(11-a));return[a,b]}},
{id:2,title:"Nivel 2 · Hasta 20",text:"Sumas básicas para ganar agilidad mental.",make:()=>{const a=Math.floor(Math.random()*16),b=Math.floor(Math.random()*(21-a));return[a,b]}},
{id:3,title:"Nivel 3 · Dos cifras",text:"Sumas hasta 99 sin llevadas.",make:()=>{const a1=Math.floor(Math.random()*6),b1=Math.floor(Math.random()*(10-a1));const a10=Math.floor(Math.random()*6),b10=Math.floor(Math.random()*(10-a10));return[a10*10+a1,b10*10+b1]}},
{id:4,title:"Nivel 4 · Con llevadas",text:"Dos cifras con llevadas.",make:()=>{const a=10+Math.floor(Math.random()*80),b=10+Math.floor(Math.random()*(100-a));return[a,b]}},
{id:5,title:"Nivel 5 · Tres cifras",text:"Sumas con resultados hasta 999.",make:()=>{const a=100+Math.floor(Math.random()*700),b=50+Math.floor(Math.random()*(1000-a-50));return[a,b]}},
{id:6,title:"Nivel 6 · Miles",text:"Sumas con resultados hasta 9.999.",make:()=>{const a=1000+Math.floor(Math.random()*7000),b=100+Math.floor(Math.random()*(10000-a-100));return[a,b]}},
{id:7,title:"Nivel 7 · Experto",text:"Números grandes y varias llevadas.",make:()=>{const a=10000+Math.floor(Math.random()*400000),b=10000+Math.floor(Math.random()*400000);return[a,b]}}
];
const TOTAL=20;
export function AdditionsQuiz(){const{user}=useAuth();const[level,setLevel]=useState(null);const[q,setQ]=useState(null);const[index,setIndex]=useState(0);const[value,setValue]=useState("");const[score,setScore]=useState(0);const[finished,setFinished]=useState(false);const currentLevel=useMemo(()=>LEVELS.find(x=>x.id===level),[level]);
const nextQuestion=(lv=currentLevel)=>{const[a,b]=lv.make();setQ({a,b});setValue("")};
const start=(id)=>{const lv=LEVELS.find(x=>x.id===id);setLevel(id);setIndex(0);setScore(0);setFinished(false);nextQuestion(lv)};
const submit=()=>{if(!q||value==="")return;const answer=Number(value),correct=answer===q.a+q.b;if(correct)setScore(s=>s+1);if(user)fetch("/api/progress/addition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({level,a:q.a,b:q.b,answer})}).catch(()=>{});if(index+1>=TOTAL){setFinished(true);setValue("");}else{setIndex(i=>i+1);nextQuestion();}};
const handleKey=(key)=>{if(key==="Enviar")return submit();if(key==="Borrar")return setValue("");setValue(v=>`${v}${key}`)};
if(!level)return <div className={styles.levelGrid}>{LEVELS.map(l=><button type="button" className={styles.levelCard} key={l.id} onClick={()=>start(l.id)}><strong>{l.title}</strong><span>{l.text}</span></button>)}</div>;
if(finished)return <div className={styles.practiceBox}><p className={styles.result}>Has acertado {score} de {TOTAL}: {Math.round(score*100/TOTAL)}%.</p><div className={styles.resultActions}><button className={styles.button} onClick={()=>start(level)}>Repetir nivel</button><button className={`${styles.button} ${styles.buttonSecondary}`} onClick={()=>setLevel(null)}>Cambiar nivel</button></div></div>;
return <div className={styles.practiceBox}><p className={styles.questionProgress}>{currentLevel.title} · Pregunta {index+1} de {TOTAL}</p><div className={styles.operation}>{q.a} + {q.b}</div><div className={styles.answerDisplay}>{value||"?"}</div><div className={styles.keyboardWrap}><MenuKeyboard callback={handleKey}/></div></div>}
