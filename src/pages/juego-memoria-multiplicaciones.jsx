import React from "react";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import { MemoryGame } from "../components/resources/MemoryGame";
import styles from "../components/resources/Resource.module.css";
export default function Memoria(){return <ResourceLayout title="Juego de memoria de multiplicaciones" description="Juego de memoria gratuito para relacionar multiplicaciones con sus resultados y practicar las tablas de forma visual." path="/juego-memoria-multiplicaciones"><header className={styles.hero}><h1>Juego de memoria de multiplicaciones</h1><p className={styles.lead}>Destapa cartas y empareja cada multiplicación con su resultado correcto.</p></header><MemoryGame/></ResourceLayout>}
