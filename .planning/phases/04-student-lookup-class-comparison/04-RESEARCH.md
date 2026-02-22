# Phase 4: Student Lookup and Class Comparison - Research

**Researched:** 2026-02-23
**Domain:** 학생 검색/조회 테이블 + 순위 차트 + 반별 비교 차트 + 핵심간호술 별도 표시 — Next.js Server/Client + Recharts 3 + shadcn/ui
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STUD-01 | 교수가 전체 학생 성적 테이블에서 반별 필터링과 이름/학번 검색을 통해 개별 학생 성적을 조회할 수 있다 | `StudentGrade` 타입에 `classCode`, `name`, `studentId`, 모든 점수 항목 이미 존재. 검색·필터 상태 관리 → Client Component + `useState`. 테이블 렌더링은 shadcn `Table` 컴포넌트(이미 설치됨) 활용 가능. 반별 필터는 버튼 그룹(`'all' | 'A' | 'B' | 'C'`), 이름/학번 검색은 `<input>` + `string.includes()` 필터링. |
| STUD-02 | 교수가 총점 기준 순위 차트에서 전체 학생의 순위와 40% 컷라인 경계를 시각적으로 확인할 수 있다 | 전체 학생 `totalScore` 내림차순 정렬 후 순위 배열 생성. Recharts `BarChart` 또는 `ComposedChart`에 `ReferenceLine`으로 40% 컷라인 표시. `Math.ceil(n * 0.4) - 1` 인덱스 패턴은 Phase 2에서 검증됨(`computeGradeKpi()` 내 cutlines 계산). |
| COMP-01 | 교수가 A/B/C반의 평균, 분포를 나란히 비교하는 차트를 확인할 수 있다 | 반별 평균은 `classAverages`로 이미 `GradeKpiData`에 존재. 분포 비교는 `buildHistogramData()`가 이미 반별 카운트 데이터를 생성. 추가 계산 없이 기존 데이터를 다른 Recharts 차트(RadarChart 또는 BarChart grouped)로 시각화. |
| COMP-02 | 핵심간호술(100점 만점 별도 평가) 데이터가 총점과 분리되어 별도로 추적·표시된다 | `StudentGrade.nursingSkills` 필드가 이미 존재(100점 만점). `totalScore`와 별도 관리. 반별 평균, 분포 등 별도 집계 함수(`computeNursingSkillsStats()`) 추가 필요. 시각화는 KPI 카드 또는 별도 차트. |
</phase_requirements>

---

## Summary

Phase 4는 교수가 개별 학생을 검색·조회하고, 전체 순위와 컷라인을 확인하고, 반별 성적을 비교하며, 핵심간호술을 별도 추적할 수 있는 페이지를 새로 추가하는 단계다. Phase 1-3의 모든 기반(데이터 레이어, 타입, 유틸 함수)이 이미 완성되어 있으므로, Phase 4는 주로 새로운 UI 컴포넌트와 새 페이지 라우트 추가가 핵심이다.

네 가지 요구사항은 두 개 페이지(또는 하나의 페이지에 섹션)으로 구현한다. **STUD-01/STUD-02**: 새 `/students` 라우트에서 학생 검색 테이블과 순위 차트를 구현. **COMP-01/COMP-02**: 새 `/class-comparison` 라우트(또는 기존 대시보드 확장)에서 반별 비교 차트와 핵심간호술 별도 표시를 구현. 새 라이브러리 설치는 불필요하다. Recharts 3, shadcn/ui Table, Tailwind CSS, lucide-react 모두 이미 설치되어 있으며, 기존 유틸(`computeGradeKpi()`, `buildHistogramData()`, `getGradeData()`)을 최대한 재활용한다.

핵심 난관은 두 가지다. (1) **순위 차트**: 126명 학생의 총점을 개인별 바 차트로 표시하면 X축이 너무 밀집됨 → 126개 바보다 클래스별 색상으로 구분된 `ComposedChart`나 `ScatterChart` 또는 반별 그룹화 방식 고려 필요. (2) **이름/학번 검색 성능**: 126명은 클라이언트 필터링으로 충분하지만, 익명화된 이름(`김*우`)으로 검색 시 `string.includes()` 방식이 정상 동작하는지 확인 필요.

**Primary recommendation:** `/students` 페이지에 학생 검색 테이블(STUD-01) + 순위 차트(STUD-02), `/class-comparison` 페이지에 반별 비교 차트(COMP-01) + 핵심간호술 별도 섹션(COMP-02)을 추가하고, 사이드바에 두 링크를 추가한다.

---

## Standard Stack

### Core (이미 설치됨 — 추가 설치 불필요)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | 새 라우트(`/students`, `/class-comparison`) App Router | 프로젝트 기반 |
| react | 19.2.3 | Client Component `useState`로 검색·필터 상태 관리 | 프로젝트 기반 |
| recharts | ^3.7.0 | 순위 BarChart + ReferenceLine, 반별 비교 BarChart/RadarChart | 프로젝트 기존 사용 — 이미 설치됨 |
| shadcn/ui (Card, Table) | - | 학생 목록 테이블, 카드 래퍼 | 이미 설치됨 |
| tailwindcss | ^4 | 필터 버튼 그룹, 검색 입력창, 레이아웃 | 프로젝트 CSS 시스템 |
| lucide-react | ^0.563.0 | 검색 아이콘(Search), 필터 아이콘(Filter) | 이미 설치됨 |

### Supporting (기존 코드 — 재사용)

