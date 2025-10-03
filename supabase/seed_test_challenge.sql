-- Test challenge: Car-Free Day
-- Users can test by logging zero car emissions for a day
INSERT INTO public.challenges (
  title, 
  description, 
  start_date, 
  end_date, 
  rules, 
  points_award, 
  badge_icon_url, 
  active
) VALUES (
  'Car-Free Day Challenge',
  'Go one full day without using a car. Walk, bike, or use public transport instead!',
  '2025-10-01',
  '2025-12-31',
  '{"type": "no_car_day", "window": 1, "params": {"maxCarKm": 0}}'::jsonb,
  50,
  NULL,
  true
) ON CONFLICT DO NOTHING;

-- Test challenge: Zero Waste Week
INSERT INTO public.challenges (
  title, 
  description, 
  start_date, 
  end_date, 
  rules, 
  points_award, 
  active
) VALUES (
  'Zero Waste Week',
  'Keep total waste under 1kg for 7 consecutive days',
  '2025-10-01',
  '2025-12-31',
  '{"type": "zero_waste_week", "window": 7, "params": {"maxWasteKg": 1.0}}'::jsonb,
  100,
  true
) ON CONFLICT DO NOTHING;

-- Verify challenges created
SELECT id, title, points_award, active FROM public.challenges ORDER BY created_at DESC;
