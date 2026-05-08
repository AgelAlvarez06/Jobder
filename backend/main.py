from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from config.settings import FRONTEND_URL
from database.connection import engine
from services.chroma_service import get_collection

from routers import (
    auth_router,
    candidatos_router,
    reclutadores_router,
    vacantes_router,
    feed_router,
    interacciones_router,
    matches_router,
    mensajes_router,
)
# Force model import so SQLAlchemy registers the table on Base.metadata.
from models import mensaje as _mensaje_model  # noqa: F401  
app = FastAPI(title="Jobder API")

allowed_origins = [FRONTEND_URL]
if FRONTEND_URL.startswith("http://localhost"):
    allowed_origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(candidatos_router.router)
app.include_router(reclutadores_router.router)
app.include_router(vacantes_router.router)
app.include_router(feed_router.router)
app.include_router(interacciones_router.router)
app.include_router(matches_router.router)
app.include_router(mensajes_router.router)


@app.on_event("startup")
def startup_event():
    try:
        get_collection()
    except Exception as e:
        print(f"[startup] Chroma init warning: {e}")


@app.get("/")
def root():
    return {"status": "ok", "service": "jobder-api"}


@app.get("/health")
def health():
    db_ok = False
    chroma_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    try:
        get_collection().count()
        chroma_ok = True
    except Exception:
        chroma_ok = False
    return {"status": "ok" if (db_ok and chroma_ok) else "degraded", "db": db_ok, "chroma": chroma_ok}