| 모듈 | 위치 | 재사용 방식 |
|------|------|------------|
| `getGradeData()` | `lib/grade-data.ts` | Server Component에서 학생 데이터 페칭 |
| `computeGradeKpi()` | `lib/grade-kpi.ts` | `cutlines`, `classAverages` 재사용 |
| `buildHistogramData()` | `lib/grade-histogram.ts` | 반별 분포 데이터 재사용 (COMP-01) |
| `StudentGrade` 타입 | `types/grades.ts` | 검색 테이블 열 표시 |
| `GradeKpiData` 타입 | `types/grades.ts` | 반별 평균/컷라인 접근 |
| `ClassCode` 타입 | `types/grades.ts` | 반 필터 타입 |
| `MockDataBanner` | `components/dashboard/mock-data-banner.tsx` | mock 폴백 경고 (이미 완성) |
| `CLASS_COLORS` 패턴 | `components/dashboard/grade-histogram-chart.tsx` | 반별 색상 상수 (A: 파랑, B: 초록, C: 주황) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 126개 개인별 BarChart 순위 차트 | ScatterChart, 반별 그룹 ComposedChart | 126개 바가 X축에 밀집되므로 가로 스크롤 허용하거나 ScatterChart로 점 표시. 반별 색상 구분 BarChart가 가장 직관적 |
| Client-side 문자열 검색 | 서버 API 라우트 검색 | 126명 데이터는 클라이언트 메모리에 충분히 보관 가능. 서버 API 불필요 |
| 별도 `/class-comparison` 라우트 | 기존 dashboard/page.tsx에 섹션 추가 | 별도 라우트가 URL 북마크 가능, 사이드바 탐색 자연스러움. COMP-01/COMP-02는 요구사항이 뚜렷하여 별도 페이지가 적합 |
| Recharts RadarChart (반별 비교) | Recharts BarChart grouped | RadarChart는 다차원 비교에 강점. BarChart는 평균/최고/최저 직접 비교에 강점. 요구사항이 "평균·분포를 나란히"이므로 BarChart grouped 권장 |

**Installation:** 추가 설치 없음. 기존 스택으로 구현 가능.

---

## Architecture Patterns

### Recommended Project Structure

```
app/
└── (dashboard)/
    ├── dashboard/
    │   └── page.tsx                    ← 기존 (Phase 2 완성)
    ├── learning-outcomes/
    │   └── page.tsx                    ← 기존 (Phase 3 완성)
    ├── students/
    │   └── page.tsx                    ← 신규 Server Component: 학생 데이터 페칭
    └── class-comparison/
        └── page.tsx                    ← 신규 Server Component: 반별 비교 데이터 페칭

components/
└── dashboard/
    ├── student-table.tsx               ← 신규 "use client": 검색·필터 + 학생 테이블
    ├── student-rank-chart.tsx          ← 신규 "use client": 순위 BarChart + ReferenceLine
    ├── class-comparison-chart.tsx      ← 신규 "use client": 반별 비교 BarChart
    └── nursing-skills-stats.tsx        ← 신규 Server Component 또는 Client: 핵심간호술 통계

lib/
└── grade-rank.ts                       ← 신규: 순위 계산 유틸 (buildRankData)
└── grade-nursing-skills.ts             ← 신규: 핵심간호술 집계 유틸 (computeNursingSkillsStats)

types/
└── grades.ts                           ← 기존 파일에 RankDataPoint, NursingSkillsStats 타입 추가
```

### Pattern 1: 학생 검색·필터 Client Component (STUD-01)

**What:** 반별 필터 버튼 + 이름/학번 검색 입력창 + 결과 테이블. 모든 상태를 `useState`로 관리.

**When to use:** 인터랙션(검색, 필터링)이 있는 데이터 테이블.

**Example:**
```typescript
"use client";

// components/dashboard/student-table.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StudentGrade, ClassCode } from '@/types/grades';
import { Search } from 'lucide-react';

interface StudentTableProps {
  students: StudentGrade[];  // 전체 학생 배열 (서버에서 props로 전달)
}

type ClassFilter = 'all' | ClassCode;

const CLASS_FILTERS: { key: ClassFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'A', label: 'A반' },
  { key: 'B', label: 'B반' },
  { key: 'C', label: 'C반' },
];

export function StudentTable({ students }: StudentTableProps) {
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링 + 검색 — useMemo로 불필요한 재계산 방지
  const filteredStudents = useMemo(() => {
    let result = students;

    // 반별 필터 적용
    if (classFilter !== 'all') {
      result = result.filter(s => s.classCode === classFilter);
    }

    // 이름/학번 검색 적용 (대소문자 무시)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.studentId.toLowerCase().includes(query)
      );
    }

    return result;
  }, [students, classFilter, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>학생 성적 조회</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 반별 필터 버튼 */}
        <div className="flex gap-2 flex-wrap">
          {CLASS_FILTERS.map(filter => (
            <button
              key={filter.key}
              onClick={() => setClassFilter(filter.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                classFilter === filter.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 이름/학번 검색 입력 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="이름 또는 학번으로 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* 결과 카운트 */}
        <p className="text-sm text-muted-foreground">
          {filteredStudents.length}명 표시 중 (전체 {students.length}명)
        </p>

        {/* 학생 테이블 */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>학번</TableHead>
                <TableHead>반</TableHead>
                <TableHead className="text-right">사전학습</TableHead>
                <TableHead className="text-right">보고서</TableHead>
                <TableHead className="text-right">실습지도교수</TableHead>
                <TableHead className="text-right">현장지도자</TableHead>
                <TableHead className="text-right">총점</TableHead>
                <TableHead className="text-right">핵심간호술</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map(student => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.studentId}</TableCell>
                  <TableCell>{student.classCode}반</TableCell>
                  <TableCell className="text-right">{student.preLearning}</TableCell>
                  <TableCell className="text-right">{student.reportTotal}</TableCell>
                  <TableCell className="text-right">{student.profTotal}</TableCell>
                  <TableCell className="text-right">{student.fieldTotal}</TableCell>
                  <TableCell className="text-right font-semibold">{student.totalScore}</TableCell>
                  <TableCell className="text-right text-blue-600 dark:text-blue-400">{student.nursingSkills}</TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 2: 순위 차트 데이터 유틸 (STUD-02)

**What:** 전체 학생 `totalScore` 내림차순 정렬 → 순위 배열 생성. Recharts에 전달할 JSON 직렬화 가능한 데이터 포인트 생성.

**When to use:** 순위 차트용 데이터를 서버에서 계산하여 Client Component props로 전달할 때.

**Example:**
```typescript
// lib/grade-rank.ts (신규 파일)
import type { StudentGrade, ClassCode } from '@/types/grades';

