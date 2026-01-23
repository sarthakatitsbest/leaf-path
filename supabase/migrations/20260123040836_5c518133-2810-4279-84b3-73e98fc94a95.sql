-- Step 1: Add owner_id column to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Step 2: Fix RLS policies for company creation flow

-- Remove restrictive INSERT policies on companies
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Company admins can create companies" ON public.companies;

-- CREATE a permissive insert policy that requires authentication and owner_id match
CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = owner_id
);

-- Update SELECT policy to allow users to see companies they own
DROP POLICY IF EXISTS "Company admins can view their company" ON public.companies;

CREATE POLICY "Users can view companies they own or admin"
ON public.companies
FOR SELECT
USING (
  owner_id = auth.uid() OR is_company_admin(id, auth.uid())
);