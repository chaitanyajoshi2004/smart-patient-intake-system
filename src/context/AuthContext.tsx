import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../services/authApi";
import type { AuthUser, LoginPayload } from "../types/api";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser() {
  const raw = localStorage.getItem("spi_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("spi_token"));
  const [user, setUser] = useState<AuthUser | null>(() => readUser());

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    async login(payload) {
      const response = await authApi.login(payload);
      localStorage.setItem("spi_token", response.access_token);
      localStorage.setItem("spi_user", JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
      toast.success(`Welcome, ${response.user.full_name}`);
    },
    logout() {
      localStorage.removeItem("spi_token");
      localStorage.removeItem("spi_user");
      setToken(null);
      setUser(null);
      toast.success("Signed out");
    },
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
