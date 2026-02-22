# Phase 3: Learning Outcomes - Research

**Researched:** 2026-02-23
**Domain:** 학습성과(PO) 달성도 집계 + 드릴다운 UI — Next.js Server/Client 컴포넌트 + Recharts + shadcn/ui
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LO-01 | 교수가 학습성과별(LO2·LO5·LO3) 상/중/하 인원 분포를 반별 + 전체 기준으로 확인할 수 있다 | `getPoGrade()`로 각 학생의 등급 판정 → `computePoDistribution()` 유틸에서 반별·전체 집계. 결과를 Server Component에서 계산 후 props 전달 |
| LO-02 | 각 학습성과에 달성률 %와 '달성'/'미달성' 배지가 표시된다 (중 이상 80% 이상이면 달성) | `isAchieved()` 기존 함수 그대로 사용. 달성률 = achievedCount / total * 100. shadcn/ui Badge 컴포넌트(설치 여부 확인 필요) 또는 Tailwind span 배지 |
| LO-03 | 하 등급 학생 목록을 익명 처리된 상태로 조회할 수 있다 | `getPoGrade() === '하'` 필터. 이름/학번은 이미 데이터 레이어에서 익명화됨. React 상태로 선택된 PO 관리 → Client Component 필요 |
| LO-04 | 하 등급 학생 선택 시 사전학습·보고서·실습교수·현장지도자·해당 학습성과 세부점수 표시 | `StudentGrade` 타입에 `preLearning`, `reportTotal`, `profTotal`, `fieldTotal`, `po2/po5/po3` 모두 존재. 선택된 학생 상태 관리 → Client Component 내 useState |
</phase_requirements>

---

## Summary

Phase 3는 기존 데이터 레이어(`getGradeData`, `getPoGrade`, `isAchieved`, `PO_THRESHOLDS`)를 최대한 재활용하여 교수가 학습성과별 달성 현황을 반별·전체로 조회하고, 하 등급 학생을 드릴다운할 수 있는 UI를 구축하는 단계다.

핵심 구현은 세 레이어다. (1) **집계 유틸(lib/)**: `computePoDistribution(students, poKey)` 함수가 반별·전체 상/중/하 인원수와 비율을 계산한다. (2) **표시 컴포넌트(Server)**: `PoAchievementTable` — 3개 학습성과 × 4개 열(A반/B반/C반/전체)의 상/중/하 분포표와 달성/미달성 배지를 Server Component로 렌더링. (3) **드릴다운 컴포넌트(Client)**: `PoLowGradePanel` — 사용자가 학습성과를 클릭하면 해당 PO의 하 등급 학생 목록과 선택된 학생의 세부 점수를 표시. 클릭/선택 상태가 필요하므로 Client Component.

새 라이브러리 설치는 불필요하다. Recharts(선택적 — PoGrade 분포 바 차트를 원할 경우), shadcn/ui Card/Table(이미 설치), Tailwind CSS v4로 전부 구현 가능하다. `Badge` 컴포넌트가 shadcn에 설치되지 않았으므로 Tailwind `span`으로 직접 구현한다.

**Primary recommendation:** `app/(dashboard)/learning-outcomes/page.tsx` (Server Component)를 새로 추가하고, 집계 유틸을 `lib/grade-po.ts`에, 분포표는 Server Component로, 드릴다운 패널은 `"use client"` Client Component로 구현한다.

---

## Standard Stack

### Core (이미 설치됨 — 추가 설치 불필요)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | Server/Client Component 분리, 새 라우트(`/learning-outcomes`) 추가 | 프로젝트 기반 |
| react | 19.2.3 | Client Component `useState`로 선택된 PO·학생 상태 관리 | 프로젝트 기반 |
| shadcn/ui (Card, Table) | - | 분포표 래퍼 Card, 학생 목록 Table | 프로젝트 표준 UI, 이미 설치됨 |
| tailwindcss | ^4 | 배지, 색상 강조, 그리드 레이아웃 | 프로젝트 CSS 시스템 |
| lucide-react | ^0.563.0 | 달성/미달성 아이콘(CheckCircle2, XCircle), 드릴다운 ChevronRight | 프로젝트 표준 아이콘 |
| recharts | ^3.7.0 | (선택적) PO 분포 StackedBarChart — 없어도 테이블로만 구현 가능 | 프로젝트 기존 사용 |

