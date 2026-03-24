-- Usuarios

CREATE TABLE usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash VARCHAR NULL,
    oauth_provider VARCHAR(50) NULL,
    oauth_id VARCHAR(255) NULL,

    rol VARCHAR(20)
        CHECK (rol IN ('candidato','reclutador'))
        NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_oauth_user
ON usuarios(oauth_provider, oauth_id);

-- Candidatos

CREATE TABLE candidatos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_usuario BIGINT UNIQUE
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    nombre VARCHAR(255),

    telefono VARCHAR(20),
    ubicacion VARCHAR(255),
    carrera VARCHAR(255),

    habilidades JSONB,
    idiomas JSONB,
    descripcion TEXT,

    cv_raw_text TEXT,
    structured_data JSONB,

    profile_text TEXT NOT NULL,

    embedding_model VARCHAR(100),

    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP
);

-- Reclutadores

CREATE TABLE reclutadores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_usuario BIGINT UNIQUE
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    nombre VARCHAR(255),
    nombre_compania VARCHAR(255) NOT NULL,

    descripcion_compania TEXT,

    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Vacantes

CREATE TABLE vacantes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_reclutador BIGINT
        REFERENCES reclutadores(id)
        ON DELETE CASCADE,

    titulo VARCHAR(255),

    job_raw_text TEXT,
    structured_data JSONB,

    job_text TEXT NOT NULL,

    embedding_model VARCHAR(100),

    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP
);

-- Interacciones

CREATE TABLE interacciones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_candidato BIGINT
        REFERENCES candidatos(id)
        ON DELETE CASCADE,

    id_vacante BIGINT
        REFERENCES vacantes(id)
        ON DELETE CASCADE,

    score_similitud FLOAT,

    accion VARCHAR(20)
        CHECK (accion IN ('viewed','liked','disliked')),

    fecha_creacion TIMESTAMP DEFAULT NOW(),

    UNIQUE(id_candidato, id_vacante)
);

-- Matches

CREATE TABLE matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_candidato BIGINT
        REFERENCES candidatos(id)
        ON DELETE CASCADE,

    id_vacante BIGINT
        REFERENCES vacantes(id)
        ON DELETE CASCADE,

    id_reclutador BIGINT
        REFERENCES reclutadores(id)
        ON DELETE CASCADE,

    fecha_match TIMESTAMP DEFAULT NOW()
);

-- Mensajes

CREATE TABLE mensajes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_match BIGINT
        REFERENCES matches(id)
        ON DELETE CASCADE,

    id_remitente BIGINT
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    contenido TEXT,

    fecha_envio TIMESTAMP DEFAULT NOW()
);

-- Indices importantes

-- interacciones (recomendador)
CREATE INDEX idx_interacciones_candidato
ON interacciones(id_candidato);

CREATE INDEX idx_interacciones_vacante
ON interacciones(id_vacante);

-- vacantes
CREATE INDEX idx_vacantes_reclutador
ON vacantes(id_reclutador);

-- matches
CREATE INDEX idx_matches_candidato
ON matches(id_candidato);

CREATE INDEX idx_matches_reclutador
ON matches(id_reclutador);

-- JSONB (búsquedas rápidas)
CREATE INDEX idx_candidatos_habilidades
ON candidatos USING GIN (habilidades);

CREATE INDEX idx_candidatos_structured
ON candidatos USING GIN (structured_data);

CREATE INDEX idx_vacantes_structured
ON vacantes USING GIN (structured_data);