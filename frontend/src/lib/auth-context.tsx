import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { auth as authApi, type UsuarioOut, type TokenResponse, ApiError } from "./api";

interface AuthState {
  token: string | null;
  userId: number | null;
  rol: string | null;
  user: UsuarioOut | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<TokenResponse>;
  register: (email: string, password: string, rol: string) => Promise<TokenResponse>;
  logout: () => void;
  setSession: (res: TokenResponse) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem("token"),
    userId: localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null,
    rol: localStorage.getItem("rol"),
    user: null,
    loading: !!localStorage.getItem("token"),
  });

  const setSession = useCallback((res: TokenResponse) => {
    localStorage.setItem("token", res.access_token);
    localStorage.setItem("userId", String(res.user_id));
    localStorage.setItem("rol", res.rol);
    setState((s) => ({
      ...s,
      token: res.access_token,
      userId: res.user_id,
      rol: res.rol,
      loading: false,
    }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("rol");
    setState({ token: null, userId: null, rol: null, user: null, loading: false });
  }, []);

  useEffect(() => {
    if (!state.token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    authApi
      .me()
      .then((user) => setState((s) => ({ ...s, user, loading: false })))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      });
  }, [state.token, logout]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setSession(res);
    return res;
  };

  const register = async (email: string, password: string, rol: string) => {
    const res = await authApi.register(email, password, rol);
    setSession(res);
    return res;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
