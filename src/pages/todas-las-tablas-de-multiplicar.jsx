import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { StaticTable } from "../components/seo/StaticTable";
import styles from "../components/resources/Resource.module.css";
export default function Todas(){return <ResourceLayout title="Todas las tablas de multiplicar del 1 al 12" description="Consulta todas las tablas de multiplicar del 1 al 12 completas y entra en cada tabla para practicar online." path="/todas-las-tablas-de-multiplicar"><header className={styles.hero}><h1>Todas las tablas de multiplicar del 1 al 12</h1><p className={styles.lead}>Aquí tienes las tablas completas en una sola página. Úsalas para repasar y entra en cualquier tabla para practicar con ejercicios interactivos.</p></header><section className={styles.tableGrid}>{Array.from({length:12},(_,i)=><StaticTable key={i+1} number={i+1} compact link />)}</section></ResourceLayout>}