/** 순위 차트 데이터 포인트 — JSON 직렬화 가능 */
export interface RankDataPoint {
  /** 순위 (1-based) */
  rank: number;
  /** 익명화된 이름 */
  name: string;
  /** 반 코드 */
  classCode: ClassCode;
  /** 총점 */
  totalScore: number;
  /** 40% 컷라인 이상 여부 — 색상 구분용 */
  aboveCutline: boolean;
}

/**
 * 전체 학생 배열을 총점 기준 순위 데이터로 변환한다.
 * - 총점 내림차순 정렬
 * - 순위(1-based) 추가
 * - 전체 상위 40% 컷라인 계산하여 aboveCutline 표시
 *
 * @param students - 전체 학생 배열
 * @returns 순위 배열 (내림차순 정렬됨)
 */
export function buildRankData(students: StudentGrade[]): RankDataPoint[] {
  if (students.length === 0) return [];

  // 총점 내림차순 정렬 (원본 배열 변경 없이 복사)
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);

  // 전체 40% 컷라인 계산 (cutlines 계산과 동일 패턴 — grade-kpi.ts)
  const cutIndex = Math.ceil(sorted.length * 0.4) - 1;
  const cutlineScore = sorted[cutIndex].totalScore;

  return sorted.map((student, index) => ({
    rank: index + 1,
    name: student.name,
    classCode: student.classCode,
    totalScore: student.totalScore,
    aboveCutline: student.totalScore >= cutlineScore,
  }));
}

/** 전체 학생의 상위 40% 컷라인 점수 반환 */
export function computeOverallCutline(students: StudentGrade[]): number {
  if (students.length === 0) return 0;
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);
  const cutIndex = Math.ceil(sorted.length * 0.4) - 1;
  return sorted[cutIndex].totalScore;
}
```

### Pattern 3: 순위 차트 Client Component (STUD-02)

**What:** 순위 데이터를 Recharts `BarChart`로 시각화. 40% 컷라인에 `ReferenceLine` 추가. 반별 색상 구분.

**Key Decision:** 126명을 X축에 개인 이름으로 표시하면 가독성이 낮음 → X축은 순위 번호로, 툴팁에 이름 표시. 가로 스크롤 허용하거나 높이를 충분히 확보.

**Example:**
```typescript
"use client";

// components/dashboard/student-rank-chart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RankDataPoint } from '@/lib/grade-rank';

// Phase 2에서 검증된 색상 상수 패턴 (Recharts SVG에서 CSS 변수 불가)
const CLASS_COLORS = {
  A: 'hsl(220, 70%, 50%)',
  B: 'hsl(160, 60%, 45%)',
  C: 'hsl(30, 80%, 55%)',
};

interface StudentRankChartProps {
  data: RankDataPoint[];
  cutlineScore: number;
}