### Supporting (기존 코드 — 재사용)

| 모듈 | 위치 | 재사용 방식 |
|------|------|------------|
| `getGradeData()` | `lib/grade-data.ts` | Server Component에서 학생 데이터 페칭 |
| `getPoGrade(score, threshold)` | `lib/grade-parser.ts` | 개별 학생 PO 등급 판정 |
| `isAchieved(students, poKey)` | `lib/grade-parser.ts` | 반별·전체 달성 여부 판정 |
| `PO_THRESHOLDS` | `lib/grade-parser.ts` | po2/po5/po3 임계값 상수 |
| `StudentGrade` 타입 | `types/grades.ts` | 하 등급 학생 상세 점수 접근 |
| `MockDataBanner` | `components/dashboard/mock-data-banner.tsx` | mock 폴백 경고 (이미 완성) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 테이블 분포표 | Recharts StackedBarChart | 테이블이 숫자 정밀도와 가독성에 유리. 차트는 추가적 시각화로 Phase 3.5/v2에서 고려 |
| shadcn Badge | Tailwind span 배지 | Badge 컴포넌트 설치 확인 필요 — 없으면 span + className으로 동일 효과 |
| 별도 `/learning-outcomes` 라우트 | dashboard/page.tsx 탭 추가 | 별도 라우트가 URL 북마크 가능하고 사이드바 탐색에 자연스러움 |
| useState 드릴다운 | URL 쿼리 파라미터 | 인트라 페이지 드릴다운이므로 useState가 더 단순. URL 공유 불필요 |

**Installation:** 추가 설치 없음. 기존 스택으로 구현 가능.

---

## Architecture Patterns

### Recommended Project Structure

```
app/
└── (dashboard)/
    ├── dashboard/
    │   └── page.tsx              ← 기존 (Phase 2 완성)
    └── learning-outcomes/
        └── page.tsx              ← 신규 Server Component: 데이터 페칭 + 집계

components/
└── dashboard/
    ├── po-achievement-table.tsx  ← 신규 Server Component: 분포표 + 배지
    └── po-low-grade-panel.tsx    ← 신규 "use client" Client Component: 드릴다운

lib/
└── grade-po.ts                   ← 신규: computePoDistribution() 집계 유틸

types/
└── grades.ts                     ← PoDistribution 타입 추가 (기존 파일 확장)
```

### Pattern 1: PO 분포 집계 유틸 (Server-side 순수 TypeScript)

**What:** `StudentGrade[]`에서 특정 poKey의 반별·전체 상/중/하 인원과 달성률을 계산하는 순수 함수.

**When to use:** Server Component에서 props로 전달할 직렬화 가능한 데이터 생성.

