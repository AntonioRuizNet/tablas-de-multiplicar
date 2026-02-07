import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

import userConfigSlice from "./reducers/userConfigSlice";
import achievementsReducer from "./reducers/achievementsSlice";

const rootReducer = combineReducers({
  aplicationConfig: userConfigSlice,
  achievements: achievementsReducer,
});

const persistConfig = {
  key: "tdm",
  version: 1,
  storage,
  whitelist: ["aplicationConfig", "achievements"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist usa acciones internas no serializables
    }),
});

export const persistor = persistStore(store);