export function StudentRankChart({ data, cutlineScore }: StudentRankChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>전체 학생 순위 (총점 기준)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 가로 스크롤 허용: 126명 × 8px ≈ 최소 1000px */}
        <div className="overflow-x-auto">
          <div style={{ width: Math.max(800, data.length * 8) }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="rank" tick={{ fontSize: 10 }} label={{ value: '순위', position: 'insideBottom', offset: -5 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value}점`, '총점']}
                  labelFormatter={(label) => `${label}위`}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as RankDataPoint;
                    return (
                      <div className="rounded-lg border bg-background p-2 text-sm shadow">
                        <p className="font-semibold">{d.rank}위 — {d.name} ({d.classCode}반)</p>
                        <p>총점: {d.totalScore}점</p>
                        <p className={d.aboveCutline ? 'text-green-600' : 'text-muted-foreground'}>
                          {d.aboveCutline ? '상위 40% (A등급 대상)' : '하위 60%'}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="totalScore" name="총점">
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CLASS_COLORS[entry.classCode]}
                      opacity={entry.aboveCutline ? 1 : 0.5}
                    />
                  ))}
                </Bar>
                {/* 40% 컷라인 수평 ReferenceLine */}
                <ReferenceLine
                  y={cutlineScore}
                  stroke="hsl(0, 72%, 51%)"
                  strokeDasharray="5 5"
                  label={{
                    value: `40% 컷라인 (${cutlineScore}점)`,
                    position: 'insideTopRight',
                    fill: 'hsl(0, 72%, 51%)',
                    fontSize: 12,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* 범례 */}
        <div className="flex gap-4 mt-2 justify-center text-sm">
          {(['A', 'B', 'C'] as const).map(cls => (
            <div key={cls} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: CLASS_COLORS[cls] }} />
              <span>{cls}반</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 4: 반별 비교 차트 Client Component (COMP-01)

**What:** A/B/C반의 평균·최고점·최저점·표준편차를 Recharts `BarChart` grouped로 나란히 표시.

**When to use:** 반별 지표를 동일 차트에서 나란히 비교할 때.

**Example:**
```typescript
"use client";

// components/dashboard/class-comparison-chart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 반별 비교 데이터 포인트 — 지표(평균, 최고, 최저)를 반별로 비교
export interface ClassComparisonData {
  metric: string;  // "평균", "최고점", "최저점"
  A: number;
  B: number;
  C: number;
}

const CLASS_COLORS = {
  A: 'hsl(220, 70%, 50%)',
  B: 'hsl(160, 60%, 45%)',
  C: 'hsl(30, 80%, 55%)',
};

interface ClassComparisonChartProps {
  data: ClassComparisonData[];
}

export function ClassComparisonChart({ data }: ClassComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>반별 성적 비교</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="metric" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value, name) => [`${value}점`, `${name}반`]} />
            <Legend formatter={(value) => `${value}반`} />
            <Bar dataKey="A" name="A" fill={CLASS_COLORS.A} />
            <Bar dataKey="B" name="B" fill={CLASS_COLORS.B} />
            <Bar dataKey="C" name="C" fill={CLASS_COLORS.C} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Pattern 5: 반별 비교 데이터 집계 유틸 (COMP-01)

**What:** `StudentGrade[]`에서 반별 평균/최고/최저/표준편차를 계산하여 `ClassComparisonData[]`로 변환.

**When to use:** Server Component에서 계산하여 Client Component에 props로 전달.

**Example:**
```typescript
// lib/grade-rank.ts 또는 lib/grade-comparison.ts (신규 함수 추가)
import type { StudentGrade, ClassCode } from '@/types/grades';
import type { ClassComparisonData } from '@/components/dashboard/class-comparison-chart';

/**
 * 반별 성적 비교 데이터를 생성한다.
 * - 평균, 최고점, 최저점을 반별로 계산
 *
 * @param students - 전체 학생 배열
 * @returns ClassComparisonData[] — Recharts BarChart에 직접 사용 가능
 */
export function buildClassComparisonData(students: StudentGrade[]): ClassComparisonData[] {
  const classCodes: ClassCode[] = ['A', 'B', 'C'];

  // 반별 통계 계산 헬퍼
  function classStats(cls: ClassCode) {
    const scores = students
      .filter(s => s.classCode === cls)
      .map(s => s.totalScore);
    if (scores.length === 0) return { avg: 0, max: 0, min: 0 };
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length * 10) / 10;
    const max = scores.reduce((m, v) => v > m ? v : m, scores[0]);
    const min = scores.reduce((m, v) => v < m ? v : m, scores[0]);
    return { avg, max, min };
  }

  const statsA = classStats('A');
  const statsB = classStats('B');
  const statsC = classStats('C');

  return [
    { metric: '평균', A: statsA.avg, B: statsB.avg, C: statsC.avg },
    { metric: '최고점', A: statsA.max, B: statsB.max, C: statsC.max },
    { metric: '최저점', A: statsA.min, B: statsB.min, C: statsC.min },
  ];
}
```

### Pattern 6: 핵심간호술 통계 집계 (COMP-02)

**What:** `nursingSkills` 필드를 `totalScore`와 완전히 분리하여 반별 평균/분포를 별도 섹션으로 표시.

**When to use:** `nursingSkills`는 총점에 포함되지 않으므로(기존 `totalScore = practiceTotal + attendance`) 별도 집계 필수.

**Example:**
```typescript
// lib/grade-rank.ts 또는 별도 lib/grade-nursing-skills.ts에 추가
import type { StudentGrade, ClassCode } from '@/types/grades';

/** 핵심간호술 반별 통계 */
export interface NursingSkillsStats {
  /** 반 코드 */
  classCode: ClassCode | 'all';
  /** 평균 점수 (소수점 1자리) */
  average: number;
  /** 최고점 */
  highest: number;
  /** 최저점 */
  lowest: number;
  /** 학생 수 */
  count: number;
}

/**
 * 핵심간호술 반별·전체 통계를 계산한다.
 * - totalScore와 독립적으로 nursingSkills만 집계
 *
 * @param students - 전체 학생 배열
 * @returns 반별(A/B/C) + 전체 NursingSkillsStats 배열
 */
export function computeNursingSkillsStats(students: StudentGrade[]): NursingSkillsStats[] {
  const groups: { code: ClassCode | 'all'; label: string }[] = [
    { code: 'A', label: 'A반' },
    { code: 'B', label: 'B반' },
    { code: 'C', label: 'C반' },
    { code: 'all', label: '전체' },
  ];

  return groups.map(({ code }) => {
    const filtered = code === 'all'
      ? students
      : students.filter(s => s.classCode === code);

    const scores = filtered.map(s => s.nursingSkills);
    if (scores.length === 0) {
      return { classCode: code, average: 0, highest: 0, lowest: 0, count: 0 };
    }

    const average = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length * 10) / 10;
    const highest = scores.reduce((m, v) => v > m ? v : m, scores[0]);
    const lowest = scores.reduce((m, v) => v < m ? v : m, scores[0]);

    return { classCode: code, average, highest, lowest, count: scores.length };
  });
}
```

### Pattern 7: Students 페이지 Server Component

**What:** `/students` 라우트 — 서버에서 데이터를 페칭·계산하고 Client Component에 props 전달.

**Example:**
```typescript
// app/(dashboard)/students/page.tsx (Server Component)
import { getGradeData } from '@/lib/grade-data';
import { buildRankData, computeOverallCutline } from '@/lib/grade-rank';
import { StudentTable } from '@/components/dashboard/student-table';
import { StudentRankChart } from '@/components/dashboard/student-rank-chart';
import { MockDataBanner } from '@/components/dashboard/mock-data-banner';

export default async function StudentsPage() {
  const { students, dataSource } = await getGradeData();
  const rankData = buildRankData(students);
  const cutlineScore = computeOverallCutline(students);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">학생 성적 조회</h1>
      <MockDataBanner dataSource={dataSource} />
      {/* STUD-01: 검색·필터 테이블 */}
      <StudentTable students={students} />
      {/* STUD-02: 순위 차트 */}
      <StudentRankChart data={rankData} cutlineScore={cutlineScore} />
    </div>
  );
}
```

### Pattern 8: Class Comparison 페이지 Server Component

**What:** `/class-comparison` 라우트 — 반별 비교 차트와 핵심간호술 별도 섹션 제공.

**Example:**
```typescript
// app/(dashboard)/class-comparison/page.tsx (Server Component)
import { getGradeData } from '@/lib/grade-data';
import { buildClassComparisonData, computeNursingSkillsStats } from '@/lib/grade-rank';
import { ClassComparisonChart } from '@/components/dashboard/class-comparison-chart';
import { NursingSkillsStats } from '@/components/dashboard/nursing-skills-stats';
import { MockDataBanner } from '@/components/dashboard/mock-data-banner';

export default async function ClassComparisonPage() {
  const { students, dataSource } = await getGradeData();
  const comparisonData = buildClassComparisonData(students);
  const nursingStats = computeNursingSkillsStats(students);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">반별 비교</h1>
      <MockDataBanner dataSource={dataSource} />
      {/* COMP-01: 반별 비교 차트 */}
      <ClassComparisonChart data={comparisonData} />
      {/* COMP-02: 핵심간호술 별도 섹션 */}
      <NursingSkillsStats stats={nursingStats} />
    </div>
  );
}
```

### Pattern 9: 사이드바에 새 라우트 링크 추가

**What:** `components/layout/sidebar.tsx`의 `navItems` 배열에 `/students`와 `/class-comparison` 링크 추가.

**When to use:** 새 페이지 라우트를 추가할 때마다.

**Example:**
```typescript
// components/layout/sidebar.tsx의 navItems 배열 수정
import {
  LayoutDashboard,
  GraduationCap,
  Users,          // 학생 조회용
  BarChart2,      // 반별 비교용
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: '대시보드', href: '/dashboard' },
  { icon: GraduationCap, label: '학습성과', href: '/learning-outcomes' },
  { icon: Users, label: '학생 조회', href: '/students' },          // 신규
  { icon: BarChart2, label: '반별 비교', href: '/class-comparison' }, // 신규
];
```

### Anti-Patterns to Avoid

- **Client Component에서 `getGradeData()` 직접 호출:** googleapis 의존성으로 서버 전용. Server Component에서만 호출하고 `students` 배열을 props로 전달.
- **126개 학생 모두를 `useState` 초기값에 배열로 복사:** 페이지 로드 시 Server Component에서 데이터를 계산하고 `students`를 props로 내려보내면 됨. Client에서 전체 재페칭 불필요.
- **`useMemo` 없이 검색 필터링:** 검색 쿼리나 필터가 변경될 때마다 126명을 전체 재필터링하면 성능 저하. `useMemo([students, classFilter, searchQuery])`로 최적화.
- **순위 차트에서 126개 이름을 X축에 표시:** XAxis tick이 겹쳐 판독 불가. X축은 순위 번호, 이름은 툴팁 커스텀 content로 표시.
- **핵심간호술을 `totalScore`에 포함하여 집계:** `nursingSkills`는 총점 별도 평가 — `totalScore = practiceTotal + attendance`이며 `nursingSkills`는 제외됨. `computeNursingSkillsStats()`는 `nursingSkills` 필드만 집계.
- **`ClassComparisonData` 타입을 컴포넌트 파일 내 정의:** props 타입은 `lib/` 유틸 파일에서 export하고, 컴포넌트는 import. 순환 import 방지.
- **Recharts SVG fill에 CSS 변수 사용:** Phase 2에서 확인된 패턴 — Recharts SVG props에서 `var(--chart-1)` 작동 안 함. `hsl(...)` 직접 값 사용.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 검색 입력 UI | 커스텀 검색 컴포넌트 | 네이티브 `<input>` + Tailwind | 126명 클라이언트 필터링, shadcn Input 불필요 |
| 정렬 기능 | 커스텀 정렬 알고리즘 | `Array.sort()` | JS 내장 sort로 충분, 라이브러리 불필요 |
| 순위 계산 | 외부 통계 라이브러리 | 순수 TypeScript (`sort` + `index + 1`) | 순위 = 내림차순 정렬 후 인덱스 번호 |
| 컷라인 계산 | 새 로직 구현 | `Math.ceil(n * 0.4) - 1` (Phase 2 검증) | `computeGradeKpi()` 내 기존 패턴 동일 |
| 반별 평균 | 새 집계 함수 | `computeGradeKpi().classAverages` | 이미 `GradeKpiData.classAverages`에 존재 |
| 가상화/페이지네이션 | react-window, tanstack-table | 단순 `Array.filter()` | 126명은 DOM 성능 문제 없음. 가상화 과도 설계 |
| 반별 비교 레이더 차트 | Recharts RadarChart 별도 설치 | Recharts `BarChart` grouped | Recharts 이미 RadarChart 포함. 단, BarChart가 평균 수치 비교에 더 직관적 |

**Key insight:** Phase 4의 계산 복잡도는 낮다. 데이터는 이미 `getGradeData()`에서 완성되어 있으며, 새로 필요한 계산은 (1) 순위 정렬, (2) 반별 비교 지표 계산, (3) 핵심간호술 집계 — 세 가지뿐이다. 모두 순수 TypeScript 배열 연산으로 구현 가능하며 라이브러리 추가 불필요.

---

## Common Pitfalls

### Pitfall 1: 126개 학생 순위 차트 X축 가독성

**What goes wrong:** `XAxis dataKey="name"`으로 설정하면 126개 이름이 서로 겹쳐 판독 불가.

**Why it happens:** Recharts X축은 모든 tick을 렌더링하므로, 데이터 포인트가 많으면 tick 레이블이 겹침.

**How to avoid:** X축을 순위 번호(`rank`)로 설정하고, `interval` prop으로 tick 간격 조정 (`interval={9}` → 10개 단위). 학생 이름은 커스텀 Tooltip `content`에서만 표시.

**Warning signs:** X축 텍스트가 45도 기울어지거나 겹치는 경우.

### Pitfall 2: 익명화된 이름 검색 (`includes()` 패턴 검증)

**What goes wrong:** 익명화된 이름(`김*우`)에서 `*`이 정규식 특수문자로 해석될 수 있음.

**Why it happens:** `string.includes()` 사용 시 `*`는 특수문자가 아니므로 문제없음. 단, 사용자가 정규식 문자를 입력하면 `RegExp()` 생성 시 에러 발생 가능.

**How to avoid:** `string.includes()` 사용 (정규식 아님). 정규식 사용 시 `escapeRegExp()` 헬퍼 필요. 현재 설계에서는 `includes()` 방식이 안전.

**Warning signs:** 검색 쿼리에 `.`, `*`, `+`, `?` 입력 시 에러 발생.

### Pitfall 3: 컷라인 차트에서 수평 vs 수직 ReferenceLine

**What goes wrong:** 순위 차트(X축=순위, Y축=점수)에서 컷라인을 `x` prop ReferenceLine으로 지정하면 잘못된 위치에 표시됨.

**Why it happens:** Phase 2 히스토그램은 `x` prop(점수 구간)으로 컷라인을 표시했지만, 순위 차트는 Y축이 점수이므로 `y` prop(점수 값)으로 수평선 표시가 필요.

**How to avoid:** 순위 차트에서는 `<ReferenceLine y={cutlineScore} ... />` 사용. `x` 대신 `y` prop.

**Warning signs:** ReferenceLine이 차트 외부나 예상치 못한 위치에 표시됨.

### Pitfall 4: props 직렬화 — 함수나 Map 포함 금지

**What goes wrong:** Server Component에서 Client Component로 함수나 Map을 props로 전달하면 빌드 에러 발생.

**Why it happens:** Next.js Server-Client 경계에서 props는 JSON 직렬화 가능한 값만 허용.

**How to avoid:** `RankDataPoint[]`, `ClassComparisonData[]`, `NursingSkillsStats[]`는 모두 plain object 배열로 유지. 함수 props 금지.

### Pitfall 5: `buildRankData()`에서 원본 배열 변경

**What goes wrong:** `students.sort(...)` 직접 호출하면 Server Component에서 한 번 계산된 `students` 배열이 변경되어 이후 계산(히스토그램 등)에 영향.

**Why it happens:** JavaScript `Array.sort()`는 원본 배열을 직접 수정(in-place).

**How to avoid:** `const sorted = [...students].sort(...)` — 스프레드로 복사 후 정렬.

**Warning signs:** 정렬 후 다른 계산 결과가 예상과 다른 순서로 나오는 경우.

### Pitfall 6: 핵심간호술 반별 평균과 총점 반별 평균 혼동

**What goes wrong:** `classAverages`(총점 기준)와 핵심간호술 평균을 같은 차트에 표시하거나, UI에서 구분 없이 "반별 평균"으로 레이블링.

**Why it happens:** 두 지표가 모두 반별 평균이지만, 한쪽은 100점 만점 총점, 다른 쪽은 100점 만점 핵심간호술로 단위가 같아 혼동 유발.

**How to avoid:** UI에서 명확히 구분. 핵심간호술 섹션 헤더를 "핵심간호술 (별도 평가, 총점 미포함)"으로 표시. 총점 차트와 별도 카드/섹션으로 분리.

### Pitfall 7: 학생 테이블에서 `key` prop으로 이름 사용

**What goes wrong:** 익명화된 이름이 동명이인이면 `key={student.name}`이 중복되어 React 경고 발생.

**Why it happens:** `김*수` 형태의 익명화로 동명이인이 동일한 key를 가질 수 있음.

**How to avoid:** `key={student.studentId}` 사용 (학번은 익명화되었어도 고유값 유지).

---

## Code Examples

Verified patterns from existing codebase:

### 기존 컷라인 계산 패턴 (lib/grade-kpi.ts에서 확인)
```typescript
// Source: lib/grade-kpi.ts (Phase 2 완성 — 동일 패턴 재사용)
const sorted = students
  .filter(s => s.classCode === cls)
  .map(s => s.totalScore)
  .sort((a, b) => b - a); // 내림차순

const cutIndex = Math.ceil(sorted.length * 0.4) - 1;
const cutlineScore = sorted[cutIndex];
// → 상위 40% 하한선 점수
```

### 기존 반별 색상 상수 패턴 (grade-histogram-chart.tsx에서 확인)
```typescript
// Source: components/dashboard/grade-histogram-chart.tsx (Phase 2 완성)
// Recharts SVG에서 CSS 변수 불가 → hsl 직접 값 사용
const CLASS_COLORS = {
  A: 'hsl(220, 70%, 50%)', // chart-1 근사값 (파랑)
  B: 'hsl(160, 60%, 45%)', // chart-2 근사값 (초록)
  C: 'hsl(30, 80%, 55%)',  // chart-3 근사값 (주황)
};
```

### 기존 ReferenceLine 패턴 (grade-histogram-chart.tsx에서 확인)
```typescript
// Source: components/dashboard/grade-histogram-chart.tsx (Phase 2 완성)
// 순위 차트에서는 x → y prop으로 변경 필요
<ReferenceLine
  x={cutlineRange}  // 히스토그램: x축 레이블 기준 수직선
  stroke="hsl(0, 72%, 51%)"
  strokeDasharray="5 5"
  label={{
    value: `A 이상 40% 컷라인 (${medianCutline}점대)`,
    position: 'top',
    fill: 'hsl(0, 72%, 51%)',
    fontSize: 12,
  }}
/>

// 순위 차트에서는:
<ReferenceLine
  y={cutlineScore}  // Y축 값 기준 수평선
  stroke="hsl(0, 72%, 51%)"
  strokeDasharray="5 5"
  label={{ value: `40% 컷라인 (${cutlineScore}점)`, position: 'insideTopRight', fill: 'hsl(0, 72%, 51%)', fontSize: 12 }}
/>
```

### 기존 shadcn Table 사용 패턴 (components/ui/table.tsx 설치됨)
```typescript
// Source: components/ui/table.tsx 설치 확인됨
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';

// 학생 테이블에 바로 사용 가능
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>이름</TableHead>
      <TableHead>총점</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {students.map(s => (
      <TableRow key={s.studentId}>
        <TableCell>{s.name}</TableCell>
        <TableCell>{s.totalScore}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 기존 Recharts Cell 패턴 (데이터 포인트별 색상 지정)
```typescript
// Recharts Bar 내부에 Cell로 개별 색상 지정 패턴
import { Bar, Cell } from 'recharts';

<Bar dataKey="totalScore">
  {data.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={CLASS_COLORS[entry.classCode]}
      opacity={entry.aboveCutline ? 1 : 0.5}
    />
  ))}
