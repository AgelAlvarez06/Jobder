import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Search, Users, Briefcase, TrendingUp, Heart, Eye, MessageCircle, Sparkles, User, LogOut, Star, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../../lib/auth-context";
import { vacantes as vacantesApi, matches as matchesApi, reclutadores, type VacanteOut, type MatchOut, type ReclutadorOut } from "../../lib/api";
import { toast } from "sonner";

export default function EmployerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [myVacancies, setMyVacancies] = useState<VacanteOut[]>([]);
  const [myMatches, setMyMatches] = useState<MatchOut[]>([]);
  const [profile, setProfile] = useState<ReclutadorOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [vacs, mats, prof] = await Promise.all([
        vacantesApi.mine().catch(() => []),
        matchesApi.list().catch(() => []),
        reclutadores.me().catch(() => null),
      ]);
      setMyVacancies(vacs);
      setMyMatches(mats);
      setProfile(prof);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    { label: "Vacantes Activas", value: String(myVacancies.length), icon: Briefcase, color: "text-[#003366]", bg: "bg-[#003366]/10" },
    { label: "Matches", value: String(myMatches.length), icon: Heart, color: "text-[#fd7e14]", bg: "bg-[#fd7e14]/10" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-[#28a745] text-white",
      paused: "bg-[#fd7e14] text-white",
      closed: "bg-gray-400 text-white",
    };
    const labels: Record<string, string> = {
      active: "Activa",
      paused: "Pausada",
      closed: "Cerrada",
    };
    return (
      <Badge className={`rounded-full ${variants[status] || variants.active}`}>
        {labels[status] || "Activa"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
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
              <Button variant="ghost" className="rounded-full text-gray-600" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#003366] mb-2">Panel de Empleador</h1>
          <p className="text-xl text-gray-600">
            {profile ? `${profile.nombre_compania || profile.nombre}` : "Gestiona tus vacantes y descubre talento"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Sparkles className="w-12 h-12 text-[#28a745] animate-pulse" />
          </div>
        ) : (
          <Tabs defaultValue="vacancies" className="space-y-6">
            <TabsList className="bg-white border-2 rounded-2xl p-1">
              <TabsTrigger value="vacancies" className="rounded-xl data-[state=active]:bg-[#003366] data-[state=active]:text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                Mis Vacantes
              </TabsTrigger>
              <TabsTrigger value="matches" className="rounded-xl data-[state=active]:bg-[#003366] data-[state=active]:text-white">
                <Heart className="w-4 h-4 mr-2" />
                Matches
              </TabsTrigger>
            </TabsList>

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
                  {myVacancies.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-[#003366] mb-2">Sin vacantes aún</h3>
                      <p className="text-gray-600 mb-4">Crea tu primera vacante para empezar a recibir candidatos</p>
                      <Link to="/employer/create-job">
                        <Button className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Primera Vacante
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    myVacancies.map((vacancy) => {
                      const sd = (vacancy.structured_data || {}) as Record<string, unknown>;
                      return (
                        <Card key={vacancy.id} className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-[#003366] mb-2">{vacancy.titulo}</h3>
                                <p className="text-sm text-gray-500">
                                  {(sd.company as string) || ""}
                                </p>
                              </div>
                              {getStatusBadge((sd.status as string) || "active")}
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
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <Card className="rounded-3xl border-2">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#003366]">Matches Recientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myMatches.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-[#003366] mb-2">Sin matches aún</h3>
                      <p className="text-gray-600">Los matches aparecerán cuando candidatos interactúen con tus vacantes</p>
                    </div>
                  ) : (
                    myMatches.map((match) => (
                      <Card key={match.id} className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[#003366]">Match #{match.id}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(match.fecha_match).toLocaleDateString("es-MX")}
                              </p>
                            </div>
                            <Link to={`/chat/${match.id}`}>
                              <Button size="sm" className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
