import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Heart, X, Sparkles, MapPin, Briefcase, MessageCircle, User, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { feed, interacciones, matches as matchesApi, Vacante, MatchEntry, getErrorMessage } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function StudentDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Vacante[]>([]);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    try {
      const v = await feed.vacantes();
      setJobs(v);
      setCurrentJobIndex(0);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "No se pudo cargar el feed"));
    }
  };

  const loadMatches = async () => {
    try {
      const m = await matchesApi.list();
      setMatches(m);
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadFeed(), loadMatches()]);
      setLoading(false);
    })();
  }, []);

  const currentJob = jobs[currentJobIndex];

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentJob) return;
    setSwipeDirection(direction);
    const accion = direction === "right" ? "liked" : "disliked";
    try {
      const result = await interacciones.candidatoSwipe(currentJob.id, accion);
      if (result.match) {
        setShowMatchNotification(true);
        setTimeout(() => setShowMatchNotification(false), 3000);
        loadMatches();
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Error al registrar swipe"));
    } finally {
      setTimeout(() => {
        setCurrentJobIndex((i) => i + 1);
        setSwipeDirection(null);
      }, 300);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sd = currentJob?.structured_data ?? {};

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
              <Link to="/profile-setup">
                <Button variant="ghost" className="rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
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
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card className="rounded-3xl border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#003366]">Mis Matches</h3>
                  <Badge className="rounded-full bg-[#28a745] text-white">{matches.length}</Badge>
                </div>

                {matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.map((m) => (
                      <Link key={m.id} to={`/chat/${m.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#003366] truncate">
                              {m.reclutador?.nombre_compania || "Empresa"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{m.vacante.titulo}</div>
                            {m.last_message?.contenido && (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="text-xs text-gray-600 truncate">
                                  {m.last_message.contenido}
                                </div>
                                {m.last_message.fecha_envio && (
                                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                                    {new Date(m.last_message.fecha_envio).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {m.unread_count > 0 ? (
                            <Badge className="rounded-full bg-[#fd7e14] text-white px-2 py-0.5 text-xs">
                              {m.unread_count}
                            </Badge>
                          ) : (
                            <MessageCircle className="w-5 h-5 text-[#28a745]" />
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Aún no tienes matches</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-[#003366]">Mejora tu perfil</h3>
                <p className="text-sm text-gray-600">
                  Sube tu CV y completa tus datos para obtener mejores recomendaciones.
                </p>
                <Link to="/profile-setup">
                  <Button className="w-full rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white">
                    Completar Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-[#003366] mb-2">Descubre Oportunidades</h2>
              <p className="text-gray-600">Desliza para encontrar tu match perfecto</p>
            </div>

            <div className="relative">
              {loading ? (
                <Card className="rounded-3xl border-2"><CardContent className="p-8 text-center text-gray-500">Cargando…</CardContent></Card>
              ) : currentJobIndex < jobs.length && currentJob ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentJob.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      x: swipeDirection === "right" ? 1000 : -1000,
                      opacity: 0,
                      rotate: swipeDirection === "right" ? 20 : -20,
                      transition: { duration: 0.3 },
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Card className="rounded-3xl border-2 shadow-2xl overflow-hidden">
                      {currentJob.score != null && (
                        <div className="absolute top-6 right-6 z-10">
                          <div className="px-4 py-2 rounded-full bg-[#28a745] text-white font-semibold shadow-lg">
                            {Math.round(currentJob.score)}% Match
                          </div>
                        </div>
                      )}

                      <div className="h-32 bg-gradient-to-br from-[#003366] to-[#28a745]" />

                      <CardContent className="p-8 space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-[#003366] mb-1">{currentJob.titulo}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {sd.ubicacion && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-5 h-5 text-[#003366]" />
                              <span className="text-sm">{sd.ubicacion}</span>
                            </div>
                          )}
                          {sd.modalidad && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Briefcase className="w-5 h-5 text-[#003366]" />
                              <span className="text-sm capitalize">{sd.modalidad}</span>
                            </div>
                          )}
                        </div>

                        {currentJob.job_text && (
                          <div>
                            <h4 className="font-semibold text-[#003366] mb-2">Descripción</h4>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                              {currentJob.job_text}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleSwipe("left")}
                            className="flex-1 h-16 rounded-full border-2 border-gray-300 hover:border-[#fd7e14] hover:bg-[#fd7e14]/10 hover:text-[#fd7e14] transition-all"
                          >
                            <X className="w-6 h-6 mr-2" />
                            Pasar
                          </Button>
                          <Button
                            size="lg"
                            onClick={() => handleSwipe("right")}
                            className="flex-1 h-16 rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white shadow-lg shadow-[#28a745]/30"
                          >
                            <Heart className="w-6 h-6 mr-2" />
                            Me Interesa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <Card className="rounded-3xl border-2">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003366]/10 to-[#28a745]/10 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-[#28a745]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[#003366]">¡Has visto todas las vacantes!</h3>
                        <p className="text-gray-600 max-w-md">
                          Vuelve más tarde para ver nuevas oportunidades.
                        </p>
                      </div>
                      <Button onClick={loadFeed} className="rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white">
                        Recargar feed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMatchNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="max-w-md mx-4"
            >
              <Card className="rounded-3xl border-4 border-[#28a745] bg-gradient-to-br from-[#003366] to-[#28a745] shadow-2xl">
                <CardContent className="p-12 text-center space-y-6">
                  <Sparkles className="w-20 h-20 text-[#fd7e14] mx-auto" />
                  <h2 className="text-4xl font-bold text-white">¡Es un Match!</h2>
                  <p className="text-xl text-white/90">
                    {currentJob?.titulo}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
