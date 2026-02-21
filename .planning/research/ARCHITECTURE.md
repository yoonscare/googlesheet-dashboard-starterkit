# Architecture Research

**Domain:** Academic grading dashboard (간호학과 실습 성적 대시보드)
**Researched:** 2026-02-22
**Confidence:** HIGH (brownfield — existing codebase fully inspected; patterns verified against Next.js v16 docs via Context7)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Browser (Client)                               │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────┐    │
│  │  Sidebar    │  │  ClassComparison │  │  StudentDetail      │    │
│  │  (useState) │  │  Chart (Recharts)│  │  RadarChart         │    │
│  └─────────────┘  └──────────────────┘  │  SearchFilter       │    │
│                                         └─────────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                      Server (Next.js RSC)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐     │
│  │OverviewPage  │  │ ClassPage    │  │ LearningOutcomesPage  │     │
│  │(async page)  │  │(async page)  │  │(async page)           │     │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬──────────┘     │
│         └─────────────────┴──────────────────────┘                 │
│                            │                                        │
│                     lib/data.ts                                     │
│              (getDashboardData / getGradeData)                      │
├─────────────────────────────────────────────────────────────────────┤
│                      Data Layer                                     │
│  ┌───────────────┐   ┌─────────────────┐   ┌──────────────────┐    │
│  │ lib/sheets.ts │   │ lib/grade-       │   │ lib/mock-        │    │
│  │ fetchSheetData│   │ parser.ts        │   │ grade-data.ts    │    │
│  │ (Google API)  │   │(3-row header     │   │(fallback)        │    │
│  └───────┬───────┘   │ transform)       │   └──────────────────┘    │
│          │           └─────────────────┘                           │
├──────────┴─────────────────────────────────────────────────────────┤
│                   Google Sheets API v4                              │
│              Sheets: A반 | B반 | C반 (동일 구조)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Type | Responsibility | Communicates With |
|-----------|------|----------------|-------------------|
| `app/(dashboard)/dashboard/page.tsx` | Server | 전체 개요 — KPI 카드, 전체 분포, 40% 컷라인 | `lib/data.ts`, KPI/Chart 컴포넌트 |
| `app/(dashboard)/class/page.tsx` | Server | 반별 비교 뷰 — A/B/C반 나란히 비교 | `lib/data.ts`, ClassComparison 컴포넌트 |
| `app/(dashboard)/students/page.tsx` | Server | 학생 목록 + 익명화 테이블 | `lib/data.ts`, StudentTable/SearchFilter |
| `app/(dashboard)/students/[id]/page.tsx` | Server | 학생 개별 상세 + 레이더 차트 | `lib/data.ts`, StudentDetail 컴포넌트 |
| `app/(dashboard)/outcomes/page.tsx` | Server | 학습성과별 상/중/하 분석 | `lib/data.ts`, OutcomesBand 컴포넌트 |
| `components/dashboard/kpi-cards.tsx` | Server | KPI 4개 카드 (총학생수, 전체평균, 최고/최저점) | props only |
| `components/dashboard/score-distribution-chart.tsx` | **Client** | 히스토그램 (Recharts) — 반별 점수 분포 | props only |
| `components/dashboard/class-comparison-chart.tsx` | **Client** | 막대 차트 (Recharts) — A/B/C반 평균 비교 | props only |
| `components/dashboard/cutline-chart.tsx` | **Client** | 라인+참조선 차트 — 40% 컷라인 표시 | props only |
| `components/dashboard/student-table.tsx` | **Client** | 검색/필터 포함 학생 테이블 (useState) | props only |
| `components/dashboard/student-radar-chart.tsx` | **Client** | 레이더 차트 (Recharts) — 개인 강약점 | props only |
| `components/dashboard/outcomes-band.tsx` | Server | 상/중/하 인원수 표 (인터랙션 없음) | props only |
| `lib/sheets.ts` | Server-only | Google Sheets API 래퍼 (기존 유지) | googleapis |
| `lib/grade-parser.ts` | Server-only | 3행 헤더 파싱 → 타입 변환 파이프라인 | `lib/sheets.ts` |
| `lib/data.ts` | Server-only | 통합 레이어 — Sheets 또는 mock 폴백 | `lib/grade-parser.ts`, `lib/mock-grade-data.ts` |
| `types/grade.ts` | 공유 타입 | 성적 도메인 타입 정의 (기존 dashboard.ts 교체) | 모든 레이어 |

