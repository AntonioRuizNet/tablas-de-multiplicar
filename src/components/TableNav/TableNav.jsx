// components/tabla/TableNav.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Link from "next/link";

import styles from "./TableNav.module.css";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function TableNav({ numero }) {
  const { prev, next } = useMemo(() => {
    const n = clamp(Number(numero) || 1, 1, 12);
    return {
      prev: n > 1 ? n - 1 : null,
      next: n < 12 ? n + 1 : null,
    };
  }, [numero]);

  return (
    <nav className={styles.nav} aria-label="Navegación entre tablas">
      {prev ? (
        <Link className={styles.link} href={`/tabla-del-${prev}`} aria-label={`Anterior: tabla del ${prev}`}>
          ‹ Tabla del {prev}
        </Link>
      ) : (
        <span className={styles.disabled} aria-hidden="true">
          ‹
        </span>
      )}

      {next ? (
        <Link className={styles.link} href={`/tabla-del-${next}`} aria-label={`Siguiente: tabla del ${next}`}>
          Tabla del {next} ›
        </Link>
      ) : (
        <span className={styles.disabled} aria-hidden="true">
          ›
        </span>
      )}
    </nav>
  );
}

TableNav.propTypes = {
  numero: PropTypes.number.isRequired,
};
