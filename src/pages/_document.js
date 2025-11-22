// pages/_document.js
import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

function Document() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalApplication",
    name: "Tablas de Multiplicar del 1 al 12",
    url: "https://www.webdelmaestro.com/tablasdemultiplicar",
    applicationCategory: "Educational",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <Html lang="es">
      <Head>
        <title>Tablas de Multiplicar del 1 al 12 | WebdelMaestro.com</title>
        <meta
          name="description"
          content="Practica y aprende las tablas de multiplicar del 1 al 12 con juegos interactivos y ejercicios divertidos para niños."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Schoolbell&display=swap"
          rel="stylesheet"
        />

        {/* Structured data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Google Analytics (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-H0C71YDJBT"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-H0C71YDJBT');
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
