import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { ArithmeticQuiz } from "../components/resources/ArithmeticQuiz";
import styles from "../components/resources/Resource.module.css";

export default function Divisiones() {
  return <ResourceLayout title="Juego de divisiones por niveles" description="Practica divisiones exactas por niveles, desde repartos sencillos hasta divisiones con números grandes." path="/divisiones">
    <header className={styles.hero}>
      <h1>Divisiones por niveles</h1>
      <p className={styles.lead}>Elige tu nivel y completa una prueba de 20 divisiones exactas. Empieza con repartos sencillos y avanza hasta divisiones con dividendos y divisores mayores.</p>
    </header>
    <ArithmeticQuiz type="division" />
  </ResourceLayout>;
}
