import React from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import Link from "next/link";
import { ARTICLES } from "../../content/articles";
import styles from "./Articulos.module.css";

export default function Articulos() {
  return (
    <AppLayout
      title="Artículos sobre tablas de multiplicar"
      description="Artículos educativos para aprender y practicar las tablas de multiplicar."
      canonical="https://tablasdemultiplicar.app/articulos"
    >
      <h1>Artículos</h1>

      <section className={styles.grid}>
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/articulos/${a.slug}`} className={styles.card} aria-label={`Leer artículo: ${a.title}`}>
            <article>
              <h2 className={styles.title}>{a.title}</h2>

              <p className={styles.description}>{a.description}</p>

              <div className={styles.meta}>
                <time dateTime={a.date}>{new Date(a.date).toLocaleDateString("es-ES")}</time>

                <ul className={styles.keywords}>
                  {a.keywords.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </AppLayout>
  );
}
