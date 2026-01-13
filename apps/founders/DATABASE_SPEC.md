# Founders 서비스 데이터베이스 명세서

## 서비스 개요
- **서비스명**: 창업가 가상 대담 (Founders)
- **설명**: 유명 창업가들의 사고방식으로 대화하는 AI 멘토 서비스
- **포트**: 3006

---

## 테이블 목록

### 1. profiles
> 사용자 프로필 정보 (auth.users 확장)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, FK(auth.users) | 사용자 ID |
| username | TEXT | - | 닉네임 |
| credits | INTEGER | DEFAULT 50, NOT NULL | 크레딧 잔액 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일 |

**RLS 정책**:
- SELECT: 본인만 조회 가능
- UPDATE: 본인만 수정 가능

---

### 2. personas
> AI 멘토 페르소나 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | TEXT | PK | 페르소나 ID (elon, steve, jeff, bill, mark) |
| name | TEXT | NOT NULL | 페르소나 이름 |
| title | TEXT | NOT NULL | 영문 타이틀 |
| philosophy | TEXT | NOT NULL | 핵심 철학 |
| color | TEXT | NOT NULL | 테마 색상 (HEX) |
| avatar_url | TEXT | - | 아바타 이미지 URL |
| system_prompt | TEXT | NOT NULL | AI 시스템 프롬프트 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |

**RLS 정책**:
- SELECT: 누구나 조회 가능 (public)

**초기 데이터**: 5개 페르소나
- `elon`: 첫 원리 사고가 (#E82127)
- `steve`: 디자인 혁신가 (#555555)
- `jeff`: 고객 집착가 (#FF9900)
- `bill`: 기술 낙관주의자 (#00A4EF)
- `mark`: 연결의 설계자 (#1877F2)

---

### 3. chat_sessions
> 채팅 세션 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 세션 ID |
| user_id | UUID | FK(auth.users), NOT NULL | 사용자 ID |
| persona_id | TEXT | FK(personas), NOT NULL | 페르소나 ID |
| title | TEXT | - | 대화 제목 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일 |

**인덱스**:
- `idx_chat_sessions_user_id` ON user_id
- `idx_chat_sessions_persona_id` ON persona_id

**RLS 정책**:
- SELECT: 본인 세션만 조회
- INSERT: 본인 세션만 생성
- DELETE: 본인 세션만 삭제

---

### 4. messages
> 채팅 메시지

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 메시지 ID |
| session_id | UUID | FK(chat_sessions), NOT NULL | 세션 ID |
| role | TEXT | NOT NULL, CHECK (user/assistant) | 발신자 역할 |
| content | TEXT | NOT NULL | 메시지 내용 |
| is_highlighted | BOOLEAN | DEFAULT FALSE | 하이라이트 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |

**인덱스**:
- `idx_messages_session_id` ON session_id

**RLS 정책**:
- SELECT: 본인 세션의 메시지만 조회
- INSERT: 본인 세션에만 메시지 추가

---

### 5. quotes
> 창업가 명언

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 명언 ID |
| persona_id | TEXT | FK(personas), NOT NULL | 페르소나 ID |
| content | TEXT | NOT NULL | 명언 내용 |
| source | TEXT | - | 출처 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |

**인덱스**:
- `idx_quotes_persona_id` ON persona_id

**RLS 정책**:
- SELECT: 누구나 조회 가능 (public)

**초기 데이터**: 페르소나당 8~10개 명언 (총 40개)

---

### 6. credit_transactions
> 크레딧 거래 내역

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 거래 ID |
| user_id | UUID | FK(auth.users), NOT NULL | 사용자 ID |
| amount | INTEGER | NOT NULL | 변동량 (+/-) |
| type | TEXT | NOT NULL, CHECK (initial/usage/bonus) | 거래 유형 |
| description | TEXT | - | 설명 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |

**인덱스**:
- `idx_credit_transactions_user_id` ON user_id

**RLS 정책**:
- SELECT: 본인 거래 내역만 조회

**거래 유형**:
- `initial`: 회원가입 보너스 (+50)
- `usage`: 대화 사용 (-1)
- `bonus`: 추가 보너스

---

## 트리거 및 함수

### handle_new_user()
> 회원가입 시 자동 실행

```sql
-- 신규 사용자 프로필 생성 + 초기 크레딧 지급
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, credits)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', 50);

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 50, 'initial', '회원가입 보너스');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### handle_updated_at()
> updated_at 자동 갱신

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles, chat_sessions 테이블에 적용
```

---

## 관계도 (ERD)

```
auth.users
    │
    ├──< profiles (1:1)
    │
    ├──< chat_sessions (1:N)
    │       │
    │       └──< messages (1:N)
    │
    └──< credit_transactions (1:N)

personas
    │
    ├──< chat_sessions (1:N)
    │
    └──< quotes (1:N)
```

---

## 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 비고

- 모든 테이블에 RLS(Row Level Security) 활성화
- CASCADE DELETE: 사용자 삭제 시 관련 데이터 자동 삭제
- 크레딧 차감은 API 레벨에서 처리 (트랜잭션)
