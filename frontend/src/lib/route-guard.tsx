import { Navigate } from "react-router";
import { useAuth } from "./auth-context";
import type { ReactNode } from "react";

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: string;
}

export function RequireAuth({ children, requiredRole }: RouteGuardProps) {
  const { token, rol, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#28a745] animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && rol !== requiredRole) {
    const redirect = rol === "reclutador" ? "/employer" : "/student";
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
