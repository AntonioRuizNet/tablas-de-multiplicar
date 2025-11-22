import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateResume, updateOperationTimer, runningOperationTimer, updateStatus } from "../redux/reducers/userConfigSlice";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { MenuTablas } from "../components/menuTablas";
import { MenuKeyboard } from "../components/keyboard";
import { randomTip, rangos } from "../constants";

function Temporizador() {
  const dispatch = useDispatch();
  //const timer = useSelector((state) => state.aplicationConfig.userConfig.operationTimer);

  useEffect(() => {
    const intervalo = setInterval(() => {
      dispatch(runningOperationTimer());
    }, 1000);

    return () => clearInterval(intervalo); // limpia al desmontar
  }, [dispatch]);
}

export const Tabla = ({ tabla }) => {
  const dispatch = useDispatch();
  const component = useSelector((state) => state.aplicationConfig.userConfig.componentActive);

  const numero = tabla.match(/\d+/)?.[0]; // Extrae el número de la cadena
  const [active, setActive] = useState(1);
  const [values, updateValues] = useState([]);
  const [error, setError] = useState(false);
  //const [rango, updateRango] = useState(0);
  //const [nivel, updateNivel] = useState(0);
  //const [puntos, updatePuntos] = useState(0);
  const [showHistorial, updateShowHistorial] = useState(false);

  const RandomTip = () => {
    const [tip, setTip] = useState("");
    useEffect(() => {
      const random = Math.floor(Math.random() * randomTip.length);
      setTip(randomTip[random]);
    }, []);
    return (
      <div className="randomTip">
        <p className="randomTip-title">Sabías que...</p>
        <p>{tip}</p>
      </div>
    );
  };

  const reset = () => {
    hideFloatPanel();
    setActive(1);
    updateValues([]);
  };

  const showFloatPanel = () => {
    console.log("showFloatPanel Component");
    const floatPanel = document.querySelector(".float-panel");
    if (floatPanel) {
      console.log("Encontrado, aplicando estilos");
      floatPanel.classList.add("show");
      floatPanel.classList.remove("hide");
    }
  };

  const hideFloatPanel = () => {
    console.log("hideFloatPanel Component");
    const floatPanel = document.querySelector(".float-panel");
    if (floatPanel) {
      console.log("Encontrado, aplicando estilos");
      floatPanel.classList.add("hide");
      floatPanel.classList.remove("show");
    }
  };

  useEffect(() => {
    console.log("useEffect component");
    hideFloatPanel();
    dispatch(updateOperationTimer(0));
  }, [component]);

  const EnOrden = () => {
    const numbers_1 = [1, 2, 3, 4, 5];
    const numbers_2 = [6, 7, 8, 9, 10];
    const Result = ({ number }) => {
      const isActive = active === number;
      const valueFound = values && values.filter((f) => f.name === number);
      const value = valueFound.length > 0 ? valueFound[0].value : "";
      return <div className={`tablaResult ${isActive && "tablaResultActive"}`}>{value}</div>;
    };

    Result.propTypes = {
      number: PropTypes.number.isRequired,
    };
    return (
      <div className="tabla-enOrden-2col">
        <div className="tabla-enOrden-col">
          {numbers_1.map((number) => (
            <div className="tabla-enOrden" key={`number1-${number}`}>
              <div>{numero}</div>
              <div>x</div>
              <div>{number}</div>
              <div>=</div>
              <Result number={number} />
            </div>
          ))}
        </div>
        <div className="tabla-enOrden-col">
          {numbers_2.map((number) => (
            <div className="tabla-enOrden" key={`number2-${number}`}>
              <div>{numero}</div>
              <div>x</div>
              <div>{number}</div>
              <div>=</div>
              <Result number={number} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const WoodenTable = () => {
    const segundos = useSelector((state) => state.aplicationConfig.userConfig.operationTimer);

    const handleResult = (value) => {
      console.log("handleResult ", numero, active, values.filter((f) => f.name === active)[0]?.value);

      if (value === "Enviar") {
        if (numero * active === parseInt(values.filter((f) => f.name === active)[0]?.value)) {
          //CORRECTO
          dispatch(updateResume({ table: tabla, operation: numero + "x" + active, state: "Bien", time: segundos }));
          console.log(tabla + " " + numero + "x" + active, "Bien");
          if (active < 10) setActive(active + 1);
          else {
            console.log("showFloatPanel.........");
            showFloatPanel();
          }
        } else {
          //ERROR
          console.log(tabla + " " + numero + "x" + active, "Mal");
          dispatch(updateResume({ table: tabla, operation: numero + "x" + active, state: "Mal", time: segundos }));
          setError(true);
          setTimeout(() => {
            setError(false);
          }, 2000);
          updateValues((prevValues) => {
            // Buscar si ya existe un objeto con el name igual a active
            const updatedValues = prevValues.map((item) => (item.name === active ? { ...item, value: "" } : item));
            return updatedValues;
          });
        }
        dispatch(updateOperationTimer(0));
      } else if (value === "Borrar") {
        updateValues((prevValues) => {
          // Buscar si ya existe un objeto con el name igual a active
          const updatedValues = prevValues.map((item) => (item.name === active ? { ...item, value: "" } : item));
          return updatedValues;
        });
      } else {
        updateValues((prevValues) => {
          // Buscar si ya existe un objeto con el name igual a active
          const updatedValues = prevValues.map((item) => (item.name === active ? { ...item, value: item.value + "" + value } : item));

          // Verificar si el objeto ya existía
          const exists = updatedValues.some((item) => item.name === active);

          // Si existe, retornar los valores actualizados; si no, agregar uno nuevo
          return exists ? updatedValues : [...updatedValues, { tableNumber: numero, name: active, value }];
        });
      }
    };

    return (
      <div className="wooden-table">
        <MenuKeyboard callback={handleResult} />
      </div>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const Alert = ({ type, message }) => {
    return <div className="fun-div">{message}</div>;
  };

  Alert.propTypes = {
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  };

  const StatsV2 = () => {
    const nivel = useSelector((state) => state.aplicationConfig.userConfig.nivel);
    const puntos = useSelector((state) => state.aplicationConfig.userConfig.puntos);
    const rango = useSelector((state) => state.aplicationConfig.userConfig.rango);
    const rate = useSelector((state) => state.aplicationConfig.userConfig.rate);
    const width = puntos > 100 ? puntos - nivel * 100 : puntos;
    console.log("STATS => ", width, puntos, nivel, rate);
    return (
      <div className="statsv2">
        <div className="level">
          <div className="level-number">{nivel}</div>
          <div className="level-range">
            <div>{rangos[rango]}</div>
            <div className="points">
              <div className="points-fill" style={{ width: `${width}%` }}>
                {" "}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleHistorial = () => {
    updateShowHistorial(!showHistorial);
  };

  const Menu = () => {
    return (
      <>
        <div className="tablasHeader">
          <StatsV2 />
          <div className="historial">
            <div className="link" onClick={handleHistorial}>
              Historial
            </div>
          </div>
        </div>
        <div className="wooden-table-options">
          <MenuTablas callbackButton={reset} />
        </div>
      </>
    );
  };

  const FloatPanel = () => {
    const multiplicador = parseInt(tabla.split("-")[2]) * 2.5 * 17;
    const base = 5; // base mínima de puntos ganados
    const scaled = Math.floor(Math.sqrt(multiplicador) * base); // progresión suave
    //const puntosObtenidos = puntos + scaled;

    const updateStats = () => {
      //const nivelObtenido = Math.floor(puntosObtenidos / rate); // cada rate puntos = 1 nivel
      //const rangoObtenido = Math.floor(nivelObtenido / 3); // cada 3 niveles = 1 rango
      //updateRango(rangoObtenido);
      //updateNivel(nivelObtenido);
      //updatePuntos(puntosObtenidos);
      dispatch(updateStatus(scaled));
      reset();
    };
    return (
      <div className="float-panel">
        <>
          <h3>¡Felicidades! Has pasado la prueba.</h3>
          <h2>Has obtenido {parseInt(scaled)} puntos.</h2>
          <RandomTip />
          <h3>Elige una tabla de multiplicar para continuar.</h3>
          <MenuTablas callbackButton={updateStats} />
        </>
      </div>
    );
  };

  const HistorialPanel = () => {
    const resume = useSelector((state) => state.aplicationConfig.userConfig.resume);
    console.log("HistorialPanel", resume);
    return (
      <div className={`float-panel ${showHistorial ? "show" : "hide"}`}>
        <div className="historialPanel">
          <div className="link" onClick={handleHistorial} style={{ fontWeight: "bold", textAlign: "center", padding: "5px" }}>
            Cerrar
          </div>
          <div className="historialData">
            {[...resume].reverse().map((row, index) => (
              <div className="historialRow" key={index}>
                <div className="historialRowOp">{row.operation}</div> <div style={{ color: row.state === "Mal" && "#ffe736" }}>{row.state}</div>{" "}
                <div>{row.time}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="wall">
        <Menu />
        <FloatPanel />
        <HistorialPanel />
        <h4>Aprende la {tabla.replaceAll("-", " ")}</h4>
        <div className="pizarra">
          <EnOrden />
        </div>

        {error && <Alert type="error" message="¡Incorrecta!" />}
      </div>
      <WoodenTable />
      <Temporizador />
    </>
  );
};

export async function getServerSideProps(context) {
  const { tabla } = context.params; // Obtiene el parámetro dinámico
  return {
    props: { tabla }, // Pasa el parámetro como prop
  };
}
Tabla.propTypes = {
  tabla: PropTypes.string.isRequired,
};

export default Tabla;
