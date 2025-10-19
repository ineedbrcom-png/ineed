-- Habilita PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Adiciona coluna "location" em Request
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "location" geometry(Point, 4326);

-- Índice espacial
CREATE INDEX IF NOT EXISTS "idx_requests_location" ON "Request" USING GIST ("location");
