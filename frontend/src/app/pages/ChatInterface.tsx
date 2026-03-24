import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router";
import { Send, ArrowLeft, Sparkles, Phone, Video, MoreVertical, Paperclip } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: number;
  sender: "user" | "other";
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const { matchId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "other",
      content: "¡Hola! Vi tu perfil y me impresionó tu experiencia con React. ¿Tienes disponibilidad para una entrevista?",
      timestamp: "10:30 AM"
    }
  ]);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const matchInfo = {
    name: "TechNova Solutions",
    position: "Desarrollador Frontend Junior",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&h=200&fit=crop",
    status: "online"
  };

  const aiSuggestions = [
    "¡Hola! Gracias por tu interés. Sí, tengo disponibilidad inmediata. Me encantaría conocer más sobre la posición y el equipo.",
    "Hola, ¡qué emoción! He revisado su empresa y me parece muy alineada con mis objetivos. ¿Podríamos agendar una videollamada?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content?: string) => {
    const messageContent = content || message;
    if (messageContent.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "user",
        content: messageContent,
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      setShowAISuggestions(false);

      // Simulate response after 2 seconds
      setTimeout(() => {
        const responses = [
          "Perfecto, ¿qué tal mañana a las 3 PM para una videollamada inicial?",
          "Excelente, te enviaré el enlace de la reunión por correo. ¿Tu email es el del perfil?",
          "Me parece genial tu actitud. Cuéntame más sobre tu experiencia con TypeScript."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage: Message = {
          id: messages.length + 2,
          sender: "other",
          content: randomResponse,
          timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex flex-col">
      {/* Chat Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link to="/student">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-14 h-14 rounded-2xl">
                    <AvatarImage src={matchInfo.logo} />
                    <AvatarFallback className="rounded-2xl bg-[#003366] text-white">TN</AvatarFallback>
                  </Avatar>
                  {matchInfo.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#28a745] border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-lg text-[#003366]">{matchInfo.name}</h2>
                  <p className="text-sm text-gray-600">{matchInfo.position}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-[#003366]">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-[#003366]">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-[#003366]">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Match Celebration */}
          <div className="flex flex-col items-center justify-center py-8 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#28a745] to-[#fd7e14] flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#003366] mb-2">¡Match Confirmado!</h3>
            <p className="text-gray-600 text-center max-w-md">
              Tú y {matchInfo.name} han mostrado interés mutuo. ¡Comienza la conversación!
            </p>
            <Badge className="mt-4 rounded-full bg-[#28a745]/10 text-[#28a745] px-4 py-2">
              95% de compatibilidad
            </Badge>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[70%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.sender === "other" && (
                      <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
                        <AvatarImage src={matchInfo.logo} />
                        <AvatarFallback className="rounded-xl bg-[#003366] text-white">TN</AvatarFallback>
                      </Avatar>
                    )}

                    <div className="space-y-1">
                      <Card
                        className={`rounded-3xl border-0 ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-[#003366] to-[#28a745]"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <CardContent className="p-4">
                          <p
                            className={`leading-relaxed ${
                              msg.sender === "user" ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {msg.content}
                          </p>
                        </CardContent>
                      </Card>
                      <p
                        className={`text-xs text-gray-500 px-4 ${
                          msg.sender === "user" ? "text-right" : ""
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>

                    {msg.sender === "user" && (
                      <div className="w-10 h-10 rounded-xl bg-[#003366] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">Tú</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* AI Suggestions */}
          <AnimatePresence>
            {showAISuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <Card className="rounded-3xl bg-gradient-to-r from-[#fd7e14]/10 to-[#28a745]/10 border-2 border-[#fd7e14]/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fd7e14] to-[#28a745] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#003366] mb-1">Sugerencias de IA</h4>
                        <p className="text-sm text-gray-600">
                          Mensajes profesionales sugeridos para romper el hielo
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setShowAISuggestions(false)}
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className="rounded-2xl border-2 border-gray-200 hover:border-[#28a745] hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleUseSuggestion(suggestion)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-gray-700 flex-1">{suggestion}</p>
                                <Button
                                  size="sm"
                                  className="rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white flex-shrink-0"
                                >
                                  Usar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Input */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-2 border-gray-200 h-14 w-14 flex-shrink-0"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </Button>

            <div className="flex-1 relative">
              <Input
                placeholder="Escribe tu mensaje..."
                className="h-14 rounded-full pr-14 border-2 border-gray-200 focus:border-[#003366]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white h-12 w-12"
                onClick={() => handleSendMessage()}
                disabled={!message.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            {!showAISuggestions && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-2 border-[#fd7e14] text-[#fd7e14] hover:bg-[#fd7e14] hover:text-white h-14 w-14 flex-shrink-0"
                onClick={() => setShowAISuggestions(true)}
              >
                <Sparkles className="w-5 h-5" />
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            Presiona Enter para enviar • Shift + Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
