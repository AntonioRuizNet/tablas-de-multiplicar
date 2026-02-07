// pages/_app.js
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "../redux/store";
import { AchievementsToastStack } from "../components/AchievementChip/AchievementsToastStack";

import "../styles/globals.css";

/* eslint-disable react/prop-types */

const SITE_URL = "https://tablasdemultiplicar.app";
const GA_ID = "G-H0C71YDJBT";

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />

        <meta property="og:site_name" content="Tablas de multiplicar" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      </Head>

      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>

      {/* ✅ Evita mismatch: en SSR renderizamos lo mínimo (nada dependiente del store persistido) */}
      {!mounted ? null : (
        <PersistGate loading={null} persistor={persistor}>
          <AchievementsToastStack />
          <Component {...pageProps} />
        </PersistGate>
      )}
    </Provider>
  );
}
