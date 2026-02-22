---
phase: 04-student-lookup-class-comparison
plan: 01
subsystem: student-lookup
tags: [student-table, rank-chart, recharts, grade-rank, sidebar]
dependency_graph:
  requires:
    - lib/grade-data.ts (getGradeData)
    - types/grades.ts (StudentGrade, ClassCode)
    - lib/grade-kpi.ts (컷라인 패턴 참조)
  provides:
    - lib/grade-rank.ts (buildRankData, computeOverallCutline, RankDataPoint)
    - components/dashboard/student-table.tsx (반별 필터 + 검색 테이블)
    - components/dashboard/student-rank-chart.tsx (순위 BarChart + 컷라인)
    - app/(dashboard)/students/page.tsx (/students 라우트)
  affects:
    - components/layout/sidebar.tsx (Users 아이콘 + /students 링크 추가)
tech_stack:
  added: []
  patterns:
    - buildRankData: [...students].sort() 원본 변경 금지 + Math.ceil(n*0.4)-1 컷라인 인덱스
    - StudentTable: useMemo([students, classFilter, searchQuery]) 필터링 최적화
    - StudentRankChart: Cell per-bar 색상 + opacity로 상위/하위 구분
    - CLASS_COLORS: hsl 직접 값 (Recharts SVG CSS 변수 불가 — grade-histogram 패턴 동일)
key_files:
  created:
    - lib/grade-rank.ts
    - components/dashboard/student-table.tsx
    - components/dashboard/student-rank-chart.tsx
    - app/(dashboard)/students/page.tsx
  modified:
    - components/layout/sidebar.tsx
decisions:
  - "[04-01]: buildRankData는 원본 배열 변경 금지 — [...students].sort() spread 복사 패턴 사용"
  - "[04-01]: StudentTable 필터링은 useMemo로 최적화 — [students, classFilter, searchQuery] 의존"
  - "[04-01]: StudentRankChart Cell opacity 1/0.5로 상위40%/하위60% 시각적 구분"
  - "[04-01]: 하단 범례는 Recharts Legend 대신 커스텀 div — 색상 원 + 레이블 텍스트"
metrics:
  duration: 3 min
  completed: 2026-02-23
  tasks_completed: 2
  files_created: 4
  files_modified: 1
---

# Phase 4 Plan 01: 학생 성적 조회 페이지 Summary

총점 기준 전체 학생 순위 BarChart + 반별 필터/이름·학번 검색 테이블로 /students 페이지 구현 및 사이드바 링크 추가.

## What Was Built

### lib/grade-rank.ts (신규)

- `RankDataPoint` 인터페이스: `{ rank, name, classCode, totalScore, aboveCutline }`
- `buildRankData(students)`: 총점 내림차순 정렬 + 전체 40% 컷라인(Math.ceil(n*0.4)-1 인덱스) 기준 aboveCutline 플래그 포함
- `computeOverallCutline(students)`: 전체 상위 40% 컷라인 점수 반환 (빈 배열 시 0)

### components/dashboard/student-table.tsx (신규)

- `"use client"` + `useState` + `useMemo`
- 반별 필터 버튼 (전체/A/B/C반) — 선택/미선택 스타일 구분
- 이름·학번 실시간 검색 (string.includes, 대소문자 무시)
- shadcn Table 컴포넌트 사용 — 9열 (이름/학번/반/사전학습/보고서/실습지도교수/현장지도자/총점/핵심간호술)
- 결과 카운트 텍스트, 빈 결과 "검색 결과가 없습니다" 메시지
- 핵심간호술 열 `text-blue-600 dark:text-blue-400` 색상 구분

### components/dashboard/student-rank-chart.tsx (신규)

- `"use client"` + Recharts BarChart + Cell + ReferenceLine
- X축: rank(순위), interval={9}로 10단위 tick / Y축: 0~100 고정
- CLASS_COLORS 반별 hsl 직접 값 (grade-histogram-chart.tsx 동일 패턴)
- Cell로 per-bar 반별 색상 + aboveCutline opacity 1/0.5 적용
- ReferenceLine y={cutlineScore} 빨간 점선 + "40% 컷라인 (X점)" 레이블
- 커스텀 Tooltip: 순위/이름/반/총점/상위40%여부 표시
- 가로 스크롤 래퍼 + `Math.max(800, data.length * 8)` 동적 너비
- 하단 커스텀 범례 (A반/B반/C반 색상 원)

### app/(dashboard)/students/page.tsx (신규)

- Server Component — `getGradeData()` + `buildRankData()` + `computeOverallCutline()` 호출
- `<MockDataBanner>` + `<StudentTable>` + `<StudentRankChart>` 통합

### components/layout/sidebar.tsx (수정)

- lucide-react `Users` 아이콘 추가
- navItems에 `{ icon: Users, label: '학생 조회', href: '/students' }` 추가 (학습성과 다음)

## Verification Results

- `npx tsc --noEmit` — 타입 에러 없음 (0 errors)
- `npm run build` — 성공, `/students` 라우트 빌드 출력 포함
- `buildRankData`, `computeOverallCutline`, `RankDataPoint` export 확인
- `student-table.tsx`에 `"use client"`, `useMemo`, `useState` 존재 확인
- `student-rank-chart.tsx`에 `"use client"`, `BarChart`, `ReferenceLine`, `Cell` 존재 확인
- sidebar.tsx navItems에 `/students` 링크 존재 확인

## Deviations from Plan

None - 플랜 그대로 실행됨.

## Commits

| Hash | Message |
|------|---------|
| 1716f01 | feat(04-01): 순위 계산 유틸 + 학생 테이블/차트 컴포넌트 생성 |
| 80eb078 | feat(04-01): /students 페이지 라우트 + 사이드바 학생 조회 링크 추가 |

## Self-Check: PASSED

- lib/grade-rank.ts: FOUND
- components/dashboard/student-table.tsx: FOUND
- components/dashboard/student-rank-chart.tsx: FOUND
- app/(dashboard)/students/page.tsx: FOUND
- .planning/phases/04-student-lookup-class-comparison/04-01-SUMMARY.md: FOUND
- commit 1716f01: FOUND
- commit 80eb078: FOUND
