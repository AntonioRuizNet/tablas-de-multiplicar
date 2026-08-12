import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { Quiz } from "../components/resources/Quiz";
import styles from "../components/resources/Resource.module.css";
export default function Prueba(){return <ResourceLayout title="Prueba de las tablas de multiplicar" description="Haz una prueba gratuita de 30 multiplicaciones mezcladas del 1 al 12 y comprueba tu porcentaje de aciertos." path="/prueba-tablas-de-multiplicar"><header className={styles.hero}><h1>Prueba de las tablas de multiplicar</h1><p className={styles.lead}>Resuelve 30 operaciones mezcladas y corrige la prueba al terminar. Si todavía dudas en algunas, vuelve a practicar esas tablas antes de repetir el test.</p></header><Quiz/></ResourceLayout>}
