import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { ErrorPractice } from "../components/resources/ErrorPractice";
import styles from "../components/resources/Resource.module.css";
export default function Errores(){return <ResourceLayout title="Practicar mis errores de multiplicación" description="Practica automáticamente las multiplicaciones que más has fallado según tu historial guardado en este dispositivo." path="/practicar-errores"><header className={styles.hero}><h1>Practicar mis errores</h1><p className={styles.lead}>Usamos únicamente el historial guardado en tu navegador para priorizar las operaciones que has fallado durante la práctica.</p></header><ErrorPractice/><section className={styles.section}><h2>Por qué repetir los errores</h2><p>Dedicar más intentos a los resultados que todavía generan dudas evita gastar el mismo tiempo en operaciones que ya recuerdas con facilidad.</p></section></ResourceLayout>}
