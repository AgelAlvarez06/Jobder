import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, GraduationCap, Sparkles, FileText, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { vacantes, ApiError, type VacanteOut } from "../../lib/api";
import { toast } from "sonner";

export default function EditVacancy() {
  const { vacancyId } = useParams();
  const navigate = useNavigate();
  const vacancyIdNum = vacancyId ? parseInt(vacancyId) : NaN;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    jobType: "",
    workMode: "",
    salaryMin: "",
    salaryMax: "",
    experience: "",
    education: "",
    industry: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    skills: [] as string[],
  });
  const [currentSkill, setCurrentSkill] = useState("");

  useEffect(() => {
    if (!vacancyIdNum || isNaN(vacancyIdNum)) {
      setLoading(false);
      return;
    }
    vacantes
      .get(vacancyIdNum)
      .then((v) => {
        const sd = (v.structured_data || {}) as Record<string, unknown>;
        setFormData({
          jobTitle: v.titulo || "",
          company: (sd.company as string) || "",
          location: (sd.location as string) || "",
          jobType: (sd.jobType as string) || "",
          workMode: (sd.workMode as string) || "",
          salaryMin: (sd.salaryMin as string) || "",
          salaryMax: (sd.salaryMax as string) || "",
          experience: (sd.experience as string) || "",
          education: (sd.education as string) || "",
          industry: (sd.industry as string) || "",
          description: v.job_raw_text || "",
          responsibilities: (sd.responsibilities as string) || "",
          requirements: (sd.requirements as string) || "",
          benefits: ((sd.benefits as string[]) || []).join("\n"),
          skills: ((sd.skills as string[]) || []),
        });
      })
      .catch(() => toast.error("Error al cargar vacante"))
      .finally(() => setLoading(false));
  }, [vacancyIdNum]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, currentSkill.trim()] }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const jobTextParts = [
      formData.jobTitle,
      formData.description,
      formData.responsibilities,
      formData.requirements,
      formData.skills.join(", "),
    ].filter(Boolean);

    setSaving(true);
    try {
      await vacantes.update(vacancyIdNum, {
        titulo: formData.jobTitle,
        job_text: jobTextParts.join(". "),
        job_raw_text: formData.description,
        structured_data: {
          company: formData.company,
          location: formData.location,
          jobType: formData.jobType,
          workMode: formData.workMode,
          salaryMin: formData.salaryMin,
          salaryMax: formData.salaryMax,
          salary:
            formData.salaryMin && formData.salaryMax
              ? `$${Number(formData.salaryMin).toLocaleString()} - $${Number(formData.salaryMax).toLocaleString()} MXN/mes`
              : "A convenir",
          experience: formData.experience,
          education: formData.education,
          industry: formData.industry,
          responsibilities: formData.responsibilities,
          requirements: formData.requirements,
          benefits: formData.benefits
            .split("\n")
            .map((b) => b.replace(/^[•\-]\s*/, "").trim())
            .filter(Boolean),
          skills: formData.skills,
        },
      });
      toast.success("Vacante actualizada");
      navigate(`/employer/vacancy/${vacancyId}`);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

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
                <h1 className="text-xl sm:text-2xl font-bold text-[#003366]">Editar Vacante</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="rounded-full border-2 border-gray-300" onClick={() => navigate(`/employer/vacancy/${vacancyId}`)}>
                Cancelar
              </Button>
              <Button type="submit" form="edit-vacancy-form" disabled={saving} className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="edit-vacancy-form" onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]"><Briefcase className="w-5 h-5" /> Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-[#003366]">Título del Puesto *</Label>
                  <Input id="jobTitle" className="h-12 rounded-2xl" value={formData.jobTitle} onChange={(e) => handleInputChange("jobTitle", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#003366]">Empresa *</Label>
                  <Input id="company" className="h-12 rounded-2xl" value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} required />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#003366]"><MapPin className="w-4 h-4 inline mr-1" />Ubicación</Label>
                  <Input className="h-12 rounded-2xl" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#003366]"><Clock className="w-4 h-4 inline mr-1" />Tipo de Empleo</Label>
                  <Input className="h-12 rounded-2xl" value={formData.jobType} onChange={(e) => handleInputChange("jobType", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#003366]">Modalidad</Label>
                  <Input className="h-12 rounded-2xl" value={formData.workMode} onChange={(e) => handleInputChange("workMode", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]"><DollarSign className="w-5 h-5" /> Compensación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#003366]">Salario Mínimo (MXN/mes)</Label>
                  <Input type="number" className="h-12 rounded-2xl" value={formData.salaryMin} onChange={(e) => handleInputChange("salaryMin", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#003366]">Salario Máximo (MXN/mes)</Label>
                  <Input type="number" className="h-12 rounded-2xl" value={formData.salaryMax} onChange={(e) => handleInputChange("salaryMax", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]"><FileText className="w-5 h-5" /> Descripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[#003366]">Descripción General *</Label>
                <Textarea className="min-h-32 rounded-2xl resize-none" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[#003366]">Responsabilidades</Label>
                <Textarea className="min-h-32 rounded-2xl resize-none" value={formData.responsibilities} onChange={(e) => handleInputChange("responsibilities", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#003366]">Requisitos *</Label>
                <Textarea className="min-h-32 rounded-2xl resize-none" value={formData.requirements} onChange={(e) => handleInputChange("requirements", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[#003366]">Beneficios</Label>
                <Textarea className="min-h-24 rounded-2xl resize-none" value={formData.benefits} onChange={(e) => handleInputChange("benefits", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]"><Sparkles className="w-5 h-5" /> Habilidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="ej. React, TypeScript..." className="h-12 rounded-2xl" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                <Button type="button" onClick={addSkill} className="h-12 px-6 rounded-2xl bg-[#003366] hover:bg-[#003366]/90 text-white">Agregar</Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-4 py-2 rounded-full bg-[#28a745]/10 text-[#28a745] hover:bg-[#28a745]/20 cursor-pointer" onClick={() => removeSkill(skill)}>
                      {skill}<span className="ml-2 text-xs">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button type="button" variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-gray-300" onClick={() => navigate(`/employer/vacancy/${vacancyId}`)}>Cancelar</Button>
            <Button type="submit" size="lg" disabled={saving} className="h-14 px-12 rounded-full bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white shadow-lg">
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
