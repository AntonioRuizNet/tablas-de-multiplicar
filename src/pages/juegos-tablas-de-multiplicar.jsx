import React from "react";
import Link from "next/link";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import styles from "../components/resources/Resource.module.css";
const games=[
  {href:"/contrarreloj",title:"Contrarreloj",text:"Resuelve tantas operaciones como puedas en 60 segundos."},
  {href:"/prueba-tablas-de-multiplicar",title:"Prueba mezclada",text:"30 operaciones para comprobar si dominas las tablas."},
  {href:"/juego-memoria-multiplicaciones",title:"Juego de memoria",text:"Relaciona cada operación con su resultado."},
  {href:"/practicar-errores",title:"Practicar mis errores",text:"Repite las operaciones que más has fallado en este dispositivo."},
  {href:"/tabla-del-7",title:"Práctica por tabla",text:"Elige una tabla y completa sus multiplicaciones con puntos y progreso."},
  {href:"/diploma-tablas-de-multiplicar",title:"Reto del diploma",text:"40 operaciones y un objetivo del 90% para conseguir el diploma."},
];
export default function Juegos(){return <ResourceLayout title="Juegos de tablas de multiplicar" description="Juegos y retos gratuitos para practicar las tablas de multiplicar: contrarreloj, pruebas, práctica por tabla y diploma." path="/juegos-tablas-de-multiplicar"><header className={styles.hero}><h1>Juegos de tablas de multiplicar</h1><p className={styles.lead}>Practica de distintas formas para no depender de repetir las tablas siempre en el mismo orden.</p></header><div className={styles.grid}>{games.map(g=><Link className={styles.cardLink} href={g.href} key={g.href}><article className={styles.card}><h2>{g.title}</h2><p>{g.text}</p></article></Link>)}</div></ResourceLayout>}
