# 매학기 운영 매뉴얼

매학기 새 Google Sheet로 대시보드를 운영하기 위한 체크리스트입니다.

---

## 배포 정보

| 항목 | 값 |
|------|-----|
| 프로덕션 URL | https://sheet-dashbord-test.vercel.app |
| GitHub 레포 | https://github.com/yoonscare/googlesheet-dashboard-starterkit |
| Vercel 대시보드 | https://vercel.com/yoons-projects-a0913d20/sheet-dashbord-test |
| Google Cloud Console | https://console.cloud.google.com |

---

## 학기 시작 전 체크리스트

### 1단계: Google Sheet 준비

- [ ] 이전 학기 시트를 복사하거나 새 시트 생성
- [ ] 시트 구조가 기존과 동일한지 확인 (열 순서, 시트 탭 이름)
- [ ] 새 시트의 **스프레드시트 ID** 복사
  - URL에서 추출: `https://docs.google.com/spreadsheets/d/{이 부분}/edit`

### 2단계: 서비스 계정에 시트 공유

- [ ] 새 Google Sheet 열기
- [ ] 우측 상단 **공유** 클릭
- [ ] 서비스 계정 이메일 추가: `id-907@platinum-avenue-460206-f4.iam.gserviceaccount.com`
- [ ] 권한: **뷰어** (읽기 전용)

> 이 단계를 빠뜨리면 대시보드에서 데이터를 읽을 수 없습니다.

### 3단계: Vercel 환경변수 업데이트

