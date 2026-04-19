import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const LoadingScreen = () => (
  <div className="shell">
    <div className="panel status-panel">Loading session...</div>
  </div>
);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { status, user } = useAppSelector((state) => state.auth);

  if (status === "idle" || status === "loading") {
    return <LoadingScreen />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { status, user } = useAppSelector((state) => state.auth);

  if (status === "idle" || status === "loading") {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/app/dashboard" replace /> : <>{children}</>;
};
