import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ARTICLES } from "../../content/articles/index";
import PropTypes from "prop-types";
import { AppLayout } from "../../components/layout/AppLayout";
import { Breadcrumbs } from "../../components/seo/Breadcrumbs";

const SITE_URL = "https://tablasdemultiplicar.app";

export async function getStaticPaths() {
  return { paths: ARTICLES.map((article) => ({ params: { slug: article.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const article = ARTICLES.find((item) => item.slug === params.slug);
  if (!article) return { notFound: true };
  return { props: { article } };
}

function renderBlock(block, index) {
  if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
  if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
  if (block.type === "p") return <p key={index}>{block.text}</p>;
  if (block.type === "ul") return <ul key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "ol") return <ol key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
  return null;
}

export default function ArticlePage({ article }) {
  const canonical = `${SITE_URL}/articulos/${article.slug}`;
  const title = `${article.title} | Tablas de multiplicar`;
  const schema = {
    "@context": "https://schema.org", "@type": "Article", headline: article.title,
    description: article.description, datePublished: article.date, dateModified: article.updatedAt || article.date,
    mainEntityOfPage: canonical, inLanguage: "es-ES", publisher: { "@type": "Organization", name: "Tablas de multiplicar", url: SITE_URL },
  };

  return (
    <AppLayout title={title} description={article.description} canonical={canonical}>
      <Head>
        <meta property="og:type" content="article" /><meta property="og:title" content={title} />
        <meta property="og:description" content={article.description} /><meta property="og:url" content={canonical} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <Breadcrumbs items={[{name:"Inicio",href:"/"},{name:"Artículos",href:"/articulos"},{name:article.title,href:`/articulos/${article.slug}`}]} />
      <article>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <p><small>Publicado el <time dateTime={article.date}>{new Date(`${article.date}T12:00:00`).toLocaleDateString("es-ES")}</time></small></p>
        {article.content.map(renderBlock)}
        <hr />
        <h2>Practica lo aprendido</h2>
        <p>Después de leer, pasa a la práctica: consulta <Link href="/todas-las-tablas-de-multiplicar">todas las tablas</Link>, haz una <Link href="/prueba-tablas-de-multiplicar">prueba mezclada</Link> o prueba el <Link href="/contrarreloj">modo contrarreloj</Link>.</p>
      </article>
    </AppLayout>
  );
}

ArticlePage.propTypes = {
  article: PropTypes.shape({ slug:PropTypes.string.isRequired,title:PropTypes.string.isRequired,description:PropTypes.string.isRequired,date:PropTypes.string.isRequired,updatedAt:PropTypes.string,content:PropTypes.array.isRequired }).isRequired,
};
