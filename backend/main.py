from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from services.chroma_service import get_collection

from routers import candidatos_router, vacantes_router, recommendations_router
from database.connection import engine
from config.settings import DATABASE_URL
app = FastAPI(title = 'Jobder API')

app.include_router(candidatos_router.router)
app.include_router(vacantes_router.router)
app.include_router(recommendations_router.router)

@app.get("/")
def root():
    return {"status": "API corriendo"}

@app.get("/debug/db")
def debug_db():
    """Debug endpoint to confirm which DB is being used at runtime."""
    with engine.connect() as conn:
        current_db = conn.execute(text("SELECT current_database()")).scalar()
    return {
        "DATABASE_URL": DATABASE_URL,
        "current_database": current_db,
    }
    
@app.on_event("startup")
def startup_event():
    get_collection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)