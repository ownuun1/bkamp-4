-- =====================================================
-- JOBHUNT PROFILES & CATEGORY SUPPORT
-- =====================================================

-- Create jobhunt_profiles table for user skills/preferences
CREATE TABLE IF NOT EXISTS jobhunt_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  -- Resume/skills data
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  strengths TEXT[] DEFAULT '{}',
  summary TEXT,
  -- User preferences
  countries TEXT[] DEFAULT '{}',  -- Worldwide, US, EU, UK, Asia, Korea
  categories TEXT[] DEFAULT '{}', -- dev, design, marketing, sales, support, data, writing, other
  preferred_locale TEXT DEFAULT 'en',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category column to jobhunt_postings
ALTER TABLE jobhunt_postings
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_jobhunt_postings_category ON jobhunt_postings(category);
CREATE INDEX IF NOT EXISTS idx_jobhunt_profiles_user ON jobhunt_profiles(user_id);

-- RLS for jobhunt_profiles
ALTER TABLE jobhunt_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON jobhunt_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON jobhunt_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON jobhunt_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_jobhunt_profiles_updated_at
  BEFORE UPDATE ON jobhunt_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
