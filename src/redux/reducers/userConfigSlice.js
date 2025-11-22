import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userConfig: {
    componentActive: null,
    resume: [],
    operationTimer: 0,
    nivel: 0,
    puntos: 0,
    rango: 0,
    rate: 1,
  },
};

const userConfigSlice = createSlice({
  name: "aplicationConfig",
  initialState,
  reducers: {
    setComponentActive: (state, action) => {
      state.userConfig.componentActive = action.payload;
    },
    updateResume: (state, action) => {
      state.userConfig.resume = [...state.userConfig.resume, action.payload];
    },
    updateOperationTimer: (state, action) => {
      state.userConfig.operationTimer = action.payload;
    },
    runningOperationTimer: (state) => {
      state.userConfig.operationTimer = state.userConfig.operationTimer + 1;
    },
    updateStatus: (state, action) => {
      const scaled = action.payload;

      // Calcula nuevos puntos escalados antes de redondear
      const nuevosPuntos = (state.userConfig.puntos + scaled) * state.userConfig.rate;

      // Redondear los puntos finales (si quieres enteros)
      const puntosFinales = Math.floor(nuevosPuntos);

      // Cada 100 puntos → sube 1 nivel
      const nivel = Math.floor(puntosFinales / 100) || 0;

      // Asignar al estado
      state.userConfig.puntos = puntosFinales;
      state.userConfig.nivel = nivel;
      state.userConfig.rango = Math.floor(nivel / 2);
    },
  },
});

export const { setComponentActive, updateResume, updateOperationTimer, runningOperationTimer, updateStatus } = userConfigSlice.actions;
export default userConfigSlice.reducer;
