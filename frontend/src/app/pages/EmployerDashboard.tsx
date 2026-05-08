import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Users, Briefcase, Sparkles, Eye, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { vacantes as vacantesApi, matches as matchesApi, Vacante, MatchEntry, getErrorMessage } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function EmployerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [v, m] = await Promise.all([vacantesApi.list(), matchesApi.list()]);
        setVacantes(v);
        setMatches(m);
      } catch (e: unknown) {
        toast.error(getErrorMessage(e, "Error cargando dashboard"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    { label: "Vacantes Activas", value: String(vacantes.length), icon: Briefcase, color: "text-[#003366]", bg: "bg-[#003366]/10" },
    { label: "Matches Totales", value: String(matches.length), icon: Users, color: "text-[#28a745]", bg: "bg-[#28a745]/10" },
  ];

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
          <p className="text-xl text-gray-600">Gestiona tus vacantes y revisa candidatos</p>
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

        <Tabs defaultValue="vacancies" className="space-y-6">
          <TabsList className="bg-white border-2 rounded-2xl p-1">
            <TabsTrigger value="vacancies" className="rounded-xl data-[state=active]:bg-[#003366] data-[state=active]:text-white">
              <Briefcase className="w-4 h-4 mr-2" />
              Mis Vacantes
            </TabsTrigger>
            <TabsTrigger value="matches" className="rounded-xl data-[state=active]:bg-[#003366] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
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
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Cargando…</p>
                ) : vacantes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aún no tienes vacantes. Crea la primera.</p>
                ) : (
                  vacantes.map((vacancy) => (
                    <Card key={vacancy.id} className="rounded-2xl border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-[#003366] mb-2">{vacancy.titulo}</h3>
                            <p className="text-sm text-gray-500">ID #{vacancy.id}</p>
                          </div>
                          <Badge className="rounded-full bg-[#28a745] text-white">Activa</Badge>
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
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-2xl text-[#003366]">Matches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {matches.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aún no tienes matches.</p>
                ) : (
                  matches.map((m) => (
                    <Card key={m.id} className="rounded-2xl border-2">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#003366] truncate">{m.candidato?.nombre || "Candidato"}</div>
                          <div className="text-sm text-gray-600 truncate">{m.candidato?.carrera}</div>
                          <div className="text-xs text-gray-500 mt-1 truncate">Vacante: {m.vacante.titulo}</div>
                          {m.last_message?.contenido && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="text-sm text-gray-700 truncate flex-1">
                                <span className="text-gray-400">Último: </span>
                                {m.last_message.contenido}
                              </div>
                              {m.last_message.fecha_envio && (
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {new Date(m.last_message.fecha_envio).toLocaleString("es-MX", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {m.unread_count > 0 && (
                            <Badge className="rounded-full bg-[#fd7e14] text-white">{m.unread_count}</Badge>
                          )}
                          <Link to={`/chat/${m.id}`}>
                            <Button size="sm" className="rounded-full bg-[#28a745] text-white">Chat</Button>
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
      </div>
    </div>
  );
}
