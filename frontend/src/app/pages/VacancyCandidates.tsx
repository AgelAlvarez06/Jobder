import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Search, Filter, Star, MapPin, Briefcase, GraduationCap, MessageCircle, UserCheck, UserX, Download, SlidersHorizontal, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

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
  status: "new" | "reviewed" | "contacted" | "interviewing" | "rejected";
  appliedDate: string;
  email: string;
  phone: string;
  experience: string;
}

export default function VacancyCandidates() {
  const { vacancyId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data
  const vacancy = {
    id: vacancyId,
    position: "Desarrollador Frontend Junior",
    company: "TechCorp Guadalajara"
  };

  const candidates: Candidate[] = [
    {
      id: 1,
      name: "María González Pérez",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      degree: "Ingeniería en Computación",
      university: "UdeG",
      skills: ["React", "TypeScript", "Node.js", "MongoDB", "Git"],
      matchScore: 95,
      location: "Zapopan, Jalisco",
      availability: "Inmediata",
      status: "new",
      appliedDate: "Hace 2 horas",
      email: "maria.gonzalez@example.com",
      phone: "+52 33 1234 5678",
      experience: "1 año"
    },
    {
      id: 2,
      name: "Carlos Ramírez López",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      degree: "Ingeniería en Sistemas",
      university: "UdeG",
      skills: ["React", "JavaScript", "HTML/CSS", "Redux", "Webpack"],
      matchScore: 92,
      location: "Guadalajara, Jalisco",
      availability: "En 2 semanas",
      status: "reviewed",
      appliedDate: "Hace 5 horas",
      email: "carlos.ramirez@example.com",
      phone: "+52 33 2345 6789",
      experience: "2 años"
    },
    {
      id: 3,
      name: "Ana Martínez Silva",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      degree: "Ingeniería en Computación",
      university: "UdeG",
      skills: ["React", "Vue.js", "CSS", "JavaScript", "Figma"],
      matchScore: 90,
      location: "Tlaquepaque, Jalisco",
      availability: "Inmediata",
      status: "contacted",
      appliedDate: "Hace 1 día",
      email: "ana.martinez@example.com",
      phone: "+52 33 3456 7890",
      experience: "1.5 años"
    },
    {
      id: 4,
      name: "Luis Hernández Torres",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      degree: "Desarrollo de Software",
      university: "UdeG",
      skills: ["React", "TypeScript", "GraphQL", "Testing"],
      matchScore: 88,
      location: "Zapopan, Jalisco",
      availability: "En 1 mes",
      status: "interviewing",
      appliedDate: "Hace 2 días",
      email: "luis.hernandez@example.com",
      phone: "+52 33 4567 8901",
      experience: "1 año"
    },
    {
      id: 5,
      name: "Sofia Rodríguez Gómez",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      degree: "Ingeniería en Computación",
      university: "UdeG",
      skills: ["React", "Angular", "JavaScript", "Bootstrap"],
      matchScore: 87,
      location: "Guadalajara, Jalisco",
      availability: "Inmediata",
      status: "new",
      appliedDate: "Hace 3 días",
      email: "sofia.rodriguez@example.com",
      phone: "+52 33 5678 9012",
      experience: "6 meses"
    },
    {
      id: 6,
      name: "Diego Morales Castro",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      degree: "Informática",
      university: "UdeG",
      skills: ["HTML", "CSS", "JavaScript", "React", "Tailwind"],
      matchScore: 85,
      location: "Zapopan, Jalisco",
      availability: "En 2 semanas",
      status: "reviewed",
      appliedDate: "Hace 4 días",
      email: "diego.morales@example.com",
      phone: "+52 33 6789 0123",
      experience: "8 meses"
    },
    {
      id: 7,
      name: "Valeria Sánchez Ruiz",
      photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
      degree: "Ingeniería en Software",
      university: "UdeG",
      skills: ["React", "Next.js", "TypeScript", "Sass"],
      matchScore: 83,
      location: "Guadalajara, Jalisco",
      availability: "Inmediata",
      status: "rejected",
      appliedDate: "Hace 5 días",
      email: "valeria.sanchez@example.com",
      phone: "+52 33 7890 1234",
      experience: "3 meses"
    },
    {
      id: 8,
      name: "Roberto Flores Mendoza",
      photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop",
      degree: "Ingeniería en Computación",
      university: "UdeG",
      skills: ["React", "Material-UI", "Redux", "Firebase"],
      matchScore: 82,
      location: "Tlaquepaque, Jalisco",
      availability: "En 1 mes",
      status: "new",
      appliedDate: "Hace 1 semana",
      email: "roberto.flores@example.com",
      phone: "+52 33 8901 2345",
      experience: "1 año"
    }
  ];

  const getStatusConfig = (status: string) => {
    const configs = {
      new: { label: "Nuevo", color: "bg-[#fd7e14] text-white" },
      reviewed: { label: "Revisado", color: "bg-blue-500 text-white" },
      contacted: { label: "Contactado", color: "bg-purple-500 text-white" },
      interviewing: { label: "En Entrevista", color: "bg-[#28a745] text-white" },
      rejected: { label: "Descartado", color: "bg-gray-400 text-white" }
    };
    return configs[status as keyof typeof configs] || configs.new;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === "all" || candidate.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "recent") return 0; // Would use actual dates in real app
    return 0;
  });

  const statusCounts = {
    all: candidates.length,
    new: candidates.filter(c => c.status === "new").length,
    reviewed: candidates.filter(c => c.status === "reviewed").length,
    contacted: candidates.filter(c => c.status === "contacted").length,
    interviewing: candidates.filter(c => c.status === "interviewing").length,
    rejected: candidates.filter(c => c.status === "rejected").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/employer/vacancy/${vacancyId}`}>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#003366]">Candidatos</h1>
                  <p className="text-sm text-gray-600">{vacancy.position}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full border-2">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                <UserCheck className="w-4 h-4 mr-2" />
                Acción Masiva
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="rounded-3xl border-2">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#003366]">{statusCounts.all}</div>
              <div className="text-sm text-gray-600">Total Candidatos</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-2">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#fd7e14]">{statusCounts.new}</div>
              <div className="text-sm text-gray-600">Nuevos</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-2">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-500">{statusCounts.reviewed}</div>
              <div className="text-sm text-gray-600">Revisados</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-2">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#28a745]">{statusCounts.interviewing}</div>
              <div className="text-sm text-gray-600">Entrevistas</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-2">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-500">{statusCounts.contacted}</div>
              <div className="text-sm text-gray-600">Contactados</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="rounded-3xl border-2 mb-6">
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o habilidad..."
                  className="pl-12 h-12 rounded-2xl bg-gray-50 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 rounded-2xl">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Mayor Match</SelectItem>
                  <SelectItem value="recent">Más Recientes</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-12 rounded-2xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="new">Nuevos</SelectItem>
                  <SelectItem value="reviewed">Revisados</SelectItem>
                  <SelectItem value="contacted">Contactados</SelectItem>
                  <SelectItem value="interviewing">En Entrevista</SelectItem>
                  <SelectItem value="rejected">Descartados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <div className="space-y-4">
          {sortedCandidates.map((candidate) => {
            const statusConfig = getStatusConfig(candidate.status);
            return (
              <Card key={candidate.id} className="rounded-3xl border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Profile */}
                    <div className="flex gap-4 lg:w-1/3">
                      <Avatar className="w-20 h-20 rounded-2xl flex-shrink-0">
                        <AvatarImage src={candidate.photo} />
                        <AvatarFallback className="rounded-2xl bg-[#003366] text-white">
                          {candidate.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#003366] mb-1">{candidate.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{candidate.degree}</p>
                        <div className="flex items-center gap-1 text-xs text-[#28a745] mb-2">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{candidate.university}</span>
                        </div>
                        <Badge className={`rounded-full ${statusConfig.color} text-xs`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Center: Details */}
                    <div className="lg:w-1/3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-[#28a745]/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-[#28a745]" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-[#28a745]">{candidate.matchScore}%</div>
                            <div className="text-xs text-gray-600">Match Score</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>Exp: {candidate.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          <span>Disponibilidad: {candidate.availability}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">Aplicó {candidate.appliedDate}</p>
                    </div>

                    {/* Right: Skills & Actions */}
                    <div className="lg:w-1/3 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Habilidades</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.slice(0, 4).map((skill, index) => (
                            <Badge
                              key={index}
                              className="rounded-full bg-[#003366]/10 text-[#003366] text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 4 && (
                            <Badge className="rounded-full bg-gray-100 text-gray-600 text-xs">
                              +{candidate.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="rounded-2xl bg-[#003366] hover:bg-[#003366]/90 text-white"
                        >
                          Ver Perfil Completo
                        </Button>
                        <div className="flex gap-2">
                          <Link to={`/chat/${candidate.id}`} className="flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full rounded-2xl border-2 border-[#28a745] text-[#28a745] hover:bg-[#28a745]/10"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-2xl border-2"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Aceptar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sortedCandidates.length === 0 && (
          <Card className="rounded-3xl border-2">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#003366] mb-2">No se encontraron candidatos</h3>
              <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
