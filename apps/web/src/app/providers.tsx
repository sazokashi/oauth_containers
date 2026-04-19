import type { ReactNode } from "react";
import { AuthProvider } from "../auth/auth-context";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);
