import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, GraduationCap, Sparkles, FileText, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";

export default function EditVacancy() {
  const { vacancyId } = useParams();
  const navigate = useNavigate();

  // Mock data - in a real app, this would be fetched based on vacancyId
  const [formData, setFormData] = useState({
    jobTitle: "Desarrollador Frontend Junior",
    company: "TechCorp Guadalajara",
    location: "zapopan",
    jobType: "full-time",
    workMode: "hibrido",
    salaryMin: "15000",
    salaryMax: "25000",
    experience: "junior",
    education: "bachelors",
    industry: "tech",
    description: "Buscamos un Desarrollador Frontend Junior apasionado por crear experiencias web excepcionales. Te unirás a un equipo dinámico trabajando en proyectos innovadores para clientes nacionales e internacionales.",
    responsibilities: "• Desarrollar interfaces de usuario responsive utilizando React y TypeScript\n• Colaborar con diseñadores UX/UI para implementar diseños pixel-perfect\n• Optimizar aplicaciones para máxima velocidad y escalabilidad\n• Participar en code reviews y contribuir a las mejores prácticas del equipo",
    requirements: "• Estudiante activo o egresado de Ingeniería en Computación, Sistemas o afín\n• Conocimiento sólido de HTML5, CSS3 y JavaScript\n• Experiencia básica con React y frameworks modernos\n• Familiaridad con Git y control de versiones",
    benefits: "• Seguro de gastos médicos mayores\n• Vales de despensa\n• 15 días de vacaciones + días extras\n• Horario flexible\n• 2 días de home office por semana",
    skills: ["React", "TypeScript", "HTML/CSS", "JavaScript", "Git", "Responsive Design"] as string[],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the updated data to your backend
    console.log("Updated job posting data:", formData);
    // Navigate back to vacancy details
    navigate(`/employer/vacancy/${vacancyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
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
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-2 border-gray-300"
                onClick={() => navigate(`/employer/vacancy/${vacancyId}`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="edit-vacancy-form"
                className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="edit-vacancy-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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
                  <Label htmlFor="jobTitle" className="text-[#003366]">
                    Título del Puesto *
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="ej. Desarrollador Frontend Junior"
                    className="h-12 rounded-2xl"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#003366]">
                    Empresa *
                  </Label>
                  <Input
                    id="company"
                    placeholder="Nombre de tu empresa"
                    className="h-12 rounded-2xl"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[#003366] flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Ubicación *
                  </Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger id="location" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Zona ZMG" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zapopan">Zapopan</SelectItem>
                      <SelectItem value="gdl">Guadalajara Centro</SelectItem>
                      <SelectItem value="tlaquepaque">Tlaquepaque</SelectItem>
                      <SelectItem value="tonala">Tonalá</SelectItem>
                      <SelectItem value="tlajomulco">Tlajomulco</SelectItem>
                      <SelectItem value="el-salto">El Salto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType" className="text-[#003366] flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Tipo de Empleo *
                  </Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                    <SelectTrigger id="jobType" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Tiempo Completo</SelectItem>
                      <SelectItem value="part-time">Medio Tiempo</SelectItem>
                      <SelectItem value="internship">Prácticas/Becario</SelectItem>
                      <SelectItem value="contract">Por Contrato</SelectItem>
                      <SelectItem value="temporary">Temporal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workMode" className="text-[#003366]">
                    Modalidad *
                  </Label>
                  <Select value={formData.workMode} onValueChange={(value) => handleInputChange("workMode", value)}>
                    <SelectTrigger id="workMode" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="remoto">Remoto</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-[#003366] flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Industria *
                  </Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger id="industry" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Seleccionar industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Tecnología</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Diseño</SelectItem>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="healthcare">Salud</SelectItem>
                      <SelectItem value="manufacturing">Manufactura</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation & Requirements */}
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]">
                <DollarSign className="w-5 h-5" />
                Compensación y Requisitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin" className="text-[#003366]">
                    Salario Mínimo (MXN/mes)
                  </Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="15,000"
                    className="h-12 rounded-2xl"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryMax" className="text-[#003366]">
                    Salario Máximo (MXN/mes)
                  </Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="25,000"
                    className="h-12 rounded-2xl"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-[#003366]">
                    Nivel de Experiencia *
                  </Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger id="experience" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Sin experiencia / Entry Level</SelectItem>
                      <SelectItem value="junior">Junior (1-2 años)</SelectItem>
                      <SelectItem value="mid">Intermedio (3-5 años)</SelectItem>
                      <SelectItem value="senior">Senior (5+ años)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education" className="text-[#003366] flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Nivel Educativo *
                  </Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                    <SelectTrigger id="education" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante Activo</SelectItem>
                      <SelectItem value="bachelors">Licenciatura</SelectItem>
                      <SelectItem value="masters">Maestría</SelectItem>
                      <SelectItem value="phd">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]">
                <FileText className="w-5 h-5" />
                Descripción del Puesto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#003366]">
                  Descripción General *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe el puesto, el equipo de trabajo y lo que el candidato hará día a día..."
                  className="min-h-32 rounded-2xl resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities" className="text-[#003366]">
                  Responsabilidades Principales
                </Label>
                <Textarea
                  id="responsibilities"
                  placeholder="Lista las principales responsabilidades del puesto..."
                  className="min-h-32 rounded-2xl resize-none"
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-[#003366]">
                  Requisitos *
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Lista los requisitos indispensables para el puesto..."
                  className="min-h-32 rounded-2xl resize-none"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits" className="text-[#003366]">
                  Beneficios y Prestaciones
                </Label>
                <Textarea
                  id="benefits"
                  placeholder="Describe los beneficios que ofreces (seguro médico, días de vacaciones, horario flexible, etc.)"
                  className="min-h-24 rounded-2xl resize-none"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange("benefits", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="rounded-3xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003366]">
                <Sparkles className="w-5 h-5" />
                Habilidades Requeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-[#003366]">
                  Agregar Habilidades
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="ej. React, TypeScript, Figma..."
                    className="h-12 rounded-2xl"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    className="h-12 px-6 rounded-2xl bg-[#003366] hover:bg-[#003366]/90 text-white"
                  >
                    Agregar
                  </Button>
                </div>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-4 py-2 rounded-full bg-[#28a745]/10 text-[#28a745] hover:bg-[#28a745]/20 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <span className="ml-2 text-xs">×</span>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500">
                Haz clic en una habilidad para eliminarla
              </p>
            </CardContent>
          </Card>

          {/* Save Notice */}
          <Card className="rounded-3xl border-2 bg-gradient-to-br from-[#003366]/5 to-[#28a745]/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#003366]">Cambios en Vacante Activa</h3>
                  <p className="text-sm text-gray-600">
                    Los cambios se aplicarán inmediatamente y la vacante se re-evaluará con nuestro sistema de matching IA para encontrar nuevos candidatos compatibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-full border-2 border-gray-300"
              onClick={() => navigate(`/employer/vacancy/${vacancyId}`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-12 rounded-full bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
