-- Complete database schema for company management

-- Companies table
CREATE TABLE IF NOT EXISTS companies_28d7f5a9c4 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments_28d7f5a9c4 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies_28d7f5a9c4(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles_fec4a7b9d6 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  app_role TEXT DEFAULT 'User' CHECK (app_role IN ('Superadmin', 'Owner', 'Admin', 'User')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Department junction table
CREATE TABLE IF NOT EXISTS user_departments_28d7f5a9c4 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments_28d7f5a9c4(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries_9f2d81ac56 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies_28d7f5a9c4(id) ON DELETE CASCADE,
  department_ids UUID[] NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('kommen', 'gehen', 'pause_start', 'pause_end', 'remote_start', 'remote_end')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL,
  notes TEXT,
  source TEXT DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time daily summaries table
CREATE TABLE IF NOT EXISTS time_daily_summaries_9f2d81ac56 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies_28d7f5a9c4(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_work_seconds INTEGER DEFAULT 0,
  total_break_seconds INTEGER DEFAULT 0,
  total_remote_seconds INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id, date)
);

-- Enable Row Level Security
ALTER TABLE companies_28d7f5a9c4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments_28d7f5a9c4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_fec4a7b9d6 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_departments_28d7f5a9c4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries_9f2d81ac56 ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_daily_summaries_9f2d81ac56 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies_28d7f5a9c4
CREATE POLICY "Superadmin can manage all companies" ON companies_28d7f5a9c4
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Owners can manage their own company" ON companies_28d7f5a9c4
  FOR ALL USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Users can view their company" ON companies_28d7f5a9c4
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_departments_28d7f5a9c4 ud
      JOIN departments_28d7f5a9c4 d ON ud.department_id = d.id
      WHERE ud.user_id = auth.uid() AND d.company_id = companies_28d7f5a9c4.id
    ) OR
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role IN ('Superadmin', 'Owner')
    )
  );

-- RLS Policies for departments_28d7f5a9c4
CREATE POLICY "Superadmin can manage all departments" ON departments_28d7f5a9c4
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Owners can manage departments in their company" ON departments_28d7f5a9c4
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies_28d7f5a9c4 c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Users can view their departments" ON departments_28d7f5a9c4
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_departments_28d7f5a9c4 ud
      WHERE ud.user_id = auth.uid() AND ud.department_id = departments_28d7f5a9c4.id
    ) OR
    EXISTS (
      SELECT 1 FROM companies_28d7f5a9c4 c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role IN ('Superadmin', 'Owner', 'Admin')
    )
  );

-- RLS Policies for profiles_fec4a7b9d6
CREATE POLICY "Users can view their own profile" ON profiles_fec4a7b9d6
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles_fec4a7b9d6
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Superadmin can manage all profiles" ON profiles_fec4a7b9d6
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Owners and Admins can view profiles in their scope" ON profiles_fec4a7b9d6
  FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 p
      WHERE p.id = auth.uid() AND p.app_role IN ('Superadmin', 'Owner', 'Admin')
    )
  );

-- RLS Policies for user_departments_28d7f5a9c4
CREATE POLICY "Superadmin can manage all user departments" ON user_departments_28d7f5a9c4
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Owners can manage user departments in their company" ON user_departments_28d7f5a9c4
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM departments_28d7f5a9c4 d
      JOIN companies_28d7f5a9c4 c ON d.company_id = c.id
      WHERE d.id = department_id AND c.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Users can view their own department assignments" ON user_departments_28d7f5a9c4
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role IN ('Superadmin', 'Owner', 'Admin')
    )
  );

-- RLS Policies for time_entries_9f2d81ac56
CREATE POLICY "Users can manage their own time entries" ON time_entries_9f2d81ac56
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Superadmin can view all time entries" ON time_entries_9f2d81ac56
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Owners can view time entries in their company" ON time_entries_9f2d81ac56
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies_28d7f5a9c4 c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

-- RLS Policies for time_daily_summaries_9f2d81ac56
CREATE POLICY "Users can view their own summaries" ON time_daily_summaries_9f2d81ac56
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Superadmin can view all summaries" ON time_daily_summaries_9f2d81ac56
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

CREATE POLICY "Owners can view summaries in their company" ON time_daily_summaries_9f2d81ac56
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies_28d7f5a9c4 c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_fec4a7b9d6 
      WHERE id = auth.uid() AND app_role = 'Superadmin'
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies_28d7f5a9c4(owner_id);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments_28d7f5a9c4(company_id);
CREATE INDEX IF NOT EXISTS idx_user_departments_user_id ON user_departments_28d7f5a9c4(user_id);
CREATE INDEX IF NOT EXISTS idx_user_departments_department_id ON user_departments_28d7f5a9c4(department_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries_9f2d81ac56(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries_9f2d81ac56(date);
CREATE INDEX IF NOT EXISTS idx_time_summaries_user_date ON time_daily_summaries_9f2d81ac56(user_id, date);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles_fec4a7b9d6 (id, app_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'app_role', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies_28d7f5a9c4
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments_28d7f5a9c4
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles_fec4a7b9d6
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();