import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { accountApi, sessionApi, type SessionUser } from "../api";
import { bootstrapSession } from "./auth-session";

export interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<{ message?: string; previewUrl?: string; token?: string }>;
  socialSignIn: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthContextProvider = ({
  value,
  children
}: {
  value: AuthContextValue;
  children: ReactNode;
}) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void bootstrapSession()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const reloadUser = async () => {
    const result = await sessionApi.me();
    setUser(result.user);
  };

  const login = async (email: string, password: string) => {
    await sessionApi.login(email, password);
    await reloadUser();
  };

  const logout = async () => {
    await sessionApi.logout();
    setUser(null);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const result = await accountApi.register(email, password, displayName);
    return {
      message: result.message,
      previewUrl: result.preview?.previewUrl,
      token: result.preview?.token
    };
  };

  const socialSignIn = async (email: string) => {
    await sessionApi.socialSignIn(email);
    await reloadUser();
  };

  const refresh = async () => {
    await sessionApi.refresh();
    await reloadUser();
  };

  return (
    <AuthContextProvider value={{ user, loading, login, register, socialSignIn, refresh, logout, reloadUser }}>
      {children}
    </AuthContextProvider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return value;
};
