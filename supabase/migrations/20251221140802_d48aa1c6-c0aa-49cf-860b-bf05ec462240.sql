-- Add certificate_type column to existing certificates table
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_type text;

-- Create entries table for activity logging
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- transport|energy|water|food|waste
  data jsonb NOT NULL,
  footprint jsonb NOT NULL, -- { co2Kg, waterLiters, cost, breakdown }
  explanation jsonb, -- factors and assumptions used
  location jsonb, -- { city, lat, lng }
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on entries
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for entries
CREATE POLICY "Users can insert their own entries" ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own entries" ON entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON entries FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for entries
CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at);

-- Create wellness_scores table
CREATE TABLE IF NOT EXISTS wellness_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  score_date date NOT NULL,
  water_score integer DEFAULT 0,
  diet_score integer DEFAULT 0,
  aqi_score integer DEFAULT 0,
  activity_score integer DEFAULT 0,
  overall_score integer DEFAULT 0,
  breakdown jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, score_date)
);

-- Enable RLS on wellness_scores
ALTER TABLE wellness_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for wellness_scores
CREATE POLICY "Users can view their own wellness scores" ON wellness_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage wellness scores" ON wellness_scores FOR ALL USING (true);

-- Create certificate_progress table to track progress toward certificates
CREATE TABLE IF NOT EXISTS certificate_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  certificate_type text NOT NULL,
  current_value numeric DEFAULT 0,
  target_value numeric NOT NULL,
  is_unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, certificate_type, week_start)
);

-- Enable RLS on certificate_progress
ALTER TABLE certificate_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for certificate_progress
CREATE POLICY "Users can view their own progress" ON certificate_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage progress" ON certificate_progress FOR ALL USING (true);

-- Create health_tips table for storing generated tips
CREATE TABLE IF NOT EXISTS health_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tip_date date NOT NULL,
  aqi_value integer,
  temperature numeric,
  tips jsonb NOT NULL,
  diet_suggestions jsonb,
  activity_suggestions jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tip_date)
);

-- Enable RLS on health_tips
ALTER TABLE health_tips ENABLE ROW LEVEL SECURITY;

-- RLS policies for health_tips
CREATE POLICY "Users can view their own tips" ON health_tips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage tips" ON health_tips FOR ALL USING (true);

-- Create auto_estimates table for city-based estimates
CREATE TABLE IF NOT EXISTS auto_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  estimate_date date NOT NULL,
  city text,
  water_estimate numeric DEFAULT 0,
  carbon_estimate numeric DEFAULT 0,
  city_average_carbon numeric DEFAULT 0,
  comparison_percentage numeric DEFAULT 0,
  estimate_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, estimate_date)
);

-- Enable RLS on auto_estimates
ALTER TABLE auto_estimates ENABLE ROW LEVEL SECURITY;

-- RLS policies for auto_estimates
CREATE POLICY "Users can view their own estimates" ON auto_estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage estimates" ON auto_estimates FOR ALL USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wellness_user_date ON wellness_scores(user_id, score_date);
CREATE INDEX IF NOT EXISTS idx_progress_user ON certificate_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tips_user_date ON health_tips(user_id, tip_date);
CREATE INDEX IF NOT EXISTS idx_estimates_user_date ON auto_estimates(user_id, estimate_date);