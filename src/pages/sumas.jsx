import React, { useState } from "react";
import { useRouter } from "next/router";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { AdditionsQuiz } from "../components/resources/AdditionsQuiz";
import styles from "../components/resources/Resource.module.css";
export default function Sumas(){const [playing,setPlaying]=useState(false);const router=useRouter();return <ResourceLayout title="Juego de sumas por niveles" description="Practica sumas por niveles, desde las primeras sumas hasta operaciones con números grandes." path="/sumas">{!playing?<header className={`${styles.hero} ${styles.compactHero}`}><h1>Sumas por niveles</h1><p className={styles.lead}>Elige uno de los 7 niveles y completa una prueba de 10 sumas.</p></header>:null}<AdditionsQuiz onLevelChange={setPlaying} initialLevel={router.query.nivel}/></ResourceLayout>}
