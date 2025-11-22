import React from "react";
import PropTypes from "prop-types";

const list = [
  { name: 0 },
  { name: 1 },
  { name: 2 },
  { name: 3 },
  { name: 4 },
  { name: 5 },
  { name: 6 },
  { name: 7 },
  { name: 8 },
  { name: 9 },
  { name: "Borrar" },
  { name: "Enviar" },
];

export const MenuKeyboard = ({ callback }) => {
  return (
    <>
      <ul className="ul-list keyboard">
        {list.map((key) => (
          <li key={key.name} className="li-list button-kids" onClick={() => callback(key.name)}>
            {key.name}
          </li>
        ))}
      </ul>
    </>
  );
};

MenuKeyboard.propTypes = {
  callback: PropTypes.func.isRequired,
};