**Example:**
```typescript
// lib/grade-po.ts (신규 파일)
import type { StudentGrade, ClassCode, PoGrade } from '@/types/grades';
import { getPoGrade, isAchieved, PO_THRESHOLDS } from './grade-parser';

export type PoKey = 'po2' | 'po5' | 'po3';

/** 반(또는 전체) 기준 PO 상/중/하 분포 */
export interface PoGradeDistribution {
  /** 총 학생 수 */
  total: number;
  /** 상 등급 인원 */
  high: number;
  /** 중 등급 인원 */
  mid: number;
  /** 하 등급 인원 */
  low: number;
  /** 중 이상 비율 (0-100, 소수점 1자리) */
  achieveRate: number;
  /** 달성 여부 (achieveRate >= 80) */
  achieved: boolean;
}

/** 3개 LO 전체 집계 결과 */
export interface PoAchievementData {
  po2: Record<ClassCode | 'all', PoGradeDistribution>;
  po5: Record<ClassCode | 'all', PoGradeDistribution>;
  po3: Record<ClassCode | 'all', PoGradeDistribution>;
}

/** 단일 PO 단일 그룹의 분포를 계산한다 */
function computeDistribution(
  students: StudentGrade[],
  poKey: PoKey
): PoGradeDistribution {
  const threshold = PO_THRESHOLDS[poKey];
  const total = students.length;
  if (total === 0) {
    return { total: 0, high: 0, mid: 0, low: 0, achieveRate: 0, achieved: false };
  }

  let high = 0, mid = 0, low = 0;
  for (const s of students) {
    const grade = getPoGrade(s[poKey], threshold);
    if (grade === '상') high++;
    else if (grade === '중') mid++;
    else low++;
  }

  const achieveRate = Math.round(((high + mid) / total) * 1000) / 10; // 소수점 1자리
  const achieved = achieveRate >= 80;
  return { total, high, mid, low, achieveRate, achieved };
}

/** 3개 PO × (A반/B반/C반/전체) 집계를 계산한다 */
export function computePoAchievement(students: StudentGrade[]): PoAchievementData {
  const poKeys: PoKey[] = ['po2', 'po5', 'po3'];
  const classCodes: ClassCode[] = ['A', 'B', 'C'];

  const result = {} as PoAchievementData;
  for (const poKey of poKeys) {
    result[poKey] = {
      A: computeDistribution(students.filter(s => s.classCode === 'A'), poKey),
      B: computeDistribution(students.filter(s => s.classCode === 'B'), poKey),
      C: computeDistribution(students.filter(s => s.classCode === 'C'), poKey),
      all: computeDistribution(students, poKey),
    };
  }
  return result;
}
```

### Pattern 2: 하 등급 학생 목록 추출 유틸

**What:** 특정 PO의 하 등급 학생을 반 필터와 함께 추출하는 순수 함수.

**When to use:** Client Component에 초기 데이터를 Server에서 계산하여 props로 전달할 때.

**Example:**
```typescript
// lib/grade-po.ts 에 추가
/** 특정 PO에서 하 등급인 학생 목록을 반환한다 */
export function getLowGradeStudents(
  students: StudentGrade[],
  poKey: PoKey,
  classCode?: ClassCode // undefined이면 전체
): StudentGrade[] {
  const threshold = PO_THRESHOLDS[poKey];
  const filtered = classCode
    ? students.filter(s => s.classCode === classCode)
    : students;
  return filtered.filter(s => getPoGrade(s[poKey], threshold) === '하');
}
```

### Pattern 3: Learning Outcomes Server Component Page

**What:** `app/(dashboard)/learning-outcomes/page.tsx` — 데이터 페칭과 집계를 서버에서 수행하고 props로 내려보낸다.

**When to use:** 인증된 교수만 접근 가능한 서버 렌더 페이지. 데이터 페칭 = 서버, 상태 관리(클릭) = Client Component.

**Example:**
```typescript
// app/(dashboard)/learning-outcomes/page.tsx (Server Component)
import { getGradeData } from '@/lib/grade-data';
import { computePoAchievement } from '@/lib/grade-po';
import { PoAchievementTable } from '@/components/dashboard/po-achievement-table';
import { PoLowGradePanel } from '@/components/dashboard/po-low-grade-panel';
import { MockDataBanner } from '@/components/dashboard/mock-data-banner';

export default async function LearningOutcomesPage() {
  const { students, dataSource } = await getGradeData();
  const poData = computePoAchievement(students);

  // 하 등급 학생 데이터를 미리 계산하여 props로 전달 (서버에서 처리)
  const lowGradeStudents = {
    po2: students.filter(s => {
      // getPoGrade 호출은 lib에서 처리하므로 여기서는 직접 임계값 사용
      return s.po2 < 38.4; // PO_THRESHOLDS.po2.mid
    }),
    po5: students.filter(s => s.po5 < 4.8),
    po3: students.filter(s => s.po3 < 4.8),
  };

  return (
    <div className="space-y-6">
      <MockDataBanner dataSource={dataSource} />

      {/* 분포표 + 배지 — Server Component */}
      <PoAchievementTable poData={poData} />

      {/* 드릴다운 패널 — Client Component (선택 상태 관리) */}
      <PoLowGradePanel students={students} />
    </div>
  );
}
```

