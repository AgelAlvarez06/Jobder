import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router";
import { Send, ArrowLeft, Sparkles, MoreVertical } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../lib/auth-context";
import { mensajes, matches as matchesApi, type MensajeOut, type MatchOut } from "../../lib/api";
import { toast } from "sonner";

export default function ChatInterface() {
  const { matchId } = useParams();
  const { userId, rol } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MensajeOut[]>([]);
  const [match, setMatch] = useState<MatchOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const matchIdNum = matchId ? parseInt(matchId) : NaN;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!matchIdNum || isNaN(matchIdNum)) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [matchData, msgs] = await Promise.all([
          matchesApi.get(matchIdNum),
          mensajes.list(matchIdNum),
        ]);
        setMatch(matchData);
        setMessages(msgs);
      } catch {
        toast.error("Error al cargar la conversación");
      } finally {
        setLoading(false);
      }
    }

    load();

    pollRef.current = setInterval(async () => {
      try {
        const msgs = await mensajes.list(matchIdNum);
        setMessages(msgs);
      } catch {
        // polling failure is silent
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [matchIdNum]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || message;
    if (!messageContent.trim() || sending) return;

    setSending(true);
    try {
      const newMsg = await mensajes.send(matchIdNum, messageContent);
      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
    } catch {
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  const backPath = rol === "reclutador" ? "/employer" : "/student";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-[#28a745] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex flex-col">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link to={backPath}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 rounded-2xl">
                  <AvatarFallback className="rounded-2xl bg-[#003366] text-white">M{matchIdNum}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg text-[#003366]">Match #{matchIdNum}</h2>
                  <p className="text-sm text-gray-600">Conversación activa</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full text-[#003366]">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-8 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#28a745] to-[#fd7e14] flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#003366] mb-2">¡Match Confirmado!</h3>
            <p className="text-gray-600 text-center max-w-md">
              ¡Comienza la conversación!
            </p>
          </div>

          <div className="space-y-4 mb-4">
            <AnimatePresence>
              {messages.map((msg) => {
                const isMe = msg.id_remitente === userId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>
                      {!isMe && (
                        <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
                          <AvatarFallback className="rounded-xl bg-[#003366] text-white">
                            {msg.id_remitente}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="space-y-1">
                        <Card
                          className={`rounded-3xl border-0 ${
                            isMe
                              ? "bg-gradient-to-r from-[#003366] to-[#28a745]"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <CardContent className="p-4">
                            <p className={`leading-relaxed ${isMe ? "text-white" : "text-gray-800"}`}>
                              {msg.contenido}
                            </p>
                          </CardContent>
                        </Card>
                        <p className={`text-xs text-gray-500 px-4 ${isMe ? "text-right" : ""}`}>
                          {new Date(msg.fecha_envio).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {isMe && (
                        <div className="w-10 h-10 rounded-xl bg-[#003366] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">Tú</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {messages.length === 0 && (
              <p className="text-center text-gray-400 py-8">No hay mensajes aún. ¡Sé el primero en escribir!</p>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
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
                disabled={!message.trim() || sending}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Presiona Enter para enviar
          </p>
        </div>
      </div>
    </div>
  );
}
