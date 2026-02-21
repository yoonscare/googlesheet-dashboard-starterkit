# Phase 1: Data Foundation - Research

**Researched:** 2026-02-22
**Domain:** Google Sheets API v4 파싱, 데이터 타입 설계, 익명화, Mock 폴백
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 시트 구조 & 헤더 파싱
- 시트 이름: **A반**, **B반**, **C반** (정확한 이름)
- 3반 모두 **동일한 열 구조**
- 3행 병합 헤더: 1행=대분류(병합), 2행=중분류, 3행=배점/열이름
- 데이터 시작: 4행부터
- 학생 수: 각 반 **40명 이상** (학기마다 변동)
- 주요 열 그룹:
  - A-E: 기본정보 (순번, 실습기간, 실습기관, 학번, 이름)
  - F-I: 사전학습 (10점 만점)
  - J-O: 보고서 (30점) — 셀프, 케이스, 교육인, 체크, 대상, 소계
  - P-S: 실습지도교수 (20점) — 대상(12), 안전(4), 전문(4), 소계
  - T-W: 현장지도자 (20점) — 대상(12), 안전(4), 전문(4), 소계
  - X: po2 학습성과2 대상자간호 (64점 만점)
  - Y: po5 학습성과5 안전과질 (8점 만점)
  - Z: po3 학습성과3 전문직 (8점 만점)
  - AA: 합계 (80점)
  - AB~: 출석(20점), 조정, 핵심간호술(100점 별도), 시간감점

#### 점수 항목 & 총점 계산
- 실습성적 = 사전학습(10) + 보고서(30) + 실습지도교수(20) + 현장지도자(20) = **80점 만점**
- 출석 = **20점**
- **총점 = 실습성적(80) + 출석(20) = 100점 만점**
- 핵심간호술 = **100점 만점 별도 평가** (총점에 미포함)
- po2/po5/po3 값은 **시트에 수식으로 이미 계산됨** — 그대로 가져옴
- 상대평가 40% 컷라인 = 총점 기준 상위 40% 경계선

#### 학습성과 상/중/하 등급 기준 (85%/60%)
- **상**: 만점의 85% 이상
- **중**: 만점의 60% 이상 ~ 85% 미만
- **하**: 만점의 60% 미만
- 구체적 컷오프:
  - po2(64점): 상 >= 54.4, 중 >= 38.4, 하 < 38.4
  - po5(8점): 상 >= 6.8, 중 >= 4.8, 하 < 4.8
  - po3(8점): 상 >= 6.8, 중 >= 4.8, 하 < 4.8
- **달성 판정**: 중 이상 비율 80% 이상이면 '달성'

#### 익명화 범위 & 규칙
- **이름**: 성 + * + 끝글자 (3글자: 김현우 -> 김*우, 4글자: 사공현우 -> 사*우 등)
- **2글자 이름**: 성 + * (김수 -> 김*)
- **학번**: 중간 마스킹 (202000316 -> 2020***16, 앞4자리 + *** + 뒤2자리)
- **실습기관명**: 원본 그대로 표시 (익명화 불필요)
- **처리 위치**: 데이터 레이어(grade-parser.ts)에서 처리 — 원본 이름/학번이 클라이언트에 전달되지 않음

#### Mock 데이터 설계
- **현실감**: 높은 현실감 — 실제 점수 분포 패턴(정규분포 기반) 반영
- **규모**: 실제와 동일 (3반, 반당 40명 이상)
- **엣지 케이스**: 학습성과별 하 등급 학생 반드시 포함
- **폴백 알림**: 상단 경고 배너로 "목 데이터 사용 중" 명시
- Google Sheets 연결 실패 시 자동 폴백, 개별 시트 실패 시 해당 반만 폴백

