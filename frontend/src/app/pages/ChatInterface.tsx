import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  auth as authApi,
  matches as matchesApi,
  mensajes,
  Mensaje,
  MatchEntry,
  getErrorMessage,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";

const POLL_INTERVAL_MS = (() => {
  const raw = Number(import.meta.env.VITE_CHAT_POLL_MS);
  return Number.isFinite(raw) && raw >= 1000 ? raw : 4000;
})();

function formatTime(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ChatInterface() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { rol } = useAuth();

  const [match, setMatch] = useState<MatchEntry | null>(null);
  const [items, setItems] = useState<Mensaje[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<number | null>(null);

  const lastIdRef = useRef<number>(0);
  const pollTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Resolve match metadata + the current user's id so we can render bubbles.
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    (async () => {
      try {
        const [list, me] = await Promise.all([matchesApi.list(), authApi.me()]);
        if (cancelled) return;
        setMeId(me.id);
        const found = list.find((m) => String(m.id) === String(matchId)) || null;
        if (!found) {
          toast.error("Match no encontrado o no autorizado");
          navigate(rol === "reclutador" ? "/employer" : "/student");
          return;
        }
        setMatch(found);
      } catch (e: unknown) {
        if (!cancelled) toast.error(getErrorMessage(e, "Error cargando el match"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId, navigate, rol]);

  // Initial load + start polling.
  useEffect(() => {
    if (!matchId) return;

    const fetchOnce = async () => {
      if (inFlightRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      inFlightRef.current = true;
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const after = lastIdRef.current || undefined;
        const incoming = await mensajes.list(matchId, after, ctrl.signal);
        if (incoming.length > 0) {
          setItems((prev) => {
            // Drop duplicates defensively (sender already echoed).
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of incoming) {
              if (!seen.has(m.id)) merged.push(m);
            }
            const maxId = merged.reduce((acc, m) => (m.id > acc ? m.id : acc), 0);
            lastIdRef.current = maxId;
            return merged;
          });
          // Best-effort mark-as-read; ignore failures.
          mensajes.markRead(matchId).catch(() => undefined);
        }
      } catch (e: unknown) {
        if ((e as { name?: string })?.name !== "AbortError") {
          // Silent during polling — only surface during initial load.
          if (loading) toast.error(getErrorMessage(e, "Error cargando mensajes"));
        }
      } finally {
        inFlightRef.current = false;
        if (loading) setLoading(false);
      }
    };

    // Reset state when match changes.
    setItems([]);
    lastIdRef.current = 0;
    setLoading(true);

    fetchOnce();
    const tick = () => {
      fetchOnce();
    };
    pollTimerRef.current = window.setInterval(tick, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (!document.hidden) fetchOnce();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      abortRef.current?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items]);

  const otherName = useMemo(() => {
    if (!match) return "Match";
    if (rol === "candidato") return match.reclutador?.nombre_compania || "Empresa";
    return match.candidato?.nombre || "Candidato";
  }, [match, rol]);

  const subtitle = match?.vacante.titulo || "";

  const otherInitials = useMemo(() => {
    return otherName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [otherName]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !matchId || sending) return;
    setSending(true);
    try {
      const created = await mensajes.send(matchId, text);
      setMeId(created.id_remitente);
      setItems((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        const next = [...prev, created];
        lastIdRef.current = Math.max(lastIdRef.current, created.id);
        return next;
      });
      setDraft("");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "No se pudo enviar el mensaje"));
    } finally {
      setSending(false);
    }
  };

  const backHref = rol === "reclutador" ? "/employer" : "/student";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex flex-col">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link to={backHref}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 rounded-2xl">
                  <AvatarFallback className="rounded-2xl bg-[#003366] text-white">
                    {otherInitials || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg text-[#003366]">{otherName}</h2>
                  {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#28a745] to-[#fd7e14] flex items-center justify-center mb-3 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[#003366]">¡Match Confirmado!</h3>
            <p className="text-gray-600 text-center max-w-md text-sm">
              Tú y {otherName} se interesaron mutuamente. Comienza la conversación.
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {loading && items.length === 0 ? (
              <p className="text-center text-sm text-gray-500">Cargando mensajes…</p>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                Aún no hay mensajes. Envía el primero para iniciar la conversación.
              </p>
            ) : null}

            <AnimatePresence initial={false}>
              {items.map((msg) => {
                const mine = meId != null && msg.id_remitente === meId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[75%] ${mine ? "flex-row-reverse" : ""}`}>
                      {!mine && (
                        <Avatar className="w-9 h-9 rounded-xl flex-shrink-0">
                          <AvatarFallback className="rounded-xl bg-[#003366] text-white text-xs">
                            {otherInitials || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="space-y-1">
                        <Card
                          className={`rounded-3xl border-0 ${
                            mine
                              ? "bg-gradient-to-r from-[#003366] to-[#28a745]"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <CardContent className="p-3 px-4">
                            <p
                              className={`leading-relaxed whitespace-pre-line ${
                                mine ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {msg.contenido}
                            </p>
                          </CardContent>
                        </Card>
                        <p className={`text-xs text-gray-500 px-3 ${mine ? "text-right" : ""}`}>
                          {formatTime(msg.fecha_envio)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Escribe tu mensaje…"
                className="h-14 rounded-full pr-14 border-2 border-gray-200 focus:border-[#003366]"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sending}
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white h-12 w-12"
                onClick={handleSend}
                disabled={!draft.trim() || sending}
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
