-- =====================================================
-- WEBTOON 제보 기능 스키마
-- =====================================================

-- 웹툰 제보 테이블
CREATE TABLE IF NOT EXISTS webtoon_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  platform TEXT, -- 'naver', 'kakao', 'kakaopage', 'lezhin', 'other', NULL
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webtoon_suggestions_status ON webtoon_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_webtoon_suggestions_created ON webtoon_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webtoon_suggestions_user ON webtoon_suggestions(user_id);

-- RLS
ALTER TABLE webtoon_suggestions ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 제보 가능
CREATE POLICY "Users can insert suggestions" ON webtoon_suggestions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 자신의 제보만 조회 가능
CREATE POLICY "Users can view own suggestions" ON webtoon_suggestions
  FOR SELECT USING (auth.uid() = user_id);
