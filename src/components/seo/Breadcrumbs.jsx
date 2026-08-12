import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import styles from "./Seo.module.css";

const SITE_URL = "https://tablasdemultiplicar.app";

export function Breadcrumbs({ items }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <nav className={styles.breadcrumbs} aria-label="Migas de pan">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 ? <span aria-hidden="true">›</span> : null}
            {index === items.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.href}>{item.name}</Link>
            )}
          </React.Fragment>
        ))}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired, href: PropTypes.string.isRequired }),
  ).isRequired,
};
