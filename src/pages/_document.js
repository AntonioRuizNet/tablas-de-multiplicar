// pages/_document.js
import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Preconnect fuentes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Fuentes en una única petición */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&family=Schoolbell&display=swap" rel="stylesheet" />

        {/* Iconos/manifest (opcional aquí, pero útil como fallback global) */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
