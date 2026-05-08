import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const rol = params.get("rol") || "candidato";
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    (async () => {
      await setSession(token, rol);
      navigate(rol === "reclutador" ? "/employer" : "/student", { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-[#003366]">
      Iniciando sesión…
    </div>
  );
}