-- Create certificates table for storing certificate metadata
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid REFERENCES public.badges(id) ON DELETE SET NULL,
  verification_code text NOT NULL UNIQUE,
  pdf_url text,
  qr_data_url text,
  user_name text,
  award_title text,
  project_name text DEFAULT 'Eco Pulse AI',
  valid boolean DEFAULT true,
  issued_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public read policy for verification (anyone can verify a certificate)
CREATE POLICY "Public certificate verification"
ON public.certificates
FOR SELECT
USING (true);

-- Service role can manage certificates (insert/update from edge functions)
CREATE POLICY "Service role can manage certificates"
ON public.certificates
FOR ALL
USING (true);

-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for public read access to certificates
CREATE POLICY "Public certificate read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'certificates');

-- Service role can upload certificates
CREATE POLICY "Service role can upload certificates"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'certificates');