### Claude's Discretion
- 헤더 파싱 전략 (열 인덱스 기반 vs 헤더 텍스트 기반 — 유지보수성 고려하여 결정)
- Mock 데이터의 구체적 점수 분포 알고리즘
- 에러 핸들링 세부 구현
- StudentGrade 타입 필드 구조 설계

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | 시스템이 Google Sheets 3개 시트(A반, B반, C반)에서 성적 데이터를 페칭할 수 있다 | 기존 `fetchSheetData()` 함수 재사용 + 3반 병렬 페칭 패턴 (Promise.all) |
| DATA-02 | 시스템이 3행 병합 헤더 구조를 정확히 파싱하여 각 열을 올바른 항목에 매핑할 수 있다 | 열 인덱스 상수(COLUMN_MAP) 기반 파싱 권장 — 병합 셀은 top-left만 값이 있으므로 헤더 텍스트 기반은 신뢰할 수 없음 |
| DATA-03 | 시스템이 학생 이름을 데이터 레이어에서 익명 처리(김*훈 형태)하여 원본 이름이 클라이언트에 전달되지 않는다 | grade-parser.ts에서 `anonymizeName()`, `anonymizeStudentId()` 순수 함수로 구현 |
| DATA-04 | Google Sheets 연결 실패 시 시스템이 목 데이터로 폴백하며, 목 데이터임을 명확히 표시한다 | 기존 `isGoogleSheetsConfigured()` 패턴 + `dataSource` 필드로 폴백 상태 전달, 배너 컴포넌트는 Phase 2에서 구현 |
</phase_requirements>

---

## Summary

Phase 1은 기존 매출 대시보드 코드베이스(sheets.ts → data.ts → mock-data.ts 3-레이어)를 학생 성적 도메인으로 교체하는 작업이다. 스택(googleapis, Next.js App Router, TypeScript)은 그대로 유지하고, 타입/파서/mock 데이터만 신규 작성한다. 핵심 기술 난제는 두 가지다: (1) Google Sheets `spreadsheets.values.get`은 병합 셀의 top-left 셀에만 값을 반환하고 나머지는 빈 문자열을 반환하므로 3행 병합 헤더를 텍스트로 파싱하는 것은 불가능하다 — **열 인덱스 상수(COLUMN_MAP) 기반 파싱**이 유일하게 신뢰할 수 있는 방법이다. (2) 익명화는 라이브러리 없이 순수 함수로 구현 가능하며 데이터 레이어에서만 수행해야 한다.

Mock 데이터는 단순 하드코딩보다 정규분포 기반 점수 생성 함수로 만드는 것이 유지보수와 엣지 케이스 포함 측면에서 유리하다. 폴백 상태 표시(dataSource 필드)는 Phase 1에서 타입과 데이터 레이어에 포함시키고, 배너 UI 렌더링은 Phase 2에서 다룬다.

**Primary recommendation:** `lib/grade-parser.ts` 파일을 새로 만들어 열 인덱스 상수 맵, 파서 함수, 익명화 함수를 모두 담는다. `types/dashboard.ts`를 학생 성적 타입으로 교체하고, `lib/grade-data.ts`가 새 통합 레이어가 된다.

---

## Standard Stack

### Core (이미 설치됨 — 추가 설치 불필요)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| googleapis | ^171.4.0 | Google Sheets API v4 클라이언트 | 기존 `fetchSheetData()` 이미 구현됨 |
| typescript | ^5 | 타입 정의 | `StudentGrade` 인터페이스, `ClassCode` 유니온 타입 |
| next | 16.1.6 | Server Components에서 데이터 페칭 | `async` Server Component 패턴 |

### 추가 설치 필요 없음

이 Phase에서는 새 npm 패키지가 필요하지 않다. 익명화 로직은 네이티브 JavaScript 문자열 조작으로 충분하며 전용 라이브러리는 불필요하다.

### 기존 코드 재사용 계획

| 파일 | 처리 방법 | 이유 |
|------|----------|------|
| `lib/sheets.ts` | **그대로 유지** | `fetchSheetData()`, `isGoogleSheetsConfigured()` 범용 함수로 재사용 가능 |
| `lib/data.ts` | **새 파일로 교체** (`lib/grade-data.ts`) | 도메인이 완전히 달라짐 |
| `lib/mock-data.ts` | **새 파일로 교체** (`lib/mock-grade-data.ts`) | 학생 성적 mock 데이터로 교체 |
| `types/dashboard.ts` | **내용 교체** (파일명 유지 또는 `types/grades.ts`로 분리) | 판단: `types/grades.ts` 신규 생성 권장 (구 타입은 당분간 호환 불필요) |

---

## Architecture Patterns

### 권장 파일 구조 (Phase 1 산출물)

