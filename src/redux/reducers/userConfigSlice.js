import { createSlice } from "@reduxjs/toolkit";

const defaultUserConfig = {
  componentActive: null,
  resume: [],
  operationTimer: 0,
  nivel: 0,
  puntos: 0,
  rango: 0,
  rate: 1,
};

const initialState = { userConfig: { ...defaultUserConfig } };

const userConfigSlice = createSlice({
  name: "aplicationConfig",
  initialState,
  reducers: {
    setComponentActive: (state, action) => { state.userConfig.componentActive = action.payload; },
    updateResume: (state, action) => { state.userConfig.resume = [...state.userConfig.resume, action.payload]; },
    updateOperationTimer: (state, action) => { state.userConfig.operationTimer = action.payload; },
    runningOperationTimer: (state) => { state.userConfig.operationTimer += 1; },
    updateStatus: (state, action) => {
      const scaled = action.payload;
      const nuevosPuntos = (state.userConfig.puntos + scaled) * state.userConfig.rate;
      const puntosFinales = Math.floor(nuevosPuntos);
      const nivel = Math.floor(puntosFinales / 100) || 0;
      state.userConfig.puntos = puntosFinales;
      state.userConfig.nivel = nivel;
      state.userConfig.rango = Math.floor(nivel / 2);
    },
    hydrateUserConfig: (state, action) => {
      state.userConfig = { ...defaultUserConfig, ...(action.payload || {}), operationTimer: 0 };
    },
    resetUserConfig: (state) => { state.userConfig = { ...defaultUserConfig }; },
  },
});

export const { setComponentActive, updateResume, updateOperationTimer, runningOperationTimer, updateStatus, hydrateUserConfig, resetUserConfig } = userConfigSlice.actions;
export default userConfigSlice.reducer;
