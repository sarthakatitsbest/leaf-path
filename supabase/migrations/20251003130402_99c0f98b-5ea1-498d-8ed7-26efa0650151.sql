-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rules JSONB NOT NULL,
  points_award INTEGER DEFAULT 10,
  badge_icon_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id),
  title TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  points INTEGER DEFAULT 0,
  certificate_url TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Policies for challenges (public read, admin write)
CREATE POLICY "Challenges viewable by everyone" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Challenges insertable by authenticated users" ON public.challenges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for badges (users can view their own)
CREATE POLICY "Users can view their own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Badges insertable by authenticated users" ON public.badges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_badges_user ON public.badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_verification ON public.badges(verification_code);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(active, start_date, end_date);