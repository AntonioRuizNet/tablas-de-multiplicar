import React, { useState } from "react";
import { useRouter } from "next/router";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { ArithmeticQuiz } from "../components/resources/ArithmeticQuiz";
import styles from "../components/resources/Resource.module.css";

export default function Divisiones() {
  const [playing, setPlaying] = useState(false);
  const router = useRouter();
  return <ResourceLayout title="Juego de divisiones por niveles" description="Practica divisiones exactas por niveles, desde repartos sencillos hasta divisiones con números grandes." path="/divisiones">
    {!playing ? <header className={`${styles.hero} ${styles.compactHero}`}>
      <h1>Divisiones por niveles</h1>
      <p className={styles.lead}>Elige uno de los 7 niveles y completa una prueba de 10 divisiones exactas.</p>
    </header> : null}
    <ArithmeticQuiz type="division" onLevelChange={setPlaying} initialLevel={router.query.nivel} />
  </ResourceLayout>;
}
