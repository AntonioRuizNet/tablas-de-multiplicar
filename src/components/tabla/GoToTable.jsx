import React from "react";
import PropTypes from "prop-types";
import styles from "./GoToTable.module.css";

export function GoToTable({ children }) {
  return <div className={styles.goToTable}>{children}</div>;
}

GoToTable.propTypes = {
  children: PropTypes.node.isRequired,
};