```
lib/
├── sheets.ts            # 기존 유지 (fetchSheetData, isGoogleSheetsConfigured)
├── grade-parser.ts      # 신규: 열 인덱스 상수, parseGradeRow(), anonymizeName(), anonymizeStudentId()
├── grade-data.ts        # 신규: getGradeData() — 3반 병렬 페칭 + 폴백 통합 레이어
└── mock-grade-data.ts   # 신규: mockGradeData (정규분포 기반 120명+ 학생)

types/
└── grades.ts            # 신규: StudentGrade, ClassData, GradeDataResult 타입

app/(dashboard)/dashboard/
└── page.tsx             # Phase 2에서 수정 — Phase 1은 타입/데이터 레이어만
```

### Pattern 1: 열 인덱스 상수 맵 (COLUMN_MAP)

**What:** 시트 열을 A=0, B=1, ... 형태의 인덱스 상수로 정의하여 파서가 열 위치를 안전하게 참조
**When to use:** 3행 병합 헤더처럼 헤더 텍스트 파싱이 불가능한 경우, 열 구조가 고정된 경우
**Why:** `spreadsheets.values.get` API는 병합 셀에서 top-left 셀에만 값을 반환하고 나머지는 빈 문자열을 반환한다. 헤더 텍스트 기반 파싱은 병합된 열의 텍스트가 누락되어 신뢰할 수 없다.

```typescript
// lib/grade-parser.ts
// Source: Google Sheets API v4 merged cell behavior (MEDIUM confidence)
// 열 인덱스 (0-based, A=0, B=1, ...)
export const COL = {
  // A-E: 기본정보
  SEQ: 0,           // A: 순번
  PERIOD: 1,        // B: 실습기간
  HOSPITAL: 2,      // C: 실습기관
  STUDENT_ID: 3,    // D: 학번
  NAME: 4,          // E: 이름

  // F-I: 사전학습 (10점)
  PRE_LEARNING: 5,  // F: 사전학습 소계 (I열이 소계일 수도 있음 — 실제 시트 확인 필요)

  // J-O: 보고서 (30점)
  REPORT_SELF: 9,   // J: 셀프
  REPORT_CASE: 10,  // K: 케이스
  REPORT_EDU: 11,   // L: 교육인
  REPORT_CHECK: 12, // M: 체크
  REPORT_SUBJECT: 13, // N: 대상
  REPORT_TOTAL: 14, // O: 보고서 소계

  // P-S: 실습지도교수 (20점)
  PROF_SUBJECT: 15, // P: 대상(12)
  PROF_SAFETY: 16,  // Q: 안전(4)
  PROF_EXPERT: 17,  // R: 전문(4)
  PROF_TOTAL: 18,   // S: 실습지도교수 소계

  // T-W: 현장지도자 (20점)
  FIELD_SUBJECT: 19, // T: 대상(12)
  FIELD_SAFETY: 20,  // U: 안전(4)
  FIELD_EXPERT: 21,  // V: 전문(4)
  FIELD_TOTAL: 22,   // W: 현장지도자 소계

  // X-Z: 학습성과
  PO2: 23,          // X: po2 대상자간호 (64점)
  PO5: 24,          // Y: po5 안전과질 (8점)
  PO3: 25,          // Z: po3 전문직 (8점)

  // AA~: 합계 및 기타
  PRACTICE_TOTAL: 26, // AA: 실습성적 합계 (80점)
  ATTENDANCE: 27,   // AB: 출석 (20점)
  // AC: 조정 (선택)
  NURSING_SKILLS: 29, // AD: 핵심간호술 (100점)
  // AE: 시간감점 (선택)
} as const;

// ⚠️ 주의: 위 인덱스는 CONTEXT.md의 열 그룹 설명 기반 추정치
// 실제 시트에서 fetchSheetData('A반!A1:AE3') 실행하여 검증 후 확정 필요
// STATE.md Blocker 참고
```

### Pattern 2: 단일 행 파서 함수

**What:** 2차원 string 배열의 한 행을 받아 `StudentGrade` 객체를 반환하는 순수 함수
**When to use:** 파서 레이어(grade-parser.ts)에서 호출

