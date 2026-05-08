import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Sparkles, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { auth } from "../../lib/api";

export default function Login() {
  const [userType, setUserType] = useState<"candidato" | "reclutador">("candidato");

  const handleGoogleLogin = () => {
    window.location.href = auth.loginUrl(userType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#28a745] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#fd7e14]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#28a745]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/">
          <Button variant="ghost" className="mb-4 text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        <Card className="rounded-3xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <Link to="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </Link>
            <CardTitle className="text-3xl font-bold text-[#003366]">
              ¡Bienvenido a Jobder!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Ingresa con tu cuenta de Google para continuar
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[#003366] font-semibold">Tipo de cuenta</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("candidato")}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    userType === "candidato"
                      ? "border-[#003366] bg-[#003366]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${
                    userType === "candidato" ? "text-[#003366]" : "text-gray-400"
                  }`} />
                  <div className={`text-sm font-semibold ${
                    userType === "candidato" ? "text-[#003366]" : "text-gray-600"
                  }`}>
                    Estudiante
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("reclutador")}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    userType === "reclutador"
                      ? "border-[#003366] bg-[#003366]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Sparkles className={`w-6 h-6 mx-auto mb-2 ${
                    userType === "reclutador" ? "text-[#003366]" : "text-gray-400"
                  }`} />
                  <div className={`text-sm font-semibold ${
                    userType === "reclutador" ? "text-[#003366]" : "text-gray-600"
                  }`}>
                    Empleador
                  </div>
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 hover:bg-gray-50"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </Button>

            <p className="text-xs text-center text-gray-500 px-4">
              Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
