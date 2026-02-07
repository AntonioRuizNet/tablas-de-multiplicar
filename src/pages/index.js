import React from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "./index.module.css";
import { MenuTablas } from "../components/menuTablas";

const SITE_URL = "https://tablasdemultiplicar.app";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function Home() {
  const title = "Tablas de multiplicar | Aprende y practica del 1 al 12";
  const description =
    "Aprende y practica las tablas de multiplicar del 1 al 12 con un juego para niños. Entrena multiplicaciones, sube de nivel y mejora tu rapidez.";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo aprender las tablas de multiplicar rápido?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La forma más efectiva es practicar cada día unos minutos: empieza por las tablas fáciles (1, 2, 5 y 10), usa trucos visuales, repite en voz alta y haz ejercicios mezclados para ganar velocidad.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué tablas de multiplicar se aprenden en primaria?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Normalmente se trabajan las tablas del 1 al 10 (y a menudo del 12). Dominar estas tablas ayuda con fracciones, divisiones y problemas matemáticos más avanzados.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué es mejor: practicar en orden o mezclado?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Para memorizar, practicar en orden es ideal al principio. Para mejorar la agilidad mental, lo mejor es pasar a ejercicios mezclados y retos con tiempo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto tiempo hay que practicar al día?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Con 5–10 minutos diarios suele ser suficiente para notar progreso. La clave es la constancia y aumentar poco a poco la dificultad.",
        },
      },
    ],
  };

  const eduAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalApplication",
    name: "Tablas de multiplicar",
    url: `${SITE_URL}/`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    inLanguage: "es-ES",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
    description,
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={OG_IMAGE} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eduAppJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </Head>

      <main className={styles.main}>
        {/* HERO */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 className={styles.h1}>Tablas de multiplicar</h1>
              <p className={styles.lead}>
                Aprende y practica las <strong>tablas de multiplicar</strong> con un juego educativo para niños: ejercicios
                interactivos, puntos, niveles y retos para mejorar tu rapidez.
              </p>

              <div className={styles.ctaRow}>
                <a className={styles.primaryCta} href="#elige-tabla">
                  Empezar a practicar
                </a>
                <a className={styles.secondaryCta} href="#como-funciona">
                  Cómo funciona
                </a>
              </div>

              <ul className={styles.bullets} aria-label="Ventajas">
                <li>✅ Practica del 1 al 12</li>
                <li>✅ Ideal para primaria</li>
                <li>✅ Progreso con puntos y niveles</li>
              </ul>
            </div>

            <div className={styles.heroCard} aria-label="Acceso rápido a tablas">
              <p className={styles.cardTitle}>Acceso rápido</p>
              <p className={styles.cardText}>Elige una tabla y empieza ahora mismo.</p>

              <div className={styles.quickGrid}>
                {TABLES.map((n) => (
                  <Link key={n} href={`/tabla-${n}`} className={styles.quickBtn} aria-label={`Practicar tabla del ${n}`}>
                    {n}
                  </Link>
                ))}
              </div>

              <p className={styles.cardHint}>Consejo: empieza por 1, 2, 5 y 10.</p>
            </div>
          </div>
        </header>

        {/* SELECTOR */}
        <section className={styles.section} id="elige-tabla">
          <h2 className={styles.h2}>Elige una tabla de multiplicar para practicar</h2>
          <p className={styles.p}>
            Selecciona una tabla y resuelve multiplicaciones paso a paso. Si te equivocas, podrás revisar el historial y repetir
            para aprender más rápido.
          </p>

          <div className={styles.selectorWrap}>
            <MenuTablas />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.section} id="como-funciona">
          <h2 className={styles.h2}>Cómo aprender las tablas de multiplicar con este juego</h2>

          <div className={styles.steps}>
            <article className={styles.step}>
              <h3 className={styles.h3}>1) Practica en orden</h3>
              <p className={styles.p}>
                Empieza desde el 1 hasta el 10 para memorizar la secuencia. Verás las operaciones claras y siempre sabrás en qué
                multiplicación estás.
              </p>
            </article>

            <article className={styles.step}>
              <h3 className={styles.h3}>2) Gana velocidad</h3>
              <p className={styles.p}>
                A medida que respondes, mejoras tu tiempo. La repetición en sesiones cortas es una de las mejores formas de
                memorizar multiplicaciones.
              </p>
            </article>

            <article className={styles.step}>
              <h3 className={styles.h3}>3) Sube de nivel</h3>
              <p className={styles.p}>
                Completa una tabla, consigue puntos y avanza. Es una forma motivadora de practicar las tablas de multiplicar sin
                aburrirse.
              </p>
            </article>
          </div>
        </section>

        {/* CONTENT BLOCKS (SEO) */}
        <section className={styles.section}>
          <h2 className={styles.h2}>Aprender las tablas de multiplicar</h2>
          <p className={styles.p}>
            Aprender las tablas de multiplicar es una habilidad clave en primaria. Dominar las tablas ayuda a resolver
            multiplicaciones con rapidez y facilita temas como divisiones, fracciones y problemas matemáticos. Para aprenderlas
            bien, funciona mejor practicar poco tiempo cada día, empezar por las tablas más fáciles y pasar después a ejercicios
            mezclados.
          </p>

          <div className={styles.callout}>
            <p className={styles.calloutTitle}>Trucos rápidos para memorizar</p>
            <ul className={styles.list}>
              <li>
                <strong>Tabla del 10:</strong> añade un 0 (7×10=70).
              </li>
              <li>
                <strong>Tabla del 5:</strong> termina en 0 o 5 (6×5=30).
              </li>
              <li>
                <strong>Tabla del 9:</strong> la suma de cifras del resultado suele dar 9 (9×7=63 → 6+3=9).
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Practicar las tablas de multiplicar</h2>
          <p className={styles.p}>
            Practicar las tablas de multiplicar refuerza la memoria a largo plazo y mejora la precisión. Lo ideal es combinar:
            práctica en orden para memorizar y práctica aleatoria para ganar agilidad mental. Con 5–10 minutos al día, el progreso
            suele notarse muy pronto.
          </p>
        </section>

        {/* FAQ (visible) */}
        <section className={styles.section}>
          <h2 className={styles.h2}>Preguntas frecuentes</h2>

          <div className={styles.faq}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>¿Cómo aprender las tablas de multiplicar rápido?</summary>
              <p className={styles.faqA}>
                Practica cada día unos minutos. Empieza por 1, 2, 5 y 10, usa trucos visuales y repite en voz alta. Cuando ya las
                sepas en orden, mezcla operaciones para ganar velocidad.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>¿Es mejor practicar en orden o mezclado?</summary>
              <p className={styles.faqA}>
                En orden sirve para memorizar. Mezclado sirve para reaccionar rápido. Lo ideal es hacer ambas cosas.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>¿Cuánto tiempo hay que practicar al día?</summary>
              <p className={styles.faqA}>
                Con 5–10 minutos diarios es suficiente si eres constante. Mejor poco cada día que mucho solo un día.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>¿Para qué sirven las tablas de multiplicar?</summary>
              <p className={styles.faqA}>
                Para calcular más rápido y resolver problemas matemáticos. Ayudan especialmente con divisiones, fracciones y
                operaciones más avanzadas.
              </p>
            </details>
          </div>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Tablas de multiplicar — Practica multiplicaciones online gratis.
          </p>
        </footer>
      </main>
    </>
  );
}
