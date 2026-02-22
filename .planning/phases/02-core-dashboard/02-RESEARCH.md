# Phase 2: Core Dashboard - Research

**Researched:** 2026-02-22
**Domain:** Next.js Server Component + Recharts 차트 (BarChart/ReferenceLine) + KPI 계산 로직 + 목 데이터 경고 배너
**Confidence:** HIGH

---

## Summary

Phase 2는 Phase 1에서 완성된 `getGradeData()` 데이터 파이프라인을 UI에 연결하고, 교수가 한눈에 볼 수 있는 대시보드 첫 화면을 구현하는 단계다. 핵심 작업은 세 가지다: (1) 기존 매출 대시보드 KPI 카드·차트를 성적 KPI 카드·히스토그램으로 교체, (2) BarChart + ReferenceLine으로 반별 히스토그램에 A 이상 40% 컷라인을 표시, (3) dataSource 배너로 mock 폴백 상태를 경고.

이미 프로젝트에는 Recharts 3.7.0, shadcn/ui Card/Button 컴포넌트, next-themes 다크모드, Tailwind CSS v4가 설치되어 있으며 `revenue-chart.tsx`와 `category-chart.tsx`가 Recharts 사용 패턴의 레퍼런스로 존재한다. 새 라이브러리 설치 없이 기존 스택만으로 구현 가능하다.

핵심 위험은 두 가지다: Recharts SVG에서 CSS 변수(`var(--chart-1)`)가 작동하지 않으므로 기존 `category-chart.tsx`처럼 직접 HSL/oklch 값을 매핑해야 하고, 컷라인 계산(`상위 40% = 60번째 백분위수`)은 정렬 후 인덱스 산술로 직접 계산해야 한다.

**Primary recommendation:** dashboard/page.tsx를 `getGradeData()` 기반으로 완전히 교체하고, Server Component에서 KPI를 계산한 뒤 props로 Client Component 차트에 전달하는 기존 패턴을 그대로 유지한다.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | 교수가 대시보드 진입 시 KPI 요약 카드(총 학생수, 반별 평균, 전체 평균, 최고점, 최저점, 표준편차)를 한 눈에 확인할 수 있다 | 기존 `kpi-cards.tsx` Server Component 패턴을 성적 KPI로 교체. 표준편차는 JS 순수 계산(`Math.sqrt` + 분산). KpiData 타입을 `types/grades.ts`에 추가. |
| DASH-02 | 교수가 반별 성적 분포 히스토그램을 통해 점수대별 학생 수를 파악할 수 있다 | Recharts `BarChart` + 3개 `Bar`(A/B/C반)로 10점 단위 구간별 학생 수 표시. 히스토그램 데이터 변환은 Server Component에서 수행. |
| DASH-03 | 교수가 반별 상위 40% 컷라인(상대평가 A등급 경계선)을 차트에서 시각적으로 확인할 수 있다 | Recharts `ReferenceLine`의 `y` prop으로 컷라인 점수 표시 + `label` prop으로 "A 이상 40% 컷라인" 텍스트. 컷라인 = totalScore 정렬 후 Math.ceil(n*0.4)-1번째 인덱스 값. |
| UI-01 | 대시보드가 다크모드/라이트모드를 지원한다 | next-themes 이미 설치. `ThemeToggle` 이미 존재. 차트는 oklch CSS 변수 대신 하드코딩된 색상값 사용(기존 category-chart.tsx 패턴). Card/배너는 CSS 변수(`bg-background`, `text-foreground`) 사용으로 자동 다크모드. |
| UI-02 | 대시보드가 데스크톱/태블릿에서 반응형으로 표시된다 | `ResponsiveContainer width="100%"` + Tailwind `grid` + `md:grid-cols-*` 패턴. 기존 대시보드 구조 그대로 활용. |
</phase_requirements>

---

## Standard Stack

