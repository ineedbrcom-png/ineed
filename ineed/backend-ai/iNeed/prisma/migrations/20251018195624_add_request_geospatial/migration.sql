-- Extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabela Request completa (primeira migração, banco vazio)
CREATE TABLE "Request" (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  budget       DECIMAL,
  "isActive"   BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "userId"     TEXT NOT NULL,
  "categoryId" TEXT,
  "type"       TEXT,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  -- Coluna gerada a partir de lng/lat em metros
  location     geography(Point,4326)
               GENERATED ALWAYS AS (
                 ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
               ) STORED
);

-- Índice geoespacial para raio
CREATE INDEX "Request_location_gist"
  ON "Request"
  USING GIST (location);

-- Restrições de sanidade para lat/lng
ALTER TABLE "Request"
  ADD CONSTRAINT request_lat_range CHECK (lat BETWEEN -90 AND 90);

ALTER TABLE "Request"
  ADD CONSTRAINT request_lng_range CHECK (lng BETWEEN -180 AND 180);