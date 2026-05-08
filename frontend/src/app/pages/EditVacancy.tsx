import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { vacantes, getErrorMessage } from "../../lib/api";

export default function EditVacancy() {
  const { vacancyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    ubicacion: "",
    modalidad: "",
    salario_min: "",
    salario_max: "",
    job_raw_text: "",
  });
  const [jdFile, setJdFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await vacantes.get(vacancyId!);
        const sd = v.structured_data ?? {};
        setForm({
          titulo: v.titulo || "",
          ubicacion: sd.ubicacion ?? "",
          modalidad: sd.modalidad ?? "",
          salario_min: sd.salario_min != null ? String(sd.salario_min) : "",
          salario_max: sd.salario_max != null ? String(sd.salario_max) : "",
          job_raw_text: v.job_raw_text || "",
        });
      } catch (e: unknown) {
        toast.error(getErrorMessage(e, "No se pudo cargar la vacante"));
      } finally {
        setLoading(false);
      }
    })();
  }, [vacancyId]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("titulo", form.titulo);
    fd.append(
      "structured_data",
      JSON.stringify({
        ubicacion: form.ubicacion || undefined,
        modalidad: form.modalidad || undefined,
        salario_min: form.salario_min ? Number(form.salario_min) : undefined,
        salario_max: form.salario_max ? Number(form.salario_max) : undefined,
      })
    );
    fd.append("job_raw_text", form.job_raw_text);
    if (jdFile) fd.append("job_description", jdFile);
    try {
      await vacantes.update(vacancyId!, fd);
      toast.success("Vacante actualizada");
      navigate(`/employer/vacancy/${vacancyId}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Error al actualizar vacante"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta vacante?")) return;
    try {
      await vacantes.remove(vacancyId!);
      toast.success("Vacante eliminada");
      navigate("/employer");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Error al eliminar"));
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#003366]">Cargando…</div>;
  }

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
            <h1 className="text-xl sm:text-2xl font-bold text-[#003366]">Editar Vacante</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-2 border-red-300 text-red-600"
              onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
            </Button>
            <Button form="edit-form" type="submit" disabled={saving}
              className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="text-[#003366]">Datos del puesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input className="h-12 rounded-2xl" value={form.titulo}
                  onChange={(e) => set("titulo", e.target.value)} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <Input className="h-12 rounded-2xl" value={form.ubicacion}
                    onChange={(e) => set("ubicacion", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Modalidad</Label>
                  <Input className="h-12 rounded-2xl" value={form.modalidad}
                    onChange={(e) => set("modalidad", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Salario mínimo</Label>
                  <Input type="number" className="h-12 rounded-2xl" value={form.salario_min}
                    onChange={(e) => set("salario_min", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Salario máximo</Label>
                  <Input type="number" className="h-12 rounded-2xl" value={form.salario_max}
                    onChange={(e) => set("salario_max", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción / texto libre</Label>
                <Textarea className="min-h-40 rounded-2xl" value={form.job_raw_text}
                  onChange={(e) => set("job_raw_text", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Adjuntar nuevo JD (opcional)</Label>
                <Input type="file" accept=".pdf,.txt" className="rounded-2xl"
                  onChange={(e) => setJdFile(e.target.files?.[0] || null)} />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
