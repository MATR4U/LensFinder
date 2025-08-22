-- Postgres schema for LensFinder

CREATE TABLE IF NOT EXISTS cameras (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  mount TEXT NOT NULL,
  sensor_name TEXT,
  sensor_width_mm REAL,
  sensor_height_mm REAL,
  sensor_coc_mm REAL,
  sensor_crop REAL,
  ibis BOOLEAN NOT NULL DEFAULT false,
  price_chf REAL,
  weight_g INTEGER,
  source_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_cameras_brand ON cameras(brand);
CREATE INDEX IF NOT EXISTS idx_cameras_mount ON cameras(mount);
CREATE INDEX IF NOT EXISTS idx_cameras_price ON cameras(price_chf);
CREATE INDEX IF NOT EXISTS idx_cameras_weight ON cameras(weight_g);

CREATE TABLE IF NOT EXISTS lenses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  mount TEXT NOT NULL,
  coverage TEXT NOT NULL,
  focal_min_mm REAL,
  focal_max_mm REAL,
  aperture_min REAL,
  aperture_max REAL,
  weight_g INTEGER,
  ois BOOLEAN NOT NULL DEFAULT false,
  price_chf REAL,
  weather_sealed BOOLEAN NOT NULL DEFAULT false,
  is_macro BOOLEAN NOT NULL DEFAULT false,
  distortion_pct REAL,
  focus_breathing_score REAL,
  source_url TEXT,
  image_url TEXT,
  UNIQUE(name, brand, mount)
);

CREATE INDEX IF NOT EXISTS idx_lenses_brand ON lenses(brand);
CREATE INDEX IF NOT EXISTS idx_lenses_mount ON lenses(mount);
CREATE INDEX IF NOT EXISTS idx_lenses_price ON lenses(price_chf);
CREATE INDEX IF NOT EXISTS idx_lenses_weight ON lenses(weight_g);

-- Schema for LensFinder Postgres database

CREATE TABLE IF NOT EXISTS cameras (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  mount TEXT NOT NULL,
  sensor_name TEXT,
  sensor_width_mm REAL,
  sensor_height_mm REAL,
  sensor_coc_mm REAL,
  sensor_crop REAL,
  ibis BOOLEAN NOT NULL DEFAULT false,
  price_chf REAL,
  weight_g INTEGER,
  source_url TEXT
);

CREATE TABLE IF NOT EXISTS lenses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  mount TEXT NOT NULL,
  coverage TEXT NOT NULL,
  focal_min_mm REAL,
  focal_max_mm REAL,
  aperture_min REAL,
  aperture_max REAL,
  weight_g INTEGER,
  ois BOOLEAN NOT NULL DEFAULT false,
  price_chf REAL,
  weather_sealed BOOLEAN NOT NULL DEFAULT false,
  is_macro BOOLEAN NOT NULL DEFAULT false,
  distortion_pct REAL,
  focus_breathing_score REAL,
  source_url TEXT,
  image_url TEXT,
  UNIQUE(name, brand, mount)
);

-- Idempotency store for API responses
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  response JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);


