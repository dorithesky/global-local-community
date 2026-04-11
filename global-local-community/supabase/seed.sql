insert into profiles (id, username, display_name, bio, city, origin_country, occupation, onboarding_completed)
values
  ('00000000-0000-0000-0000-000000000001', 'mina-expat', 'Mina Carter', 'Community host for newcomers in Daegu.', 'Daegu', 'Canada', 'Teacher', true),
  ('00000000-0000-0000-0000-000000000002', 'jaynomad', 'Jay Park', 'Sharing practical Korea life tips.', 'Daegu', 'USA', 'Designer', true),
  ('00000000-0000-0000-0000-000000000003', 'sara-abroad', 'Sara Kim', 'Helping people find housing and jobs.', 'Daegu', 'UK', 'Recruiter', true)
on conflict (id) do nothing;

insert into posts (author_id, category, title, body, city, district, tags, ai_label, ai_score, ai_explanation)
values
  ('00000000-0000-0000-0000-000000000001','housing','Studio near Kyungpook National University','I found a landlord offering a clean studio with no realtor fee. Happy to share contact details and deposit range.','Daegu','Buk-gu',array['housing','studio','university'],'housing',0.96,'Housing-related keywords and rental intent detected.'),
  ('00000000-0000-0000-0000-000000000002','jobs','Part-time English tutoring openings this month','A local academy in Suseong is hiring evening tutors. Visa compatibility still needs checking.','Daegu','Suseong-gu',array['jobs','teaching','part-time'],'jobs',0.94,'Employment intent and tutoring language detected.'),
  ('00000000-0000-0000-0000-000000000003','daily-life','Best bank account for foreigners in Daegu?','I need a bank with smooth online onboarding and an English app. Any recent experience?','Daegu','Jung-gu',array['banking','daily-life','finance'],'daily-life',0.88,'Daily life navigation topic with finance context.')
on conflict do nothing;
