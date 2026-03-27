import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Search, Filter, Star, MapPin, Briefcase, GraduationCap, MessageCircle, UserCheck, Heart, SlidersHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sparkles } from "lucide-react";
import { vacantes, type VacanteOut } from "../../lib/api";
import { toast } from "sonner";

interface CandidateData {
  id: number;
  nombre: string;
  carrera: string | null;
  ubicacion: string | null;
  habilidades: string | null;
  score_similitud: number | null;
  accion: string;
}

export default function VacancyCandidates() {
  const { vacancyId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [vacancy, setVacancy] = useState<VacanteOut | null>(null);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);

  const vacancyIdNum = vacancyId ? parseInt(vacancyId) : NaN;

  useEffect(() => {
    if (!vacancyIdNum || isNaN(vacancyIdNum)) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [vac, cands] = await Promise.all([
          vacantes.get(vacancyIdNum),
          vacantes.candidates(vacancyIdNum),
        ]);
        setVacancy(vac);
        setCandidates(cands);
      } catch {
        toast.error("Error al cargar candidatos");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [vacancyIdNum]);

  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.habilidades || "").toLowerCase().includes(q) ||
      (c.carrera || "").toLowerCase().includes(q)
    );
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "match") return (b.score_similitud || 0) - (a.score_similitud || 0);
    if (sortBy === "name") return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-[#28a745] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
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
                  <p className="text-sm text-gray-600">{vacancy?.titulo || ""}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="rounded-3xl border-2">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#003366]">{candidates.length}</div>
              <div className="text-sm text-gray-600">Total Candidatos Interesados</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-2">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#28a745]">
                {candidates.filter((c) => c.score_similitud && c.score_similitud > 80).length}
              </div>
              <div className="text-sm text-gray-600">Alta Compatibilidad</div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border-2 mb-6">
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
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
                  <SelectItem value="match">Mayor Compatibilidad</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sortedCandidates.map((candidate) => {
            const skills = (candidate.habilidades || "").split(",").map((s) => s.trim()).filter(Boolean);
            const initials = candidate.nombre
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2);

            return (
              <Card key={candidate.id} className="rounded-3xl border-2 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex gap-4 lg:w-1/3">
                      <Avatar className="w-20 h-20 rounded-2xl flex-shrink-0">
                        <AvatarFallback className="rounded-2xl bg-[#003366] text-white text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[#003366] mb-1">{candidate.nombre}</h3>
                        {candidate.carrera && (
                          <p className="text-sm text-gray-600 mb-1">{candidate.carrera}</p>
                        )}
                      </div>
                    </div>

                    <div className="lg:w-1/3 space-y-3">
                      {candidate.score_similitud !== null && (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-[#28a745]/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-[#28a745]" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-[#28a745]">
                              {Math.round(candidate.score_similitud)}%
                            </div>
                            <div className="text-xs text-gray-600">Compatibilidad</div>
                          </div>
                        </div>
                      )}

                      {candidate.ubicacion && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{candidate.ubicacion}</span>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-1/3 space-y-4">
                      {skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">Habilidades</p>
                          <div className="flex flex-wrap gap-2">
                            {skills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} className="rounded-full bg-[#003366]/10 text-[#003366] text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {skills.length > 4 && (
                              <Badge className="rounded-full bg-gray-100 text-gray-600 text-xs">
                                +{skills.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
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
              <h3 className="text-xl font-semibold text-[#003366] mb-2">
                {candidates.length === 0 ? "Sin candidatos aún" : "No se encontraron candidatos"}
              </h3>
              <p className="text-gray-600">
                {candidates.length === 0
                  ? "Los candidatos aparecerán cuando alguien dé like a tu vacante"
                  : "Intenta ajustar tus filtros de búsqueda"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
