import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { AuthGate } from "../auth/auth-gate";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    <AuthGate>{children}</AuthGate>
  </Provider>
);
