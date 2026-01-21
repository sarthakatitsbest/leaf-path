-- Plastic Waste Intelligence Engine Tables

-- Uploads table for images/PDFs/posts
CREATE TABLE public.plastic_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'pdf', 'social_post', 'report')),
  file_url TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  text_extracted TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plastic classification results
CREATE TABLE public.plastic_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES public.plastic_uploads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  plastic_category TEXT NOT NULL CHECK (plastic_category IN ('single-use', 'multi-layer', 'PET', 'HDPE', 'PVC', 'film', 'unknown')),
  recyclability_score INTEGER CHECK (recyclability_score >= 0 AND recyclability_score <= 100),
  model_confidence NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hotspot scores for areas
CREATE TABLE public.plastic_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  area_name TEXT,
  location_lat NUMERIC NOT NULL,
  location_lng NUMERIC NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  sources JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brand mentions for accountability
CREATE TABLE public.plastic_brand_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  area TEXT,
  mention_count INTEGER DEFAULT 1,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  evidence JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pitch analysis results (voice/text)
CREATE TABLE public.plastic_pitch_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transcript TEXT NOT NULL,
  category TEXT,
  problem_statement TEXT,
  solution_statement TEXT,
  suggested_metrics JSONB DEFAULT '[]',
  confidence INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.plastic_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plastic_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plastic_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plastic_brand_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plastic_pitch_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plastic_uploads
CREATE POLICY "Users can view their own uploads" ON public.plastic_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own uploads" ON public.plastic_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own uploads" ON public.plastic_uploads FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for plastic_classifications
CREATE POLICY "Users can view their own classifications" ON public.plastic_classifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own classifications" ON public.plastic_classifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for plastic_hotspots (public read for map)
CREATE POLICY "Anyone can view hotspots" ON public.plastic_hotspots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hotspots" ON public.plastic_hotspots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for plastic_brand_mentions (public read)
CREATE POLICY "Anyone can view brand mentions" ON public.plastic_brand_mentions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create mentions" ON public.plastic_brand_mentions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for plastic_pitch_analyses
CREATE POLICY "Users can view their own analyses" ON public.plastic_pitch_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analyses" ON public.plastic_pitch_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_plastic_uploads_user ON public.plastic_uploads(user_id);
CREATE INDEX idx_plastic_classifications_upload ON public.plastic_classifications(upload_id);
CREATE INDEX idx_plastic_hotspots_city ON public.plastic_hotspots(city);
CREATE INDEX idx_plastic_hotspots_location ON public.plastic_hotspots(location_lat, location_lng);
CREATE INDEX idx_plastic_pitch_analyses_user ON public.plastic_pitch_analyses(user_id);