---

## Recommended Project Structure

```
app/
├── (auth)/
│   └── login/page.tsx              # 기존 유지
├── (dashboard)/
│   ├── layout.tsx                  # 기존 유지 (Sidebar + Header)
│   ├── dashboard/page.tsx          # 전체 개요 (교체)
│   ├── class/page.tsx              # 신규: 반별 비교 뷰
│   ├── students/
│   │   ├── page.tsx                # 신규: 학생 목록
│   │   └── [id]/page.tsx           # 신규: 학생 상세
│   └── outcomes/page.tsx           # 신규: 학습성과 뷰

components/
├── layout/                         # 기존 유지 (sidebar, header, theme-toggle)
├── providers/                      # 기존 유지
├── ui/                             # 기존 유지 (shadcn/ui)
└── dashboard/
    ├── kpi-cards.tsx               # 교체 (성적 KPI로)
    ├── score-distribution-chart.tsx # 신규: 히스토그램
    ├── class-comparison-chart.tsx  # 신규: 반별 비교 막대
    ├── cutline-chart.tsx           # 신규: 40% 컷라인
    ├── student-table.tsx           # 신규: 검색/필터 테이블
    ├── student-radar-chart.tsx     # 신규: 레이더 차트
    └── outcomes-band.tsx           # 신규: 상/중/하 밴드표

lib/
├── sheets.ts                       # 기존 유지 (fetchSheetData)
├── grade-parser.ts                 # 신규: 3행 헤더 파싱 파이프라인
├── data.ts                         # 교체 (getGradeData로 재작성)
├── mock-grade-data.ts              # 신규: 성적 mock 데이터
└── utils.ts                        # 기존 유지

types/
└── grade.ts                        # 신규: 성적 도메인 타입 (dashboard.ts 교체)
```

### Structure Rationale

- **`lib/grade-parser.ts` 분리:** 3행 헤더 파싱 로직은 복잡하므로 `data.ts`에서 분리. 단위 테스트 가능.
- **`types/grade.ts`:** 기존 `types/dashboard.ts`는 매출 도메인이므로 삭제 후 성적 도메인 타입으로 새 파일 작성.
- **라우트 구조 확장:** 현재 `/dashboard` 단일 페이지에서 4개 뷰로 분리. 사이드바 navItems에 메뉴 추가 필요.
- **Client 컴포넌트 최소화:** Recharts와 useState가 필요한 컴포넌트만 `"use client"` — 나머지는 Server Component로 유지.

---

## Architectural Patterns

### Pattern 1: 3행 헤더 파싱 파이프라인

**What:** Google Sheets의 3행 병합 헤더를 컬럼 인덱스 맵으로 변환한 뒤 4행째부터 학생 데이터를 파싱.

**When to use:** 스프레드시트 헤더가 단순 1행이 아닌 경우. `spreadsheets.values.get`은 병합 셀을 flatten한 상태로 반환하므로 직접 처리해야 함.

**Trade-offs:**
- 장점: 시트 컬럼 순서가 바뀌어도 헤더 이름 기반으로 찾으므로 안정적
- 단점: 헤더 이름 변경 시 파서도 수정 필요 (상수로 관리하면 완화)

**핵심 제약:** `spreadsheets.values.get`은 병합 셀의 값을 **병합 범위 첫 번째 셀에만** 반환하고 나머지는 빈 문자열로 반환함. 따라서 행 1~3을 읽어 컬럼별 레이블을 직접 조립해야 함.

