from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
import os
import json
from typing import Any, Optional
from datetime import datetime, date
from decimal import Decimal
from google import genai
import os


API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

# Permite que el HTML pueda llamar al Back
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=API_KEY)
model = genai.Client()

class Pregunta(BaseModel):
    prompt: str

@app.post("/ask")
async def ask(pregunta: Pregunta):
    response = model.generate_content(
    model='gemini-2.0-flash',
    contents='Tell me a story in 300 words.'
)
    return { "answer": response.text }


def get_connection():
    return psycopg2.connect(**DB_CONFIG)

@app.get("/health")
def health():
    try:
        conn = get_connection()
        conn.close()
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))