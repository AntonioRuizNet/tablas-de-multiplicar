import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { StaticTable } from "../components/seo/StaticTable";
import styles from "../components/resources/Resource.module.css";
export default function Imprimir(){return <ResourceLayout title="Tablas de multiplicar para imprimir" description="Tablas de multiplicar del 1 al 12 completas y preparadas para imprimir como hoja de consulta." path="/tablas-de-multiplicar-para-imprimir"><header className={styles.hero}><h1>Tablas de multiplicar para imprimir</h1><p className={styles.lead}>Imprime las tablas del 1 al 12 como hoja de consulta para estudiar y repasar en casa o en clase.</p></header><div className={`${styles.actions} ${styles.noPrint}`}><button className={styles.button} onClick={()=>window.print()}>Imprimir todas las tablas</button></div><div className={styles.tableGrid}>{Array.from({length:12},(_,i)=><StaticTable key={i+1} number={i+1} compact />)}</div></ResourceLayout>}