```typescript
// lib/grade-parser.ts
export function parseGradeRow(
  row: string[],
  classCode: ClassCode
): StudentGrade | null {
  const name = row[COL.NAME]?.trim();
  const studentId = row[COL.STUDENT_ID]?.trim();

  // 빈 행 스킵 (이름 없으면 무효)
  if (!name) return null;

  const getNum = (idx: number): number => {
    const val = Number(row[idx]);
    return isNaN(val) ? 0 : val;
  };

  return {
    // 익명화 처리 — 원본은 여기서 폐기
    name: anonymizeName(name),
    studentId: anonymizeStudentId(studentId),
    classCode,
    hospital: row[COL.HOSPITAL]?.trim() ?? '',

    preLearning: getNum(COL.PRE_LEARNING),
    reportTotal: getNum(COL.REPORT_TOTAL),
    profTotal: getNum(COL.PROF_TOTAL),
    fieldTotal: getNum(COL.FIELD_TOTAL),
    practiceTotal: getNum(COL.PRACTICE_TOTAL),
    attendance: getNum(COL.ATTENDANCE),
    totalScore: getNum(COL.PRACTICE_TOTAL) + getNum(COL.ATTENDANCE),

    po2: getNum(COL.PO2),
    po5: getNum(COL.PO5),
    po3: getNum(COL.PO3),

    nursingSkills: getNum(COL.NURSING_SKILLS),
  };
}
```

### Pattern 3: 병렬 3반 페칭 + 개별 폴백

**What:** `Promise.all`로 3반을 동시에 페칭, 각 반 실패 시 해당 반만 mock으로 대체
**When to use:** `grade-data.ts`의 `getGradeData()` 함수

```typescript
// lib/grade-data.ts
export async function getGradeData(): Promise<GradeDataResult> {
  if (!isGoogleSheetsConfigured()) {
    return { students: mockGradeData, dataSource: 'mock' };
  }

  const DATA_RANGE = 'A4:AE'; // 4행부터 끝까지 (열 범위 확정 후 조정)

  try {
    const [classARows, classBRows, classCRows] = await Promise.all([
      fetchSheetData(`A반!${DATA_RANGE}`).catch(() => null),
      fetchSheetData(`B반!${DATA_RANGE}`).catch(() => null),
      fetchSheetData(`C반!${DATA_RANGE}`).catch(() => null),
    ]);

    const parseClass = (rows: string[][] | null, code: ClassCode): StudentGrade[] => {
      if (!rows) return getMockForClass(code);
      return rows
        .map(row => parseGradeRow(row, code))
        .filter((s): s is StudentGrade => s !== null);
    };

    const students = [
      ...parseClass(classARows, 'A'),
      ...parseClass(classBRows, 'B'),
      ...parseClass(classCRows, 'C'),
    ];

    const isFallback = !classARows || !classBRows || !classCRows;
    return {
      students,
      dataSource: isFallback ? 'partial-mock' : 'sheets',
    };
  } catch (error) {
    console.error('성적 데이터 페칭 실패, mock 데이터로 대체:', error);
    return { students: mockGradeData, dataSource: 'mock' };
  }
}
```

### Pattern 4: 익명화 순수 함수

**What:** 이름/학번을 입력받아 마스킹된 문자열을 반환하는 순수 함수, 라이브러리 불필요
**When to use:** `parseGradeRow()` 내에서 호출

```typescript
// lib/grade-parser.ts

/**
 * 한국어 이름 익명화
 * - 3글자: 김현우 -> 김*우
 * - 4글자: 사공현우 -> 사*우 (성 1자 + * + 끝글자)
 * - 2글자: 김수 -> 김*
 */
export function anonymizeName(name: string): string {
  if (!name || name.length < 2) return name;
  if (name.length === 2) {
    return name[0] + '*';
  }
  // 3글자 이상: 성(첫 글자) + * + 끝글자
  return name[0] + '*' + name[name.length - 1];
}

/**
 * 학번 익명화
 * - 202000316 -> 2020***16 (앞4자리 + *** + 뒤2자리)
 */
export function anonymizeStudentId(id: string): string {
  if (!id || id.length < 7) return id;
  return id.slice(0, 4) + '***' + id.slice(-2);
}
```

### Anti-Patterns to Avoid