</Bar>
```

### 기존 Tooltip contentStyle CSS 변수 패턴 (HTML 영역에서는 CSS 변수 가능)
```typescript
// Source: grade-histogram-chart.tsx — HTML 렌더링 영역(Tooltip contentStyle)에서는 CSS 변수 작동
<Tooltip
  contentStyle={{
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
  }}
/>
```

### useMemo 검색 필터링 패턴
```typescript
// React useMemo로 검색·필터 최적화
import { useMemo } from 'react';

const filteredStudents = useMemo(() => {
  let result = students;
  if (classFilter !== 'all') {
    result = result.filter(s => s.classCode === classFilter);
  }
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    result = result.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query)
    );
  }
  return result;
}, [students, classFilter, searchQuery]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 데이터 레이어만 존재 | 전체 학생 조회 + 검색 UI | Phase 4 신규 | 교수의 개별 학생 추적 가능 |
| 히스토그램 구간 분포만 | 개인별 순위 차트 | Phase 4 신규 | 40% 컷라인 경계에서 경쟁 위치 파악 |
| 반별 평균 KPI 카드(텍스트) | 반별 비교 차트(시각화) | Phase 4 신규 | 반간 성적 격차를 시각적으로 비교 |
| `nursingSkills` 필드만 존재 | 핵심간호술 별도 집계·표시 | Phase 4 신규 | 총점과 독립된 핵심간호술 추적 |

