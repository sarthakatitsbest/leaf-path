-- Create newsletters table for email signups
CREATE TABLE IF NOT EXISTS public.newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert newsletter signups
CREATE POLICY "Allow public newsletter signups" ON public.newsletters
FOR INSERT
WITH CHECK (true);

-- Allow reading for authenticated users only (admin view)
CREATE POLICY "Allow authenticated to read newsletters" ON public.newsletters
FOR SELECT
USING (auth.uid() IS NOT NULL);