import React, { useState } from "react";
import { useRouter } from "next/router";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { ArithmeticQuiz } from "../components/resources/ArithmeticQuiz";
import styles from "../components/resources/Resource.module.css";

export default function Restas() {
  const [playing, setPlaying] = useState(false);
  const router = useRouter();
  return <ResourceLayout title="Juego de restas por niveles" description="Practica restas por niveles, desde las primeras restas hasta operaciones con números grandes." path="/restas">
    {!playing ? <header className={`${styles.hero} ${styles.compactHero}`}>
      <h1>Restas por niveles</h1>
      <p className={styles.lead}>Elige uno de los 7 niveles y completa una prueba de 10 restas.</p>
    </header> : null}
    <ArithmeticQuiz type="subtraction" onLevelChange={setPlaying} initialLevel={router.query.nivel} />
  </ResourceLayout>;
}
