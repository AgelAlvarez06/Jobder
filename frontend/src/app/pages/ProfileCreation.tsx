import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronRight, ChevronLeft, Upload, Sparkles, Check, User, FileText, Target, Award } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export default function ProfileCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    degree: "",
    university: "Universidad de Guadalajara",
    graduationYear: "",
    bio: "",
    cvFile: null as File | null,
    selectedInterests: [] as string[],
    certifications: [] as string[]
  });

  const interests = [
    "Desarrollo Frontend",
    "Desarrollo Backend",
    "Diseño UX/UI",
    "Marketing Digital",
    "Data Science",
    "Análisis de Datos",
    "Project Management",
    "Ventas",
    "Recursos Humanos",
    "Finanzas",
    "Contabilidad",
    "Ingeniería Industrial"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete profile and redirect to student dashboard
      navigate("/student");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cvFile: e.target.files[0] });
    }
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.selectedInterests.includes(interest)
      ? formData.selectedInterests.filter(i => i !== interest)
      : [...formData.selectedInterests, interest];
    setFormData({ ...formData, selectedInterests: newInterests });
  };

  const steps = [
    { number: 1, title: "Información Básica", icon: User },
    { number: 2, title: "Cargar CV", icon: FileText },
    { number: 3, title: "Intereses", icon: Target },
    { number: 4, title: "Certificaciones", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#003366] to-[#28a745]">
      <div className="min-h-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-repeat">
        
        {/* Top Navigation */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#003366]" />
                </div>
                <span className="text-xl font-bold text-white">JOBDER</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">Crear Tu Perfil</h1>
              <Badge className="rounded-full bg-white text-[#003366] px-4 py-2">
                Paso {currentStep} de {totalSteps}
              </Badge>
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center gap-2 ${
                  step.number <= currentStep ? "opacity-100" : "opacity-50"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    step.number < currentStep
                      ? "bg-[#28a745] text-white"
                      : step.number === currentStep
                      ? "bg-[#fd7e14] text-white"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check className="w-7 h-7" />
                  ) : (
                    <step.icon className="w-7 h-7" />
                  )}
                </div>
                <p className="text-xs text-white text-center font-medium">{step.title}</p>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <Card className="rounded-3xl border-4 border-white/20 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#003366] mb-2">Información Básica</h2>
                      <p className="text-gray-600">Cuéntanos sobre ti para comenzar</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input
                          id="fullName"
                          placeholder="María González Pérez"
                          className="h-12 rounded-2xl"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="maria@alumnos.udg.mx"
                          className="h-12 rounded-2xl"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          placeholder="33 1234 5678"
                          className="h-12 rounded-2xl"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          placeholder="Zapopan, Jalisco"
                          className="h-12 rounded-2xl"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="degree">Carrera</Label>
                        <Input
                          id="degree"
                          placeholder="Ingeniería en Computación"
                          className="h-12 rounded-2xl"
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Año de Graduación</Label>
                        <Input
                          id="graduationYear"
                          placeholder="2024"
                          className="h-12 rounded-2xl"
                          value={formData.graduationYear}
                          onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Sobre Ti</Label>
                      <Textarea
                        id="bio"
                        placeholder="Cuéntanos brevemente sobre tus objetivos profesionales y lo que te apasiona..."
                        className="min-h-32 rounded-2xl"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: CV Upload */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#003366] mb-2">Sube tu CV</h2>
                      <p className="text-gray-600">Comparte tu experiencia y habilidades (PDF, máx 5MB)</p>
                    </div>

                    <div className="border-4 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-[#003366] transition-colors">
                      <input
                        type="file"
                        id="cv-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="cv-upload" className="cursor-pointer">
                        <div className="space-y-4">
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                            {formData.cvFile ? (
                              <Check className="w-10 h-10 text-white" />
                            ) : (
                              <Upload className="w-10 h-10 text-white" />
                            )}
                          </div>
                          {formData.cvFile ? (
                            <div>
                              <p className="text-lg font-semibold text-[#28a745]">¡Archivo cargado!</p>
                              <p className="text-sm text-gray-600">{formData.cvFile.name}</p>
                              <Button
                                variant="outline"
                                className="mt-4 rounded-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFormData({ ...formData, cvFile: null });
                                }}
                              >
                                Cambiar archivo
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-lg font-semibold text-[#003366]">
                                Haz clic para seleccionar tu CV
                              </p>
                              <p className="text-sm text-gray-600">o arrastra y suelta aquí</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 space-y-2">
                      <h4 className="font-semibold text-[#003366]">💡 Consejos para tu CV:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Incluye tu información de contacto actualizada</li>
                        <li>Destaca tus habilidades técnicas y blandas</li>
                        <li>Menciona proyectos académicos relevantes</li>
                        <li>Incluye idiomas y certificaciones</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Interests */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#003366] mb-2">Áreas de Interés</h2>
                      <p className="text-gray-600">Selecciona las áreas profesionales que te interesan (mínimo 3)</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {interests.map((interest) => (
                        <Badge
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`cursor-pointer px-6 py-3 rounded-full text-base transition-all ${
                            formData.selectedInterests.includes(interest)
                              ? "bg-[#28a745] text-white hover:bg-[#28a745]/90"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {formData.selectedInterests.includes(interest) && (
                            <Check className="w-4 h-4 mr-2 inline" />
                          )}
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    <Card className="rounded-2xl bg-gradient-to-r from-[#003366]/10 to-[#28a745]/10 border-0">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-700">
                          <strong>Seleccionados:</strong> {formData.selectedInterests.length} de {interests.length}
                          {formData.selectedInterests.length < 3 && (
                            <span className="text-[#fd7e14] ml-2">
                              (Selecciona al menos {3 - formData.selectedInterests.length} más)
                            </span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Step 4: Certifications */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#003366] mb-2">Certificaciones y Logros</h2>
                      <p className="text-gray-600">Agrega tus certificaciones, cursos o logros (opcional)</p>
                    </div>

                    <div className="space-y-4">
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={cert}
                            readOnly
                            className="h-12 rounded-2xl"
                          />
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                              const newCerts = formData.certifications.filter((_, i) => i !== index);
                              setFormData({ ...formData, certifications: newCerts });
                            }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Input
                          id="new-cert"
                          placeholder="Ej: Google Analytics Certification"
                          className="h-12 rounded-2xl"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const input = e.currentTarget;
                              if (input.value.trim()) {
                                setFormData({
                                  ...formData,
                                  certifications: [...formData.certifications, input.value.trim()]
                                });
                                input.value = "";
                              }
                            }
                          }}
                        />
                        <Button
                          className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white"
                          onClick={() => {
                            const input = document.getElementById("new-cert") as HTMLInputElement;
                            if (input.value.trim()) {
                              setFormData({
                                ...formData,
                                certifications: [...formData.certifications, input.value.trim()]
                              });
                              input.value = "";
                            }
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-6 h-6 text-[#28a745] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-[#003366] mb-2">¡Estás casi listo!</h4>
                          <p className="text-sm text-gray-700">
                            Tu perfil está por completarse. Podrás empezar a recibir matches con empresas
                            que buscan talento como el tuyo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8 pt-8 border-t">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevious}
                    className="flex-1 h-14 rounded-full border-2 border-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Anterior
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={currentStep === 3 && formData.selectedInterests.length < 3}
                  className={`flex-1 h-14 rounded-full text-white ${
                    currentStep === totalSteps
                      ? "bg-[#28a745] hover:bg-[#28a745]/90"
                      : "bg-[#fd7e14] hover:bg-[#fd7e14]/90"
                  }`}
                >
                  {currentStep === totalSteps ? "Completar Perfil" : "Siguiente"}
                  {currentStep < totalSteps && <ChevronRight className="w-5 h-5 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