### Core (이미 설치됨 — 추가 설치 불필요)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.7.0 | BarChart 히스토그램, ReferenceLine 컷라인 표시 | 프로젝트 기존 사용, React 19 호환 |
| next | 16.1.6 | Server Component에서 데이터 페칭 | 프로젝트 기반 |
| next-themes | ^0.4.6 | 다크모드/라이트모드 전환 | 이미 동작 중 |
| shadcn/ui (Card) | - | KPI 카드, 히스토그램 카드 래퍼 | 프로젝트 표준 UI |
| lucide-react | ^0.563.0 | KPI 카드 아이콘 | 프로젝트 표준 아이콘 |
| tailwindcss | ^4 | 반응형 그리드, 색상, 배너 스타일 | 프로젝트 CSS 시스템 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx / cn | ^2.1.1 | 조건부 className 결합 | 배너 visibility 조건, 다크모드 분기 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts BarChart (grouped) | 3개 별도 BarChart | 반별 히스토그램을 하나의 grouped bar로 보여주는 것이 비교에 유리 |
| Server Component KPI 계산 | Client Component useState | Server가 옳음 — 데이터가 이미 서버에 있고 인터랙션 없음 |

**Installation:** 추가 설치 없음. 기존 패키지로 구현 가능.

---

## Architecture Patterns

### Recommended Project Structure

```
app/
└── (dashboard)/
    └── dashboard/
        └── page.tsx              ← Server Component: getGradeData() 호출 + KPI 계산

components/
└── dashboard/
    ├── grade-kpi-cards.tsx       ← Server Component: KPI 카드 6개
    ├── grade-histogram-chart.tsx ← Client Component ("use client"): BarChart 히스토그램
    ├── mock-data-banner.tsx      ← Server Component: 경고 배너 (dataSource 기반)
    └── (기존 파일들은 삭제 또는 유지)

types/
└── grades.ts                     ← GradeKpiData 인터페이스 추가 (기존 파일 확장)
```

### Pattern 1: Server Component에서 KPI 계산 후 props 전달

**What:** dashboard/page.tsx(Server)에서 getGradeData()로 학생 데이터를 받아 KPI를 계산하고, 결과를 props로 Server/Client 컴포넌트에 전달한다.

**When to use:** 인터랙션이 없는 순수 데이터 표시 컴포넌트. KPI 카드, 경고 배너.

**Example:**
```typescript
// Source: 프로젝트 기존 패턴 (app/(dashboard)/dashboard/page.tsx 구조 참고)
// app/(dashboard)/dashboard/page.tsx (Server Component)
import { getGradeData } from "@/lib/grade-data";
import { computeGradeKpi } from "@/lib/grade-kpi";        // 새로 만들 유틸
import { buildHistogramData } from "@/lib/grade-histogram"; // 새로 만들 유틸
import { GradeKpiCards } from "@/components/dashboard/grade-kpi-cards";
import { GradeHistogramChart } from "@/components/dashboard/grade-histogram-chart";
import { MockDataBanner } from "@/components/dashboard/mock-data-banner";

export default async function DashboardPage() {
  const { students, dataSource } = await getGradeData();
  const kpi = computeGradeKpi(students);
  const histogramData = buildHistogramData(students);

  return (
    <div className="space-y-6">
      <MockDataBanner dataSource={dataSource} />
      <GradeKpiCards kpi={kpi} />
      <GradeHistogramChart data={histogramData} cutlines={kpi.cutlines} />
    </div>
  );
}
```

### Pattern 2: Client Component Recharts Chart (기존 패턴 동일)

**What:** Recharts는 DOM 조작이 필요하므로 "use client" 필수. 데이터는 props로 받고 차트만 렌더링.

**When to use:** BarChart, ReferenceLine 등 Recharts 컴포넌트를 사용하는 모든 차트.

**Example:**
```typescript
// Source: Context7 /recharts/recharts + 기존 revenue-chart.tsx 패턴
"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Recharts SVG에서 CSS 변수가 작동하지 않으므로 직접 색상값 매핑 (기존 category-chart.tsx 패턴)
const CLASS_COLORS = {
  A: "hsl(220, 70%, 50%)",  // chart-1 근사값
  B: "hsl(160, 60%, 45%)",  // chart-2 근사값
  C: "hsl(30, 80%, 55%)",   // chart-3 근사값
};

interface HistogramDataPoint {
  range: string;   // "0-9", "10-19", ..., "90-100"
  A: number;       // A반 학생 수
  B: number;       // B반 학생 수
  C: number;       // C반 학생 수
}

interface GradeHistogramChartProps {
  data: HistogramDataPoint[];
  cutlines: { A: number; B: number; C: number }; // 각 반 40% 컷라인 점수
}

export function GradeHistogramChart({ data, cutlines }: GradeHistogramChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>반별 성적 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="range" tick={{ fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="A" name="A반" fill={CLASS_COLORS.A} />
              <Bar dataKey="B" name="B반" fill={CLASS_COLORS.B} />
              <Bar dataKey="C" name="C반" fill={CLASS_COLORS.C} />
              {/* ReferenceLine은 히스토그램 x축(점수 구간)에 수직선으로 표시 어려우므로
                  실제 구현에서는 정렬 순위 차트 또는 별도 컷라인 정보 표시 권장 — 아래 Open Questions 참고 */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 3: ReferenceLine으로 컷라인 표시

**What:** Recharts `ReferenceLine` 컴포넌트로 수직/수평 기준선과 라벨을 표시한다.

**When to use:** 히스토그램 또는 순위 차트에서 특정 임계값 시각화.

**Example:**
```typescript
// Source: Context7 /recharts/recharts ReferenceLine 문서
// y 기반 수평선 — 점수 구간별 히스토그램에서 적합하지 않을 수 있음 (Open Questions 참고)
<ReferenceLine
  y={cutlineScore}
  label={{ value: "A 이상 40% 컷라인", position: "insideTopRight" }}
  stroke="red"
  strokeDasharray="3 3"
