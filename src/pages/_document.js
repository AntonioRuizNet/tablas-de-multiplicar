// pages/_document.js
import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

const SITE_URL = "https://tablasdemultiplicar.app";

function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Preconnect fuentes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Fuentes */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Schoolbell&display=swap" rel="stylesheet" />

        {/* Preload og-image (mejora LCP cuando se comparte / redes / etc.) */}
        <link rel="preload" as="image" href={`${SITE_URL}/og-image.png`} />

        {/* Iconos/manifest (opcional aquí, pero útil como fallback global) */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
