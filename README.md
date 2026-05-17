# 캐릭터 테스트 기반 팀 배정 웹앱

오프라인 네트워킹 행사를 위한 **MBTI 스타일 캐릭터 테스트 + 자동 팀 배정** 도구입니다.
참가자들이 모바일로 밸런스 게임을 풀면 16개 캐릭터 중 하나로 분류되고, 진행자는 버튼 한 번으로 다양한 조합의 팀을 자동 생성할 수 있습니다.

## 🎯 무엇을 해결하나요

신입생 오리엔테이션, 사내 워크숍, 부트캠프 첫 모임 등에서 "어색함을 깨고 자연스럽게 팀을 짜야 하는" 진행자의 고민을 해결합니다.

- **참가자에게는** 자기소개 부담 없이 재미있게 본인의 성향을 발견하는 시간
- **진행자에게는** 수십 명을 일일이 팀 짜는 수작업 없이, 한 번 누르면 끝나는 자동화
- **결과적으로** 처음 만나는 사람들이 캐릭터를 매개로 서로에게 다가가기 쉬워지는 환경

## ✨ 주요 기능

### 참가자 입장
- 모바일 최적화 UI — QR 스캔으로 즉시 참여
- 10문항 밸런스 게임 (3~5분 소요)
- 본인 캐릭터 결과 카드 + 16개 전체 갤러리
- 결과 이미지 저장 (`html2canvas`)
- 응답 중 새로고침 대응 (localStorage 진행상황 복원)

### 진행자 입장
- 응답 현황 실시간 모니터링 (Supabase Realtime)
- **자동 팀 배정 알고리즘**
  - 라운드 1: 한 팀 내 캐릭터 다양성 우선
  - 라운드 2~4: 이전 라운드와 멤버 중복 최소화 (그리디 + 100회 시도)
- 큰 화면 모드 원격 전환 (QR ↔ 라운드 발표)
- CSV 내보내기 (응답 데이터 분석용)
- 더미 데이터 자동 생성 (사전 시뮬레이션용)

### 디스플레이
- 큰 스크린용 QR 코드 + 실시간 응답 카운트
- 라운드별 팀 발표 화면 (팀 색상 자동 배정)

## 🛠 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + Realtime) |
| Hosting | Vercel |
| 기타 | `qrcode.react`, `html2canvas-pro` |

## 📐 작동 원리

```
참가자 → 이름 입력 → 10문항 설문
            ↓
   4축 점수 계산 (pace / voice / conflict / learning)
            ↓
       16 캐릭터 중 하나로 분류
            ↓
  진행자가 "팀 생성" 버튼 클릭
            ↓
  알고리즘이 다양성/중복최소화 고려해
  4라운드 × N팀 자동 배정
            ↓
  큰 화면에 라운드별 팀 표시
```

## 🌐 페이지 구성

| 경로 | 누가 보나 | 용도 |
|---|---|---|
| `/` | 참가자 | 이름 입력 |
| `/survey` | 참가자 | 설문 진행 |
| `/result` | 참가자 | 결과 카드 + 캐릭터 갤러리 |
| `/display` | 진행자 (큰 화면) | QR 또는 라운드 발표 |
| `/admin` | 진행자 (관리) | 비밀번호 로그인 |
| `/admin/dashboard` | 진행자 (관리) | 응답 모니터링 + 모든 컨트롤 |

## 🚀 직접 사용해보기

### 1) Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에 가입 후 새 프로젝트 생성
2. SQL Editor에서 아래 스크립트 실행:

```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  answers JSONB NOT NULL,
  scores JSONB NOT NULL,
  self_role TEXT NOT NULL,
  character_id TEXT NOT NULL,
  is_flexible JSONB DEFAULT '{}',
  cafe_preference TEXT,
  favorite_ai TEXT,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INT NOT NULL,
  team_number INT NOT NULL,
  member_ids UUID[] NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_number, team_number)
);

CREATE TABLE app_state (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_state (key, value) VALUES ('display_mode', '{"mode": "qr"}');

ALTER PUBLICATION supabase_realtime ADD TABLE responses;
ALTER PUBLICATION supabase_realtime ADD TABLE team_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE app_state;

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on responses" ON responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on teams" ON team_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on app_state" ON app_state FOR ALL USING (true) WITH CHECK (true);
```

3. Settings → API 에서 `Project URL`과 `anon public` key 복사

### 2) 로컬 개발

```bash
git clone https://github.com/SeongTrueLife/saessac-network.git
cd saessac-network
npm install
```

프로젝트 루트에 `.env.local` 파일 생성:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

개발 서버 실행:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

### 3) Vercel 배포

1. [vercel.com](https://vercel.com) 로그인 → "Add New Project"
2. 본인 GitHub 저장소 import
3. **Environment Variables** 에 위의 2개 키 입력
4. Deploy

## 🎨 커스터마이징

본인 행사에 맞게 쉽게 수정할 수 있습니다.

| 무엇을 바꿀까 | 어디서 |
|---|---|
| 설문 문항 (질문/선택지) | [`lib/questions.ts`](lib/questions.ts) |
| 캐릭터 이름/설명/이모지 | [`lib/characters.ts`](lib/characters.ts) |
| 캐릭터별 색상 | [`lib/character-colors.ts`](lib/character-colors.ts) |
| 관리자 비밀번호 | [`lib/admin-auth.ts`](lib/admin-auth.ts) |
| 참가자 총 인원수 | `TOTAL_PARTICIPANTS` 상수 (`app/display/page.tsx`, `app/admin/dashboard/page.tsx`) |
| 팀 개수/사이즈 | [`lib/team-algorithm.ts`](lib/team-algorithm.ts) 의 `DEFAULT_TEAM_COUNT` |
| 라운드 수 | `generateAllRounds(responses, N)` 호출 시 N |

**중요:** 캐릭터를 새로 만들 때는 4축(pace/voice/conflict/learning) 조합 16가지를 모두 커버하도록 정의해야 알고리즘이 깨지지 않습니다.

## 📊 알고리즘 요약

### 캐릭터 결정
- 4축 점수를 문항 답변에서 계산
- 동률(0점)인 축은 "유연형"으로 처리 (자가인식 또는 랜덤으로 결정)
- 4축 조합 → 16 캐릭터 중 하나로 매핑

### 팀 배정
- **라운드 1**: 캐릭터별 그룹 만들고 라운드 로빈으로 분배 → 한 팀에 다양한 캐릭터
- **라운드 2~4**: 그리디 알고리즘 — "이미 만난 사람 적은 팀"에 우선 배치
- 매 라운드마다 100회 시도 후 중복 최소인 조합 선택

## 📝 라이선스

MIT License — 자유롭게 본인 행사에 맞게 수정해서 사용하세요.

## 🙋 만든 이유

이 프로젝트는 한 부트캠프 4기 오리엔테이션 네트워킹 시간을 위해 만들어졌습니다. 비슷한 고민이 있는 다른 행사 진행자분들께도 도움이 되길 바라며 공개합니다.
