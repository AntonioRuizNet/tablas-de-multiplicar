import React from "react";
import Link from "next/link";
import { FaClock, FaCheckCircle, FaBrain, FaRedoAlt, FaThLarge, FaAward } from "react-icons/fa";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import styles from "../components/resources/Resource.module.css";

const games = [
  { href:"/contrarreloj", title:"Contrarreloj", text:"Resuelve tantas multiplicaciones como puedas en 60 segundos.", Icon:FaClock },
  { href:"/prueba-tablas-de-multiplicar", title:"Prueba mezclada", text:"30 multiplicaciones para comprobar si dominas las tablas.", Icon:FaCheckCircle },
  { href:"/juego-memoria-multiplicaciones", title:"Juego de memoria", text:"Relaciona cada multiplicación con su resultado.", Icon:FaBrain },
  { href:"/practicar-errores", title:"Practicar mis errores", text:"Repite las multiplicaciones que más has fallado en este dispositivo.", Icon:FaRedoAlt },
  { href:"/tabla-del-7", title:"Práctica por tabla", text:"Elige una tabla y completa sus multiplicaciones con puntos y progreso.", Icon:FaThLarge },
  { href:"/diploma-tablas-de-multiplicar", title:"Reto del diploma", text:"40 multiplicaciones y un objetivo del 90% para conseguir el diploma.", Icon:FaAward },
];

export default function Juegos() {
  return <ResourceLayout title="Juegos de multiplicar" description="Juegos y retos gratuitos para practicar exclusivamente multiplicaciones y tablas de multiplicar." path="/juegos-tablas-de-multiplicar">
    <header className={styles.hero}>
      <h1>Juegos de multiplicar</h1>
      <p className={styles.lead}>Practica las tablas de multiplicar con distintos juegos y retos para mejorar velocidad, memoria y precisión.</p>
    </header>
    <div className={styles.grid}>
      {games.map(({ Icon, ...game }) => <Link className={styles.cardLink} href={game.href} key={game.href}>
        <article className={styles.card}>
          <Icon className={styles.gameIcon} aria-hidden="true" />
          <h2>{game.title}</h2>
          <p>{game.text}</p>
        </article>
      </Link>)}
    </div>
  </ResourceLayout>;
}