**기존 패턴 재사용:**
- `computeGradeKpi().cutlines` — 이미 반별 컷라인 계산 완성. 전체 컷라인만 추가 계산 필요.
- `computeGradeKpi().classAverages` — 반별 평균 이미 존재. `buildClassComparisonData()`에서 재활용 또는 직접 재계산.
- `buildHistogramData()` — 반별 분포 이미 존재. COMP-01 분포 비교에 재활용 가능.
- `CLASS_COLORS` 상수 — Phase 2 히스토그램과 동일한 색상 체계 유지 (일관성).

---

## Open Questions

1. **순위 차트 표시 방식: 개인별 바 vs. 집약 표시**
   - What we know: 126명 개인별 바는 X축이 밀집됨. `interval` prop으로 일부 해결 가능.
   - What's unclear: 교수가 개인 이름을 차트에서 직접 보기를 원하는지, 순위 번호 + 툴팁으로 충분한지.
   - Recommendation: 순위 번호 X축 + 반별 색상 바 + 커스텀 툴팁(이름+반+점수)으로 구현. 126명 전체를 가로 스크롤 차트로 표시하는 것이 가장 직관적.

2. **반별 비교에서 분포 비교 방식**
   - What we know: COMP-01은 "평균·분포를 나란히 비교"를 요구. 평균은 BarChart grouped로 충분. "분포"는 히스토그램 재활용 또는 boxplot이 필요.
   - What's unclear: Recharts에는 boxplot이 내장되지 않음. `ComposedChart`로 커스텀 구현 가능하지만 복잡.
   - Recommendation: 분포 비교는 Phase 2 히스토그램(`buildHistogramData()` 결과)을 반별 섹션으로 나란히 표시하거나, 평균·최고점·최저점 BarChart grouped로 간소화. 복잡한 boxplot은 v2로 연기.