- **헤더 텍스트로 열 탐색:** `rows[0].indexOf('이름')`처럼 헤더 텍스트로 열 인덱스를 찾는 방식 — 병합 셀에서 텍스트가 top-left 셀에만 있어 인접 열은 빈 문자열이므로 불신뢰. 열 인덱스 상수(COL)로 대체.
- **총점 재계산:** po2/po5/po3는 시트 수식으로 계산된 값이 이미 있음. 직접 재계산하면 수식과 다른 값이 나올 수 있음. 시트 값 그대로 가져올 것.
- **클라이언트 컴포넌트에서 익명화:** 이름이 클라이언트로 전달된 후 익명화하면 원본이 네트워크에서 노출됨. 반드시 `grade-parser.ts`(서버 사이드)에서 처리.
- **fetchSheetData 범위를 헤더까지 포함:** 4행부터가 데이터 시작이므로 `A반!A4:AE` 형태로 요청해야 헤더 파싱 불필요.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Google Sheets 인증 | JWT 수동 구현 | googleapis `google.auth.JWT` (기존 코드) | OAuth2/JWT 엣지 케이스 복잡, 이미 구현됨 |
| 정규분포 랜덤 숫자 | 직접 구현 | Box-Muller 변환 (20줄 이하, 외부 라이브러리 불필요) | 표준 통계 알고리즘, npm 패키지 추가 불필요 |
| 익명화 | 범용 익명화 라이브러리 | 순수 함수 직접 구현 | 한국어 이름 특화, 10줄 이하로 충분 |
| 반별 통계 계산 | 커스텀 통계 라이브러리 | 네이티브 Array 메서드 | 반당 40명 규모는 네이티브로 충분 |

**Key insight:** 외부 라이브러리 의존성 추가 없이 전체 Phase 1을 구현할 수 있다. 모든 계산은 네이티브 JavaScript/TypeScript로 충분하다.

---

## Common Pitfalls

### Pitfall 1: 병합 셀 헤더의 빈 열 문제
**What goes wrong:** `spreadsheets.values.get`으로 헤더 행(1~3행)을 가져오면 병합된 열의 non-top-left 셀은 빈 문자열(`''`)로 반환됨. 예: "사전학습" 헤더가 F열(인덱스 5)에만 있고 G,H,I 열은 `''`.
**Why it happens:** Google Sheets API v4 `values.get`은 병합 메타데이터를 무시하고 셀 값만 반환. top-left 셀 값만 반환하고 나머지는 `undefined` 또는 빈 문자열.
**How to avoid:** 헤더 행을 아예 페칭하지 않고 데이터 행만 요청(`A반!A4:AE`). 열 인덱스 상수(COL)를 소스 오브 트루스로 사용.
**Warning signs:** 파싱된 StudentGrade 객체에 `undefined` 필드가 많이 발생하면 열 인덱스 오류 의심.

### Pitfall 2: 열 인덱스 오프바이원 오류
**What goes wrong:** CONTEXT.md의 열 그룹 설명(A-E, F-I 등)을 0-based 인덱스로 변환할 때 실수. 예: "AA열"은 인덱스 26 (A=0 기준).
**Why it happens:** 스프레드시트는 1-based 열명 사용, JavaScript 배열은 0-based.
**How to avoid:** COL 상수 정의 후 `fetchSheetData('A반!A1:AE3')`로 헤더 3행을 별도 조회하여 인덱스 검증. 실제 시트의 열 위치를 개발 환경에서 반드시 확인 (STATE.md Blocker 참고).
**Warning signs:** preLearning이 항상 0, 또는 attendance가 nursingSkills와 같은 값.

### Pitfall 3: `\\n` 이스케이프 미처리
**What goes wrong:** `GOOGLE_PRIVATE_KEY` 환경변수의 `\\n`이 실제 개행으로 변환되지 않으면 인증 실패.
**Why it happens:** `.env.local` 파일에서 개인키의 줄바꿈이 `\\n` 리터럴로 저장됨.
**How to avoid:** `sheets.ts`의 기존 처리 `key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')` 그대로 유지. 이미 구현됨.
**Warning signs:** `googleapis` 인증 오류 - "invalid_grant" 또는 JWT 서명 오류.

