import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import styles from "./Seo.module.css";

export function StaticTable({ number, compact = false, link = false }) {
  const content = (
    <div className={`${styles.staticTable} ${compact ? styles.compactTable : ""}`}>
      <h3>Tabla del {number}</h3>
      <ol>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((multiplier) => (
          <li key={multiplier}>
            <span>{number} × {multiplier}</span>
            <strong>= {number * multiplier}</strong>
          </li>
        ))}
      </ol>
    </div>
  );

  return link ? <Link className={styles.tableCardLink} href={`/tabla-del-${number}`}>{content}</Link> : content;
}

StaticTable.propTypes = {
  number: PropTypes.number.isRequired,
  compact: PropTypes.bool,
  link: PropTypes.bool,
};