3. **`/students`와 `/class-comparison` 분리 vs. 단일 페이지 탭**
   - What we know: Phase 3처럼 별도 라우트가 URL 북마크 가능하고 사이드바 탐색에 적합.
   - What's unclear: 사이드바 항목이 4개(대시보드, 학습성과, 학생 조회, 반별 비교)로 늘어나는 것이 UX상 적절한지.
   - Recommendation: 별도 라우트 2개로 구현. 사이드바 4개 항목은 허용 범위 내.

4. **핵심간호술 표시 형식: KPI 카드 vs. 별도 차트**
   - What we know: COMP-02는 "총점과 분리되어 별도로 추적·표시"를 요구. 구체적 형식 미지정.
   - What's unclear: 반별 KPI 카드 4개(A반/B반/C반/전체 평균)로 충분한지, 차트 시각화도 필요한지.
   - Recommendation: 반별 KPI 카드 + 핵심간호술 분포 히스토그램(선택적) 구현. 핵심 표시는 카드로 충분, 히스토그램은 여유 있으면 추가.

---

## Phase 4 구현 계획 제안 (플랜 분리 기준)

Phase 4를 2개 플랜으로 나누는 것을 권장:

**Plan 04-01:** 학생 검색 + 순위 차트 (STUD-01, STUD-02)
- `lib/grade-rank.ts` — `buildRankData()`, `computeOverallCutline()` 유틸
- `components/dashboard/student-table.tsx` — Client Component (검색·필터·테이블)
- `components/dashboard/student-rank-chart.tsx` — Client Component (순위 BarChart + ReferenceLine)
- `app/(dashboard)/students/page.tsx` — Server Component 라우트
- `components/layout/sidebar.tsx` — '학생 조회' 링크 추가

