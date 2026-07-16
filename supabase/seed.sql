-- Beetorial Phase 1 Complete Seed Data
-- Seeds 4 user roles with easy password 'password123' (Bcrypt hash: '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e')

-- 1. Seed Auth Users
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, created_at, updated_at
) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'alex.jenkins@beetorial.com', '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e', NOW(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"Alex Jenkins"}', false, 'authenticated', 'authenticated', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'emily.rivers@beetorial.com', '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e', NOW(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"Emily Rivers"}', false, 'authenticated', 'authenticated', NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'marcus.vance@beetorial.com', '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e', NOW(), '{"provider":"email","providers":["email"]}', '{"role":"student","full_name":"Marcus Vance"}', false, 'authenticated', 'authenticated', NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'sarah.jenkins@beetorial.com', '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e', NOW(), '{"provider":"email","providers":["email"]}', '{"role":"parent","full_name":"Sarah Jenkins"}', false, 'authenticated', 'authenticated', NOW(), NOW()),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'liam.sterling@beetorial.com', '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e', NOW(), '{"provider":"email","providers":["email"]}', '{"role":"mentor","full_name":"Dr. Liam Sterling"}', false, 'authenticated', 'authenticated', NOW(), NOW()),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'clara.finch@beetorial.com', '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e', NOW(), '{"provider":"email","providers":["email"]}', '{"role":"mentor","full_name":"Clara Finch"}', false, 'authenticated', 'authenticated', NOW(), NOW()),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'admin.coordinator@beetorial.com', '$2a$10$Wp22yVdG9JmUqXf7Ww04iOuQ.s2R/B1W7J2L1z6z01O8J2f.Z7w/e', NOW(), '{"provider":"email","providers":["email"]}', '{"role":"admin","full_name":"Admin Coordinator"}', false, 'authenticated', 'authenticated', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Link Parent and Student
INSERT INTO public.parent_student (parent_id, student_id) VALUES
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 3. Seed Subjects
INSERT INTO public.subjects (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Mathematics', '1-on-1 focus on algebra, decimals, fractions, and logic solving.'),
('22222222-2222-2222-2222-222222222222', 'Science', 'Exploring mechanics, ecosystems, chemical interactions, and biology.'),
('33333333-3333-3333-3333-333333333333', 'English', 'Building vocabulary, reading comprehension, grammar details, and text essays.')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Chapters
INSERT INTO public.chapters (id, subject_id, name, order_index) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Fractions & Ratios', 1),
('c1111111-1111-1111-1111-222222222222', '11111111-1111-1111-1111-111111111111', 'Intro to Equations', 2),
('c2222222-2222-2222-2222-111111111111', '22222222-2222-2222-2222-222222222222', 'The Water Cycle', 1),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Forces & Motion', 2),
('c3333333-3333-3333-3333-111111111111', '33333333-3333-3333-3333-333333333333', 'Narrative Essay Writing', 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Topics
INSERT INTO public.topics (id, chapter_id, name, order_index) VALUES
('t1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Simplifying Fractions', 1),
('t1111111-1111-1111-1111-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Adding Mixed Numbers', 2),
('t2222222-2222-2222-2222-111111111111', 'c2222222-2222-2222-2222-111111111111', 'Evaporation & Condensation', 1),
('t2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-111111111111', 'Precipitation Patterns', 2)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Notes
INSERT INTO public.notes (id, topic_id, title, content, updated_at) VALUES
('n1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111111', 'Mastering Simplified Fractions', 'To simplify a fraction, divide both the numerator and the denominator by their Greatest Common Divisor (GCD). For example, to simplify 12/16, the GCD of 12 and 16 is 4. Dividing both parts by 4 gives 3/4. Double check by ensuring no common factors remain other than 1.', NOW() - INTERVAL '2 hours'),
('n2222222-2222-2222-2222-222222222222', 't2222222-2222-2222-2222-111111111111', 'Ecosystem Condensation Cycles', 'Evaporation occurs when solar radiation heats liquid surface water, causing it to escape into gaseous vapour. As temperature cools high in the atmosphere, vapour condenses into water droplets, forming visible clouds. Condensation is the exact thermodynamic inverse of evaporation.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Student Progress Metrics
INSERT INTO public.student_progress (student_id, accuracy_percentage, streak_days, xp) VALUES
('00000000-0000-0000-0000-000000000001', 94, 7, 680),
('00000000-0000-0000-0000-000000000002', 88, 3, 410),
('00000000-0000-0000-0000-000000000003', 91, 12, 1250)
ON CONFLICT (student_id) DO NOTHING;

-- 8. Seed Scheduled Classes (Relative to current date)
INSERT INTO public.classes (id, student_id, mentor_id, start_time, end_time, subject, status) VALUES
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', NOW(), NOW() + INTERVAL '1 hour', 'Mathematics', 'scheduled'),
('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 'Science', 'scheduled'),
('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 1 hour', 'English', 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Assignments
INSERT INTO public.assignments (id, student_id, title, due_date, status, xp_reward) VALUES
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Fractions Operations Workbook', NOW() + INTERVAL '2 days', 'pending', 120),
('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Condensation Science Lab Summary', NOW() + INTERVAL '4 days', 'pending', 150)
ON CONFLICT (id) DO NOTHING;
