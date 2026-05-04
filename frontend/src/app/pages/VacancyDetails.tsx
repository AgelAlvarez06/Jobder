import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, GraduationCap, Users, Eye, Heart, TrendingUp, Calendar, Edit, Trash2, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Sparkles } from "lucide-react";
import { vacantes, ApiError, type VacanteOut } from "../../lib/api";
import { toast } from "sonner";

export default function VacancyDetails() {
  const { vacancyId } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<VacanteOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const vacancyIdNum = vacancyId ? parseInt(vacancyId) : NaN;

  useEffect(() => {
    if (!vacancyIdNum || isNaN(vacancyIdNum)) {
      setLoading(false);
      return;
    }
    vacantes
      .get(vacancyIdNum)
      .then(setVacancy)
      .catch(() => toast.error("Error al cargar vacante"))
      .finally(() => setLoading(false));
  }, [vacancyIdNum]);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta vacante?")) return;
    setDeleting(true);
    try {
      await vacantes.delete(vacancyIdNum);
      toast.success("Vacante eliminada");
      navigate("/employer");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-[#28a745] animate-pulse" />
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Vacante no encontrada</p>
      </div>
    );
  }

  const sd = (vacancy.structured_data || {}) as Record<string, unknown>;

  const responsibilities = ((sd.responsibilities as string) || "")
    .split("\n")
    .map((l: string) => l.replace(/^[•\-]\s*/, "").trim())
    .filter(Boolean);
  const requirements = ((sd.requirements as string) || "")
    .split("\n")
    .map((l: string) => l.replace(/^[•\-]\s*/, "").trim())
    .filter(Boolean);
  const benefits = ((sd.benefits as string[]) || []);
  const skills = ((sd.skills as string[]) || []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/employer">
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
                  <h1 className="text-xl font-bold text-[#003366]">{vacancy.titulo}</h1>
                  <p className="text-sm text-gray-600">{(sd.company as string) || ""}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/employer/vacancy/${vacancyId}/edit`}>
                <Button variant="outline" className="rounded-full border-2">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-[#003366]">Rendimiento de la Vacante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-6">
                  <Link to={`/employer/vacancy/${vacancyId}/candidates`}>
                    <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white">
                      <Users className="w-5 h-5 mr-2" />
                      Ver Candidatos Interesados
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-[#003366]">Descripción del Puesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-700 leading-relaxed">{vacancy.job_raw_text || vacancy.job_text}</p>
                </div>

                {responsibilities.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-[#003366] mb-3">Responsabilidades</h3>
                      <ul className="space-y-2">
                        {responsibilities.map((item: string, index: number) => (
                          <li key={index} className="flex gap-3 text-gray-700">
                            <span className="text-[#28a745] mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {requirements.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-[#003366] mb-3">Requisitos</h3>
                      <ul className="space-y-2">
                        {requirements.map((item: string, index: number) => (
                          <li key={index} className="flex gap-3 text-gray-700">
                            <span className="text-[#003366] mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {benefits.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-[#003366] mb-3">Beneficios y Prestaciones</h3>
                      <ul className="space-y-2">
                        {benefits.map((item: string, index: number) => (
                          <li key={index} className="flex gap-3 text-gray-700">
                            <span className="text-[#fd7e14] mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-[#003366]">Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {(sd.location as string) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#003366] mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-600">Ubicación</div>
                        <div className="text-[#003366]">{sd.location as string}</div>
                      </div>
                    </div>
                  )}
                  {(sd.jobType as string) && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Tipo de Empleo</div>
                          <div className="text-[#003366]">{sd.jobType as string}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {(sd.workMode as string) && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Modalidad</div>
                          <div className="text-[#003366]">{sd.workMode as string}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {(sd.salary as string) && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Salario</div>
                          <div className="text-[#003366]">{sd.salary as string}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {(sd.experience as string) && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Experiencia</div>
                          <div className="text-[#003366]">{sd.experience as string}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {(sd.education as string) && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-[#003366] mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Educación</div>
                          <div className="text-[#003366]">{sd.education as string}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {skills.length > 0 && (
              <Card className="rounded-3xl border-2">
                <CardHeader>
                  <CardTitle className="text-[#003366]">Habilidades Requeridas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, index: number) => (
                      <Badge key={index} className="px-4 py-2 rounded-full bg-[#28a745]/10 text-[#28a745]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-3xl border-2 bg-red-50/50">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-[#003366] mb-4">Acciones Avanzadas</h3>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 justify-start"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? "Eliminando..." : "Eliminar Vacante"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
