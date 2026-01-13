-- Jansori AI Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. profiles - 사용자 프로필
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Seoul',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. goals - 사용자 목표
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  category TEXT NOT NULL DEFAULT 'etc' CHECK (category IN ('study', 'exercise', 'habit', 'self_dev', 'etc')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_active ON goals(user_id, is_active);

-- RLS 정책
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own goals"
  ON goals FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 3. nagging_settings - 잔소리 설정
-- ============================================
CREATE TABLE IF NOT EXISTS nagging_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 톤 설정: friend, mom, teacher, coach, tsundere
  tone TEXT NOT NULL DEFAULT 'friend' CHECK (tone IN ('friend', 'mom', 'teacher', 'coach', 'tsundere')),

  -- 주기 설정: daily, weekdays, weekends, custom
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
  custom_days INTEGER[] DEFAULT NULL, -- [0,1,2,3,4,5,6] where 0=Sunday

  -- 시간대 설정 (최대 3개)
  time_slots JSONB NOT NULL DEFAULT '["09:00"]'::jsonb,

  -- 상태
  is_enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(goal_id)
);

CREATE INDEX idx_nagging_settings_user ON nagging_settings(user_id);
CREATE INDEX idx_nagging_settings_enabled ON nagging_settings(is_enabled);

-- RLS 정책
ALTER TABLE nagging_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own nagging_settings"
  ON nagging_settings FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 4. nagging_history - 잔소리 히스토리
-- ============================================
CREATE TABLE IF NOT EXISTS nagging_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  tone TEXT NOT NULL,

  -- 전송 상태
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'failed')),

  -- 사용자 반응 (향후 확장)
  user_response TEXT CHECK (user_response IN ('done', 'snooze', 'skip', NULL)),
  responded_at TIMESTAMPTZ
);

CREATE INDEX idx_nagging_history_user ON nagging_history(user_id, sent_at DESC);
CREATE INDEX idx_nagging_history_goal ON nagging_history(goal_id, sent_at DESC);

-- RLS 정책
ALTER TABLE nagging_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nagging_history"
  ON nagging_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert nagging_history"
  ON nagging_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. push_subscriptions - 푸시 알림 구독
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Web Push 구독 정보
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,

  -- 메타데이터
  user_agent TEXT,
  device_name TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id, is_active);

-- RLS 정책
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push_subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 6. updated_at 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nagging_settings_updated_at
  BEFORE UPDATE ON nagging_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
