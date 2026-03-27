import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, GraduationCap, Sparkles, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { vacantes, ApiError } from "../../lib/api";
import { toast } from "sonner";

export default function CreateJobPosting() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const jobTextParts = [
      formData.jobTitle,
      formData.description,
      formData.responsibilities,
      formData.requirements,
      formData.skills.join(", "),
    ].filter(Boolean);

    setLoading(true);
    try {
      await vacantes.create({
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
          salary: formData.salaryMin && formData.salaryMax
            ? `$${Number(formData.salaryMin).toLocaleString()} - $${Number(formData.salaryMax).toLocaleString()} MXN/mes`
            : "A convenir",
          experience: formData.experience,
          education: formData.education,
          industry: formData.industry,
          responsibilities: formData.responsibilities,
          requirements: formData.requirements,
          benefits: formData.benefits.split("\n").map(b => b.replace(/^[•\-]\s*/, "").trim()).filter(Boolean),
          skills: formData.skills,
        },
      });
      toast.success("Vacante publicada exitosamente");
      navigate("/employer");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Error al crear vacante");
      }
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-xl sm:text-2xl font-bold text-[#003366]">Nueva Vacante</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-2 border-gray-300"
                onClick={() => navigate("/employer")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="job-posting-form"
                disabled={loading}
                className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white"
              >
                {loading ? "Publicando..." : "Publicar Vacante"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="job-posting-form" onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]">
                <Briefcase className="w-5 h-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-[#003366]">Título del Puesto *</Label>
                  <Input id="jobTitle" placeholder="ej. Desarrollador Frontend Junior" className="h-12 rounded-2xl" value={formData.jobTitle} onChange={(e) => handleInputChange("jobTitle", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#003366]">Empresa *</Label>
                  <Input id="company" placeholder="Nombre de tu empresa" className="h-12 rounded-2xl" value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} required />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[#003366] flex items-center gap-1"><MapPin className="w-4 h-4" /> Ubicación *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger id="location" className="h-12 rounded-2xl"><SelectValue placeholder="Zona ZMG" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zapopan">Zapopan</SelectItem>
                      <SelectItem value="Guadalajara Centro">Guadalajara Centro</SelectItem>
                      <SelectItem value="Tlaquepaque">Tlaquepaque</SelectItem>
                      <SelectItem value="Tonalá">Tonalá</SelectItem>
                      <SelectItem value="Tlajomulco">Tlajomulco</SelectItem>
                      <SelectItem value="El Salto">El Salto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType" className="text-[#003366] flex items-center gap-1"><Clock className="w-4 h-4" /> Tipo de Empleo *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                    <SelectTrigger id="jobType" className="h-12 rounded-2xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tiempo Completo">Tiempo Completo</SelectItem>
                      <SelectItem value="Medio Tiempo">Medio Tiempo</SelectItem>
                      <SelectItem value="Prácticas/Becario">Prácticas/Becario</SelectItem>
                      <SelectItem value="Por Contrato">Por Contrato</SelectItem>
                      <SelectItem value="Temporal">Temporal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workMode" className="text-[#003366]">Modalidad *</Label>
                  <Select value={formData.workMode} onValueChange={(value) => handleInputChange("workMode", value)}>
                    <SelectTrigger id="workMode" className="h-12 rounded-2xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Remoto">Remoto</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-[#003366] flex items-center gap-1"><Building2 className="w-4 h-4" /> Industria *</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger id="industry" className="h-12 rounded-2xl"><SelectValue placeholder="Seleccionar industria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Finanzas">Finanzas</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Diseño">Diseño</SelectItem>
                      <SelectItem value="Ventas">Ventas</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Manufactura">Manufactura</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]"><DollarSign className="w-5 h-5" /> Compensación y Requisitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin" className="text-[#003366]">Salario Mínimo (MXN/mes)</Label>
                  <Input id="salaryMin" type="number" placeholder="15000" className="h-12 rounded-2xl" value={formData.salaryMin} onChange={(e) => handleInputChange("salaryMin", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax" className="text-[#003366]">Salario Máximo (MXN/mes)</Label>
                  <Input id="salaryMax" type="number" placeholder="25000" className="h-12 rounded-2xl" value={formData.salaryMax} onChange={(e) => handleInputChange("salaryMax", e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-[#003366]">Nivel de Experiencia *</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger id="experience" className="h-12 rounded-2xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sin experiencia">Sin experiencia / Entry Level</SelectItem>
                      <SelectItem value="Junior (1-2 años)">Junior (1-2 años)</SelectItem>
                      <SelectItem value="Intermedio (3-5 años)">Intermedio (3-5 años)</SelectItem>
                      <SelectItem value="Senior (5+ años)">Senior (5+ años)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education" className="text-[#003366] flex items-center gap-1"><GraduationCap className="w-4 h-4" /> Nivel Educativo *</Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                    <SelectTrigger id="education" className="h-12 rounded-2xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estudiante Activo">Estudiante Activo</SelectItem>
                      <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                      <SelectItem value="Maestría">Maestría</SelectItem>
                      <SelectItem value="Doctorado">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]"><FileText className="w-5 h-5" /> Descripción del Puesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#003366]">Descripción General *</Label>
                <Textarea id="description" placeholder="Describe el puesto..." className="min-h-32 rounded-2xl resize-none" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsibilities" className="text-[#003366]">Responsabilidades Principales</Label>
                <Textarea id="responsibilities" placeholder="Lista las principales responsabilidades..." className="min-h-32 rounded-2xl resize-none" value={formData.responsibilities} onChange={(e) => handleInputChange("responsibilities", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-[#003366]">Requisitos *</Label>
                <Textarea id="requirements" placeholder="Lista los requisitos indispensables..." className="min-h-32 rounded-2xl resize-none" value={formData.requirements} onChange={(e) => handleInputChange("requirements", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-[#003366]">Beneficios y Prestaciones</Label>
                <Textarea id="benefits" placeholder="Describe los beneficios..." className="min-h-24 rounded-2xl resize-none" value={formData.benefits} onChange={(e) => handleInputChange("benefits", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]"><Sparkles className="w-5 h-5" /> Habilidades Requeridas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-[#003366]">Agregar Habilidades</Label>
                <div className="flex gap-2">
                  <Input id="skills" placeholder="ej. React, TypeScript, Figma..." className="h-12 rounded-2xl" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                  <Button type="button" onClick={addSkill} className="h-12 px-6 rounded-2xl bg-[#003366] hover:bg-[#003366]/90 text-white">Agregar</Button>
                </div>
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
              <p className="text-sm text-gray-500">Haz clic en una habilidad para eliminarla</p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button type="button" variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-gray-300" onClick={() => navigate("/employer")}>Cancelar</Button>
            <Button type="submit" size="lg" disabled={loading} className="h-14 px-12 rounded-full bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white shadow-lg">
              <Briefcase className="w-5 h-5 mr-2" />
              {loading ? "Publicando..." : "Publicar Vacante"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