### Pitfall 4: Mock 데이터 규모 부족
**What goes wrong:** 3반 × 40명 = 120명 이상이어야 하는데 mock 데이터가 10-20명이면 분포 차트가 의미없어짐.
**Why it happens:** 개발 편의상 적게 만드는 경향.
**How to avoid:** Box-Muller 정규분포 생성기로 정확히 반당 42명(126명)을 생성. 하 등급(60% 미만) 학생 각 반 최소 2-3명 포함.
**Warning signs:** 상/중/하 비율이 비현실적(모두 상, 또는 균등 분포).

### Pitfall 5: `dataSource` 필드 타입 미정의
**What goes wrong:** 폴백 상태를 별도 상태 변수로 전달하지 않으면 Phase 2에서 배너 구현 시 타입을 바꿔야 함.
**Why it happens:** 초기 설계에서 폴백 상태 전달 방법을 고려하지 않음.
**How to avoid:** `GradeDataResult` 타입에 `dataSource: 'sheets' | 'mock' | 'partial-mock'` 필드 포함. Phase 1에서부터 포함.

### Pitfall 6: 행 끝 빈 셀로 인한 row 길이 불일치
**What goes wrong:** Google Sheets API는 "empty trailing cells are omitted" — 마지막 데이터 열 이후 빈 셀은 반환하지 않음. `row[COL.NURSING_SKILLS]`가 `undefined`가 될 수 있음.
**Why it happens:** API 최적화로 trailing empty cells를 생략.
**How to avoid:** `getNum()` 헬퍼가 `undefined`를 0으로 처리하도록 구현 (`Number(undefined) === NaN`, `isNaN(val) ? 0 : val`).

---

## Code Examples

Verified patterns from official sources:

### StudentGrade 타입 정의

```typescript
// types/grades.ts

export type ClassCode = 'A' | 'B' | 'C';

export type PoGrade = '상' | '중' | '하';

export type DataSource = 'sheets' | 'mock' | 'partial-mock';

export interface StudentGrade {
  // 기본정보 (익명화됨)
  name: string;           // 예: "김*우"
  studentId: string;      // 예: "2020***16"
  classCode: ClassCode;   // 'A' | 'B' | 'C'
  hospital: string;       // 실습기관명 (원본)

  // 점수 항목
  preLearning: number;    // 사전학습 (10점)
  reportTotal: number;    // 보고서 소계 (30점)
  profTotal: number;      // 실습지도교수 소계 (20점)
  fieldTotal: number;     // 현장지도자 소계 (20점)
  practiceTotal: number;  // 실습성적 합계 (80점)
  attendance: number;     // 출석 (20점)
  totalScore: number;     // 총점 = 실습성적 + 출석 (100점)

  // 학습성과 (시트 수식 값 그대로)
  po2: number;            // 대상자간호 (64점)
  po5: number;            // 안전과질 (8점)
  po3: number;            // 전문직 (8점)

  // 별도 평가
  nursingSkills: number;  // 핵심간호술 (100점)
}

export interface GradeDataResult {
  students: StudentGrade[];
  dataSource: DataSource;
}
```

### 학습성과 등급 계산 유틸

```typescript
// lib/grade-parser.ts

// 등급 임계값 상수
export const PO_THRESHOLDS = {
  po2: { max: 64, high: 54.4, mid: 38.4 },  // 85%, 60%
  po5: { max: 8,  high: 6.8,  mid: 4.8  },
  po3: { max: 8,  high: 6.8,  mid: 4.8  },
} as const;

export function getPoGrade(score: number, threshold: { high: number; mid: number }): PoGrade {
  if (score >= threshold.high) return '상';
  if (score >= threshold.mid)  return '중';
  return '하';
}

// 달성 판정: 반 학생 중 중 이상 비율 80% 이상이면 달성
export function isAchieved(students: StudentGrade[], poKey: 'po2' | 'po5' | 'po3'): boolean {
  if (students.length === 0) return false;
  const threshold = PO_THRESHOLDS[poKey];
  const achievedCount = students.filter(
    s => getPoGrade(s[poKey], threshold) !== '하'
  ).length;
  return achievedCount / students.length >= 0.8;
}
```

### Box-Muller 정규분포 Mock 생성

```typescript
// lib/mock-grade-data.ts (생성 패턴)

// Box-Muller 변환으로 정규분포 랜덤값 생성
function gaussianRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.min(mean + z * std, /* max */));
}
```

