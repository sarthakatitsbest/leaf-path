-- Fix the chicken-egg problem: allow first admin to be created during company onboarding
-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Company admins can manage employees" ON public.company_users;

-- Allow authenticated users to insert themselves as initial admin
-- This is safe because:
-- 1. Only authenticated users can insert
-- 2. user_id must match auth.uid() (enforced by application logic)
-- 3. After creation, admin checks still apply for managing other employees
CREATE POLICY "Allow company user creation"
ON public.company_users
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Keep the existing SELECT/UPDATE/DELETE policies that use is_company_admin/is_company_member