import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { ArithmeticQuiz } from "../components/resources/ArithmeticQuiz";
import styles from "../components/resources/Resource.module.css";

export default function Restas() {
  return <ResourceLayout title="Juego de restas por niveles" description="Practica restas por niveles, desde las primeras restas hasta operaciones con números grandes." path="/restas">
    <header className={styles.hero}>
      <h1>Restas por niveles</h1>
      <p className={styles.lead}>Elige tu nivel y completa una prueba de 20 restas. La dificultad aumenta poco a poco, incluyendo restas con llevadas y números de varias cifras.</p>
    </header>
    <ArithmeticQuiz type="subtraction" />
  </ResourceLayout>;
}
