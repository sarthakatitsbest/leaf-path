-- Create app_role enum for company roles
CREATE TYPE public.company_role AS ENUM ('admin', 'manager', 'employee');

-- Create company_plan enum
CREATE TYPE public.company_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');

-- Companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  logo_url text,
  plan company_plan DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'inactive',
  max_employees integer DEFAULT 10,
  settings jsonb DEFAULT '{"auto_domain_join": false, "require_opt_in": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Company users/employees table
CREATE TABLE public.company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  email text NOT NULL,
  role company_role DEFAULT 'employee',
  invite_token text,
  invite_expires_at timestamptz,
  opted_in boolean DEFAULT false,
  opted_in_at timestamptz,
  joined_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, email)
);

-- Company metrics (aggregated environmental data)
CREATE TABLE public.company_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- metrics schema: {carbon: number, water: number, waste: number, employee_count: number, participation_rate: number}
  comparison jsonb DEFAULT '{}'::jsonb,
  -- comparison schema: {previous_carbon: number, change_percent: number}
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, period_type, period_start)
);

-- ESG Audit logs for compliance
CREATE TABLE public.esg_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- ESG Reports table (generated PDFs)
CREATE TABLE public.esg_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  generated_by uuid NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('monthly', 'quarterly', 'annual', 'custom')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  pdf_url text,
  csv_url text,
  metrics_snapshot jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Add company_id and share_with_company to entries table
ALTER TABLE public.entries 
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS share_with_company boolean DEFAULT false;

-- Create index for efficient company queries
CREATE INDEX idx_entries_company ON public.entries(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_company_users_user ON public.company_users(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_company_metrics_period ON public.company_metrics(company_id, period_type, period_start);
CREATE INDEX idx_esg_audit_company ON public.esg_audit(company_id, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is company admin
CREATE OR REPLACE FUNCTION public.is_company_admin(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users
    WHERE company_id = p_company_id
      AND user_id = p_user_id
      AND role = 'admin'
      AND is_active = true
  )
$$;

-- Helper function to check if user is company member
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users
    WHERE company_id = p_company_id
      AND user_id = p_user_id
      AND is_active = true
  )
$$;

-- RLS Policies for companies
CREATE POLICY "Company admins can view their company"
  ON public.companies FOR SELECT
  USING (public.is_company_admin(id, auth.uid()));

CREATE POLICY "Company admins can update their company"
  ON public.companies FOR UPDATE
  USING (public.is_company_admin(id, auth.uid()));

CREATE POLICY "Authenticated users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for company_users
CREATE POLICY "Company admins can view all employees"
  ON public.company_users FOR SELECT
  USING (public.is_company_admin(company_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Company admins can manage employees"
  ON public.company_users FOR INSERT
  WITH CHECK (public.is_company_admin(company_id, auth.uid()));

CREATE POLICY "Company admins can update employees"
  ON public.company_users FOR UPDATE
  USING (public.is_company_admin(company_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Company admins can remove employees"
  ON public.company_users FOR DELETE
  USING (public.is_company_admin(company_id, auth.uid()));

-- RLS Policies for company_metrics
CREATE POLICY "Company members can view metrics"
  ON public.company_metrics FOR SELECT
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Service role can manage metrics"
  ON public.company_metrics FOR ALL
  USING (true);

-- RLS Policies for esg_audit
CREATE POLICY "Company admins can view audit logs"
  ON public.esg_audit FOR SELECT
  USING (public.is_company_admin(company_id, auth.uid()));

CREATE POLICY "Service role can insert audit logs"
  ON public.esg_audit FOR INSERT
  WITH CHECK (true);

-- RLS Policies for esg_reports
CREATE POLICY "Company members can view reports"
  ON public.esg_reports FOR SELECT
  USING (public.is_company_member(company_id, auth.uid()));

CREATE POLICY "Company admins can create reports"
  ON public.esg_reports FOR INSERT
  WITH CHECK (public.is_company_admin(company_id, auth.uid()));

CREATE POLICY "Service role can update reports"
  ON public.esg_reports FOR UPDATE
  USING (true);

-- Trigger for updated_at on companies
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on company_users
CREATE TRIGGER update_company_users_updated_at
  BEFORE UPDATE ON public.company_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();