**Plan 04-02:** 반별 비교 차트 + 핵심간호술 (COMP-01, COMP-02)
- `lib/grade-rank.ts` (또는 `lib/grade-comparison.ts`) — `buildClassComparisonData()`, `computeNursingSkillsStats()` 추가
- `components/dashboard/class-comparison-chart.tsx` — Client Component (반별 비교 BarChart)
- `components/dashboard/nursing-skills-stats.tsx` — Server 또는 Client Component (핵심간호술 KPI + 히스토그램)
- `app/(dashboard)/class-comparison/page.tsx` — Server Component 라우트
- `components/layout/sidebar.tsx` — '반별 비교' 링크 추가

---

## Sources

### Primary (HIGH confidence)

- 프로젝트 코드베이스 직접 검토:
  - `types/grades.ts` — `StudentGrade` 타입 전체 필드 확인 (`nursingSkills` 포함, 201줄)
  - `lib/grade-kpi.ts` — `computeGradeKpi()` 컷라인 계산 패턴 (`Math.ceil(n * 0.4) - 1`) 확인
  - `lib/grade-histogram.ts` — `buildHistogramData()`, `SCORE_RANGES` 패턴 확인
  - `lib/grade-data.ts` — `getGradeData()` 인터페이스 확인
  - `lib/grade-parser.ts` — `PO_THRESHOLDS`, `anonymizeName()`, `anonymizeStudentId()` 확인
  - `lib/mock-grade-data.ts` — 126명 데이터 구조, `nursingSkills` 범위 (100점 만점) 확인
  - `components/dashboard/grade-histogram-chart.tsx` — Recharts `BarChart`, `ReferenceLine`, `CLASS_COLORS`, CSS 변수 불가 패턴 확인
  - `components/dashboard/po-low-grade-panel.tsx` — Client Component 필터·버튼 패턴 확인
  - `components/ui/table.tsx` — shadcn Table 컴포넌트 설치 확인
  - `components/layout/sidebar.tsx` — `navItems` 배열 구조, 링크 추가 방법 확인
  - `app/(dashboard)/layout.tsx` — 대시보드 레이아웃 구조 확인
  - `app/(dashboard)/students/` — 디렉토리 미존재 (신규 생성 필요) 확인
  - `package.json` — recharts ^3.7.0, lucide-react ^0.563.0, shadcn ^3.8.4 설치 확인
  - `.planning/REQUIREMENTS.md` — STUD-01, STUD-02, COMP-01, COMP-02 요구사항 원문
  - `.planning/STATE.md` — Phase 2-3 결정사항 (컷라인 계산 패턴, Recharts 색상 패턴)
  - `.planning/phases/03-learning-outcomes/03-RESEARCH.md` — Phase 3 아키텍처 패턴 재확인

### Secondary (MEDIUM confidence)

- 없음 — 모든 핵심 결정이 기존 코드베이스에서 직접 확인됨

### Tertiary (LOW confidence)

- 없음 — 모든 핵심 결정이 기존 코드베이스에서 직접 확인됨

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — `package.json`에서 직접 확인, 모든 라이브러리 이미 설치됨
- Architecture: HIGH — Phase 1-3 Server/Client 분리 패턴이 기존 코드로 검증됨
- 순위 계산 유틸: HIGH — `computeGradeKpi()` 내 컷라인 계산 패턴 직접 확인 후 재활용
- 반별 비교 집계: HIGH — 기존 `classAverages`, `buildHistogramData()` 패턴으로 확장 가능
- 핵심간호술 집계: HIGH — `StudentGrade.nursingSkills` 필드 확인 (100점 만점, 총점 미포함 명시)
- 검색·필터 UI: HIGH — Phase 3 PoLowGradePanel 반 필터 버튼 패턴 동일. `useMemo` 최적화 추가.
- Recharts 순위 차트: MEDIUM — Phase 2 히스토그램과 유사하지만 `Cell`로 개별 색상 지정 + 수평 ReferenceLine은 신규 패턴 (코드베이스 미확인, 단 Recharts 3 공식 API)
- Pitfalls: HIGH — 컷라인 계산, 배열 복사, CSS 변수 제한은 Phase 1-3에서 이미 식별됨

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (안정적 스택, 30일)
