-- Go-Green Campaigns tables

-- Main campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER DEFAULT 50,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  certificate_template_id UUID,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign team members (organizers/volunteers)
CREATE TABLE public.campaign_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'volunteer' CHECK (role IN ('organizer', 'volunteer')),
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Campaign participants (join requests + status)
CREATE TABLE public.campaign_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'checked_in', 'completed')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  checked_in_lat DOUBLE PRECISION,
  checked_in_lng DOUBLE PRECISION,
  completed_at TIMESTAMPTZ,
  UNIQUE(campaign_id, user_id)
);

-- Campaign certificates issued to participants
CREATE TABLE public.campaign_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  issued_by UUID NOT NULL,
  pdf_url TEXT,
  verification_code TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  issued_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Campaign notifications audit log
CREATE TABLE public.campaign_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  notification_type TEXT DEFAULT 'nearby_campaign',
  payload JSONB,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_notifications ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Anyone can view public campaigns"
  ON public.campaigns FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update their campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = owner_id);

-- Campaign team policies
CREATE POLICY "Team members can view team"
  ON public.campaign_team FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND (c.owner_id = auth.uid() OR c.visibility = 'public'))
    OR user_id = auth.uid()
  );

CREATE POLICY "Campaign owners can manage team"
  ON public.campaign_team FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid())
  );

-- Campaign participants policies
CREATE POLICY "Participants can view their participation"
  ON public.campaign_participants FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid()));

CREATE POLICY "Users can join campaigns"
  ON public.campaign_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners or self can update participation"
  ON public.campaign_participants FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid())
  );

-- Campaign certificates policies
CREATE POLICY "Users can view their certificates"
  ON public.campaign_certificates FOR SELECT
  USING (user_id = auth.uid() OR issued_by = auth.uid());

CREATE POLICY "Campaign owners can issue certificates"
  ON public.campaign_certificates FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid())
  );

-- Notifications policies (service role mainly)
CREATE POLICY "Users can view their notifications"
  ON public.campaign_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage notifications"
  ON public.campaign_notifications FOR ALL
  USING (true);

-- Add notification_opt_in to user_profiles if not exists
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS notification_opt_in BOOLEAN DEFAULT true;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Indexes for performance
CREATE INDEX idx_campaigns_location ON public.campaigns(lat, lng);
CREATE INDEX idx_campaigns_dates ON public.campaigns(start_time, end_time);
CREATE INDEX idx_campaign_participants_status ON public.campaign_participants(status);
CREATE INDEX idx_user_profiles_location ON public.user_profiles(lat, lng) WHERE lat IS NOT NULL;