const BASE = "/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("rol");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const body = await res.json().catch(() => ({}));
    const msg = body.detail || res.statusText;
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  rol: string;
}

export interface UsuarioOut {
  id: number;
  email: string;
  rol: string;
}

export interface CandidatoOut {
  id: number;
  id_usuario: number;
  nombre: string;
  telefono: string | null;
  ubicacion: string | null;
  carrera: string | null;
  habilidades: string | null;
  idiomas: string | null;
  descripcion: string | null;
  profile_text: string | null;
}

export interface ReclutadorOut {
  id: number;
  id_usuario: number;
  nombre: string;
  nombre_compania: string | null;
  descripcion_compania: string | null;
}

export interface VacanteOut {
  id: number;
  id_reclutador: number;
  titulo: string;
  job_text: string;
  job_raw_text: string | null;
  structured_data: Record<string, unknown> | null;
}


export interface InteraccionOut {
  id: number;
  id_candidato: number;
  id_vacante: number;
  score_similitud: number | null;
  accion: string;
  fecha_creacion: string;
}

export interface MatchOut {
  id: number;
  id_candidato: number;
  id_vacante: number;
  id_reclutador: number;
  fecha_match: string;
}

export interface MensajeOut {
  id: number;
  id_match: number;
  id_remitente: number;
  contenido: string;
  fecha_envio: string;
}

export interface RecommendationResult {
  id: number;
  titulo: string;
  job_text: string;
  score: number;
}

export const auth = {
  register: (email: string, password: string, rol: string) =>
    request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, rol }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<UsuarioOut>("/auth/me"),
};

export const candidatos = {
  create: (data: {
    nombre: string;
    profile_text: string;
    telefono?: string;
    ubicacion?: string;
    carrera?: string;
    habilidades?: string;
    idiomas?: string;
    descripcion?: string;
  }) =>
    request<CandidatoOut>("/candidatos/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<CandidatoOut>("/candidatos/me"),

  updateMe: (data: Record<string, unknown>) =>
    request<CandidatoOut>("/candidatos/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const reclutadores = {
  create: (data: {
    nombre: string;
    nombre_compania?: string;
    descripcion_compania?: string;
  }) =>
    request<ReclutadorOut>("/reclutadores/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<ReclutadorOut>("/reclutadores/me"),

  updateMe: (data: Record<string, unknown>) =>
    request<ReclutadorOut>("/reclutadores/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const vacantes = {
  list: () => request<VacanteOut[]>("/vacantes/"),

  mine: () => request<VacanteOut[]>("/vacantes/mine"),

  get: (id: number) => request<VacanteOut>(`/vacantes/${id}`),

  create: (data: {
    titulo: string;
    job_text: string;
    job_raw_text?: string;
    structured_data?: Record<string, unknown>;
  }) =>
    request<VacanteOut>("/vacantes/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Record<string, unknown>) =>
    request<VacanteOut>(`/vacantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ status: string; id: number }>(`/vacantes/${id}`, {
      method: "DELETE",
    }),

  candidates: (id: number) =>
    request<
      {
        id: number;
        nombre: string;
        carrera: string | null;
        ubicacion: string | null;
        habilidades: string | null;
        score_similitud: number | null;
        accion: string;
      }[]
    >(`/vacantes/${id}/candidates`),
};

export const interacciones = {
  create: (data: {
    id_vacante: number;
    accion: string;
    score_similitud?: number;
  }) =>
    request<InteraccionOut>("/interacciones/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => request<InteraccionOut[]>("/interacciones/"),
  liked: () => request<InteraccionOut[]>("/interacciones/liked"),
};

export const matches = {
  list: () => request<MatchOut[]>("/matches/"),

  get: (id: number) => request<MatchOut>(`/matches/${id}`),

  create: (data: { id_candidato: number; id_vacante: number }) =>
    request<MatchOut>("/matches/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const mensajes = {
  list: (matchId: number) =>
    request<MensajeOut[]>(`/matches/${matchId}/mensajes/`),

  send: (matchId: number, contenido: string) =>
    request<MensajeOut>(`/matches/${matchId}/mensajes/`, {
      method: "POST",
      body: JSON.stringify({ contenido }),
    }),
};

export const recommendations = {
  get: (text: string) =>
    request<RecommendationResult[]>("/recommendations/", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};
