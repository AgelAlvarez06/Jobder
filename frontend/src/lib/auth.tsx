/**
 * Lightweight client-side auth: JWT stored in localStorage, role mirrored
 * for instant route-guard decisions without a roundtrip.
 *
 * The provider verifies any persisted token against /auth/me on mount; if
 * verification fails we clear the session so the user lands on /login.
 */
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
  } from "react";
  import { Navigate, useLocation } from "react-router";
  import {
    ROL_STORAGE_KEY,
    TOKEN_STORAGE_KEY,
    auth as authApi,
    type Rol,
  } from "./api";
  
  interface AuthState {
    token: string | null;
    rol: Rol | null;
    loading: boolean;
    setSession: (token: string, rol: string) => Promise<void> | void;
    logout: () => void;
  }
  
  const AuthContext = createContext<AuthState | null>(null);
  
  function readStored(): { token: string | null; rol: Rol | null } {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const rolRaw = localStorage.getItem(ROL_STORAGE_KEY);
      const rol: Rol | null = rolRaw === "candidato" || rolRaw === "reclutador" ? rolRaw : null;
      return { token, rol };
    } catch {
      return { token: null, rol: null };
    }
  }
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const initial = readStored();
    const [token, setToken] = useState<string | null>(initial.token);
    const [rol, setRol] = useState<Rol | null>(initial.rol);
    const [loading, setLoading] = useState<boolean>(!!initial.token);
  
    // Validate persisted token on mount.
    useEffect(() => {
      if (!token) {
        setLoading(false);
        return;
      }
      let cancelled = false;
      (async () => {
        try {
          const me = await authApi.me();
          if (!cancelled) {
            setRol(me.rol);
            try {
              localStorage.setItem(ROL_STORAGE_KEY, me.rol);
            } catch {
              /* noop */
            }
          }
        } catch {
          if (!cancelled) {
            setToken(null);
            setRol(null);
            try {
              localStorage.removeItem(TOKEN_STORAGE_KEY);
              localStorage.removeItem(ROL_STORAGE_KEY);
            } catch {
              /* noop */
            }
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const value = useMemo<AuthState>(
      () => ({
        token,
        rol,
        loading,
        setSession: (t, r) => {
          const safeRol: Rol = r === "reclutador" ? "reclutador" : "candidato";
          try {
            localStorage.setItem(TOKEN_STORAGE_KEY, t);
            localStorage.setItem(ROL_STORAGE_KEY, safeRol);
          } catch {
            /* noop */
          }
          setToken(t);
          setRol(safeRol);
          setLoading(false);
        },
        logout: () => {
          try {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(ROL_STORAGE_KEY);
          } catch {
            /* noop */
          }
          setToken(null);
          setRol(null);
        },
      }),
      [token, rol, loading]
    );
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }
  
  export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
  }
  
  interface RequireAuthProps {
    children: ReactNode;
    role?: Rol;
  }
  
  export function RequireAuth({ children, role }: RequireAuthProps) {
    const { token, rol, loading } = useAuth();
    const location = useLocation();
  
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-[#003366]">
          Cargando…
        </div>
      );
    }
    if (!token) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    if (role && rol && rol !== role) {
      return <Navigate to={rol === "reclutador" ? "/employer" : "/student"} replace />;
    }
    return <>{children}</>;
  }
  