import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.chroma_service import get_collection

from routers import candidatos_router, vacantes_router, recommendations_router
from routers import auth_router, reclutadores_router, interacciones_router
from routers import matches_router, mensajes_router

app = FastAPI(title='Jobder API')

allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)

app.include_router(candidatos_router.router)
app.include_router(vacantes_router.router)
app.include_router(recommendations_router.router)

app.include_router(reclutadores_router.router)
app.include_router(interacciones_router.router)
app.include_router(matches_router.router)
app.include_router(mensajes_router.router)


@app.get("/")
def root():
    return {"status": "API corriendo"}


@app.on_event("startup")
def startup_event():
    get_collection()