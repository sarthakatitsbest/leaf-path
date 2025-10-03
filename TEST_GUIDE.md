# Badge & Certificate System - Testing Guide

## Quick Setup (Minimal Credits)

### 1. Seed Test Challenges
Run in Supabase SQL Editor:
```sql
-- Copy content from supabase/seed_test_challenge.sql
```

### 2. Test Badge Award API

**Endpoint**: `https://fbmphwihmfzbbyavgusl.supabase.co/functions/v1/award-badge`

**Test with curl:**
```bash
curl -X POST "https://fbmphwihmfzbbyavgusl.supabase.co/functions/v1/award-badge" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibXBod2lobWZ6YmJ5YXZndXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTAxMzIsImV4cCI6MjA3MzA2NjEzMn0.etMn07UhYbVu2NEiYQzBgIYO_7O3SqCL2u3tiOR18KA" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "challengeId": "CHALLENGE_ID_FROM_DB",
    "userName": "Test User"
  }'
```

### 3. Verify Badge

**Public URL**: `https://YOUR_DOMAIN/verify/{verification_code}`

**API Test:**
```bash
curl "https://fbmphwihmfzbbyavgusl.supabase.co/functions/v1/verify-badge/YOUR_VER_CODE" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibXBod2lobWZ6YmJ5YXZndXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTAxMzIsImV4cCI6MjA3MzA2NjEzMn0.etMn07UhYbVu2NEiYQzBgIYO_7O3SqCL2u3tiOR18KA"
```

### 4. Check Database
```sql
-- View badges
SELECT * FROM badges ORDER BY created_at DESC LIMIT 5;

-- View challenges
SELECT id, title, points_award, active FROM challenges;

-- Check user points
SELECT user_id, display_name, total_points FROM user_profiles;
```

## Frontend Testing

1. **Dashboard**: Navigate to `/dashboard` - you should see "My Badges & Certificates" section
2. **Award Test**: Call award-badge API via your admin panel or evaluator function
3. **View Badge**: Click on a badge card to open certificate modal
4. **Download**: Click "Download Certificate" to get SVG file
5. **Verify**: Scan QR code or visit `/verify/{code}` URL

## Security Checklist

✅ RLS enabled on `badges` and `challenges` tables
✅ Service role policies for badge creation
✅ Public verification endpoint (read-only)
✅ Unique constraint on `verification_code`

## Credit Optimization

- ✅ SVG certificates (tiny file size)
- ✅ Client-side QR generation
- ✅ Direct Supabase queries (no external APIs)
- ✅ Simple edge functions (minimal compute)

## Monitoring

View edge function logs:
- [award-badge logs](https://supabase.com/dashboard/project/fbmphwihmfzbbyavgusl/functions/award-badge/logs)
- [verify-badge logs](https://supabase.com/dashboard/project/fbmphwihmfzbbyavgusl/functions/verify-badge/logs)

## Next Steps

1. Integrate with challenge evaluator
2. Add badge award notifications (toast/email)
3. Add social share buttons
4. Create admin panel for challenge management
