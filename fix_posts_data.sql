-- ============================================================
-- Run this in Supabase SQL Editor
-- Fixes: official info, formal_request, lat/lng on all posts
-- ============================================================

-- 1. Fill official info by issue type
UPDATE posts SET
  official_name = 'Kevin Mattingly, Public Works Director',
  department = 'Tempe Public Works',
  official_email = 'publicworks@tempe.gov'
WHERE (official_name IS NULL OR official_name = '')
  AND issue_type IN ('road_maintenance', 'other');

UPDATE posts SET
  official_name = 'Traffic Engineering Division',
  department = 'Tempe Traffic Engineering',
  official_email = 'traffic@tempe.gov'
WHERE (official_name IS NULL OR official_name = '')
  AND issue_type = 'traffic_safety';

UPDATE posts SET
  official_name = 'Jody Doyle, Parks Director',
  department = 'Tempe Parks and Recreation',
  official_email = 'parks@tempe.gov'
WHERE (official_name IS NULL OR official_name = '')
  AND issue_type = 'parks_facilities';

UPDATE posts SET
  official_name = 'City of Tempe 311 Service',
  department = 'Tempe Street Lighting Division',
  official_email = '311@tempe.gov'
WHERE (official_name IS NULL OR official_name = '')
  AND issue_type = 'street_lighting';

-- Catch-all for anything still null
UPDATE posts SET
  official_name = 'Kevin Mattingly, Public Works Director',
  department = 'Tempe Public Works',
  official_email = 'publicworks@tempe.gov'
WHERE (official_name IS NULL OR official_name = '');

-- 2. Fill missing formal_request
UPDATE posts SET
  formal_request = 'Dear ' || COALESCE(official_name, 'City of Tempe') || ','
    || E'\n\nWe the undersigned residents formally request immediate attention to the following community concern: '
    || complaint
    || E'\n\nThis issue has been raised by ' || echo_count || ' residents and requires urgent action per applicable Tempe Municipal Code. We respectfully request a response within 30 days.'
    || E'\n\nSincerely,\nConcerned Tempe Residents'
WHERE formal_request IS NULL OR formal_request = '';

-- 3. Fill lat/lng by location keyword
UPDATE posts SET lat = 33.4152, lng = -111.9093
WHERE (lat IS NULL) AND location ILIKE '%apache%';

UPDATE posts SET lat = 33.3942, lng = -111.9261
WHERE (lat IS NULL) AND location ILIKE '%kyrene%';

UPDATE posts SET lat = 33.3978, lng = -111.9307
WHERE (lat IS NULL) AND location ILIKE '%rural%';

UPDATE posts SET lat = 33.4255, lng = -111.9400
WHERE (lat IS NULL) AND location ILIKE '%mcclintock%';

UPDATE posts SET lat = 33.4152, lng = -111.8315
WHERE (lat IS NULL) AND (location ILIKE '%mill%' OR location ILIKE '%university%');

UPDATE posts SET lat = 33.3784, lng = -111.9318
WHERE (lat IS NULL) AND location ILIKE '%southern%';

UPDATE posts SET lat = 33.4045, lng = -111.9400
WHERE (lat IS NULL) AND location ILIKE '%kiwanis%';

UPDATE posts SET lat = 33.4255, lng = -111.9261
WHERE (lat IS NULL) AND (location ILIKE '%town lake%' OR location ILIKE '%rio salado%');

-- Catch-all: center of Tempe for anything still missing coords
UPDATE posts SET lat = 33.3890, lng = -111.9318
WHERE lat IS NULL OR lng IS NULL;

-- 4. Verify completeness
SELECT
  COUNT(*) AS total,
  COUNT(official_name) AS has_official,
  COUNT(official_email) AS has_email,
  COUNT(formal_request) AS has_letter,
  COUNT(lat) AS has_lat,
  COUNT(lng) AS has_lng
FROM posts;