**더 나은 대안:** `getLowGradeStudents()`를 import하여 명시적으로 호출.

### Pattern 4: 분포표 Server Component

**What:** 3개 PO × 4개 열(A반/B반/C반/전체)의 상/중/하 분포를 테이블로 렌더링. 달성/미달성 배지 포함.

**When to use:** 인터랙션 없는 순수 데이터 표시 테이블.

**Example:**
```typescript
// components/dashboard/po-achievement-table.tsx (Server Component)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PoAchievementData } from '@/lib/grade-po';
import { CheckCircle2, XCircle } from 'lucide-react';

const PO_LABELS = {
  po2: '학습성과2 (대상자간호, 64점)',
  po5: '학습성과5 (안전과질, 8점)',
  po3: '학습성과3 (전문직, 8점)',
} as const;

interface PoAchievementTableProps {
  poData: PoAchievementData;
}

export function PoAchievementTable({ poData }: PoAchievementTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>학습성과 달성도</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">학습성과</th>
                {['A반', 'B반', 'C반', '전체'].map(col => (
                  <th key={col} className="text-center py-2 px-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['po2', 'po5', 'po3'] as const).map(poKey => {
                const row = poData[poKey];
                return (
                  <tr key={poKey} className="border-b">
                    <td className="py-3 pr-4 font-medium">{PO_LABELS[poKey]}</td>
                    {(['A', 'B', 'C', 'all'] as const).map(cls => {
                      const d = row[cls];
                      return (
                        <td key={cls} className="py-3 px-2 text-center">
                          {/* 상/중/하 인원 */}
                          <div className="text-xs text-muted-foreground">
                            상 {d.high} / 중 {d.mid} / 하 {d.low}
                          </div>
                          {/* 달성률 + 달성/미달성 배지 */}
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="font-semibold">{d.achieveRate}%</span>
                            {d.achieved ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 5: 드릴다운 Panel Client Component

**What:** PO 선택(탭 또는 버튼) + 하 등급 학생 목록 + 학생 선택 시 세부점수. 클릭 상태 관리로 `"use client"` 필수.

**When to use:** 사용자 인터랙션(PO 선택, 학생 선택)이 있는 모든 컴포넌트.

**Example:**
```typescript
"use client";

// components/dashboard/po-low-grade-panel.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentGrade } from '@/types/grades';
import type { PoKey } from '@/lib/grade-po';
import { getLowGradeStudents } from '@/lib/grade-po';

interface PoLowGradePanelProps {
  students: StudentGrade[];  // 전체 학생 배열 (서버에서 props로 전달)
}

const PO_TABS: { key: PoKey; label: string }[] = [
  { key: 'po2', label: 'LO2 대상자간호' },
  { key: 'po5', label: 'LO5 안전과질' },
  { key: 'po3', label: 'LO3 전문직' },
];

