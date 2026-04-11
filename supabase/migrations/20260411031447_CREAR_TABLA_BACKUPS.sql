-- Tabla de respaldos de usuarios
CREATE TABLE backups (
    -- Cada usuario tiene un solo respaldo, por eso se usa user_id como PRIMARY KEY
    user_id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    -- El payload es un JSON que contiene toda la información necesaria para restaurar el estado del usuario
    payload jsonb NOT NULL,
    -- Para comparar versiones
    updated_at timestamp with time zone DEFAULT now()
);
