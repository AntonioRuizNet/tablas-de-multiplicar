import { configureStore, combineReducers } from "@reduxjs/toolkit";

import userConfigSlice from "./reducers/userConfigSlice";

const rootReducer = combineReducers({
  aplicationConfig: userConfigSlice,
});

export const store = configureStore({
  reducer: rootReducer,
});