export function PoLowGradePanel({ students }: PoLowGradePanelProps) {
  const [selectedPo, setSelectedPo] = useState<PoKey>('po2');
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);

  const lowGradeStudents = getLowGradeStudents(students, selectedPo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>하 등급 학생 드릴다운</CardTitle>
      </CardHeader>
      <CardContent>
        {/* PO 탭 선택 */}
        <div className="flex gap-2 mb-4">
          {PO_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setSelectedPo(tab.key); setSelectedStudent(null); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${selectedPo === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 하 등급 학생 목록 */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              하 등급 학생 {lowGradeStudents.length}명
            </p>
            <div className="space-y-1">
              {lowGradeStudents.map(s => (
                <button
                  key={s.studentId}
                  onClick={() => setSelectedStudent(s)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${selectedStudent?.studentId === s.studentId
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                    }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground ml-2">{s.classCode}반</span>
                  <span className="text-muted-foreground ml-2">{s[selectedPo]}점</span>
                </button>
              ))}
              {lowGradeStudents.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  하 등급 학생 없음
                </p>
              )}
            </div>
          </div>

          {/* 선택된 학생 세부점수 */}
          {selectedStudent && (
            <div className="border rounded-lg p-4">
              <p className="font-medium mb-3">{selectedStudent.name} 세부점수</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">사전학습</dt>
                  <dd>{selectedStudent.preLearning}점 / 10점</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">보고서</dt>
                  <dd>{selectedStudent.reportTotal}점 / 30점</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">실습지도교수</dt>
                  <dd>{selectedStudent.profTotal}점 / 20점</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">현장지도자</dt>
                  <dd>{selectedStudent.fieldTotal}점 / 20점</dd>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <dt>
                    {selectedPo === 'po2' ? 'LO2 대상자간호' :
                     selectedPo === 'po5' ? 'LO5 안전과질' : 'LO3 전문직'} 점수
                  </dt>
                  <dd className="text-red-500">
                    {selectedStudent[selectedPo]}점
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 6: 사이드바에 새 라우트 링크 추가

**What:** 기존 사이드바 컴포넌트에 `/learning-outcomes` 링크를 추가한다.

**When to use:** 새 페이지 라우트를 추가할 때마다.

**Example:**
```typescript
// 사이드바 navigation 배열에 추가 (기존 사이드바 파일 위치 확인 필요)
{ label: '학습성과', href: '/learning-outcomes', icon: GraduationCap }
```

### Anti-Patterns to Avoid

- **드릴다운 상태를 Server Component에서 관리:** `selectedPo`, `selectedStudent`는 클릭 상태이므로 반드시 Client Component에서 `useState`로 관리. Server Component에서는 불가.
- **getLowGradeStudents를 Client Component 내부에서 import:** `lib/grade-po.ts`가 서버 전용 모듈이 아니므로(googleapis 의존성 없음) Client에서 import 가능. 단, `getGradeData()`를 Client에서 호출하는 것은 금지.
- **isAchieved()를 분포표 렌더링마다 호출:** 집계는 Server Component에서 한 번만 계산하고 결과를 props로 전달. UI 컴포넌트는 계산 결과만 표시.
- **PoGradeDistribution 타입을 컴포넌트 파일 내 정의:** `types/grades.ts` 또는 `lib/grade-po.ts`에 중앙화. 컴포넌트 파일에 타입 정의하면 임포트 순환이 발생할 수 있음.
- **하 등급 기준선(mid 임계값)을 컴포넌트에서 하드코딩:** `PO_THRESHOLDS`를 `lib/grade-parser.ts`에서 import하여 사용. 컴포넌트에서 `38.4`, `4.8` 같은 숫자를 직접 쓰지 말 것.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 달성/미달성 배지 | 직접 아이콘 SVG | lucide-react `CheckCircle2`, `XCircle` | 이미 설치됨, 다크모드 대응 |
| PO 탭 UI | Radix Tabs 설치 | Tailwind button 스타일링 | 탭 3개로 단순 — 라이브러리 불필요 |
| 학생 목록 테이블 | shadcn Table | 간단한 `<table>` 또는 `div` 리스트 | 드릴다운 인터랙션에 버튼 클릭이 필요하므로 shadcn Table Row보다 직접 구현이 유연 |
| 상태 기반 라우팅 | URL 쿼리 파라미터 | React `useState` | 페이지 내 드릴다운 — URL 공유 불필요 |
| 분포 계산 | 외부 통계 라이브러리 | 순수 TypeScript 카운트 | 3등급 카운트는 단순 filter().length |

**Key insight:** Phase 3는 새 라이브러리 없이 기존 유틸(`getPoGrade`, `isAchieved`, `PO_THRESHOLDS`)을 집계 레이어로 감싸는 작업이 핵심이다. 복잡성은 UI 상태 관리(선택된 PO, 선택된 학생)에 있으며, 이는 `useState` 두 개로 해결된다.

---

## Common Pitfalls

### Pitfall 1: Client Component에서 서버 전용 데이터 페칭

**What goes wrong:** `PoLowGradePanel` 내부에서 `getGradeData()`를 직접 호출하면 빌드 에러 또는 런타임 에러 발생.

**Why it happens:** `getGradeData()`는 `googleapis`를 사용하는 서버 전용 함수. Client Component에서 호출하면 Next.js가 에러를 발생시킴.

**How to avoid:** 전체 `students` 배열을 Server Component(`page.tsx`)에서 계산하고 props로 Client Component에 전달. `getLowGradeStudents(students, poKey)`는 순수 TypeScript 함수이므로 Client에서 호출 가능.

**Warning signs:** 빌드 에러 "Error: This module cannot be imported from a Client Component module"

### Pitfall 2: PoGradeDistribution 타입의 직렬화 가능성

**What goes wrong:** Server Component에서 Client Component로 함수나 Map 객체를 props로 전달하면 에러 발생.

**Why it happens:** Next.js Server-Client 경계에서 props는 JSON 직렬화 가능한 값만 허용.

**How to avoid:** `PoGradeDistribution`을 숫자와 boolean만 포함하는 plain object로 유지. 함수 포함 금지. `Record<ClassCode | 'all', PoGradeDistribution>`은 직렬화 가능.

### Pitfall 3: `isAchieved()`와 `achieveRate` 계산의 미세 차이

**What goes wrong:** `isAchieved()`는 `achievedCount / students.length >= 0.8`로 판정하는데, `achieveRate = Math.round(rate * 1000) / 10`으로 계산 시 반올림으로 인해 `achieveRate >= 80`이지만 `isAchieved()`가 false를 반환하는 엣지 케이스 발생 가능.

**Why it happens:** 부동소수점 반올림(예: 79.999... → 80.0% 표시되지만 isAchieved는 false).

**How to avoid:** `computeDistribution()` 함수에서 `achieved` 필드를 `isAchieved()`를 직접 호출하여 설정하거나, 동일한 계산식(`>= 0.8`)을 사용. `achieveRate`를 UI 표시용으로만 사용하고 `achieved`를 별도 계산.

**권고:** `achieved = (high + mid) / total >= 0.8` — `isAchieved()`와 동일한 로직을 `computeDistribution()` 내부에서 직접 구현.

### Pitfall 4: 학생 0명 반 처리

**What goes wrong:** partial-mock 상황에서 특정 반 학생이 0명일 때 `computeDistribution([], poKey)`가 나누기 0 발생.

**Why it happens:** `achieveRate = (high + mid) / total * 100`에서 `total === 0`.

**How to avoid:** `computeDistribution()`의 시작에서 `if (total === 0) return { total: 0, high: 0, mid: 0, low: 0, achieveRate: 0, achieved: false }` 가드.

### Pitfall 5: 반 필터 없이 전체를 하나의 열로 표시 시 반별 배지 혼동

**What goes wrong:** '전체' 열의 달성/미달성 배지가 반별 배지와 시각적으로 구분되지 않아 교수가 반별 달성인지 전체 달성인지 혼동.

**Why it happens:** 동일한 UI 패턴을 반별·전체에 동일하게 적용.

**How to avoid:** '전체' 열에 굵은 폰트 또는 구분 배경색 적용. 테이블 헤더에서 "전체" 열을 시각적으로 강조.

### Pitfall 6: 하 등급 학생이 0명일 때 드릴다운 패널의 빈 상태

**What goes wrong:** 학습성과 달성률이 높아 하 등급 학생이 없을 때 드릴다운 패널이 빈 상태로 남아 사용자에게 오해를 줌.

**Why it happens:** 빈 상태 처리 미구현.

**How to avoid:** `lowGradeStudents.length === 0`일 때 "하 등급 학생 없음 (달성)" 메시지와 초록색 표시. 이미 Pattern 5 예시에 포함.

---

## Code Examples

Verified patterns from existing codebase:

### getPoGrade() 사용 패턴 (lib/grade-parser.ts에서 확인)
```typescript
// Source: lib/grade-parser.ts (이미 구현됨)
import { getPoGrade, PO_THRESHOLDS } from '@/lib/grade-parser';

// po2(대상자간호) 등급 판정
const grade = getPoGrade(student.po2, PO_THRESHOLDS.po2);
// → '상' | '중' | '하'

// PO_THRESHOLDS 상수
// po2: { max: 64, high: 54.4, mid: 38.4 }
// po5: { max: 8,  high: 6.8,  mid: 4.8 }
// po3: { max: 8,  high: 6.8,  mid: 4.8 }
```

### isAchieved() 사용 패턴 (lib/grade-parser.ts에서 확인)
```typescript
// Source: lib/grade-parser.ts (이미 구현됨)
import { isAchieved } from '@/lib/grade-parser';

const achieved = isAchieved(classAStudents, 'po2');
// → true (중 이상 비율 80% 이상) | false
```

### 달성률 계산 (순수 TypeScript)
```typescript
// 중 이상 인원 / 전체 × 100, 소수점 1자리
function computeAchieveRate(students: StudentGrade[], poKey: PoKey): number {
  if (students.length === 0) return 0;
  const threshold = PO_THRESHOLDS[poKey];
  const achieved = students.filter(s => {
    const grade = getPoGrade(s[poKey], threshold);
    return grade === '상' || grade === '중';
  }).length;
  return Math.round((achieved / students.length) * 1000) / 10;
}
```

### Client Component useState 드릴다운 패턴 (기존 패턴 동일)
```typescript
// Source: 기존 프로젝트 패턴 (components/dashboard/grade-histogram-chart.tsx)
"use client";
import { useState } from 'react';

// 선택 상태 두 개: 어떤 PO인지, 어떤 학생인지
const [selectedPo, setSelectedPo] = useState<PoKey>('po2');
const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);

// PO 탭 변경 시 학생 선택 초기화
const handlePoChange = (poKey: PoKey) => {
  setSelectedPo(poKey);
  setSelectedStudent(null); // 다른 PO로 전환 시 학생 선택 초기화
};
```

### Tailwind 배지 패턴 (shadcn Badge 미설치 대응)
```typescript
// 달성 배지
<span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
  <CheckCircle2 className="h-3 w-3" />
  달성
</span>

// 미달성 배지
<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
  <XCircle className="h-3 w-3" />
  미달성
</span>
```

### 반 필터링 패턴 (기존 grade-kpi.ts 패턴 동일)
```typescript
// Source: lib/grade-kpi.ts (기존 구현)
const classCodes: ClassCode[] = ['A', 'B', 'C'];
for (const cls of classCodes) {
  const classStudents = students.filter(s => s.classCode === cls);
  // ... 반별 집계 처리
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `isAchieved()` 단독 boolean | `computeDistribution()` — 상/중/하 인원수 + 달성률 + boolean 통합 | Phase 3 신규 | 더 상세한 분포 정보 제공 |
| 단일 전체 집계 | 반별(A/B/C) + 전체(all) 4개 열 집계 | Phase 3 신규 | LO-01 반별 조회 요구사항 충족 |
| 데이터 레이어만 구현 | 데이터 + 집계 유틸 + UI + 드릴다운 풀스택 | Phase 3 | 인증평가 핵심 아티팩트 완성 |

**기존 유틸 재사용:**
- `getPoGrade()`, `isAchieved()`, `PO_THRESHOLDS` — Phase 1에서 완성된 함수들을 그대로 활용
- `MockDataBanner` — Phase 2에서 완성된 컴포넌트 그대로 재사용
- `CLASS_COLORS` 패턴 — 히스토그램과 동일한 색상 상수 패턴 유지

---

## Open Questions

1. **사이드바에 '학습성과' 링크 추가 위치**
   - What we know: `app/(dashboard)/layout.tsx`에 사이드바가 있으나 내부 구조 미확인
   - What's unclear: 사이드바 navigation 배열이 어디에 정의되어 있는지
   - Recommendation: `app/(dashboard)/layout.tsx` 또는 해당 사이드바 컴포넌트를 확인하여 navigation 항목 추가 위치 파악. 플랜 첫 태스크로 포함.

2. **shadcn Badge 컴포넌트 설치 여부**
   - What we know: `package.json`에 `shadcn@^3.8.4` devDependency 존재. 그러나 `components/ui/` 디렉토리의 실제 설치 파일 미확인
   - Recommendation: Badge 미설치 가정 하에 Tailwind `span` 패턴으로 구현. 있으면 import만 추가.

3. **분포표를 테이블로만 할지, Recharts 차트 병행할지**
   - What we know: 테이블이 LO-01/LO-02 요구사항을 모두 충족
   - What's unclear: 교수가 시각화(스택 바 차트)도 원하는지 명확하지 않음
   - Recommendation: Phase 3에서는 테이블 구현으로 LO-01~LO-04를 완성. 차트는 v2 ENH-01에서 추가. REQUIREMENTS.md의 LO-01은 "확인할 수 있다"이며 시각화 형식을 강제하지 않음.

4. **하 등급 학생 드릴다운에서 반 필터 필요 여부**
   - What we know: LO-03은 "학습성과별 하 등급 학생 목록"을 조회. LO-01은 반별 + 전체 기준. 드릴다운도 반별 필터가 자연스러움.
   - Recommendation: `PoLowGradePanel`에 반 선택 필터(전체/A반/B반/C반) 버튼을 PO 탭 옆에 추가. 구현 복잡도는 낮음(`useState<ClassCode | 'all'>`).

---

## Phase 3 구현 계획 제안 (플랜 분리 기준)

Phase 3를 2개 플랜으로 나누는 것을 권장:

**Plan 03-01:** 집계 유틸 + 분포표 (LO-01, LO-02)
- `lib/grade-po.ts` — `computePoAchievement()`, `getLowGradeStudents()`, 타입 정의
- `types/grades.ts` — `PoDistribution` 타입 추가
- `components/dashboard/po-achievement-table.tsx` — 분포표 Server Component
- `app/(dashboard)/learning-outcomes/page.tsx` — 라우트 + 사이드바 링크

**Plan 03-02:** 드릴다운 패널 (LO-03, LO-04)
- `components/dashboard/po-low-grade-panel.tsx` — Client Component 드릴다운
- `app/(dashboard)/learning-outcomes/page.tsx` — 드릴다운 통합

---

## Sources

### Primary (HIGH confidence)

- 프로젝트 코드베이스 직접 검토:
  - `lib/grade-parser.ts` — `getPoGrade()`, `isAchieved()`, `PO_THRESHOLDS` 함수/상수 확인 (203줄 전체)
  - `types/grades.ts` — `StudentGrade`, `PoGrade`, `ClassCode`, `GradeKpiData` 타입 확인
  - `lib/grade-data.ts` — `getGradeData()` 인터페이스 확인
  - `lib/mock-grade-data.ts` — mock 하 등급 학생 보장 로직, `po2/po5/po3` 점수 범위 확인
  - `app/(dashboard)/dashboard/page.tsx` — Server Component 패턴 확인
  - `components/dashboard/grade-kpi-cards.tsx` — Server Component KPI 카드 패턴
  - `components/dashboard/grade-histogram-chart.tsx` — Client Component Recharts 패턴
  - `.planning/REQUIREMENTS.md` — LO-01~LO-04 요구사항 원문
  - `.planning/ROADMAP.md` — Phase 3 성공기준 4개
  - `.planning/STATE.md` — 이전 결정사항(익명화, PO 임계값, mock 폴백)

### Secondary (MEDIUM confidence)

- 프로젝트 Phase 2 RESEARCH.md — 검증된 패턴(Server/Client 분리, Recharts 색상, Tailwind 배지) 재활용

### Tertiary (LOW confidence)

- 없음 — 모든 핵심 결정이 기존 코드베이스에서 직접 확인됨

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — `package.json`에서 직접 확인, 모든 라이브러리 이미 설치됨
- Architecture: HIGH — Phase 2 Server/Client 분리 패턴이 기존 코드로 검증됨
- 집계 유틸 설계: HIGH — `getPoGrade()`, `isAchieved()`, `PO_THRESHOLDS`가 Phase 1에서 완성, 래퍼 함수만 추가
- 드릴다운 UI: HIGH — React `useState` 두 개로 충분, 기존 Client Component 패턴 동일
- Pitfalls: HIGH — 부동소수점, 빈 배열, Server/Client 경계 이슈는 Phase 1-2 검증에서 이미 식별됨

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (안정적 스택, 30일)
