# Jansori (잔소리 AI) - Supabase 명세서

## 서비스 개요
- **서비스명**: Jansori (잔소리 AI)
- **설명**: 친구/엄마/선생님 등 다양한 톤으로 AI가 주기적으로 잔소리를 보내주는 동기부여 서비스
- **포트**: 3003

---

## 1. 테이블 명세

### 1.1 profiles
사용자 프로필 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, FK(auth.users) | 사용자 ID |
| nickname | TEXT | NOT NULL | 닉네임 |
| avatar_url | TEXT | NULLABLE | 프로필 이미지 URL |
| timezone | TEXT | DEFAULT 'Asia/Seoul' | 타임존 |
| onboarding_completed | BOOLEAN | DEFAULT FALSE | 온보딩 완료 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일 |

### 1.2 goals
사용자 목표

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 목표 ID |
| user_id | UUID | FK(auth.users), NOT NULL | 사용자 ID |
| title | TEXT | NOT NULL, CHECK(<=50자) | 목표 제목 |
| description | TEXT | NULLABLE, CHECK(<=200자) | 목표 설명 |
| category | TEXT | NOT NULL, DEFAULT 'etc' | 카테고리 |
| is_active | BOOLEAN | DEFAULT TRUE | 활성화 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일 |

**category 값**: `study`, `exercise`, `habit`, `self_dev`, `etc`

### 1.3 nagging_settings
잔소리 설정

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 설정 ID |
| goal_id | UUID | FK(goals), UNIQUE, NOT NULL | 목표 ID |
| user_id | UUID | FK(auth.users), NOT NULL | 사용자 ID |
| tone | TEXT | NOT NULL, DEFAULT 'friend' | 잔소리 톤 |
| frequency | TEXT | NOT NULL, DEFAULT 'daily' | 주기 |
| custom_days | INTEGER[] | NULLABLE | 커스텀 요일 (0=일요일) |
| time_slots | JSONB | NOT NULL, DEFAULT '["09:00"]' | 알림 시간 (최대 3개) |
| is_enabled | BOOLEAN | DEFAULT TRUE | 활성화 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일 |

**tone 값**: `friend`, `mom`, `teacher`, `coach`, `tsundere`
**frequency 값**: `daily`, `weekdays`, `weekends`, `custom`

### 1.4 nagging_history
잔소리 히스토리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 히스토리 ID |
| user_id | UUID | FK(auth.users), NOT NULL | 사용자 ID |
| goal_id | UUID | FK(goals), NOT NULL | 목표 ID |
| message | TEXT | NOT NULL | 잔소리 메시지 |
| tone | TEXT | NOT NULL | 사용된 톤 |
| sent_at | TIMESTAMPTZ | DEFAULT NOW() | 전송 시간 |
| delivery_status | TEXT | DEFAULT 'sent' | 전송 상태 |
| user_response | TEXT | NULLABLE | 사용자 반응 |
| responded_at | TIMESTAMPTZ | NULLABLE | 반응 시간 |

**delivery_status 값**: `sent`, `delivered`, `failed`
**user_response 값**: `done`, `snooze`, `skip`

### 1.5 push_subscriptions
웹 푸시 구독 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 구독 ID |
| user_id | UUID | FK(auth.users), NOT NULL | 사용자 ID |
| endpoint | TEXT | NOT NULL | 푸시 엔드포인트 |
| p256dh | TEXT | NOT NULL | P256DH 키 |
| auth | TEXT | NOT NULL | Auth 키 |
| user_agent | TEXT | NULLABLE | 브라우저 정보 |
| device_name | TEXT | NULLABLE | 기기 이름 |
| is_active | BOOLEAN | DEFAULT TRUE | 활성화 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일 |

**UNIQUE 제약**: (user_id, endpoint)

---

## 2. 인덱스

| 테이블 | 인덱스명 | 컬럼 |
|--------|----------|------|
| goals | idx_goals_user_id | user_id |
| goals | idx_goals_active | user_id, is_active |
| nagging_settings | idx_nagging_settings_user | user_id |
| nagging_settings | idx_nagging_settings_enabled | is_enabled |
| nagging_history | idx_nagging_history_user | user_id, sent_at DESC |
| nagging_history | idx_nagging_history_goal | goal_id, sent_at DESC |
| push_subscriptions | idx_push_subscriptions_user | user_id, is_active |

---

## 3. RLS (Row Level Security) 정책

### profiles
- SELECT: `auth.uid() = id`
- INSERT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`

### goals
- ALL: `auth.uid() = user_id`

### nagging_settings
- ALL: `auth.uid() = user_id`

### nagging_history
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`

### push_subscriptions
- ALL: `auth.uid() = user_id`

---

## 4. 트리거

### 4.1 자동 프로필 생성
```sql
-- auth.users INSERT 시 profiles 자동 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4.2 updated_at 자동 갱신
- profiles
- goals
- nagging_settings
- push_subscriptions

---

## 5. Auth 설정

### 소셜 로그인 Provider
- Google
- Kakao

### Redirect URL
- `/auth/callback`

---

## 6. 환경 변수

| 변수명 | 설명 | 용도 |
|--------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL | 클라이언트/서버 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Anon Key | 클라이언트/서버 |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Service Role Key | Cron API (서버) |

---

## 7. 외부 API 연동

### Groq API (무료)
- **용도**: AI 잔소리 메시지 생성
- **모델**: llama-3.1-8b-instant
- **환경변수**: `GROQ_API_KEY`
- **발급**: https://console.groq.com/keys
- **무료 한도**: 분당 30요청, 하루 14,400요청

### Web Push (VAPID)
- **용도**: 브라우저 푸시 알림
- **환경변수**:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`

---

## 8. Cron Job

### process-naggings
- **경로**: `/api/cron/process-naggings`
- **스케줄**: `0 9,12,18,21 * * *` (매일 9시, 12시, 18시, 21시)
- **인증**: `Authorization: Bearer {CRON_SECRET}`
- **기능**: 활성화된 잔소리 설정 조회 → AI 메시지 생성 → 푸시 알림 전송