**Example:**
```typescript
// lib/grade-parser.ts

// 시트에서 반환된 실제 헤더 구조 예시 (3행 × N열):
// 행1: ["", "", "", "", "", "실습평가(80점)", "", "", "", "학습성과(80점)", "", "", "출석", "총점", "핵심간호술"]
// 행2: ["열번호", "실습기간", "실습기관", "학번", "이름", "사전학습", "보고서", "지도교수", "현장지도자", "대상자간호", "안전과질", "전문직", "출석점수", "총점", "핵심간호술"]
// 행3: ["", "", "", "", "", "10", "30", "20", "20", "64", "8", "8", "20", "100", "100"]

// 전략: 행2(세부항목명)를 컬럼 인덱스 맵의 기준으로 사용
function buildColumnIndexMap(headerRows: string[][]): Record<string, number> {
  const labelRow = headerRows[1]; // 행2: 세부 항목명
  const map: Record<string, number> = {};
  labelRow.forEach((label, idx) => {
    if (label) map[label.trim()] = idx;
  });
  return map;
}

export function parseStudentRows(
  allRows: string[][],
  classLabel: "A" | "B" | "C"
): StudentGrade[] {
  const headerRows = allRows.slice(0, 3);       // 행1~3: 헤더
  const dataRows = allRows.slice(3);             // 행4~: 학생 데이터
  const colMap = buildColumnIndexMap(headerRows);

  return dataRows
    .filter((row) => row[colMap["학번"]]?.trim()) // 빈 행 제거
    .map((row): StudentGrade => {
      const get = (key: string) => Number(row[colMap[key]] ?? 0);
      const name = row[colMap["이름"]] ?? "";
      return {
        studentId: row[colMap["학번"]] ?? "",
        name: anonymizeName(name),              // 김*훈 형태 익명화
        class: classLabel,
        practiceAssessment: {
          preLearning: get("사전학습"),
          report: get("보고서"),
          supervisorProf: get("지도교수"),
          supervisorField: get("현장지도자"),
        },
        learningOutcomes: {
          patientCare: get("대상자간호"),   // 학습성과2, 64점
          safetyQuality: get("안전과질"),   // 학습성과5, 8점
          professionalism: get("전문직"),   // 학습성과3, 8점
        },
        attendance: get("출석점수"),
        totalScore: get("총점"),
        coreNursingSkills: get("핵심간호술"),
      };
    });
}

/** 이름 익명 처리: "김기훈" → "김*훈" */
function anonymizeName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}
```

---

### Pattern 2: 병렬 시트 페칭 + 개별 폴백

**What:** A/B/C 3개 시트를 `Promise.all`로 병렬 페칭. 각 시트 실패 시 해당 반만 mock으로 대체.

**When to use:** 복수 시트를 가져올 때 하나의 시트 장애가 전체 페이지를 막지 않아야 할 때.

**Trade-offs:**
- 장점: 개별 시트 오류 격리, 전체 페이지 장애 방지
- 단점: 일부 mock + 일부 실제 데이터가 섞일 수 있으나 교수 전용 도구이므로 허용 범위

**Example:**
```typescript
// lib/data.ts
export async function getGradeData(): Promise<GradeDashboardData> {
  if (!isGoogleSheetsConfigured()) return mockGradeDashboardData;

  try {
    const [rowsA, rowsB, rowsC] = await Promise.all([
      fetchSheetData("A반!A1:P100"),
      fetchSheetData("B반!A1:P100"),
      fetchSheetData("C반!A1:P100"),
    ]);

    const studentsA = rowsA ? parseStudentRows(rowsA, "A") : mockGradeDashboardData.classes.A;
    const studentsB = rowsB ? parseStudentRows(rowsB, "B") : mockGradeDashboardData.classes.B;
    const studentsC = rowsC ? parseStudentRows(rowsC, "C") : mockGradeDashboardData.classes.C;

    const allStudents = [...studentsA, ...studentsB, ...studentsC];

    return {
      classes: { A: studentsA, B: studentsB, C: studentsC },
      aggregates: computeAggregates(allStudents),
    };
  } catch (error) {
    console.error("시트 페칭 실패, mock 사용:", error);
    return mockGradeDashboardData;
  }
}
```

---

### Pattern 3: Server Component → Client Chart 경계 분리

**What:** 데이터 페칭은 Server Component에서 처리하고, Recharts 차트만 Client Component로 위임.

**When to use:** Next.js App Router의 기본 패턴. Recharts는 DOM/window에 의존하므로 `"use client"` 필수.

**Trade-offs:**
- 장점: API 키 서버 보호, 초기 JS 번들 최소화, FCP 개선
- 단점: Server → Client props는 JSON 직렬화 가능해야 함 (Date 객체 등 주의)

