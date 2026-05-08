import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Edit, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { vacantes, Vacante, getErrorMessage } from "../../lib/api";

export default function VacancyDetails() {
  const { vacancyId } = useParams();
  const [vacancy, setVacancy] = useState<Vacante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await vacantes.get(vacancyId!);
        setVacancy(v);
      } catch (e: unknown) {
        toast.error(getErrorMessage(e, "Error al cargar vacante"));
      } finally {
        setLoading(false);
      }
    })();
  }, [vacancyId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#003366]">Cargando…</div>;
  }
  if (!vacancy) {
    return <div className="min-h-screen flex items-center justify-center text-[#003366]">Vacante no encontrada</div>;
  }
  const sd = vacancy.structured_data ?? {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/employer">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#003366]">{vacancy.titulo}</h1>
              <p className="text-sm text-gray-600">ID #{vacancy.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/employer/vacancy/${vacancyId}/edit`}>
              <Button variant="outline" className="rounded-full border-2">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Link to={`/employer/vacancy/${vacancyId}/candidates`}>
              <Button className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                <Users className="w-4 h-4 mr-2" />
                Ver candidatos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="rounded-3xl border-2">
          <CardHeader>
            <CardTitle className="text-[#003366]">Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sd.ubicacion && (
              <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[#003366]" /><span>{sd.ubicacion}</span></div>
            )}
            {sd.modalidad && (
              <div className="flex items-center gap-3"><Briefcase className="w-5 h-5 text-[#003366]" /><span className="capitalize">{sd.modalidad}</span></div>
            )}
            {(sd.salario_min || sd.salario_max) && (
              <div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-[#28a745]" />
                <span>${sd.salario_min || "—"} - ${sd.salario_max || "—"} MXN</span>
              </div>
            )}
            <Separator />
            <div>
              <h3 className="font-semibold text-[#003366] mb-2">Texto del puesto (embedding)</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm">{vacancy.job_text}</p>
            </div>
            {vacancy.job_raw_text && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-[#003366] mb-2">Descripción original</h3>
                  <p className="text-gray-700 whitespace-pre-line text-sm">{vacancy.job_raw_text}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
