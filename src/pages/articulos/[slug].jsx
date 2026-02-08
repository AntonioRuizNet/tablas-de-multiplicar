import React from "react";
import { ARTICLES } from "../../content/articles";
import PropTypes from "prop-types";
import { AppLayout } from "../../components/layout/AppLayout";

export async function getStaticPaths() {
  const paths = ARTICLES.map((article) => ({
    params: { slug: article.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const article = ARTICLES.find((item) => item.slug === params.slug);

  return {
    props: { article },
  };
}

export default function ArticlePage({ article }) {
  return (
    <AppLayout
      title="Artículos sobre tablas de multiplicar"
      description="Artículos educativos para aprender y practicar las tablas de multiplicar."
      canonical="https://tablasdemultiplicar.app/articulos"
    >
      <h1>{article.title}</h1>

      {article.content.map((block, index) => {
        if (block.type === "h2") {
          return <h2 key={index}>{block.text}</h2>;
        }

        if (block.type === "p") {
          return <p key={index}>{block.text}</p>;
        }

        return null;
      })}
    </AppLayout>
  );
}

ArticlePage.propTypes = {
  article: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    content: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        text: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
};
