// pages/_app.js
import React from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import "../styles/index.css";
import "./../styles/home.css";
import "./../styles/tabla.css";
import "../styles/components.css";

/* eslint-disable react/prop-types */
export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
