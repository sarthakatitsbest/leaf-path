-- Roles for government module
DO $$ BEGIN
  CREATE TYPE public.gov_role AS ENUM ('super_admin','gov_admin','city_admin','ward_admin','analyst');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.gov_org_type AS ENUM ('municipal','smart_city','district','state','university');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.government_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  org_type public.gov_org_type NOT NULL DEFAULT 'municipal',
  city text,
  state text,
  country text DEFAULT 'India',
  logo_url text,
  contact_email text,
  plan text NOT NULL DEFAULT 'demo',
  status text NOT NULL DEFAULT 'active',
  owner_id uuid NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.government_organizations TO authenticated;
GRANT ALL ON public.government_organizations TO service_role;
ALTER TABLE public.government_organizations ENABLE ROW LEVEL SECURITY;

-- 2. Government users
CREATE TABLE IF NOT EXISTS public.government_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.government_organizations(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  full_name text,
  role public.gov_role NOT NULL DEFAULT 'analyst',
  ward text,
  is_active boolean NOT NULL DEFAULT true,
  invite_token text,
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.government_users TO authenticated;
GRANT ALL ON public.government_users TO service_role;
ALTER TABLE public.government_users ENABLE ROW LEVEL SECURITY;

-- Helper functions (security definer, avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_gov_member(p_org_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.government_users
    WHERE org_id = p_org_id AND user_id = p_user_id AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_gov_admin(p_org_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.government_users
    WHERE org_id = p_org_id AND user_id = p_user_id AND is_active = true
      AND role IN ('super_admin','gov_admin','city_admin')
  )
$$;

-- Policies: organizations
DROP POLICY IF EXISTS "gov org members can view" ON public.government_organizations;
CREATE POLICY "gov org members can view" ON public.government_organizations
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_gov_member(id, auth.uid()));

DROP POLICY IF EXISTS "gov org owner can insert" ON public.government_organizations;
CREATE POLICY "gov org owner can insert" ON public.government_organizations
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "gov org admins can update" ON public.government_organizations;
CREATE POLICY "gov org admins can update" ON public.government_organizations
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_gov_admin(id, auth.uid()))
  WITH CHECK (owner_id = auth.uid() OR public.is_gov_admin(id, auth.uid()));

-- Policies: government_users
DROP POLICY IF EXISTS "gov users viewable by org members" ON public.government_users;
CREATE POLICY "gov users viewable by org members" ON public.government_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_gov_member(org_id, auth.uid()));

DROP POLICY IF EXISTS "gov users self or admin insert" ON public.government_users;
CREATE POLICY "gov users self or admin insert" ON public.government_users
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_gov_admin(org_id, auth.uid()));

DROP POLICY IF EXISTS "gov users admin update" ON public.government_users;
CREATE POLICY "gov users admin update" ON public.government_users
  FOR UPDATE TO authenticated
  USING (public.is_gov_admin(org_id, auth.uid()))
  WITH CHECK (public.is_gov_admin(org_id, auth.uid()));

DROP POLICY IF EXISTS "gov users admin delete" ON public.government_users;
CREATE POLICY "gov users admin delete" ON public.government_users
  FOR DELETE TO authenticated
  USING (public.is_gov_admin(org_id, auth.uid()));

-- 3. Sustainability campaigns (government)
CREATE TABLE IF NOT EXISTS public.sustainability_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.government_organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  name text NOT NULL,
  description text,
  area text,
  category text NOT NULL DEFAULT 'general',
  goal text,
  target_participation integer NOT NULL DEFAULT 1000,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sustainability_campaigns TO authenticated;
GRANT ALL ON public.sustainability_campaigns TO service_role;
ALTER TABLE public.sustainability_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gov campaigns viewable by members" ON public.sustainability_campaigns;
CREATE POLICY "gov campaigns viewable by members" ON public.sustainability_campaigns
  FOR SELECT TO authenticated USING (public.is_gov_member(org_id, auth.uid()));
DROP POLICY IF EXISTS "gov campaigns admin insert" ON public.sustainability_campaigns;
CREATE POLICY "gov campaigns admin insert" ON public.sustainability_campaigns
  FOR INSERT TO authenticated WITH CHECK (public.is_gov_admin(org_id, auth.uid()) AND created_by = auth.uid());
DROP POLICY IF EXISTS "gov campaigns admin update" ON public.sustainability_campaigns;
CREATE POLICY "gov campaigns admin update" ON public.sustainability_campaigns
  FOR UPDATE TO authenticated USING (public.is_gov_admin(org_id, auth.uid())) WITH CHECK (public.is_gov_admin(org_id, auth.uid()));
DROP POLICY IF EXISTS "gov campaigns admin delete" ON public.sustainability_campaigns;
CREATE POLICY "gov campaigns admin delete" ON public.sustainability_campaigns
  FOR DELETE TO authenticated USING (public.is_gov_admin(org_id, auth.uid()));

