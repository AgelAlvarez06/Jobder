import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { vacantes, VacanteStructuredData, getErrorMessage } from "../../lib/api";

export default function CreateJobPosting() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    ubicacion: "",
    modalidad: "",
    salario_min: "",
    salario_max: "",
    description: "",
    requirements: "",
    benefits: "",
  });
  const [jdFile, setJdFile] = useState<File | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("titulo", form.titulo);
    const sd: VacanteStructuredData = {};
    if (form.ubicacion) sd.ubicacion = form.ubicacion;
    if (form.modalidad) sd.modalidad = form.modalidad;
    if (form.salario_min) sd.salario_min = Number(form.salario_min);
    if (form.salario_max) sd.salario_max = Number(form.salario_max);
    fd.append("structured_data", JSON.stringify(sd));
    const raw = [form.description, form.requirements, form.benefits].filter(Boolean).join("\n\n");
    if (raw) fd.append("job_raw_text", raw);
    if (jdFile) fd.append("job_description", jdFile);
    try {
      await vacantes.create(fd);
      toast.success("Vacante publicada");
      navigate("/employer");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Error al crear vacante"));
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-xl sm:text-2xl font-bold text-[#003366]">Nueva Vacante</h1>
          </div>
          <Button form="job-form" type="submit" disabled={saving}
            className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
            {saving ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]">
                <Briefcase className="w-5 h-5" />
                Información del puesto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input id="titulo" className="h-12 rounded-2xl" value={form.titulo}
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
                  <Input className="h-12 rounded-2xl" placeholder="presencial / hibrido / remoto"
                    value={form.modalidad} onChange={(e) => set("modalidad", e.target.value)} />
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
                <Label>Descripción</Label>
                <Textarea className="min-h-32 rounded-2xl" value={form.description}
                  onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Requisitos</Label>
                <Textarea className="min-h-24 rounded-2xl" value={form.requirements}
                  onChange={(e) => set("requirements", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Beneficios</Label>
                <Textarea className="min-h-24 rounded-2xl" value={form.benefits}
                  onChange={(e) => set("benefits", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Job description (PDF/TXT, opcional)</Label>
                <Input type="file" accept=".pdf,.txt" className="rounded-2xl"
                  onChange={(e) => setJdFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-gray-500">Se combinará con los campos para el embedding.</p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}