1. [Vercel 대시보드](https://vercel.com/yoons-projects-a0913d20/sheet-dashbord-test/settings/environment-variables) 접속
2. `GOOGLE_SHEETS_ID` 값을 새 시트 ID로 변경
3. 필요시 `ALLOWED_EMAILS`에 이번 학기 허용 이메일 추가

또는 CLI로:
```bash
# 기존 값 삭제 후 새 값 추가
vercel env rm GOOGLE_SHEETS_ID production
echo "새_스프레드시트_ID" | vercel env add GOOGLE_SHEETS_ID production
```

### 4단계: 재배포

환경변수 변경 후 재배포해야 적용됩니다.

- **방법 A** (Vercel 대시보드): Deployments → 최신 배포 → ⋮ → Redeploy
- **방법 B** (CLI): `vercel --prod --yes`
- **방법 C** (자동): 코드 변경 후 `git push` → 자동 배포

### 5단계: 동작 확인

- [ ] https://sheet-dashbord-test.vercel.app 접속
- [ ] 로그인 정상 작동 확인
- [ ] 대시보드에 새 학기 데이터가 표시되는지 확인
- [ ] 학생 목록, 학습성과, 반별 비교 페이지 확인

---

## Google OAuth 설정 (최초 1회)

이미 설정된 경우 매학기 반복할 필요 없습니다.

1. [Google Cloud Console](https://console.cloud.google.com) → API 및 서비스 → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 리디렉션 URI**에 아래 추가:
   - `https://sheet-dashbord-test.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (로컬 개발용)

---

## 시트 구조 참고

대시보드가 정상 작동하려면 Google Sheet의 탭 이름과 열 구조가 일치해야 합니다.
기존 시트를 **복사**해서 데이터만 교체하는 것을 권장합니다.

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| 데이터가 안 나오고 mock 표시 | 시트 공유 안 됨 또는 ID 오류 | 2단계 확인 |
| 로그인 안 됨 | OAuth 콜백 URL 미등록 | Google OAuth 설정 확인 |
| 빌드 실패 | 환경변수 누락 | Vercel 환경변수 6개 확인 |
| 열 데이터 불일치 | 시트 구조 변경됨 | `lib/data.ts` 열 매핑 수정 |

---

## 환경변수 목록

| 변수명 | 설명 | 매학기 변경 |
|--------|------|:-----------:|
| `AUTH_SECRET` | NextAuth 시크릿 키 | X |
| `AUTH_GOOGLE_ID` | Google OAuth 클라이언트 ID | X |
| `AUTH_GOOGLE_SECRET` | Google OAuth 시크릿 | X |
| `GOOGLE_SHEETS_ID` | 스프레드시트 ID | **O** |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 서비스 계정 이메일 | X |
| `GOOGLE_PRIVATE_KEY` | 서비스 계정 비공개 키 | X |
| `ALLOWED_EMAILS` | 접근 허용 이메일 (선택) | O |
| `AUTH_TRUST_HOST` | Vercel 호스트 신뢰 설정 (`true`) | X |
| `AUTH_URL` | 프로덕션 URL (`https://sheet-dashbord-test.vercel.app`) | X |

---

## Google OAuth 설정 상세 (최초 배포 시 삽질 방지)

2025년 2월 최초 배포 때 겪었던 문제와 해결법입니다.

### 1. "액세스 차단됨 / 401 invalid_client" 오류

**원인**: Vercel 환경변수에 값을 넣을 때 `echo`를 쓰면 끝에 줄바꿈(`\n`)이 추가됨.
Google이 클라이언트 ID를 인식하지 못함.

**해결**: 환경변수 설정 시 반드시 `printf '%s'` 사용:
```bash
# 잘못된 방법 (줄바꿈 포함됨)
echo "값" | vercel env add 변수명 production

# 올바른 방법 (줄바꿈 없음)
printf '%s' '값' | vercel env add 변수명 production
```

또는 Vercel 웹 대시보드에서 직접 입력하면 이 문제 없음.

### 2. "목 데이터로 대체 중" 배너

**원인**: `GOOGLE_PRIVATE_KEY` 환경변수가 올바르지 않거나 시트 공유가 안 됨.

**확인 순서**:
1. Google Sheet에 서비스 계정 이메일이 공유되어 있는지 확인
2. Vercel 환경변수에서 `GOOGLE_PRIVATE_KEY` 값이 올바른지 확인
3. 시트 탭 이름이 `A반`, `B반`, `C반`인지 확인

### 3. Google Cloud Console 필수 설정

OAuth 2.0 클라이언트에 아래 두 항목 모두 등록:

| 항목 | 값 |
|------|-----|
| 승인된 자바스크립트 원본 | `https://sheet-dashbord-test.vercel.app` |
| 승인된 리디렉션 URI | `https://sheet-dashbord-test.vercel.app/api/auth/callback/google` |

### 4. OAuth 동의 화면

- **테스트 모드**인 경우: "테스트 사용자"에 본인 Gmail 추가 필요
  - 경로: API 및 서비스 → OAuth 동의 화면 → 대상 탭 → 테스트 사용자 → ADD USERS
- **또는**: "앱 게시" 버튼 클릭하면 모든 계정 사용 가능

---

## 학습성과 분석 스킬 (Claude/Manus용)

대시보드와 별개로, Claude 웹앱이나 Manus에서 학습성과를 분석할 수 있는 스킬 파일이 있습니다.

### 파일 위치
- 원본: `docs/nursing-learning-outcomes/SKILL.md`
- Manus용 zip: `docs/nursing-learning-outcomes.zip`
- Claude 웹앱용: `docs/skill-learning-outcomes.md`

### 사용법
1. **Claude 웹앱**: Projects → 새 프로젝트 → Project Knowledge에 `skill-learning-outcomes.md` 업로드
2. **Manus**: 스킬 업로드에 `nursing-learning-outcomes.zip` 업로드
3. Google Sheets에서 학생 데이터를 복사 → 채팅에 붙여넣기 → "학습성과 분석해줘"

### 분석 결과
- PO2(대상자간호), PO5(안전과질), PO3(전문직) 등급 분포표
- 반별(A/B/C) + 전체 달성률 및 달성 여부
- 하 등급 학생 드릴다운 (익명화 처리됨)
- 개선 제안

---

## 2025년 2월 23일 작업 기록

이 프로젝트의 최초 배포 과정 요약입니다. 나중에 비슷한 작업 시 참고하세요.

### 수행한 작업

| 순서 | 작업 | 결과 |
|------|------|------|
| 1 | GitHub 레포 생성 및 push | `yoonscare/googlesheet-dashboard-starterkit` |
| 2 | Vercel 프로젝트 생성 및 배포 | https://sheet-dashbord-test.vercel.app |
| 3 | 환경변수 8개 설정 | AUTH_SECRET, AUTH_GOOGLE_ID/SECRET, GOOGLE_SHEETS_ID, SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, AUTH_TRUST_HOST, AUTH_URL |
| 4 | Google OAuth 로그인 오류 해결 | 환경변수 줄바꿈 문제 → printf로 재설정 |
| 5 | 매학기 운영 매뉴얼 작성 | 이 문서 (`docs/semester-guide.md`) |
| 6 | 학습성과 분석 스킬 생성 | `docs/skill-learning-outcomes.md`, `docs/nursing-learning-outcomes.zip` |

### 핵심 교훈

1. **Vercel 환경변수는 웹 대시보드에서 직접 입력하는 게 안전** — CLI `echo`는 줄바꿈 문제 발생
2. **Google OAuth는 자바스크립트 원본 + 리디렉션 URI 둘 다 필요**
3. **OAuth 동의 화면이 테스트 모드면 테스트 사용자 등록 필수**
4. **매학기 바꿀 것은 `GOOGLE_SHEETS_ID` 하나 + 시트 공유 + 재배포 뿐**
