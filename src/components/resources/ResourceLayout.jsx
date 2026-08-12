import React from "react";
import Head from "next/head";
import PropTypes from "prop-types";
import { AppLayout } from "../layout/AppLayout";
import { Breadcrumbs } from "../seo/Breadcrumbs";
import styles from "./Resource.module.css";

const SITE_URL = "https://tablasdemultiplicar.app";

export function ResourceLayout({ title, description, path, children, breadcrumbs }) {
  const canonical = `${SITE_URL}${path}`;
  const fullTitle = `${title} | Tablas de multiplicar`;
  const jsonLd = { "@context":"https://schema.org", "@type":"LearningResource", name:title, description, url:canonical, inLanguage:"es-ES", isAccessibleForFree:true, educationalLevel:"Primary education" };
  return <AppLayout title={fullTitle} description={description} canonical={canonical}>
    <Head>
      <meta property="og:type" content="website" /><meta property="og:title" content={fullTitle} /><meta property="og:description" content={description} /><meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
    </Head>
    <div className={styles.wrap}>
      <Breadcrumbs items={breadcrumbs || [{name:"Inicio",href:"/"},{name:title,href:path}]} />
      {children}
    </div>
  </AppLayout>;
}
ResourceLayout.propTypes={title:PropTypes.string.isRequired,description:PropTypes.string.isRequired,path:PropTypes.string.isRequired,children:PropTypes.node.isRequired,breadcrumbs:PropTypes.array};
