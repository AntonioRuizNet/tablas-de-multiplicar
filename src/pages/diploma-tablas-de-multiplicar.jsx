import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { Quiz } from "../components/resources/Quiz";
import styles from "../components/resources/Resource.module.css";
export default function Diploma(){return <ResourceLayout title="Diploma de las tablas de multiplicar" description="Supera una prueba de 40 multiplicaciones y consigue un diploma imprimible si logras al menos un 90% de aciertos." path="/diploma-tablas-de-multiplicar"><header className={styles.hero}><h1>Consigue tu diploma de las tablas de multiplicar</h1><p className={styles.lead}>Completa 40 operaciones del 1 al 12. Con un 90% de aciertos o más podrás imprimir tu diploma de reconocimiento.</p></header><Quiz diploma/></ResourceLayout>}
