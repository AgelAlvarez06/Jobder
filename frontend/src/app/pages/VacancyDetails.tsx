import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Building2, GraduationCap, Users, Eye, Heart, TrendingUp, Calendar, Edit, Trash2, PauseCircle, PlayCircle, Share2, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

export default function VacancyDetails() {
  const { vacancyId } = useParams();
  const navigate = useNavigate();

  // Mock data - in a real app, this would be fetched based on vacancyId
  const vacancy = {
    id: vacancyId,
    position: "Desarrollador Frontend Junior",
    company: "TechCorp Guadalajara",
    status: "active",
    location: "Zapopan, Jalisco",
    jobType: "Tiempo Completo",
    workMode: "Híbrido",
    salaryRange: "$15,000 - $25,000 MXN/mes",
    experience: "Junior (1-2 años)",
    education: "Licenciatura en curso o completa",
    industry: "Tecnología",
    posted: "Hace 3 días",
    expiresIn: "27 días",
    description: "Buscamos un Desarrollador Frontend Junior apasionado por crear experiencias web excepcionales. Te unirás a un equipo dinámico trabajando en proyectos innovadores para clientes nacionales e internacionales. Esta es una excelente oportunidad para crecer profesionalmente en un ambiente colaborativo.",
    responsibilities: [
      "Desarrollar interfaces de usuario responsive utilizando React y TypeScript",
      "Colaborar con diseñadores UX/UI para implementar diseños pixel-perfect",
      "Optimizar aplicaciones para máxima velocidad y escalabilidad",
      "Participar en code reviews y contribuir a las mejores prácticas del equipo",
      "Mantener y mejorar el código existente"
    ],
    requirements: [
      "Estudiante activo o egresado de Ingeniería en Computación, Sistemas o afín",
      "Conocimiento sólido de HTML5, CSS3 y JavaScript",
      "Experiencia básica con React y frameworks modernos",
      "Familiaridad con Git y control de versiones",
      "Inglés nivel intermedio (lectura de documentación técnica)"
    ],
    benefits: [
      "Seguro de gastos médicos mayores",
      "Vales de despensa",
      "15 días de vacaciones + días extras",
      "Horario flexible",
      "2 días de home office por semana",
      "Capacitación continua",
      "Ambiente de trabajo dinámico"
    ],
    skills: ["React", "TypeScript", "HTML/CSS", "JavaScript", "Git", "Responsive Design"],
    stats: {
      applicants: 45,
      matches: 12,
      views: 234,
      conversionRate: 27
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: {
        badge: "bg-[#28a745] text-white",
        label: "Activa",
        action: { icon: PauseCircle, label: "Pausar", color: "bg-[#fd7e14]" }
      },
      paused: {
        badge: "bg-[#fd7e14] text-white",
        label: "Pausada",
        action: { icon: PlayCircle, label: "Activar", color: "bg-[#28a745]" }
      },
      closed: {
        badge: "bg-gray-400 text-white",
        label: "Cerrada",
        action: { icon: PlayCircle, label: "Reactivar", color: "bg-[#28a745]" }
      }
    };
    return configs[status as keyof typeof configs] || configs.active;
  };

  const statusConfig = getStatusConfig(vacancy.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
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
                  <h1 className="text-xl font-bold text-[#003366]">{vacancy.position}</h1>
                  <p className="text-sm text-gray-600">{vacancy.company}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full border-2">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
              <Link to={`/employer/vacancy/${vacancyId}/edit`}>
                <Button variant="outline" className="rounded-full border-2">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button className={`rounded-full ${statusConfig.action.color} hover:opacity-90 text-white`}>
                <statusConfig.action.icon className="w-4 h-4 mr-2" />
                {statusConfig.action.label}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-[#003366]">Rendimiento de la Vacante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-2xl bg-[#003366]/5">
                    <Eye className="w-6 h-6 text-[#003366] mx-auto mb-2" />
                    <div className="text-3xl font-bold text-[#003366]">{vacancy.stats.views}</div>
                    <div className="text-sm text-gray-600">Vistas</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#28a745]/5">
                    <Users className="w-6 h-6 text-[#28a745] mx-auto mb-2" />
                    <div className="text-3xl font-bold text-[#28a745]">{vacancy.stats.applicants}</div>
                    <div className="text-sm text-gray-600">Aplicantes</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#fd7e14]/5">
                    <Heart className="w-6 h-6 text-[#fd7e14] mx-auto mb-2" />
                    <div className="text-3xl font-bold text-[#fd7e14]">{vacancy.stats.matches}</div>
                    <div className="text-sm text-gray-600">Matches</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#003366]/5">
                    <TrendingUp className="w-6 h-6 text-[#003366] mx-auto mb-2" />
                    <div className="text-3xl font-bold text-[#003366]">{vacancy.stats.conversionRate}%</div>
                    <div className="text-sm text-gray-600">Conversión</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={`/employer/vacancy/${vacancyId}/candidates`}>
                    <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#003366] to-[#28a745] hover:opacity-90 text-white">
                      <Users className="w-5 h-5 mr-2" />
                      Ver Todos los Candidatos ({vacancy.stats.applicants})
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-[#003366]">Descripción del Puesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-700 leading-relaxed">{vacancy.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-[#003366] mb-3">Responsabilidades</h3>
                  <ul className="space-y-2">
                    {vacancy.responsibilities.map((item, index) => (
                      <li key={index} className="flex gap-3 text-gray-700">
                        <span className="text-[#28a745] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-[#003366] mb-3">Requisitos</h3>
                  <ul className="space-y-2">
                    {vacancy.requirements.map((item, index) => (
                      <li key={index} className="flex gap-3 text-gray-700">
                        <span className="text-[#003366] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-[#003366] mb-3">Beneficios y Prestaciones</h3>
                  <ul className="space-y-2">
                    {vacancy.benefits.map((item, index) => (
                      <li key={index} className="flex gap-3 text-gray-700">
                        <span className="text-[#fd7e14] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="rounded-3xl border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Estado</span>
                  <Badge className={`rounded-full ${statusConfig.badge}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Publicada {vacancy.posted}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Expira en {vacancy.expiresIn}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-[#003366]">Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#003366] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Ubicación</div>
                      <div className="text-[#003366]">{vacancy.location}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#003366] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Tipo de Empleo</div>
                      <div className="text-[#003366]">{vacancy.jobType}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[#003366] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Modalidad</div>
                      <div className="text-[#003366]">{vacancy.workMode}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-[#003366] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Salario</div>
                      <div className="text-[#003366]">{vacancy.salaryRange}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-[#003366] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Experiencia</div>
                      <div className="text-[#003366]">{vacancy.experience}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-[#003366] mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-600">Educación</div>
                      <div className="text-[#003366]">{vacancy.education}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="rounded-3xl border-2">
              <CardHeader>
                <CardTitle className="text-[#003366]">Habilidades Requeridas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {vacancy.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="px-4 py-2 rounded-full bg-[#28a745]/10 text-[#28a745]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="rounded-3xl border-2 bg-red-50/50">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-[#003366] mb-4">Acciones Avanzadas</h3>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-2 justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Candidatos
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Vacante
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
