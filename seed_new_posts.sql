-- Run this in Supabase SQL Editor to add 6 more seeded posts
INSERT INTO posts (complaint, formal_request, department, official_name, official_email, issue_type, location, lat, lng, echo_count, status) VALUES
(
  'The sidewalk on University Drive near ASU is completely broken and cracked, students are tripping and falling',
  'Dear Tempe Public Works Director,

We the undersigned residents formally request immediate repair of the damaged sidewalk on University Drive between Mill Avenue and Rural Road. Multiple injury incidents have been reported. Per Arizona Revised Statute § 28-1103, municipalities bear liability for dangerous walkway conditions.

Sincerely,
34 ASU Area Residents',
  'Tempe Public Works', 'Kevin Mattingly, Public Works Director', 'publicworks@tempe.gov',
  'road_maintenance', 'University Drive near ASU, Tempe', 33.4215, -111.9340, 34, 'pending'
),
(
  'There is graffiti all over the underpass on Mill Ave and it has been there for months making the area feel unsafe',
  'Dear Tempe Community Development Department,

We formally request graffiti abatement at the Mill Avenue underpass at Rio Salado Parkway. This graffiti has been present for over 60 days and violates Tempe Municipal Code § 18-55 regarding public property maintenance.

Sincerely,
18 Downtown Tempe Residents',
  'Tempe Community Development', 'Community Services Division', 'community@tempe.gov',
  'other', 'Mill Ave Underpass, Tempe', 33.4280, -111.9420, 18, 'sent'
),
(
  'The bus stop on Southern Ave has no shelter and elderly people are standing in 110 degree heat waiting for the bus',
  'Dear Valley Metro and Tempe Transportation Department,

We formally request installation of a shade shelter at the bus stop located at Southern Avenue and McClintock Drive. Summer temperatures regularly exceed 110°F creating a heat illness risk for transit-dependent residents. Per ADA Title II requirements, public transit stops must provide reasonable accommodations.

Sincerely,
41 South Tempe Residents',
  'Tempe Transportation & Valley Metro', 'Transportation Director', 'transportation@tempe.gov',
  'other', 'Southern Ave & McClintock Dr, Tempe', 33.3890, -111.9100, 41, 'pending'
),
(
  'Homeless encampment near Tempe Town Lake is growing and there is trash and needles on the ground near the path',
  'Dear Tempe Human Services and Parks Department,

We formally request coordinated outreach and cleanup services at the encampment located near the Tempe Town Lake pedestrian path east of Rural Road. Public health concerns include improper waste disposal creating hazards under Maricopa County Health Code § 6-6. We urge compassionate outreach-first response.

Sincerely,
27 Town Lake Residents',
  'Tempe Human Services', 'Human Services Director', 'humanservices@tempe.gov',
  'other', 'Tempe Town Lake East Path, Tempe', 33.4280, -111.9150, 27, 'pending'
),
(
  'The dog park at Kiwanis Park has broken fencing and dogs are escaping onto the street which is dangerous',
  'Dear Tempe Parks and Recreation Department,

We formally request urgent repair of the perimeter fencing at the Kiwanis Park Dog Park located at 6111 S All America Way. Multiple fence breaches have resulted in dogs escaping onto adjacent roadways. Per Tempe Municipal Code § 4-22, the City is responsible for maintaining safe conditions at all off-leash dog facilities.

Sincerely,
22 Kiwanis Park Dog Owners',
  'Tempe Parks and Recreation', 'Jody Doyle, Parks Director', 'parks@tempe.gov',
  'parks_facilities', 'Kiwanis Park, 6111 S All America Way, Tempe', 33.3900, -111.9600, 22, 'pending'
),
(
  'Speeding cars on Rural Road between Baseline and Elliot are putting kids at risk near the elementary schools',
  'Dear Tempe Traffic Engineering Division,

We formally request a speed study and installation of speed feedback signs on Rural Road between Baseline Road and Elliot Road. Three elementary schools are located within this corridor and recorded vehicle speeds regularly exceed posted 35mph limits by 15-20mph. Per ARS § 28-797, school zone safety is a municipal priority obligation.

Sincerely,
56 Rural Road Families',
  'Tempe Traffic Engineering', 'Traffic Engineering Division', 'traffic@tempe.gov',
  'traffic_safety', 'Rural Road between Baseline & Elliot, Tempe', 33.3780, -111.9500, 56, 'sent'
);

SELECT COUNT(*) FROM posts;