-- 4. Aggregated campaign participation (anonymous counters only)
CREATE TABLE IF NOT EXISTS public.campaign_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.sustainability_campaigns(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.government_organizations(id) ON DELETE CASCADE,
  area text,
  period_start date NOT NULL,
  period_end date NOT NULL,
  participant_count integer NOT NULL DEFAULT 0,
  action_count integer NOT NULL DEFAULT 0,
  estimated_carbon_reduction numeric NOT NULL DEFAULT 0,
  repeat_participation_rate numeric NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaign_participation TO authenticated;
GRANT ALL ON public.campaign_participation TO service_role;
ALTER TABLE public.campaign_participation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gov participation viewable by members" ON public.campaign_participation;
CREATE POLICY "gov participation viewable by members" ON public.campaign_participation
  FOR SELECT TO authenticated USING (public.is_gov_member(org_id, auth.uid()));

-- 5. Aggregated city metrics
CREATE TABLE IF NOT EXISTS public.aggregated_city_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.government_organizations(id) ON DELETE CASCADE,
  city text,
  period_type text NOT NULL DEFAULT 'monthly',
  period_start date NOT NULL,
  period_end date NOT NULL,
  active_citizens integer NOT NULL DEFAULT 0,
  total_actions integer NOT NULL DEFAULT 0,
  estimated_carbon_reduction numeric NOT NULL DEFAULT 0,
  plastic_reports integer NOT NULL DEFAULT 0,
  campaign_participation integer NOT NULL DEFAULT 0,
  eco_score numeric NOT NULL DEFAULT 0,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.aggregated_city_metrics TO authenticated;
GRANT ALL ON public.aggregated_city_metrics TO service_role;
ALTER TABLE public.aggregated_city_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gov city metrics viewable by members" ON public.aggregated_city_metrics;
CREATE POLICY "gov city metrics viewable by members" ON public.aggregated_city_metrics
  FOR SELECT TO authenticated USING (public.is_gov_member(org_id, auth.uid()));

-- 6. Area / ward metrics
CREATE TABLE IF NOT EXISTS public.area_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.government_organizations(id) ON DELETE CASCADE,
  area_name text NOT NULL,
  ward_code text,
  center_lat double precision,
  center_lng double precision,
  period_start date NOT NULL,
  period_end date NOT NULL,
  participants integer NOT NULL DEFAULT 0,
  plastic_reports integer NOT NULL DEFAULT 0,
  waste_activity_index numeric NOT NULL DEFAULT 0,
  estimated_carbon_reduction numeric NOT NULL DEFAULT 0,
  engagement_score numeric NOT NULL DEFAULT 0,
  trend jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.area_metrics TO authenticated;
GRANT ALL ON public.area_metrics TO service_role;
ALTER TABLE public.area_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gov area metrics viewable by members" ON public.area_metrics;
CREATE POLICY "gov area metrics viewable by members" ON public.area_metrics
  FOR SELECT TO authenticated USING (public.is_gov_member(org_id, auth.uid()));

-- 7. Government reports
CREATE TABLE IF NOT EXISTS public.government_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.government_organizations(id) ON DELETE CASCADE,
  generated_by uuid NOT NULL,
  report_type text NOT NULL DEFAULT 'city_sustainability',
  title text,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  pdf_url text,
  csv_url text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.government_reports TO authenticated;
GRANT ALL ON public.government_reports TO service_role;
ALTER TABLE public.government_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gov reports viewable by members" ON public.government_reports;
CREATE POLICY "gov reports viewable by members" ON public.government_reports
  FOR SELECT TO authenticated USING (public.is_gov_member(org_id, auth.uid()));
DROP POLICY IF EXISTS "gov reports admin insert" ON public.government_reports;
CREATE POLICY "gov reports admin insert" ON public.government_reports
  FOR INSERT TO authenticated WITH CHECK (public.is_gov_admin(org_id, auth.uid()) AND generated_by = auth.uid());
DROP POLICY IF EXISTS "gov reports admin update" ON public.government_reports;
CREATE POLICY "gov reports admin update" ON public.government_reports
  FOR UPDATE TO authenticated USING (public.is_gov_admin(org_id, auth.uid())) WITH CHECK (public.is_gov_admin(org_id, auth.uid()));

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_gov_orgs_updated ON public.government_organizations;
CREATE TRIGGER trg_gov_orgs_updated BEFORE UPDATE ON public.government_organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_gov_users_updated ON public.government_users;
CREATE TRIGGER trg_gov_users_updated BEFORE UPDATE ON public.government_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_gov_campaigns_updated ON public.sustainability_campaigns;
CREATE TRIGGER trg_gov_campaigns_updated BEFORE UPDATE ON public.sustainability_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_gov_participation_updated ON public.campaign_participation;
CREATE TRIGGER trg_gov_participation_updated BEFORE UPDATE ON public.campaign_participation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();