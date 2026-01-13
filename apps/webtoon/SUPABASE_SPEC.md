# Webtoon 서비스 Supabase 명세서

## 서비스 개요
- **서비스명**: 웹툰 추천
- **설명**: AI 기반 웹툰 취향 분석 및 맞춤 추천 서비스

---

## 1. Authentication

### OAuth Providers
| Provider | 필수 | 용도 |
|----------|------|------|
| Google | O | 소셜 로그인 |
| Kakao | O | 소셜 로그인 |

### Redirect URLs
```
http://localhost:3007/auth/callback
https://your-domain.com/auth/callback
```

---

## 2. Database Tables

### 2.1 profiles
사용자 프로필 (auth.users와 연동)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 트리거: 새 사용자 가입 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.2 recommendations
AI 추천 기록 저장

```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  input_webtoons TEXT[] NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);

-- RLS 정책
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### recommendations.recommendations JSONB 구조
```json
{
  "taste_analysis": "사용자의 취향 분석 텍스트",
  "recommendations": [
    {
      "title": "웹툰 제목",
      "author": "작가명",
      "genre": ["장르1", "장르2"],
      "platform": "naver | kakao | kakaopage",
      "platform_url": "",
      "reason": "추천 이유",
      "similarity_point": "입력 웹툰과의 공통점"
    }
  ]
}
```

---

## 3. Row Level Security (RLS) 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | 본인만 | 트리거 | 본인만 | - |
| recommendations | 본인만 | 본인만 | - | - |

---

## 4. 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (서버 전용)
OPENAI_API_KEY=your-openai-api-key
```

---

## 5. 초기 설정 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] Google OAuth 설정 (Google Cloud Console)
- [ ] Kakao OAuth 설정 (Kakao Developers)
- [ ] Auth > URL Configuration > Redirect URLs 추가
- [ ] profiles 테이블 생성
- [ ] recommendations 테이블 생성
- [ ] RLS 정책 적용
- [ ] 트리거 함수 생성