**Example:**
```typescript
// app/(dashboard)/dashboard/page.tsx — Server Component
export default async function DashboardPage() {
  const data = await getGradeData();
  const kpi = computeKpi(data); // 서버에서 계산

  return (
    <div className="space-y-6">
      {/* Server: 인터랙션 없음 */}
      <GradeKpiCards data={kpi} />

      {/* Client: Recharts 사용 */}
      <ScoreDistributionChart data={data.classes} />
      <CutlineChart students={data.aggregates.allStudents} cutlineRatio={0.4} />
    </div>
  );
}

// components/dashboard/score-distribution-chart.tsx — Client Component
"use client";
export function ScoreDistributionChart({ data }: { data: ClassesData }) {
  // Recharts BarChart로 히스토그램 렌더링
}
```

---

### Pattern 4: 집계 함수 서버 전용 처리

**What:** 40% 컷라인 계산, 학습성과 상/중/하 분류, 반별 통계 등의 계산을 `lib/data.ts` 또는 별도 `lib/grade-utils.ts`에서 서버에서 수행하고 결과값만 컴포넌트에 전달.

**When to use:** 클라이언트가 원시 배열(~120명 학생 데이터)을 받아 직접 집계하면 불필요한 데이터 전송 발생. 집계 결과(숫자/객체)만 전달.

**Example:**
```typescript
// lib/grade-utils.ts

/** 상위 40% 기준 컷라인 점수 계산 */
export function compute40PercentCutline(scores: number[]): number {
  const sorted = [...scores].sort((a, b) => b - a);
  const cutIndex = Math.ceil(sorted.length * 0.4) - 1;
  return sorted[cutIndex] ?? 0;
}

/** 학습성과 달성도 분류 */
export function classifyOutcomeLevel(
  score: number,
  maxScore: number
): "상" | "중" | "하" {
  const ratio = score / maxScore;
  if (ratio >= 0.85) return "상";
  if (ratio >= 0.60) return "중";
  return "하";
}

/** 반별 + 전체 학습성과 집계 */
export function computeOutcomeAggregates(
  classes: Record<"A" | "B" | "C", StudentGrade[]>
): OutcomeAggregates {
  // 반별, 전체 합산
}
```

---

## Data Flow

### 전체 요청 흐름

```
[교수 브라우저 접속]
    ↓
[proxy.ts 인증 검사] → 미인증 시 /login 리다이렉트
    ↓
[app/(dashboard)/*/page.tsx (Server Component)]
    ↓
[lib/data.ts: getGradeData()]
    ↓ (병렬)
[lib/sheets.ts: fetchSheetData("A반"), fetchSheetData("B반"), fetchSheetData("C반")]
    ↓
[Google Sheets API v4]
    ↓ (응답)
[lib/grade-parser.ts: parseStudentRows() × 3]
    ↓
[lib/grade-utils.ts: computeAggregates(), compute40PercentCutline(), computeOutcomeAggregates()]
    ↓
[Server Component: 집계 결과를 Client Chart 컴포넌트에 props 전달]
    ↓
[Recharts Client 컴포넌트: 차트 렌더링]
```

### 타입 데이터 흐름

```
Google Sheets raw string[][]
    ↓  grade-parser.ts
StudentGrade[]  (typed, anonymized)
    ↓  grade-utils.ts
GradeDashboardData  {classes, aggregates, cutlines, outcomes}
    ↓  page.tsx props
Chart/Table 컴포넌트 props (serializable)
```

### 상태 관리

인터랙티브 상태는 최소화. 클라이언트 상태가 필요한 경우:

```
StudentTable (useState: searchQuery, selectedClass)
    ↓
로컬 필터링 (120명 이하, 클라이언트 필터로 충분)
```

학생 상세 페이지(`/students/[id]`)는 URL 파라미터가 상태이므로 추가 useState 불필요.

---

## Key Data Types

### 핵심 타입 (types/grade.ts)