/>

// x 기반 수직선 — 히스토그램에서 특정 점수 구간 표시 시
<ReferenceLine
  x="70-79"
  label={{ value: "A 이상 40% 컷라인", position: "top" }}
  stroke="red"
  strokeDasharray="3 3"
/>
```

### Pattern 4: KPI 계산 유틸 (Server-side, 순수 TypeScript)

**What:** StudentGrade[] 배열에서 KPI 값을 계산하는 순수 함수. lib/ 레이어에 배치.

**Example:**
```typescript
// lib/grade-kpi.ts (새 파일)
import type { StudentGrade, ClassCode } from '@/types/grades';

export interface GradeKpiData {
  totalStudents: number;     // 총 학생 수
  classAverages: Record<ClassCode, number>; // 반별 평균
  overallAverage: number;    // 전체 평균
  highest: number;           // 최고점
  lowest: number;            // 최저점
  stdDev: number;            // 표준편차
  cutlines: Record<ClassCode, number>; // 반별 40% 컷라인 점수
}

export function computeGradeKpi(students: StudentGrade[]): GradeKpiData {
  const totalStudents = students.length;
  const scores = students.map(s => s.totalScore);

  // 표준편차: Math.sqrt(분산) — 분산 = sum((x - mean)^2) / n
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // 반별 40% 컷라인: 해당 반 학생을 totalScore 내림차순 정렬 후 상위 40%의 마지막 점수
  const cutlineForClass = (classCode: ClassCode): number => {
    const classStudents = students
      .filter(s => s.classCode === classCode)
      .map(s => s.totalScore)
      .sort((a, b) => b - a); // 내림차순
    if (classStudents.length === 0) return 0;
    const cutIndex = Math.ceil(classStudents.length * 0.4) - 1;
    return classStudents[cutIndex];
  };

  return {
    totalStudents,
    classAverages: {
      A: avg(students.filter(s => s.classCode === 'A').map(s => s.totalScore)),
      B: avg(students.filter(s => s.classCode === 'B').map(s => s.totalScore)),
      C: avg(students.filter(s => s.classCode === 'C').map(s => s.totalScore)),
    },
    overallAverage: mean,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
    stdDev,
    cutlines: { A: cutlineForClass('A'), B: cutlineForClass('B'), C: cutlineForClass('C') },
  };
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
```

### Pattern 5: 히스토그램 데이터 변환 유틸 (Server-side)

**What:** StudentGrade[]를 10점 단위 구간별 학생 수로 변환.

**Example:**
```typescript
// lib/grade-histogram.ts (새 파일)
import type { StudentGrade } from '@/types/grades';

export interface HistogramDataPoint {
  range: string;  // "0-9", "10-19", ..., "90-100"
  A: number;
  B: number;
  C: number;
}

export function buildHistogramData(students: StudentGrade[]): HistogramDataPoint[] {
  // 11개 구간: 0-9, 10-19, ..., 90-100
  const ranges = Array.from({ length: 11 }, (_, i) => {
    const low = i * 10;
    const high = i === 10 ? 100 : low + 9;
    return { label: `${low}-${high}`, low, high };
  });

  return ranges.map(({ label, low, high }) => ({
    range: label,
    A: students.filter(s => s.classCode === 'A' && s.totalScore >= low && s.totalScore <= high).length,
    B: students.filter(s => s.classCode === 'B' && s.totalScore >= low && s.totalScore <= high).length,
    C: students.filter(s => s.classCode === 'C' && s.totalScore >= low && s.totalScore <= high).length,
  }));
}
```

### Pattern 6: Mock 데이터 경고 배너 (Server Component)

**What:** dataSource가 'mock' 또는 'partial-mock'일 때 상단에 경고 배너 표시.

**Example:**
```typescript
// components/dashboard/mock-data-banner.tsx (Server Component — "use client" 없음)
import type { DataSource } from '@/types/grades';

interface MockDataBannerProps {
  dataSource: DataSource;
}

export function MockDataBanner({ dataSource }: MockDataBannerProps) {
  if (dataSource === 'sheets') return null;

  const message = dataSource === 'partial-mock'
    ? '일부 반 데이터를 목 데이터로 대체 중입니다 (Google Sheets 연결 오류)'
    : '목 데이터 사용 중 — Google Sheets 연결이 설정되지 않았습니다';

  return (
    <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
      {message}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Recharts에서 CSS 변수 직접 사용:** `stroke="var(--chart-1)"` — SVG 렌더링 시 CSS 변수가 해석되지 않는 경우가 있음. 대신 `hsl(...)` 직접 값 사용 (기존 category-chart.tsx 패턴).
- **Client Component에서 getGradeData() 호출:** 서버 전용 함수(googleapis 포함). Server Component에서만 호출해야 함.
- **기존 dashboard/page.tsx의 getDashboardData() 잔존:** Phase 1 VERIFICATION.md에서 명시한 핵심 갭. 이번 Phase에서 완전히 교체해야 함.
- **KPI 계산을 컴포넌트 내부에서 수행:** 재사용성 및 테스트 용이성을 위해 lib/ 유틸 함수로 분리.
- **히스토그램 구간에 전체 학생 혼합:** 히스토그램은 반별로 구분해야 함. `classCode`로 필터링 필수.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 히스토그램 차트 | 직접 SVG 그리기 | Recharts BarChart (grouped) | 반응형, 애니메이션, 툴팁, 다크모드 자동 처리 |
| 컷라인 기준선 | 직접 SVG line element | Recharts ReferenceLine | 차트 좌표계와 자동 정렬, label prop 내장 |
| 반응형 차트 컨테이너 | 직접 ResizeObserver | Recharts ResponsiveContainer | 이미 ResizeObserver 구현됨 |
| 다크모드 토글 | 직접 localStorage + 클래스 | next-themes (이미 설치) | SSR hydration 이슈 자동 처리 |

**Key insight:** 히스토그램이 "독자 구현처럼 보이지만" Recharts BarChart가 정확히 이 용도로 설계되어 있음. grouped bar + x축이 점수 구간이면 히스토그램과 시각적으로 동일.

---

## Common Pitfalls

### Pitfall 1: Recharts ReferenceLine x 값이 데이터 dataKey와 정확히 일치해야 함

**What goes wrong:** `<ReferenceLine x="70-79" />` 사용 시 HistogramDataPoint.range가 `"70-79"`가 아니면 기준선이 렌더링되지 않음.

**Why it happens:** ReferenceLine x prop은 XAxis dataKey 값과 정확히 string 매칭함.

**How to avoid:** `buildHistogramData`에서 생성하는 range 문자열과 ReferenceLine x prop에 전달하는 값을 동일 함수에서 유도.

**Warning signs:** 기준선이 보이지 않거나 엉뚱한 위치에 표시됨.

### Pitfall 2: 컷라인을 히스토그램 x축(점수 구간)으로 표현하는 어려움

**What goes wrong:** 히스토그램 x축은 "60-69"와 같은 범위 라벨이고 컷라인은 특정 점수(예: 73.5)이므로, 정확한 컷라인 위치를 히스토그램에 표시하기 어렵다.

**Why it happens:** 구간 히스토그램에서 연속값 컷라인을 정확히 표시하는 것은 Recharts BarChart로는 근사치만 가능.

**How to avoid:** 두 가지 접근 중 선택:
- (A) 컷라인이 속하는 구간 막대에 특별 색상 강조 + 카드에 "A반 컷라인: 73.5점" 텍스트 표시
- (B) 별도 순위 차트(ScatterChart 또는 BarChart with sorted scores)에 ReferenceLine으로 정확한 컷라인 표시 (STUD-02 요구사항이지만 Phase 4 범위)

**Warning signs:** DASH-03 성공기준 "히스토그램 또는 순위 차트에"라는 표현이 이 모호성을 이미 인식하고 있음.

**권고:** KPI 카드에 반별 컷라인 점수를 텍스트로 명확히 표시하고, 히스토그램에서는 컷라인이 속한 구간 막대에 색상 강조 또는 `<ReferenceLine x={cutlineRange} />` 근사 표시로 구현. "히스토그램에서 컷라인 구간을 시각적으로 표시" + "KPI 카드에 정확한 점수 텍스트"의 조합이 현실적.

### Pitfall 3: Server Component에서 "use client" Client Component import 시 props 직렬화

**What goes wrong:** Server Component에서 Client Component로 함수(Function)를 props로 전달 불가.

**Why it happens:** Next.js App Router의 Server/Client 경계에서 props는 JSON 직렬화 가능한 값만 허용.

**How to avoid:** KPI 계산 결과(숫자, 문자열, 배열)만 props로 전달. 계산 함수는 Server Component에서 호출 완료 후 결과만 전달.

### Pitfall 4: 반별 평균 소수점 표시

**What goes wrong:** `73.2857142857...` 처럼 긴 소수점이 KPI 카드에 노출됨.

**Why it happens:** JS 나눗셈의 부동소수점.

**How to avoid:** `Math.round(avg * 10) / 10` 또는 `.toFixed(1)` + `parseFloat()`로 소수점 1자리로 고정.

### Pitfall 5: 빈 반(학생 0명) 처리

**What goes wrong:** partial-mock 폴백 시 특정 반 학생 수가 0일 때 `Math.max(...[])` = `-Infinity` 오류.

**Why it happens:** 빈 배열에 spread operator로 Math.min/max 호출.

**How to avoid:** KPI 계산 전 `if (arr.length === 0) return 0` 가드 추가 (이미 grade-kpi.ts 예시에 포함).

---

## Code Examples

Verified patterns from official sources:

### Recharts ReferenceLine with label (Context7 verified)
```typescript
// Source: Context7 /recharts/recharts
<ReferenceLine
  y={3000}
  label="Target"
  stroke="red"
  strokeDasharray="3 3"
/>

// label 객체로 세부 제어
<ReferenceLine
  x="Apr"
  stroke="green"
  label={{ value: 'Q2 Start', position: 'top' }}
/>
```

### Recharts grouped BarChart (Context7 verified)
```typescript
// Source: Context7 /recharts/recharts
<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="pv" stackId="a" fill="#8884d8" />  {/* stackId 제거하면 grouped */}
  <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
</BarChart>
```

### 40% 컷라인 계산 (순수 TypeScript)
```typescript
// 내림차순 정렬 후 상위 40% 마지막 인덱스
// 42명이면: Math.ceil(42 * 0.4) - 1 = Math.ceil(16.8) - 1 = 17 - 1 = 16 → 17번째 학생(0-indexed 16)
function cutlineScore(scores: number[]): number {
  const sorted = [...scores].sort((a, b) => b - a);
  const cutIndex = Math.ceil(sorted.length * 0.4) - 1;
  return sorted[cutIndex] ?? 0;
}
```

### 표준편차 계산 (순수 TypeScript)
```typescript
function stdDev(scores: number[]): number {
  if (scores.length === 0) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}
```

### MockDataBanner 조건부 렌더링 (기존 타입 활용)
```typescript
// types/grades.ts의 DataSource 타입 활용
import type { DataSource } from '@/types/grades';

// 'sheets'이면 null, 'mock'/'partial-mock'이면 배너 표시
if (dataSource === 'sheets') return null;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getDashboardData()` (매출 데이터) | `getGradeData()` (성적 데이터) | Phase 2 교체 | dashboard/page.tsx 전체 교체 필요 |
| KPI: 매출/주문/성장률 | KPI: 학생수/반별평균/최고최저/표준편차 | Phase 2 | kpi-cards.tsx → grade-kpi-cards.tsx |
| RevenueChart (라인) | GradeHistogramChart (바 차트) | Phase 2 | 컴포넌트 신규 작성 |
| CategoryChart (파이) | 제거 또는 Phase 4로 이동 | Phase 2 | category-chart.tsx 더 이상 불필요 |

**Deprecated/outdated:**
- `lib/data.ts` (매출 데이터 getDashboardData): Phase 2에서 dashboard/page.tsx가 getGradeData()로 교체되면 호출 경로가 없어짐. 파일 자체는 남겨두거나 제거 — 계획에서 명시 필요.
- `types/dashboard.ts` (KpiData, MonthlyRevenue 등): 성적 대시보드에서 사용되지 않으므로 Phase 2 이후 제거 가능. 단 Breaking 없으므로 급하지 않음.

---

## Phase 1 연결 갭 (VERIFICATION.md에서 이관)

Phase 1 VERIFICATION.md가 명시한 핵심 갭:

> `app/(dashboard)/dashboard/page.tsx` — `getDashboardData()` 사용 중, `getGradeData()` 미연결.
> Phase 2 첫 번째 태스크로 getGradeData()로 교체해야 함.

이 갭은 Phase 2의 필수 시작점이다. 이 연결 없이 KPI 카드, 히스토그램, 경고 배너 어느 것도 구현 불가.

---

## Open Questions

1. **컷라인을 히스토그램에서 어떻게 표시할 것인가?**
   - What we know: 히스토그램 x축은 "60-69" 같은 구간 라벨이고, 컷라인은 73.5 같은 실수값
   - What's unclear: 구간 히스토그램에서 정확한 컷라인 위치를 Recharts로 표시하는 표준 방법 없음
   - Recommendation: (A) KPI 카드에 "A반 컷라인: 73.5점" 텍스트 + 히스토그램에서 컷라인 구간 막대에 `<ReferenceLine x="70-79" />` 근사 표시. DASH-03 성공기준 "히스토그램 또는 순위 차트"의 '또는' 표현이 이 유연성을 허용함.

2. **기존 매출 대시보드 컴포넌트(kpi-cards, revenue-chart, category-chart, recent-orders-table)를 제거해야 하는가?**
   - What we know: Phase 2 이후 dashboard/page.tsx에서 호출되지 않음
   - What's unclear: 향후 참조가 필요할 수 있음, 또는 dead code로 남아 있으면 혼란
   - Recommendation: 파일명을 변경하거나(grade-kpi-cards.tsx 등 새 파일 생성) 기존 파일을 교체. 명시적으로 계획에서 결정.

3. **반별 히스토그램을 하나의 grouped chart로 보여줄 것인가, 아니면 3개 별도 차트로?**
   - What we know: DASH-02가 "반별 성적 분포 히스토그램"이라 명시 — 반별 비교가 목적
   - Recommendation: 하나의 grouped BarChart(A/B/C반 각각 Bar 컴포넌트)가 비교 가시성에 유리. 단 반이 많으면 바가 너무 촘촘해질 수 있으나 3반은 적절.

---

## Sources

### Primary (HIGH confidence)

- Context7 `/recharts/recharts` — ReferenceLine, BarChart grouped, ResponsiveContainer 패턴
- 프로젝트 코드베이스 직접 검토:
  - `components/dashboard/revenue-chart.tsx` — Recharts 사용 패턴, CSS 변수 이슈
  - `components/dashboard/category-chart.tsx` — CHART_COLORS 하드코딩 패턴 확인
  - `lib/grade-data.ts` — getGradeData() 인터페이스 확인
  - `types/grades.ts` — StudentGrade, DataSource 타입 확인
  - `app/(dashboard)/dashboard/page.tsx` — 현재 getDashboardData() 호출 구조 확인
  - `.planning/phases/01-data-foundation/01-VERIFICATION.md` — Phase 1 갭 분석

### Secondary (MEDIUM confidence)

- Recharts 3.x 공식 패턴 (Context7 라이브러리 ID: /recharts/recharts, Benchmark Score 88.7)

### Tertiary (LOW confidence)

- 없음

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — 설치된 라이브러리 package.json 직접 확인 + Context7 Recharts 검증
- Architecture: HIGH — 기존 패턴(revenue-chart.tsx, kpi-cards.tsx)이 레퍼런스로 존재
- KPI 계산 로직: HIGH — 순수 TypeScript 수학 연산, 외부 의존성 없음
- ReferenceLine 컷라인 표시: MEDIUM — 히스토그램 x축과 실수값 컷라인 간의 좌표 매핑 근사치 이슈 존재
- Pitfalls: HIGH — 기존 코드(category-chart.tsx CSS 변수 이슈)와 Context7로 검증됨

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (Recharts 3.x API 안정, 30일)
