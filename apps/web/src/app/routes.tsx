import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./guards";
import { ErrorBoundary } from "./error-boundary";

const LoginPage = lazy(() => import("../pages/login/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/register/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import("../pages/verify-email/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import("../pages/forgot-password/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../pages/reset-password/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const AppLayout = lazy(() => import("../components/layout/AppLayout").then((m) => ({ default: m.AppLayout })));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const UsersPage = lazy(() => import("../pages/users/UsersPage").then((m) => ({ default: m.UsersPage })));

const SuspenseShell = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<div className="shell"><div className="panel status-panel">Loading...</div></div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const AppRoutes = () => (
  <SuspenseShell>
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/verify-email" element={<PublicOnlyRoute><VerifyEmailPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  </SuspenseShell>
);
