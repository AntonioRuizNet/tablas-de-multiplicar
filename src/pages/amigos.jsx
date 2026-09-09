import React, { useEffect, useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { UserAvatar } from "../components/avatar/UserAvatar";
import styles from "../styles/friends.module.css";

function Player({ player, action, label }) { return <li className={styles.player}><UserAvatar icon={player.avatar_icon} color={player.avatar_color} size={38}/><div><strong>{player.name}</strong><span>{player.points} puntos</span></div>{action ? <button onClick={action}>{label}</button> : null}</li>; }
export default function Amigos() {
  const [data,setData]=useState({search:[],pendingReceived:[],pendingSent:[],friends:[]}); const [query,setQuery]=useState(""); const [message,setMessage]=useState("");
  const load=async(q="")=>{const r=await fetch(`/api/friends${q?`?q=${encodeURIComponent(q)}`:""}`);const d=await r.json();if(r.ok)setData(d);else setMessage(d.error||"No se ha podido cargar.");};
  useEffect(()=>{load();},[]);
  const send=async(body)=>{const r=await fetch("/api/friends",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)setMessage(d.error||"No se ha podido guardar.");else {setMessage("");load(query);}};
  const search=(event)=>{event.preventDefault();load(query);};
  return <AppLayout title="Amigos | Tablas de multiplicar" description="Busca jugadores y gestiona tus amistades."><main className={styles.page}><header><h1>Amigos</h1><p>Encuentra compañeros para seguir vuestro progreso.</p></header><form className={styles.search} onSubmit={search}><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nombre" minLength="2"/><button>Buscar</button></form>{message?<p className={styles.message}>{message}</p>:null}
    {query ? <section><h2>Coincidencias</h2>{data.search.length?<ul>{data.search.map(p=><Player key={p.id} player={p} label="Enviar solicitud" action={()=>send({action:"request",targetId:p.id})}/>)}</ul>:<p>No hay jugadores coincidentes.</p>}</section>:null}
    <section><h2>Solicitudes recibidas</h2>{data.pendingReceived.length?<ul>{data.pendingReceived.map(p=><li className={styles.player} key={p.id}><UserAvatar icon={p.avatar_icon} color={p.avatar_color} size={38}/><div><strong>{p.name}</strong><span>{p.points} puntos · solicitud pendiente</span></div><button onClick={()=>send({action:"accept",friendshipId:p.id})}>Aceptar</button><button onClick={()=>send({action:"reject",friendshipId:p.id})}>Rechazar</button></li>)}</ul>:<p>No tienes solicitudes pendientes.</p>}</section>
    <section><h2>Solicitudes enviadas</h2>{data.pendingSent.length?<ul>{data.pendingSent.map(p=><Player key={p.id} player={p} label="Cancelar" action={()=>send({action:"remove",friendshipId:p.id})}/>)}</ul>:<p>No tienes solicitudes enviadas.</p>}</section>
    <section><h2>Mis amigos</h2>{data.friends.length?<ul>{data.friends.map(p=><Player key={p.id} player={p} label="Eliminar" action={()=>send({action:"remove",friendshipId:p.id})}/>)}</ul>:<p>Aún no tienes amigos añadidos.</p>}</section>
  </main></AppLayout>;
}
