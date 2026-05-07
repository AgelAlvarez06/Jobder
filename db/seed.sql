-- Jobder demo seed
-- Idempotent: only inserts if tables are empty.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM usuarios) THEN

    INSERT INTO usuarios (email, oauth_provider, oauth_id, rol) VALUES
      ('ana.candidata@example.com',  'demo', 'demo-cand-1', 'candidato'),
      ('bruno.candidato@example.com','demo', 'demo-cand-2', 'candidato'),
      ('clara.recluta@example.com',  'demo', 'demo-recl-1', 'reclutador'),
      ('diego.recluta@example.com',  'demo', 'demo-recl-2', 'reclutador');

    INSERT INTO candidatos
      (id_usuario, nombre, telefono, ubicacion, carrera, habilidades, idiomas,
       descripcion, cv_raw_text, structured_data, profile_text, embedding_model)
    VALUES
      ((SELECT id FROM usuarios WHERE email='ana.candidata@example.com'),
       'Ana Pérez', '33-1111-1111', 'Zapopan, Jalisco',
       'Ingeniería en Computación',
       '["React","TypeScript","Node.js","SQL"]'::jsonb,
       '["Español","Inglés"]'::jsonb,
       'Recién egresada apasionada por el desarrollo frontend.',
       NULL,
       '{"anos_experiencia":1}'::jsonb,
       'Ana Pérez. Ingeniería en Computación. Habilidades: React, TypeScript, Node.js, SQL. Ubicación: Zapopan.',
       NULL),
      ((SELECT id FROM usuarios WHERE email='bruno.candidato@example.com'),
       'Bruno López', '33-2222-2222', 'Guadalajara, Jalisco',
       'Diseño Gráfico',
       '["Figma","Adobe XD","UI Design"]'::jsonb,
       '["Español"]'::jsonb,
       'Diseñador UX/UI con foco en producto.',
       NULL,
       '{"anos_experiencia":2}'::jsonb,
       'Bruno López. Diseño Gráfico. Habilidades: Figma, Adobe XD, UI Design. Ubicación: Guadalajara.',
       NULL);

    INSERT INTO reclutadores
      (id_usuario, nombre, nombre_compania, descripcion_compania)
    VALUES
      ((SELECT id FROM usuarios WHERE email='clara.recluta@example.com'),
       'Clara Méndez', 'TechNova Solutions',
       'Consultora de software en Zapopan.'),
      ((SELECT id FROM usuarios WHERE email='diego.recluta@example.com'),
       'Diego Ruiz', 'Creative Studio GDL',
       'Estudio de diseño y producto.');

    INSERT INTO vacantes
      (id_reclutador, titulo, job_raw_text, structured_data, job_text, embedding_model)
    VALUES
      ((SELECT id FROM reclutadores WHERE nombre_compania='TechNova Solutions'),
       'Desarrollador Frontend Junior',
       NULL,
       '{"ubicacion":"Zapopan","modalidad":"hibrido","salario_min":18000,"salario_max":25000}'::jsonb,
       'Desarrollador Frontend Junior en TechNova Solutions. Stack: React, TypeScript, Tailwind. Ubicación: Zapopan. Modalidad híbrida.',
       NULL),
      ((SELECT id FROM reclutadores WHERE nombre_compania='Creative Studio GDL'),
       'Diseñador UX/UI',
       NULL,
       '{"ubicacion":"Tlaquepaque","modalidad":"presencial","salario_min":16000,"salario_max":23000}'::jsonb,
       'Diseñador UX/UI en Creative Studio GDL. Herramientas: Figma, Adobe XD. Ubicación: Tlaquepaque.',
       NULL);

  END IF;
END $$;