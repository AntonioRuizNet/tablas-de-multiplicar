import React from "react";
import { useDispatch } from "react-redux";
import { setComponentActive } from "../redux/reducers/userConfigSlice";
import Link from "next/link"; // Importar Link de Next.js

const tableList = [
  { name: 1, component: "tabla-del-1" },
  { name: 2, component: "tabla-del-2" },
  { name: 3, component: "tabla-del-3" },
  { name: 4, component: "tabla-del-4" },
  { name: 5, component: "tabla-del-5" },
  { name: 6, component: "tabla-del-6" },
  { name: 7, component: "tabla-del-7" },
  { name: 8, component: "tabla-del-8" },
  { name: 9, component: "tabla-del-9" },
  { name: 10, component: "tabla-del-10" },
  { name: 11, component: "tabla-del-11" },
  { name: 12, component: "tabla-del-12" },
];

// eslint-disable-next-line react/prop-types
export const MenuTablas = ({ callbackButton = () => null }) => {
  const dispatch = useDispatch();

  const handleUrl = (url) => {
    callbackButton();
    dispatch(setComponentActive(url));
  };

  return (
    <div className="menuTablasContainer">
      <h4>Ir a la tabla</h4>
      <div className="menuTablas">
        {tableList.map((tabla) => (
          <div
            key={tabla.name} // Es importante agregar una key única en la lista
            className="button-kids"
            onClick={() => handleUrl(tabla.component)}
          >
            <Link href={`/${tabla.component}`}>{tabla.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
