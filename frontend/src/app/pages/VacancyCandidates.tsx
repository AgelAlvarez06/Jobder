import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Briefcase, Heart, MapPin, MessageCircle, X, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { vacantes, interacciones, Candidato, getErrorMessage } from "../../lib/api";

export default function VacancyCandidates() {
  const { vacancyId } = useParams();
  const [candidates, setCandidates] = useState<Candidato[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await vacantes.candidatos(vacancyId!);
      setCandidates(list);
      setIndex(0);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Error cargando candidatos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacancyId]);

  const current = candidates[index];

  const handleSwipe = async (dir: "left" | "right") => {
    if (!current) return;
    setDirection(dir);
    const accion = dir === "right" ? "liked" : "disliked";
    try {
      const res = await interacciones.reclutadorSwipe(Number(vacancyId), current.id, accion);
      if (res.match) {
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 3000);
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Error al registrar swipe"));
    } finally {
      setTimeout(() => {
        setIndex((i) => i + 1);
        setDirection(null);
      }, 250);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/employer/vacancy/${vacancyId}`}>
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#003366]">Candidatos recomendados</h1>
              <p className="text-sm text-gray-600">Vacante #{vacancyId}</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full" onClick={load}>Recargar</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Card className="rounded-3xl border-2"><CardContent className="p-8 text-center text-gray-500">Cargando…</CardContent></Card>
        ) : index >= candidates.length || !current ? (
          <Card className="rounded-3xl border-2">
            <CardContent className="p-12 text-center space-y-4">
              <Sparkles className="w-16 h-16 text-[#28a745] mx-auto" />
              <h3 className="text-2xl font-bold text-[#003366]">No hay más candidatos</h3>
              <p className="text-gray-600">Vuelve más tarde o publica nuevas vacantes para atraer más talento.</p>
              <Button onClick={load} className="rounded-full bg-[#fd7e14] text-white">Recargar</Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: direction === "right" ? 600 : -600,
                opacity: 0,
                rotate: direction === "right" ? 15 : -15,
                transition: { duration: 0.25 },
              }}
            >
              <Card className="rounded-3xl border-2 shadow-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20 rounded-2xl">
                        <AvatarFallback className="rounded-2xl bg-[#003366] text-white">
                          {(current.nombre || "C").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-bold text-[#003366]">{current.nombre || "Candidato"}</h3>
                        <p className="text-gray-600">{current.carrera}</p>
                      </div>
                    </div>
                    {current.score != null && (
                      <Badge className="rounded-full bg-[#28a745] text-white px-3 py-2">
                        {Math.round(current.score)}% match
                      </Badge>
                    )}
                  </div>

                  {current.ubicacion && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" /> {current.ubicacion}
                    </div>
                  )}

                  {current.habilidades && current.habilidades.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#003366] mb-2">Habilidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {current.habilidades.map((s) => (
                          <Badge key={s} className="rounded-full bg-[#003366]/10 text-[#003366]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {current.descripcion && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#003366] mb-2">Sobre el candidato</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-line">{current.descripcion}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button size="lg" variant="outline"
                      onClick={() => handleSwipe("left")}
                      className="flex-1 h-14 rounded-full border-2 border-gray-300 hover:border-[#fd7e14]">
                      <X className="w-5 h-5 mr-2" />
                      Pasar
                    </Button>
                    <Button size="lg"
                      onClick={() => handleSwipe("right")}
                      className="flex-1 h-14 rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                      <Heart className="w-5 h-5 mr-2" />
                      Me Interesa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              transition={{ type: "spring" }} className="max-w-md mx-4">
              <Card className="rounded-3xl border-4 border-[#28a745] bg-gradient-to-br from-[#003366] to-[#28a745] shadow-2xl">
                <CardContent className="p-12 text-center space-y-4">
                  <Sparkles className="w-16 h-16 text-[#fd7e14] mx-auto" />
                  <h2 className="text-3xl font-bold text-white">¡Es un Match!</h2>
                  <p className="text-white/90">Pueden empezar a conversar.</p>
                  <Button className="rounded-full bg-[#fd7e14] text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Enviar mensaje
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
