-- Enable RLS on city_air_cache table
ALTER TABLE city_air_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (air quality data is public)
CREATE POLICY "Allow authenticated users to read air quality data"
ON city_air_cache FOR SELECT
TO authenticated
USING (true);

-- Allow service role to manage cache (for edge functions)
CREATE POLICY "Allow service role to manage air quality cache"
ON city_air_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);