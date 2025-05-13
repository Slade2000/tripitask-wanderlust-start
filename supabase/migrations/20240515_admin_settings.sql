
-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add row-level security policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users with admin role to modify settings
CREATE POLICY "Allow admins to modify settings" ON admin_settings
  FOR ALL
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Allow any authenticated user to read settings
CREATE POLICY "Allow authenticated users to read settings" ON admin_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert initial settings
INSERT INTO admin_settings (name, value, description)
VALUES 
  ('commission_rate', '5', 'Platform commission percentage on tasks'),
  ('min_task_budget', '5', 'Minimum allowed task budget in dollars'),
  ('max_files_per_task', '5', 'Maximum number of files allowed per task')
ON CONFLICT (name) DO NOTHING;

-- Update offers table to add net_amount column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS net_amount NUMERIC(10, 2);

-- Ensure task status can be properly set
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE tasks ADD CONSTRAINT valid_status 
  CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));
