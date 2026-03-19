FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar todo el proyecto
COPY . .

EXPOSE 8000

# Sin --reload (más estable en contenedor)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]