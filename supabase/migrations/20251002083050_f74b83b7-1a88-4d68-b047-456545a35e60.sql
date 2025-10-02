-- Add lat/lon to carbon_logs for location tracking
ALTER TABLE carbon_logs 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lon DOUBLE PRECISION;

-- Create cache table for OpenWeather Air Pollution API responses
CREATE TABLE IF NOT EXISTS city_air_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  city_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_city_air_cache_key ON city_air_cache(city_key);
CREATE INDEX IF NOT EXISTS idx_city_air_cache_fetched ON city_air_cache(fetched_at);
CREATE INDEX IF NOT EXISTS idx_carbon_logs_location ON carbon_logs(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;