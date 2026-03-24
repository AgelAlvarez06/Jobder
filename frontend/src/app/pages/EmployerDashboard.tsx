import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Users, Briefcase, TrendingUp, Star, MapPin, DollarSign, Eye, Heart, MessageCircle, Sparkles, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface Vacancy {
  id: number;
  position: string;
  status: "active" | "paused" | "closed";
  applicants: number;
  matches: number;
  views: number;
  posted: string;
}

interface Candidate {
  id: number;
  name: string;
  photo: string;
  degree: string;
  university: string;
  skills: string[];
  matchScore: number;
  location: string;
  availability: string;
}

export default function EmployerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { label: "Vacantes Activas", value: "8", icon: Briefcase, color: "text-[#003366]", bg: "bg-[#003366]/10" },
    { label: "Candidatos Totales", value: "247", icon: Users, color: "text-[#28a745]", bg: "bg-[#28a745]/10" },
    { label: "Matches Nuevos", value: "34", icon: Heart, color: "text-[#fd7e14]", bg: "bg-[#fd7e14]/10" },
    { label: "Tasa de Conversión", value: "68%", icon: TrendingUp, color: "text-[#003366]", bg: "bg-[#003366]/10" }
  ];

  const vacancies: Vacancy[] = [
    {
      id: 1,
      position: "Desarrollador Frontend Junior",
      status: "active",
      applicants: 45,
      matches: 12,
      views: 234,
      posted: "Hace 3 días"
    },
    {
      id: 2,
      position: "Diseñador UX/UI",
      status: "active",
      applicants: 38,
      matches: 9,
      views: 189,
      posted: "Hace 5 días"
    },
    {
      id: 3,
      position: "Analista de Datos",
      status: "active",
      applicants: 52,
      matches: 15,
      views: 312,
      posted: "Hace 1 semana"
    },
    {
      id: 4,
      position: "Marketing Digital Specialist",
      status: "paused",
      applicants: 29,
      matches: 7,
      views: 156,
      posted: "Hace 2 semanas"
    }
  ];

  const topCandidates: Candidate[] = [
    {
      id: 1,
      name: "María González Pérez",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      degree: "Ingeniería en Computación",
      university: "UdeG",
      skills: ["React", "TypeScript", "Node.js", "MongoDB"],
      matchScore: 95,
      location: "Zapopan, Jalisco",
      availability: "Inmediata"
    },
    {
      id: 2,
      name: "Carlos Ramírez López",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      degree: "Diseño Gráfico",
      university: "UdeG",
      skills: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
      matchScore: 92,
      location: "Guadalajara, Jalisco",
      availability: "En 2 semanas"
    },
    {
      id: 3,
      name: "Ana Martínez Silva",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      degree: "Marketing Digital",
      university: "UdeG",
      skills: ["SEO", "Google Ads", "Analytics", "Social Media"],
      matchScore: 90,
      location: "Tlaquepaque, Jalisco",
      availability: "Inmediata"
    },
    {
      id: 4,
      name: "Luis Hernández Torres",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      degree: "Ciencia de Datos",
      university: "UdeG",
      skills: ["Python", "SQL", "Machine Learning", "Tableau"],
      matchScore: 88,
      location: "Zapopan, Jalisco",
      availability: "En 1 mes"
    },
    {
      id: 5,
      name: "Sofia Rodrguez Gómez",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      degree: "Administración de Empresas",
      university: "UdeG",
      skills: ["Excel", "SAP", "Project Management", "CRM"],
      matchScore: 87,
      location: "Guadalajara, Jalisco",
      availability: "Inmediata"
    },
    {
      id: 6,
      name: "Diego Morales Castro",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      degree: "Ingeniería Industrial",
      university: "UdeG",
      skills: ["Lean", "Six Sigma", "AutoCAD", "Supply Chain"],
      matchScore: 85,
      location: "Zapopan, Jalisco",
      availability: "En 2 semanas"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-[#28a745] text-white",
      paused: "bg-[#fd7e14] text-white",
      closed: "bg-gray-400 text-white"
    };
    const labels = {
      active: "Activa",
      paused: "Pausada",
      closed: "Cerrada"
    };
    return (
      <Badge className={`rounded-full ${variants[status as keyof typeof variants]}`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#003366]">JOBDER</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/employer/create-job">
                <Button className="rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Vacante
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#003366] mb-2">Panel de Empleador</h1>
          <p className="text-xl text-gray-600">Gestiona tus vacantes y descubre talento</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="rounded-3xl border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#003366]">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="bg-white border-2 rounded-2xl p-1">
            <TabsTrigger value="candidates" className="rounded-xl data-[state=active]:bg-[#003366] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Candidatos
            </TabsTrigger>
            <TabsTrigger value="vacancies" className="rounded-xl data-[state=active]:bg-[#003366] data-[state=active]:text-white">
              <Briefcase className="w-4 h-4 mr-2" />
              Mis Vacantes
            </TabsTrigger>
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            {/* Search Bar */}
            <Card className="rounded-3xl border-2">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar candidatos por habilidad, carrera o nombre..."
                    className="pl-12 h-14 rounded-2xl bg-gray-50 border-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Candidates - F-Pattern Layout */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#003366]">Candidatos Recomendados</h2>
                  <p className="text-gray-600">Ordenados por compatibilidad con tus vacantes</p>
                </div>
                <Button variant="outline" className="rounded-full border-2 border-[#003366] text-[#003366]">
                  Ver Todos
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topCandidates.map((candidate) => (
                  <Card key={candidate.id} className="rounded-3xl border-2 hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-6 space-y-4">
                      {/* Match Score Badge */}
                      <div className="flex items-start justify-between">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                          <User className="w-10 h-10 text-white" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-[#28a745] text-white text-sm font-semibold">
                          {candidate.matchScore}% Match
                        </div>
                      </div>

                      {/* Candidate Info */}
                      <div>
                        <h3 className="font-semibold text-lg text-[#003366] mb-1">{candidate.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{candidate.degree}</p>
                        <div className="flex items-center gap-1 text-xs text-[#28a745]">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{candidate.university}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} className="rounded-full bg-[#003366]/10 text-[#003366] text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge className="rounded-full bg-gray-100 text-gray-600 text-xs">
                            +{candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Location & Availability */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Disponibilidad: {candidate.availability}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-full border-2">
                          Ver Perfil
                        </Button>
                        <Link to={`/chat/${candidate.id}`} className="flex-1">
                          <Button size="sm" className="w-full rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Contactar
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Vacancies Tab */}
          <TabsContent value="vacancies" className="space-y-6">
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-[#003366]">Gestión de Vacantes</CardTitle>
                  <Link to="/employer/create-job">
                    <Button className="rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Vacante
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {vacancies.map((vacancy) => (
                  <Card key={vacancy.id} className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-[#003366] mb-2">{vacancy.position}</h3>
                          <p className="text-sm text-gray-500">{vacancy.posted}</p>
                        </div>
                        {getStatusBadge(vacancy.status)}
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#003366]">{vacancy.applicants}</div>
                          <div className="text-sm text-gray-600">Aplicantes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#28a745]">{vacancy.matches}</div>
                          <div className="text-sm text-gray-600">Matches</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#fd7e14]">{vacancy.views}</div>
                          <div className="text-sm text-gray-600">Vistas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#003366]">{Math.round((vacancy.matches / vacancy.applicants) * 100)}%</div>
                          <div className="text-sm text-gray-600">Conversión</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/employer/vacancy/${vacancy.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full rounded-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </Link>
                        <Link to={`/employer/vacancy/${vacancy.id}/candidates`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full rounded-full">
                            <Users className="w-4 h-4 mr-2" />
                            Ver Candidatos
                          </Button>
                        </Link>
                        <Link to={`/employer/vacancy/${vacancy.id}/edit`}>
                          <Button size="sm" className="rounded-full bg-[#003366] hover:bg-[#003366]/90 text-white">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}