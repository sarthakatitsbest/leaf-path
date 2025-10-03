-- Fix carbon_logs ON CONFLICT issue by adding unique constraint
ALTER TABLE public.carbon_logs 
ADD CONSTRAINT carbon_logs_user_date_unique UNIQUE (user_id, log_date);

-- Update RLS policies for better security
CREATE POLICY "Service role can manage badges" ON public.badges 
FOR ALL 
USING (auth.role() = 'service_role' OR auth.uid() = user_id);