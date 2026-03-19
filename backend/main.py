from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from services.chroma_service import get_collection

from routers import candidatos_router, vacantes_router, recommendations_router
from database.connection import engine
from config.settings import DATABASE_URL

import psycopg2
import psycopg2.extras
import os
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime, date
from decimal import Decimal
from google import genai

app = FastAPI(title='Jobder API')

# Routers
app.include_router(candidatos_router.router)
app.include_router(vacantes_router.router)
app.include_router(recommendations_router.router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Raiz
@app.get("/")
def root():
    return {"status": "API corriendo"}

# Debug DB
@app.get("/debug/db")
def debug_db():
    with engine.connect() as conn:
        current_db = conn.execute(text("SELECT current_database()")).scalar()
    return {
        "DATABASE_URL": DATABASE_URL,
        "current_database": current_db,
    }

@app.on_event("startup")
def startup_event():
    get_collection()

API_KEY = os.getenv("GEMINI_API_KEY")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "db"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "queryforge"),
    "user": os.getenv("DB_USER", "forge"),
    "password": os.getenv("DB_PASSWORD", "forge_secret"),
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def serialize_value(val: Any) -> Any:
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, memoryview):
        return val.tobytes().decode("utf-8", errors="replace")
    return val

class QueryRequest(BaseModel):
    sql: str
    params: Optional[list] = None

class QueryResult(BaseModel):
    columns: list[str]
    rows: list[list[Any]]
    row_count: int
    execution_time_ms: float
    query_type: str
    message: Optional[str] = None

@app.get("/health")
def health():
    try:
        conn = get_connection()
        conn.close()
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

# Gemini
if not API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY")

model = genai.Client(api_key=API_KEY)

class Pregunta(BaseModel):
    prompt: str

@app.post("/ask")
async def ask(pregunta: Pregunta):
    response = model.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=pregunta.prompt,
    )
    return {"answer": response.text}

# Query executor
@app.post("/query", response_model=QueryResult)
def run_query(req: QueryRequest):
    start = datetime.now()
    sql = req.sql.strip()
    query_type = sql.split()[0].upper() if sql else "UNKNOWN"

    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(sql, req.params or [])

        elapsed = (datetime.now() - start).total_seconds() * 1000

        if query_type in ["SELECT", "WITH"]:
            raw_rows = cur.fetchall()
            columns = list(raw_rows[0].keys()) if raw_rows else []
            rows = [
                [serialize_value(row[col]) for col in columns]
                for row in raw_rows
            ]
            conn.commit()
            return QueryResult(
                columns=columns,
                rows=rows,
                row_count=len(rows),
                execution_time_ms=round(elapsed, 2),
                query_type=query_type,
            )
        else:
            affected = cur.rowcount
            conn.commit()
            return QueryResult(
                columns=[],
                rows=[],
                row_count=affected,
                execution_time_ms=round(elapsed, 2),
                query_type=query_type,
                message=f"{query_type} executed. {affected} row(s) affected.",
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))