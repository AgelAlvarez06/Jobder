const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") as string;
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

export const TOKEN_STORAGE_KEY = "jobder.token";
export const ROL_STORAGE_KEY = "jobder.rol";

export type Rol = "candidato" | "reclutador";

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown, message?: string) {
    super(message || `HTTP ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export function getErrorMessage(e: unknown, fallback = "Error inesperado"): string {
  if (e instanceof ApiError) {
    const d = e.detail as { detail?: unknown } | string | undefined;
    if (typeof d === "string") return d;
    if (d && typeof d === "object" && "detail" in d) {
      const inner = (d as { detail: unknown }).detail;
      if (typeof inner === "string") return inner;
      if (Array.isArray(inner) && inner.length && typeof inner[0] === "object") {
        const msg = (inner[0] as { msg?: string }).msg;
        if (msg) return msg;
      }
    }
    return e.message || fallback;
  }
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

interface RequestOpts {
  method?: string;
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
  auth?: boolean;
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const url = new URL(API_BASE + path);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: opts.method || (body ? "POST" : "GET"),
      headers,
      body,
      signal: opts.signal,
    });
  } catch (e: unknown) {
    if ((e as { name?: string })?.name === "AbortError") throw e;
    throw new ApiError(0, null, "Network error");
  }

  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") || "";
  const payload: unknown = ct.includes("application/json") ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    throw new ApiError(res.status, payload);
  }
  return payload as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VacanteStructuredData {
  ubicacion?: string;
  modalidad?: string;
  salario_min?: number;
  salario_max?: number;
  [k: string]: unknown;
}

export interface Vacante {
  id: number;
  id_reclutador?: number;
  titulo: string;
  job_raw_text?: string | null;
  structured_data?: VacanteStructuredData | null;
  job_text?: string;
  embedding_model?: string | null;
  score?: number;
}

export interface CandidatoStructuredData {
  [k: string]: unknown;
}

export interface Candidato {
  id: number;
  id_usuario?: number;
  nombre?: string | null;
  telefono?: string | null;
  ubicacion?: string | null;
  carrera?: string | null;
  habilidades?: string[] | null;
  idiomas?: string[] | null;
  descripcion?: string | null;
  structured_data?: CandidatoStructuredData | null;
  cv_raw_text?: string | null;
  profile_text?: string;
  score?: number;
}

export interface MensajePreview {
  id: number;
  id_remitente: number;
  contenido: string | null;
  fecha_envio: string | null;
}

export interface MatchEntry {
  id: number;
  vacante: { id: number; titulo: string };
  reclutador?: { id: number; nombre_compania: string };
  candidato?: { id: number; nombre?: string | null; carrera?: string | null };
  fecha_match: string | null;
  last_message: MensajePreview | null;
  unread_count: number;
}

export interface Mensaje {
  id: number;
  id_match: number;
  id_remitente: number;
  contenido: string | null;
  fecha_envio: string | null;
  read_at: string | null;
}

export interface SwipeResult {
  status: string;
  interaccion_id: number;
  match: boolean;
  match_id: number | null;
}

export interface AuthMe {
  id: number;
  email: string;
  rol: Rol;
  oauth_provider: string | null;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const auth = {
  loginUrl(rol: Rol): string {
    return `${API_BASE}/auth/google/login?rol=${encodeURIComponent(rol)}`;
  },
  me(): Promise<AuthMe> {
    return request<AuthMe>("/auth/me");
  },
};

export const candidatos = {
  me(): Promise<Candidato> {
    return request<Candidato>("/candidatos/me");
  },
  updateMe(fd: FormData): Promise<Candidato> {
    return request<Candidato>("/candidatos/me", { method: "PATCH", formData: fd });
  },
};

export const vacantes = {
  list(): Promise<Vacante[]> {
    return request<Vacante[]>("/vacantes/");
  },
  create(fd: FormData): Promise<Vacante> {
    return request<Vacante>("/vacantes/", { method: "POST", formData: fd });
  },
  get(id: string | number): Promise<Vacante> {
    return request<Vacante>(`/vacantes/${id}`);
  },
  update(id: string | number, fd: FormData): Promise<Vacante> {
    return request<Vacante>(`/vacantes/${id}`, { method: "PATCH", formData: fd });
  },
  remove(id: string | number): Promise<{ status: string; id: number }> {
    return request<{ status: string; id: number }>(`/vacantes/${id}`, { method: "DELETE" });
  },
  candidatos(id: string | number): Promise<Candidato[]> {
    return request<Candidato[]>(`/vacantes/${id}/candidatos`);
  },
};

export const feed = {
  vacantes(): Promise<Vacante[]> {
    return request<Vacante[]>("/feed/vacantes");
  },
};

export const interacciones = {
  candidatoSwipe(vacanteId: number, accion: "liked" | "disliked"): Promise<SwipeResult> {
    return request<SwipeResult>("/interacciones/", {
      method: "POST",
      body: { vacante_id: vacanteId, accion },
    });
  },
  reclutadorSwipe(
    vacanteId: number,
    candidatoId: number,
    accion: "liked" | "disliked"
  ): Promise<SwipeResult> {
    return request<SwipeResult>("/interacciones/", {
      method: "POST",
      body: { vacante_id: vacanteId, candidato_id: candidatoId, accion },
    });
  },
};

export const matches = {
  list(): Promise<MatchEntry[]> {
    return request<MatchEntry[]>("/matches/");
  },
};

export const mensajes = {
  list(matchId: string | number, afterId?: number, signal?: AbortSignal): Promise<Mensaje[]> {
    return request<Mensaje[]>(`/matches/${matchId}/mensajes`, {
      query: { after_id: afterId },
      signal,
    });
  },
  send(matchId: string | number, contenido: string): Promise<Mensaje> {
    return request<Mensaje>(`/matches/${matchId}/mensajes`, {
      method: "POST",
      body: { contenido },
    });
  },
  markRead(matchId: string | number): Promise<{ status: string; marked: number }> {
    return request<{ status: string; marked: number }>(
      `/matches/${matchId}/mensajes/read`,
      { method: "POST" }
    );
  },
};