```typescript
// types/grade.ts

export interface StudentGrade {
  studentId: string;
  name: string;                    // 익명 처리됨 (김*훈)
  class: "A" | "B" | "C";
  practiceAssessment: {
    preLearning: number;           // 사전학습, 10점 만점
    report: number;                // 보고서, 30점 만점
    supervisorProf: number;        // 실습지도교수, 20점 만점
    supervisorField: number;       // 현장지도자, 20점 만점
  };
  learningOutcomes: {
    patientCare: number;           // 대상자간호 (학습성과2), 64점 만점
    safetyQuality: number;         // 안전과질 (학습성과5), 8점 만점
    professionalism: number;       // 전문직 (학습성과3), 8점 만점
  };
  attendance: number;              // 출석, 20점 만점
  totalScore: number;              // 총점, 100점 만점
  coreNursingSkills: number;       // 핵심간호술, 100점 만점 (별도)
}

export interface ClassStats {
  classLabel: "A" | "B" | "C";
  count: number;
  mean: number;
  max: number;
  min: number;
  cutline40Percent: number;        // 40% 컷라인 점수
  distribution: ScoreBucket[];     // 히스토그램용
}

export interface ScoreBucket {
  range: string;                   // "60-65"
  count: number;
}

export interface OutcomeAggregates {
  patientCare: OutcomeLevelCount;
  safetyQuality: OutcomeLevelCount;
  professionalism: OutcomeLevelCount;
}

export interface OutcomeLevelCount {
  byClass: Record<"A" | "B" | "C", { 상: number; 중: number; 하: number }>;
  total: { 상: number; 중: number; 하: number };
  maxScore: number;
}

export interface GradeDashboardData {
  classes: Record<"A" | "B" | "C", StudentGrade[]>;
  aggregates: {
    overall: ClassStats;
    byClass: Record<"A" | "B" | "C", ClassStats>;
  };
  outcomes: OutcomeAggregates;
}
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 현재 (교수 ~5명, 학생 120명) | 현재 구조 그대로. 서버 캐싱 불필요 |
| 동시 접속 증가 시 | `React.cache()` 또는 `unstable_cache`로 getGradeData 캐싱 (같은 요청 내 중복 페칭 방지) |
| 시트 데이터 실시간성 요구 시 | 현재 요청마다 Sheets API 호출 — 캐시 TTL 도입 가능 (5분) |

**첫 번째 병목:** Google Sheets API 응답 지연 (~500ms~1s). 페이지 로딩 시 Suspense + streaming으로 UX 개선 가능.

---

## Anti-Patterns

### Anti-Pattern 1: 클라이언트에서 원시 학생 배열 필터링

**What people do:** 120명 전체 `StudentGrade[]`를 Client Component에 전달하고, 클라이언트에서 집계 계산.

**Why it's wrong:** JSON 직렬화 비용 증가, 클라이언트 번들 크기 증가, API 키 노출 위험.

**Do this instead:** 서버에서 집계 완료 후 결과(숫자/요약 객체)만 Client로 전달. 학생 테이블 검색은 예외 — 검색어 입력은 클라이언트 상태이므로 전체 목록 전달 후 클라이언트 필터 허용.

---

### Anti-Pattern 2: `fetchSheetData`에서 직접 파싱

**What people do:** `sheets.ts`에 파싱 로직을 추가하여 파일이 비대해짐.

**Why it's wrong:** `sheets.ts`는 API 래퍼여야 함. 도메인 로직이 섞이면 단위 테스트와 재사용이 어려워짐.

**Do this instead:** `sheets.ts`는 raw `string[][]` 반환만 담당. 파싱은 `grade-parser.ts`에서 전담.

---

### Anti-Pattern 3: 병합 셀을 `spreadsheets.get` (메타데이터)으로 해석

**What people do:** `spreadsheets.get`의 `merges` 프로퍼티로 병합 범위를 파악하려 함.

**Why it's wrong:** 추가 API 호출 필요, 코드 복잡도 급증.

**Do this instead:** `spreadsheets.values.get`은 병합 셀의 값을 첫 번째 셀에만 반환하는 특성을 활용. 행2(세부항목명)를 컬럼 인덱스 기준으로 삼으면 병합 여부와 무관하게 안정적으로 파싱 가능.

---

### Anti-Pattern 4: 학생 상세를 Client-side 라우팅으로 구현

**What people do:** 학생 목록 페이지에서 모달이나 client-side 상태로 학생 상세를 표시.

**Why it's wrong:** URL이 없으면 새로고침/공유 불가. 교수가 특정 학생 데이터를 공유하거나 북마크하기 어려움.

**Do this instead:** `/students/[id]/page.tsx` Server Component로 개별 학생 페이지 구성. `id`는 `studentId` (학번).

---

## Build Order (Dependencies)

컴포넌트 간 의존성을 고려한 권장 구현 순서:

```
1. types/grade.ts
   └─ 모든 레이어의 기반. 가장 먼저 정의.

