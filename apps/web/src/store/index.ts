import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer, logoutUser } from "./auth-slice";

const appReducer = combineReducers({
  auth: authReducer
});

// On logout, reset the entire store to prevent stale data
// from leaking between sessions (security requirement).
const rootReducer: typeof appReducer = (state, action) => {
  if (logoutUser.fulfilled.match(action)) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE !== "production"
});

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
