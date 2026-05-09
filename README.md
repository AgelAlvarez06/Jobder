# Jobder

Sistema de búsqueda de empleo al estilo Tinder. Los candidatos deslizan sobre las vacantes, los reclutadores deslizan sobre los candidatos.
Los "me gusta" mutuos se convierten en coincidencias. Las recomendaciones se basan en
incrustaciones de Google Gemini almacenadas en ChromaDB y combinan el formulario de perfil estructurado
con el texto del CV (o la descripción del puesto) analizado.

## Stack

| Layer    | Tech                                  | Port |
|----------|---------------------------------------|------|
| Database | PostgreSQL 15                         | 5433 |
| Vector   | ChromaDB (persistent, local)          | -    |
| Cache    | Redis 7 (in-memory only)              | -    |
| Backend  | Python 3.12 + FastAPI                 | 8000 |
| Frontend | React 18 + Vite + Tailwind + nginx    | 3000 |

## Quick start

```bash
cp backend/.env.example backend/.env   # fill GEMINI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET
docker compose up --build
```

Open http://localhost:3000.

## API surface

### Auth
- `GET /auth/google/login?rol=candidato|reclutador` — start OAuth (rol used on first login)
- `GET /auth/google/callback` — redirects to `${FRONTEND_URL}/auth/callback#token=...&rol=...`
- `GET /auth/me` — current user (requires `Authorization: Bearer <jwt>`)

### Profiles
- `GET /candidatos/me`, `PATCH /candidatos/me` (multipart: structured fields + optional `cv` file)
- `GET /reclutadores/me`, `PATCH /reclutadores/me`

### Vacantes (recruiter scoped)
- `GET /vacantes` — vacantes belonging to the current recruiter
- `GET /vacantes/{id}` — read (recruiter must own it)
- `POST /vacantes` — create (multipart, optional `job_description` file)
- `PATCH /vacantes/{id}` — update (re-embeds on text change)
- `DELETE /vacantes/{id}`

### Swipe
- `GET /feed/vacantes` — ranked vacantes for the current candidato
- `GET /vacantes/{id}/candidatos` — ranked candidates for a recruiter's vacante
- `POST /interacciones` — body `{target_id, accion}`; for candidatos `target_id` is a vacante id, for recruiters it's `{vacante_id, candidato_id, accion}`. Returns `{match: bool, match_id?}`
- `GET /matches` — matches for the current user

### Misc
- `GET /health` — DB + Chroma connectivity check

## Architecture notes

- One embedding per candidato and per vacante, generated from
  `structured_form_text + "\n" + parsed_cv_or_jd_text`. Re-embed on update.
- Chroma ids are namespaced: `candidato_<id>` / `vacante_<id>`.
- All write endpoints require auth and verify ownership server-side.
- Mutual likes auto-create a row in `matches`.

## Caching (Redis)

Redis sits in front of Postgres + Chroma + Gemini as a soft cache; failures
log a warning and fall through.

| Cache              | Key shape                                       | TTL                      | Invalidated by                                             |
|--------------------|-------------------------------------------------|--------------------------|------------------------------------------------------------|
| Embeddings         | `jobder:v1:emb:<model>:<sha256(text)>`          | `EMBEDDING_CACHE_TTL`    | Content-addressed; never invalidated explicitly            |
| Candidate feed     | `jobder:v1:feed:cand:<id>:k<top_k>`             | `FEED_CACHE_TTL`         | `PATCH /candidatos/me`, `POST /interacciones` (candidato)  |
| Recruiter feed     | `jobder:v1:feed:vac:<id>:k<top_k>`              | `FEED_CACHE_TTL`         | vacante create/update/delete, `POST /interacciones` (rec.) |
| Swiped-set (cand.) | `jobder:v1:swiped:cand:<id>`                    | `SWIPED_CACHE_TTL`       | `POST /interacciones` (candidato)                          |
| Swiped-set (rec.)  | `jobder:v1:swiped:rec:<id>:vac:<vid>`           | `SWIPED_CACHE_TTL`       | `POST /interacciones` (reclutador)                         |

Feed endpoints also reuse the embedding stored in Chroma instead of re-calling
Gemini on every page load (falling back to a Gemini call only if missing).

**Disable caching for local debugging**: set `REDIS_URL=` (empty) in
`backend/.env`. The backend will log a notice and bypass Redis entirely —
every request goes straight to Postgres + Chroma + Gemini.
