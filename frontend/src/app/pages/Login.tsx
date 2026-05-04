import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, ArrowLeft, Sparkles, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "../../lib/auth-context";
import { ApiError } from "../../lib/api";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    rememberMe: false,
    userType: "student" as "student" | "employer"
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const rol = formData.userType === "student" ? "candidato" : "reclutador";

      if (isLogin) {
        const res = await login(formData.email, formData.password);
        if (res.rol === "candidato") {
          navigate("/student");
        } else {
          navigate("/employer");
        }
      } else {
        const res = await register(formData.email, formData.password, rol);
        navigate("/profile-setup");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Error de conexión");
      }
    } finally {
      setLoading(false);
    }
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
              {isLogin ? "¡Bienvenido de nuevo!" : "Crear cuenta"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? "Ingresa a tu cuenta para continuar"
                : "Únete a la plataforma de empleo de UdeG"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[#003366] font-semibold">Tipo de cuenta</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("userType", "student")}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    formData.userType === "student"
                      ? "border-[#003366] bg-[#003366]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${
                    formData.userType === "student" ? "text-[#003366]" : "text-gray-400"
                  }`} />
                  <div className={`text-sm font-semibold ${
                    formData.userType === "student" ? "text-[#003366]" : "text-gray-600"
                  }`}>
                    Estudiante
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange("userType", "employer")}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    formData.userType === "employer"
                      ? "border-[#003366] bg-[#003366]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Sparkles className={`w-6 h-6 mx-auto mb-2 ${
                    formData.userType === "employer" ? "text-[#003366]" : "text-gray-400"
                  }`} />
                  <div className={`text-sm font-semibold ${
                    formData.userType === "employer" ? "text-[#003366]" : "text-gray-600"
                  }`}>
                    Empleador
                  </div>
                </button>
              </div>
            </div>

            <div className="relative">
              <Separator className="my-6" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
                {isLogin ? "Ingresa con email" : "Regístrate con email"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#003366]">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="h-12 pl-12 rounded-2xl"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#003366]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pl-12 rounded-2xl"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#003366]">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 pl-12 rounded-2xl"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Recordarme
                    </label>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white font-semibold shadow-lg"
              >
                {loading ? "Cargando..." : isLogin ? "Iniciar sesión" : "Crear cuenta"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600"
              >
                {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <span className="text-[#003366] hover:text-[#28a745] font-semibold">
                  {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                </span>
              </button>
            </div>

            {!isLogin && (
              <p className="text-xs text-center text-gray-500 px-4">
                Al registrarte, aceptas nuestros{" "}
                <a href="#" className="text-[#003366] hover:underline">
                  Términos de Servicio
                </a>{" "}
                y{" "}
                <a href="#" className="text-[#003366] hover:underline">
                  Política de Privacidad
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