---

## State of the Art

| Old Approach (기존 대시보드) | New Approach (성적 대시보드) | Impact |
|----------------------------|-----------------------------|--------|
| `DashboardData` 타입 (매출 도메인) | `StudentGrade[]` + `GradeDataResult` | 타입 완전 교체 |
| `lib/data.ts` (단일 통합 함수) | `lib/grade-data.ts` (도메인 분리) | 파일 신규 생성, 구 파일 삭제 |
| `lib/mock-data.ts` (10건 하드코딩) | `lib/mock-grade-data.ts` (126명 정규분포) | 현실적 분포 반영 |
| 헤더 포함 행 파싱 | 데이터 행만 페칭 (`A4:AE` 범위) | 헤더 파싱 로직 불필요 |

**삭제 예정:**
- `lib/data.ts` — `lib/grade-data.ts`로 교체
- `lib/mock-data.ts` — `lib/mock-grade-data.ts`로 교체
- `types/dashboard.ts` 내 기존 타입들 — `types/grades.ts`로 대체 (대시보드 컴포넌트들이 기존 타입에 의존하므로 Phase 2에서 컴포넌트 교체 시 함께 처리)

---

## Open Questions

1. **실제 열 인덱스 검증**
   - What we know: CONTEXT.md에서 A-E, F-I, J-O 등 열 그룹 범위 제시됨
   - What's unclear: 정확한 0-based 인덱스 (AA열=26인지, 사전학습 소계가 I열=8인지 F열=5인지 등)
   - Recommendation: 첫 번째 task로 `fetchSheetData('A반!A1:AE3')` 실행하여 헤더 3행 출력 → 열 이름과 인덱스 맵 확정 후 `COL` 상수 정의. 이 task가 blocked되면 전체 파서 구현이 불가능.

2. **출석(AB) 이후 열 구조**
   - What we know: AB=출석(20), AC=조정, AD=핵심간호술, AE=시간감점 (추정)
   - What's unclear: AC(조정)가 항상 있는지, 조정 점수가 총점에 반영되는지
   - Recommendation: 헤더 확인 시 함께 조사. 조정 컬럼은 일단 무시하고 `totalScore = practiceTotal + attendance`로 계산.

3. **dataSource 배너 UI 위치**
   - What we know: Phase 1은 데이터 레이어만, UI는 Phase 2
   - What's unclear: 배너를 dashboard layout에 넣을지 page에 넣을지
   - Recommendation: Phase 1에서는 `GradeDataResult.dataSource` 필드만 정의. Phase 2에서 `app/(dashboard)/layout.tsx` 또는 `dashboard/page.tsx`에서 배너 렌더링.

---

## Sources

### Primary (HIGH confidence)
- 기존 코드베이스 (`lib/sheets.ts`, `lib/data.ts`) — API 패턴, JWT 인증, 병렬 페칭 패턴 직접 확인
- `package.json` — googleapis ^171.4.0, Next.js 16.1.6, TypeScript ^5 버전 직접 확인
- `.planning/phases/01-data-foundation/01-CONTEXT.md` — 열 구조, 점수 체계, 익명화 규칙 확정

### Secondary (MEDIUM confidence)
- Google Sheets API v4 merged cell behavior: WebSearch + GitHub issue #400 (theoephraim/node-google-spreadsheet) — "merged cells only have a value in the first cell, leaving the rest empty" — 여러 소스에서 일치
- WebSearch: `spreadsheets.values.get` trailing empty cells 생략 동작 — Google 공식 문서 `Basic reading` 페이지에서 확인

### Tertiary (LOW confidence)
- 열 인덱스(COL) 상수값 — CONTEXT.md의 열 그룹 설명을 기반으로 추정. **실제 시트에서 반드시 검증 필요**

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 기존 코드베이스에서 직접 확인, 추가 패키지 없음
- Architecture: HIGH — 기존 3-레이어 패턴 유지, 도메인 교체만 필요
- Pitfalls: HIGH — 병합 셀 동작은 여러 소스에서 확인, 익명화/폴백 패턴은 코드베이스에서 확인
- 열 인덱스 상수: LOW — CONTEXT.md 기반 추정, 실제 시트 검증 필수

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (googleapis API는 안정적, 30일 유효)
