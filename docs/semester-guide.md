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
