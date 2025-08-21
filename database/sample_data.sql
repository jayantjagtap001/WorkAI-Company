-- Sample data for testing company management functionality

-- Insert sample companies
INSERT INTO companies_28d7f5a9c4 (id, name, industry, owner_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TechCorp GmbH', 'Technologie', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440002', 'Marketing Solutions AG', 'Marketing', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440003', 'Finance Pro Ltd', 'Finanzdienstleistungen', '550e8400-e29b-41d4-a716-446655440103', NOW() - INTERVAL '20 days');

-- Insert sample departments
INSERT INTO departments_28d7f5a9c4 (id, name, company_id, created_at) VALUES
-- TechCorp GmbH departments
('550e8400-e29b-41d4-a716-446655440201', 'IT-Entwicklung', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '29 days'),
('550e8400-e29b-41d4-a716-446655440202', 'Qualitätssicherung', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '28 days'),
('550e8400-e29b-41d4-a716-446655440203', 'DevOps', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '27 days'),

-- Marketing Solutions AG departments
('550e8400-e29b-41d4-a716-446655440204', 'Digital Marketing', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '24 days'),
('550e8400-e29b-41d4-a716-446655440205', 'Content Creation', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '23 days'),
('550e8400-e29b-41d4-a716-446655440206', 'Analytics', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '22 days'),

-- Finance Pro Ltd departments
('550e8400-e29b-41d4-a716-446655440207', 'Buchhaltung', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '19 days'),
('550e8400-e29b-41d4-a716-446655440208', 'Steuerberatung', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '18 days'),
('550e8400-e29b-41d4-a716-446655440209', 'Finanzplanung', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '17 days');

-- Sample profiles (these would normally be created by the auth trigger)
INSERT INTO profiles_fec4a7b9d6 (id, app_role, is_active, created_at) VALUES
-- Company owners
('550e8400-e29b-41d4-a716-446655440101', 'Owner', true, NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440102', 'Owner', true, NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440103', 'Owner', true, NOW() - INTERVAL '20 days'),

-- Superadmin
('550e8400-e29b-41d4-a716-446655440100', 'Superadmin', true, NOW() - INTERVAL '60 days'),

-- Sample employees
('550e8400-e29b-41d4-a716-446655440301', 'Admin', true, NOW() - INTERVAL '15 days'),
('550e8400-e29b-41d4-a716-446655440302', 'User', true, NOW() - INTERVAL '14 days'),
('550e8400-e29b-41d4-a716-446655440303', 'User', true, NOW() - INTERVAL '13 days'),
('550e8400-e29b-41d4-a716-446655440304', 'User', false, NOW() - INTERVAL '12 days'), -- Inactive user
('550e8400-e29b-41d4-a716-446655440305', 'Admin', true, NOW() - INTERVAL '11 days'),
('550e8400-e29b-41d4-a716-446655440306', 'User', true, NOW() - INTERVAL '10 days');

-- Sample user-department assignments
INSERT INTO user_departments_28d7f5a9c4 (user_id, department_id, created_at) VALUES
-- TechCorp GmbH users
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', NOW() - INTERVAL '15 days'), -- Admin in IT-Entwicklung
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', NOW() - INTERVAL '14 days'), -- User in IT-Entwicklung
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440202', NOW() - INTERVAL '13 days'), -- User in QS
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440203', NOW() - INTERVAL '12 days'), -- Inactive user in DevOps

-- Marketing Solutions AG users
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440204', NOW() - INTERVAL '11 days'), -- Admin in Digital Marketing
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440205', NOW() - INTERVAL '10 days'); -- User in Content Creation

-- Sample time entries
INSERT INTO time_entries_9f2d81ac56 (user_id, company_id, department_ids, action_type, timestamp, date, notes) VALUES
-- Today's entries for active users
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '{"550e8400-e29b-41d4-a716-446655440201"}', 'kommen', NOW() - INTERVAL '4 hours', CURRENT_DATE, 'Früher Start heute'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440001', '{"550e8400-e29b-41d4-a716-446655440202"}', 'kommen', NOW() - INTERVAL '3 hours', CURRENT_DATE, 'Pünktlich angekommen'),

-- Yesterday's completed entries
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '{"550e8400-e29b-41d4-a716-446655440201"}', 'kommen', (CURRENT_DATE - INTERVAL '1 day') + TIME '08:00:00', CURRENT_DATE - INTERVAL '1 day', null),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '{"550e8400-e29b-41d4-a716-446655440201"}', 'pause_start', (CURRENT_DATE - INTERVAL '1 day') + TIME '12:00:00', CURRENT_DATE - INTERVAL '1 day', 'Mittagspause'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '{"550e8400-e29b-41d4-a716-446655440201"}', 'pause_end', (CURRENT_DATE - INTERVAL '1 day') + TIME '12:30:00', CURRENT_DATE - INTERVAL '1 day', null),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '{"550e8400-e29b-41d4-a716-446655440201"}', 'gehen', (CURRENT_DATE - INTERVAL '1 day') + TIME '17:00:00', CURRENT_DATE - INTERVAL '1 day', 'Feierabend');

-- Sample time summaries
INSERT INTO time_daily_summaries_9f2d81ac56 (user_id, company_id, date, total_work_seconds, total_break_seconds, total_remote_seconds) VALUES
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 28800, 1800, 0), -- 8 hours work, 30 min break
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 25200, 1800, 7200); -- 7 hours work, 30 min break, 2 hours remote

-- Comments explaining the sample data structure
/*
This sample data creates:

1. Three companies with different industries:
   - TechCorp GmbH (Technology)
   - Marketing Solutions AG (Marketing) 
   - Finance Pro Ltd (Financial Services)

2. Each company has 3 departments with realistic names

3. Users with different roles:
   - 1 Superadmin (can manage everything)
   - 3 Owners (one for each company)
   - 2 Admins (can manage users in their departments)
   - 4 Users (regular employees, one inactive)

4. User-department assignments showing the relationship structure

5. Sample time entries showing:
   - Current active sessions
   - Completed daily time tracking
   - Different action types (kommen, gehen, pause_start, etc.)

6. Time summaries for reporting

This data allows testing of:
- Company deletion with active/inactive users
- User management across different companies
- Time tracking functionality
- Role-based access control
- Department management

To test the deletion validation:
- TechCorp has 3 active users and 1 inactive user -> should prevent deletion
- Marketing Solutions has 2 active users -> should prevent deletion  
- Finance Pro has 0 users -> should allow deletion
*/