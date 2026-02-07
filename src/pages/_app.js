// pages/_app.js
import React from "react";
import Head from "next/head";
import Script from "next/script";
import { Provider } from "react-redux";
import { store } from "../redux/store";

import "../styles/globals.css";

/* eslint-disable react/prop-types */

const SITE_URL = "https://tablasdemultiplicar.app";
const GA_ID = "G-H0C71YDJBT";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        {/* Defaults globales (cada página puede sobrescribir) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />

        {/* Defaults OG/Twitter (cada página puede sobrescribir) */}
        <meta property="og:site_name" content="Tablas de multiplicar" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      </Head>

      {/* Google Analytics (mejor en _app para apps SPA) */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>

      <Component {...pageProps} />
    </Provider>
  );
}
