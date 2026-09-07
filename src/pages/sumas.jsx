import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { AdditionsQuiz } from "../components/resources/AdditionsQuiz";
import styles from "../components/resources/Resource.module.css";
export default function Sumas(){return <ResourceLayout title="Juego de sumas por niveles" description="Practica sumas por niveles, desde las primeras sumas hasta operaciones con números grandes." path="/sumas"><header className={styles.hero}><h1>Sumas por niveles</h1><p className={styles.lead}>Elige tu nivel y completa una prueba de 20 sumas. La dificultad avanza desde cálculo básico hasta números de varias cifras.</p></header><AdditionsQuiz/></ResourceLayout>}
