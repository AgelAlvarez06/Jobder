import { Link } from "react-router";
import { Search, Briefcase, Users, TrendingUp, Sparkles, MapPin, DollarSign, Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { useState } from "react";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [area, setArea] = useState("");
  const [industry, setIndustry] = useState("");

  const stats = [
    { number: "5,000+", label: "Estudiantes Activos", icon: Users },
    { number: "850+", label: "Empresas Asociadas", icon: Building2 },
    { number: "92%", label: "Tasa de Match", icon: TrendingUp },
    { number: "3.2 sem", label: "Tiempo Promedio", icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#003366] to-[#28a745] bg-clip-text text-transparent">
                  JOBDER
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/student" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full">
                  Para Egresados
                </Button>
              </Link>
              <Link to="/employer" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full">
                  Para Empresas
                </Button>
              </Link>
              <Link to="/profile-setup">
                <Button className="rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white text-sm sm:text-base px-4 sm:px-6">
                  Comenzar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-[#003366] via-[#003366] to-[#28a745] bg-clip-text text-transparent">
                  Tu Próximo Empleo
                </span>
                <br />
                <span className="text-[#003366]">
                  Te Está Esperando
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Conectamos talento con las mejores oportunidades en el área ZMG. 
                Match inteligente, proceso simple, resultados rápidos.
              </p>

              {/* Search Bar with Filters */}
              <Card className="rounded-3xl shadow-xl border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Buscar por puesto, empresa o palabra clave..."
                        className="pl-12 h-14 rounded-2xl bg-gray-50 border-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <Select value={area} onValueChange={setArea}>
                        <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-0">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <SelectValue placeholder="Zona ZMG" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zapopan">Zapopan</SelectItem>
                          <SelectItem value="gdl">Guadalajara Centro</SelectItem>
                          <SelectItem value="tlaquepaque">Tlaquepaque</SelectItem>
                          <SelectItem value="tonala">Tonalá</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-0">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <SelectValue placeholder="Industria" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Tecnología</SelectItem>
                          <SelectItem value="finance">Finanzas</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="design">Diseño</SelectItem>
                          <SelectItem value="sales">Ventas</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button className="h-12 rounded-2xl bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white">
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-6">
                <Link to="/profile-setup">
                  <Button size="lg" className="h-14 px-8 rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white shadow-lg shadow-[#fd7e14]/30">
                    Crear Mi Perfil
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white">
                    Iniciar sesion
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/10 via-[#28a745]/10 to-[#fd7e14]/10 rounded-3xl blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="UdeG Students"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#003366] to-[#28a745]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-10 h-10 text-white/80 mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#003366]">Match Inteligente</h3>
              <p className="text-gray-600">
                Nuestro algoritmo conecta tu perfil con vacantes que realmente se ajustan a ti
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#28a745] to-[#fd7e14] flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#003366]">Optimizacion con IA</h3>
              <p className="text-gray-600">
                Nuestro sistema analiza tu CV para resaltar tus habilidades clave y potenciar tu perfil ante las empresas
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#fd7e14] to-[#003366] flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#003366]">Chat Directo</h3>
              <p className="text-gray-600">
                Comunícate directamente con reclutadores con sugerencias de IA para romper el hielo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="rounded-3xl bg-gradient-to-br from-[#003366] to-[#28a745] border-0 shadow-2xl">
            <CardContent className="p-12 space-y-6">
              <h2 className="text-4xl font-bold text-white">
                ¿Listo para Encontrar tu Match Perfecto?
              </h2>
              <p className="text-xl text-white/90">
                Únete a miles de estudiantes que ya están construyendo su futuro profesional
              </p>
              <Link to="/profile-setup">
                <Button size="lg" className="h-14 px-12 rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white shadow-xl">
                  Comenzar Gratis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>© 2026 Jobder. Plataforma exclusiva para estudiantes y graduados.</p>
        </div>
      </footer>
    </div>
  );
}