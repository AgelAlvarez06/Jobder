import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, ArrowLeft, Sparkles, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle authentication
    console.log("Form submitted:", formData);
    
    // Navigate based on user type
    if (formData.userType === "student") {
      navigate("/student");
    } else {
      navigate("/employer");
    }
  };

  const handleGoogleLogin = () => {
    // Here you would typically integrate with Google OAuth
    console.log("Google login clicked");
    
    // For demo purposes, navigate based on user type
    if (formData.userType === "student") {
      navigate("/student");
    } else {
      navigate("/employer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#28a745] flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#fd7e14]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#28a745]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-4 text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        {/* Main Card */}
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
            {/* User Type Selection */}
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

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 hover:bg-gray-50"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLogin ? "Continuar con Google" : "Registrarse con Google"}
            </Button>

            <div className="relative">
              <Separator className="my-6" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
                O {isLogin ? "ingresa" : "regístrate"} con email
              </span>
            </div>

            {/* Login/Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#003366]">
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez"
                      className="h-12 pl-12 rounded-2xl"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

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
                  <button
                    type="button"
                    className="text-sm text-[#003366] hover:text-[#28a745] font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white font-semibold shadow-lg"
              >
                {isLogin ? "Iniciar sesión" : "Crear cuenta"}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
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

            {/* Terms for Signup */}
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