import { useState } from "react";
import { Link } from "react-router";
import { Heart, X, Sparkles, MapPin, DollarSign, Briefcase, Clock, Award, MessageCircle, User, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

interface Job {
  id: number;
  company: string;
  logo: string;
  position: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
  matchScore: number;
}

export default function StudentDashboard() {
  const [profileCompletion, setProfileCompletion] = useState(75);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [matches, setMatches] = useState<Job[]>([]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);

  const jobs: Job[] = [
    {
      id: 1,
      company: "TechNova Solutions",
      logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&h=200&fit=crop",
      position: "Desarrollador Frontend Junior",
      location: "Zapopan, Jalisco",
      salary: "$18,000 - $25,000 MXN",
      type: "Tiempo Completo",
      description: "Buscamos un desarrollador frontend apasionado para unirse a nuestro equipo de innovación digital.",
      requirements: ["React", "TypeScript", "Tailwind CSS", "Git"],
      benefits: ["Trabajo híbrido", "Seguro médico", "Capacitaciones", "Bonos trimestrales"],
      matchScore: 92
    },
    {
      id: 2,
      company: "Digital Marketing Lab",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
      position: "Especialista en Marketing Digital",
      location: "Guadalajara Centro",
      salary: "$15,000 - $20,000 MXN",
      type: "Tiempo Completo",
      description: "Únete a nuestro equipo creativo y ayuda a marcas a crecer en el mundo digital.",
      requirements: ["SEO/SEM", "Google Analytics", "Redes Sociales", "Copywriting"],
      benefits: ["Trabajo remoto", "Horario flexible", "Equipamiento", "Días libres"],
      matchScore: 88
    },
    {
      id: 3,
      company: "FinTech Innovators",
      logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=200&fit=crop",
      position: "Analista de Datos Junior",
      location: "Zapopan, Jalisco",
      salary: "$20,000 - $28,000 MXN",
      type: "Tiempo Completo",
      description: "Buscamos analista de datos para impulsar decisiones basadas en información.",
      requirements: ["Python", "SQL", "Excel Avanzado", "Power BI"],
      benefits: ["Crecimiento acelerado", "Seguro médico", "Vales de despensa", "Home office"],
      matchScore: 85
    },
    {
      id: 4,
      company: "Creative Studio GDL",
      logo: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop",
      position: "Diseñador UX/UI",
      location: "Tlaquepaque, Jalisco",
      salary: "$16,000 - $23,000 MXN",
      type: "Tiempo Completo",
      description: "Diseña experiencias digitales excepcionales para clientes nacionales e internacionales.",
      requirements: ["Figma", "Adobe XD", "Diseño responsive", "Prototipado"],
      benefits: ["Ambiente creativo", "MacBook Pro", "Capacitación continua", "Viernes casual"],
      matchScore: 90
    }
  ];

  const currentJob = jobs[currentJobIndex];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    
    setTimeout(() => {
      if (direction === "right" && currentJob) {
        // Simulate match (80% chance)
        if (Math.random() > 0.2) {
          setMatches([...matches, currentJob]);
          setShowMatchNotification(true);
          setTimeout(() => setShowMatchNotification(false), 3000);
        }
      }
      
      if (currentJobIndex < jobs.length - 1) {
        setCurrentJobIndex(currentJobIndex + 1);
      }
      setSwipeDirection(null);
    }, 300);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[600px] text-center space-y-6">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003366]/10 to-[#28a745]/10 flex items-center justify-center">
        <Sparkles className="w-16 h-16 text-[#28a745]" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-[#003366]">¡Has visto todas las vacantes!</h3>
        <p className="text-gray-600 max-w-md">
          Vuelve mañana para ver nuevas oportunidades o completa tu perfil para obtener mejores matches.
        </p>
      </div>
      <Link to="/profile-setup">
        <Button className="rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white">
          Mejorar Mi Perfil
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#003366]">JOBDER</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/profile-setup">
                <Button variant="ghost" className="rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
                </Button>
              </Link>
              <Button variant="ghost" className="rounded-full text-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Completion */}
          <div className="space-y-6">
            {/* Profile Completion Card */}
            <Card className="rounded-3xl border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#003366]">Completar Perfil</h3>
                  <Badge className="rounded-full bg-[#28a745] text-white">{profileCompletion}%</Badge>
                </div>
                
                <Progress value={profileCompletion} className="h-3" />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-[#28a745]">
                    <div className="w-5 h-5 rounded-full bg-[#28a745] flex items-center justify-center text-white">✓</div>
                    <span>Información básica</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#28a745]">
                    <div className="w-5 h-5 rounded-full bg-[#28a745] flex items-center justify-center text-white">✓</div>
                    <span>CV cargado</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#28a745]">
                    <div className="w-5 h-5 rounded-full bg-[#28a745] flex items-center justify-center text-white">✓</div>
                    <span>Intereses seleccionados</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span>Certificaciones agregadas</span>
                  </div>
                </div>

                <Link to="/profile-setup">
                  <Button className="w-full rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white">
                    Completar Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Matches Card */}
            <Card className="rounded-3xl border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#003366]">Mis Matches</h3>
                  <Badge className="rounded-full bg-[#28a745] text-white">{matches.length}</Badge>
                </div>

                {matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <Link key={match.id} to={`/chat/${match.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
                          <img src={match.logo} alt={match.company} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#003366] truncate">{match.company}</div>
                            <div className="text-xs text-gray-500 truncate">{match.position}</div>
                          </div>
                          <MessageCircle className="w-5 h-5 text-[#28a745]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Aún no tienes matches</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="rounded-3xl border-2 bg-gradient-to-br from-[#003366] to-[#28a745]">
              <CardContent className="p-6 space-y-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Vistas esta semana</span>
                  <span className="text-2xl font-bold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Perfil destacado</span>
                  <Award className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Job Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-[#003366] mb-2">Descubre Oportunidades</h2>
              <p className="text-gray-600">Desliza para encontrar tu match perfecto</p>
            </div>

            <div className="relative">
              {currentJobIndex < jobs.length ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentJob.id}
                    initial={{ scale: 0.9, opacity: 0, rotateY: -10 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{
                      x: swipeDirection === "right" ? 1000 : -1000,
                      opacity: 0,
                      rotate: swipeDirection === "right" ? 20 : -20,
                      transition: { duration: 0.3 }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Card className="rounded-3xl border-2 shadow-2xl overflow-hidden">
                      {/* Match Score Badge */}
                      <div className="absolute top-6 right-6 z-10">
                        <div className="px-4 py-2 rounded-full bg-[#28a745] text-white font-semibold shadow-lg">
                          {currentJob.matchScore}% Match
                        </div>
                      </div>

                      {/* Company Image Header */}
                      <div className="h-48 bg-gradient-to-br from-[#003366] to-[#28a745] relative">
                        <img
                          src={currentJob.logo}
                          alt={currentJob.company}
                          className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute bottom-6 left-6">
                          <img
                            src={currentJob.logo}
                            alt={currentJob.company}
                            className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg"
                          />
                        </div>
                      </div>

                      <CardContent className="p-8 space-y-6">
                        {/* Job Title & Company */}
                        <div>
                          <h3 className="text-2xl font-bold text-[#003366] mb-1">{currentJob.position}</h3>
                          <p className="text-lg text-gray-600">{currentJob.company}</p>
                        </div>

                        {/* Job Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-[#003366]" />
                            <span className="text-sm">{currentJob.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-5 h-5 text-[#28a745]" />
                            <span className="text-sm">{currentJob.salary}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-5 h-5 text-[#003366]" />
                            <span className="text-sm">{currentJob.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-5 h-5 text-[#003366]" />
                            <span className="text-sm">Junior Level</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="font-semibold text-[#003366] mb-2">Descripción</h4>
                          <p className="text-gray-600 leading-relaxed">{currentJob.description}</p>
                        </div>

                        {/* Requirements */}
                        <div>
                          <h4 className="font-semibold text-[#003366] mb-3">Requisitos</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentJob.requirements.map((req, index) => (
                              <Badge key={index} className="rounded-full bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Benefits */}
                        <div>
                          <h4 className="font-semibold text-[#003366] mb-3">Beneficios</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentJob.benefits.map((benefit, index) => (
                              <Badge key={index} className="rounded-full bg-[#28a745]/10 text-[#28a745] hover:bg-[#28a745]/20">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleSwipe("left")}
                            className="flex-1 h-16 rounded-full border-2 border-gray-300 hover:border-[#fd7e14] hover:bg-[#fd7e14]/10 hover:text-[#fd7e14] transition-all"
                          >
                            <X className="w-6 h-6 mr-2" />
                            Pasar
                          </Button>
                          <Button
                            size="lg"
                            onClick={() => handleSwipe("right")}
                            className="flex-1 h-16 rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white shadow-lg shadow-[#28a745]/30"
                          >
                            <Heart className="w-6 h-6 mr-2" />
                            Me Interesa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <Card className="rounded-3xl border-2">
                  <CardContent className="p-8">
                    <EmptyState />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Progress Indicator */}
            {currentJobIndex < jobs.length && (
              <div className="flex justify-center gap-2">
                {jobs.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentJobIndex
                        ? "w-8 bg-[#28a745]"
                        : index < currentJobIndex
                        ? "w-2 bg-gray-300"
                        : "w-2 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Notification Overlay */}
      <AnimatePresence>
        {showMatchNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="max-w-md mx-4"
            >
              <Card className="rounded-3xl border-4 border-[#28a745] bg-gradient-to-br from-[#003366] to-[#28a745] shadow-2xl">
                <CardContent className="p-12 text-center space-y-6">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <Sparkles className="w-20 h-20 text-[#fd7e14] mx-auto" />
                  </motion.div>
                  <h2 className="text-4xl font-bold text-white">¡Es un Match!</h2>
                  <p className="text-xl text-white/90">
                    {currentJob?.company} también está interesada en ti
                  </p>
                  <Link to={`/chat/${currentJob?.id}`}>
                    <Button size="lg" className="rounded-full bg-[#fd7e14] hover:bg-[#fd7e14]/90 text-white shadow-xl">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Enviar Mensaje
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}