2. lib/grade-parser.ts + lib/grade-utils.ts
   └─ types/grade.ts에 의존.
   └─ lib/sheets.ts는 기존 유지 (수정 불필요).

3. lib/mock-grade-data.ts
   └─ types/grade.ts에 의존.
   └─ lib/data.ts 재작성 전 폴백 데이터 준비.

4. lib/data.ts (getGradeData로 재작성)
   └─ grade-parser.ts, grade-utils.ts, mock-grade-data.ts에 의존.

5. components/dashboard/kpi-cards.tsx (교체)
   └─ Server Component. types/grade.ts에 의존.

6. app/(dashboard)/dashboard/page.tsx (교체)
   └─ lib/data.ts, kpi-cards에 의존.
   └─ 이 시점에서 기본 개요 뷰 완성 → 조기 검증 가능.

7. components/dashboard/score-distribution-chart.tsx
   components/dashboard/cutline-chart.tsx
   └─ Client 차트 컴포넌트. props 인터페이스만 맞추면 독립 개발 가능.

8. components/dashboard/student-table.tsx (Client, useState 포함)
   └─ 검색/필터 로직 포함.

9. app/(dashboard)/students/page.tsx + [id]/page.tsx
   └─ student-table, student-radar-chart에 의존.

10. components/dashboard/outcomes-band.tsx
    app/(dashboard)/outcomes/page.tsx
    └─ grade-utils.ts의 classifyOutcomeLevel에 의존.

11. app/(dashboard)/class/page.tsx
    components/dashboard/class-comparison-chart.tsx
    └─ 마지막 — 앞선 모든 레이어가 검증된 후 비교 뷰 추가.

12. components/layout/sidebar.tsx (navItems 업데이트)
    └─ 모든 라우트 완성 후 네비게이션 메뉴 추가.
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Sheets API v4 | 서비스 계정 JWT, `spreadsheets.values.get` | 기존 `lib/sheets.ts` 유지. 시트명이 한글("A반")이므로 range 인코딩 확인 필요 |
| NextAuth.js v5 beta | JWT 세션, 이메일 화이트리스트 | 기존 `auth.ts`, `proxy.ts` 유지 |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `lib/sheets.ts` → `lib/grade-parser.ts` | `string[][]` raw data | sheets.ts는 파싱 로직 없음 |
| `lib/data.ts` → Server Components | `GradeDashboardData` props | 직렬화 가능한 순수 객체 |
| Server Components → Client Charts | props (숫자/배열/단순 객체) | Date 객체 금지 — 문자열로 전달 |
| `proxy.ts` → Dashboard routes | 인증 미들웨어 | 수정 불필요 |

---

## Sources

- Next.js App Router — Server vs Client Components: Context7 `/vercel/next.js` (HIGH confidence)
  - "Use Server Components when you need to fetch data from databases or APIs close to the source, use API keys and tokens without exposing them to the client"
  - "Props passed to Client Components must be serializable"
- Google Sheets API v4 `spreadsheets.values.get` 병합 셀 동작: Context7 `/websites/googleapis_dev_nodejs_googleapis` (HIGH confidence)
- 기존 프로젝트 코드 직접 분석 (HIGH confidence):
  - `lib/sheets.ts` — fetchSheetData 패턴
  - `lib/data.ts` — 3-레이어 패턴 + Promise.all 폴백
  - `types/dashboard.ts` — 기존 타입 구조
  - `app/(dashboard)/dashboard/page.tsx` — Server Component 패턴
  - `components/dashboard/*.tsx` — Server/Client 분리 현황
- 프로젝트 요구사항: `.planning/PROJECT.md` (HIGH confidence)

---

*Architecture research for: 간호학과 실습 성적 대시보드*
*Researched: 2026-02-22*
