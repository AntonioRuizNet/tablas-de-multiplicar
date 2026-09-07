import React from "react";
import Link from "next/link";
import { FaPlus, FaMinus, FaDivide } from "react-icons/fa";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import styles from "../components/resources/Resource.module.css";
import gameStyles from "../components/resources/OtherGames.module.css";

const games = [
  { href:"/sumas", title:"Sumas", text:"Practica sumas en 7 niveles, desde cálculo básico hasta números grandes.", Icon:FaPlus, className:gameStyles.addition },
  { href:"/restas", title:"Restas", text:"Entrena restas progresivas, incluyendo operaciones con llevadas y varias cifras.", Icon:FaMinus, className:gameStyles.subtraction },
  { href:"/divisiones", title:"Divisiones", text:"Practica divisiones exactas desde repartos sencillos hasta operaciones avanzadas.", Icon:FaDivide, className:gameStyles.division },
];

export default function OtrosJuegos() {
  return <ResourceLayout title="Otros juegos de matemáticas" description="Juegos gratuitos de sumas, restas y divisiones por niveles." path="/otros-juegos">
    <header className={`${styles.hero} ${gameStyles.hero}`}>
      <h1>Otros juegos</h1>
      <p className={styles.lead}>Practica otras operaciones matemáticas con juegos por niveles. Cada respuesta correcta suma puntos a tu perfil.</p>
    </header>
    <div className={styles.grid}>
      {games.map(({ Icon, className, ...game }) => <Link className={styles.cardLink} href={game.href} key={game.href}>
        <article className={`${styles.card} ${gameStyles.card} ${className}`}>
          <Icon className={gameStyles.icon} aria-hidden="true" />
          <h2>{game.title}</h2>
          <p>{game.text}</p>
          <span className={gameStyles.cta}>Elegir niveles →</span>
        </article>
      </Link>)}
    </div>
  </ResourceLayout>;
}
