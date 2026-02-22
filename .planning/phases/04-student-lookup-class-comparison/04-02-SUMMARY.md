---
phase: 04-student-lookup-class-comparison
plan: 02
subsystem: ui
tags: [recharts, bar-chart, class-comparison, nursing-skills, sidebar, next-js]

requires:
  - phase: 04-student-lookup-class-comparison
    provides: lib/grade-data.ts (getGradeData), types/grades.ts (StudentGrade, ClassCode), sidebar (Users 아이콘 추가됨)
  - phase: 02-core-dashboard
    provides: CLASS_COLORS hsl 패턴, GradeHistogramChart grouped BarChart 패턴
provides:
  - lib/grade-comparison.ts (buildClassComparisonData, computeNursingSkillsStats)
  - components/dashboard/class-comparison-chart.tsx (반별 비교 grouped BarChart)
  - components/dashboard/nursing-skills-stats.tsx (핵심간호술 KPI 카드)
  - app/(dashboard)/class-comparison/page.tsx (/class-comparison 라우트)
affects:
  - components/layout/sidebar.tsx (BarChart2 + 반별 비교 링크 추가)

tech-stack:
  added: []
  patterns:
    - buildClassComparisonData: 반별 totalScore 배열 → ClassComparisonData[] (평균/최고점/최저점 3행)
    - computeNursingSkillsStats: nursingSkills 필드만 독립 집계 — totalScore와 분리
    - calcStats 헬퍼: reduce 패턴으로 빈 배열 -Infinity/Infinity 방지 (grade-kpi.ts 동일 패턴)
    - CLASS_COLORS hsl 직접 값: Recharts SVG CSS 변수 불가 — grade-histogram-chart.tsx 동일 패턴

key-files:
  created:
    - lib/grade-comparison.ts
    - components/dashboard/class-comparison-chart.tsx
    - components/dashboard/nursing-skills-stats.tsx
    - app/(dashboard)/class-comparison/page.tsx
  modified:
    - components/layout/sidebar.tsx

key-decisions:
  - "[04-02]: calcStats 내부 헬퍼로 avg/max/min 일괄 계산 — buildClassComparisonData와 computeNursingSkillsStats에서 공유"
  - "[04-02]: NursingSkillsStatsCard는 Server Component로 구현 — 인터랙션 없음, use client 불필요"
  - "[04-02]: 핵심간호술 섹션 헤더에 '총점 미포함' 명시 — 교수가 데이터 독립성을 명확히 인지하도록"

requirements-completed: [COMP-01, COMP-02]

duration: 2min
completed: 2026-02-23
---

# Phase 4 Plan 02: 반별 성적 비교 페이지 Summary

**반별 평균/최고점/최저점 grouped BarChart + 핵심간호술 독립 KPI 카드로 /class-comparison 페이지 구현 및 사이드바 링크 추가.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-22T16:10:45Z
- **Completed:** 2026-02-22T16:13:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- lib/grade-comparison.ts: buildClassComparisonData() + computeNursingSkillsStats() 유틸 구현 (totalScore와 nursingSkills 완전 분리)
- ClassComparisonChart: A/B/C반 평균/최고점/최저점을 hsl 직접 값 + grouped BarChart로 시각화
- NursingSkillsStatsCard: 핵심간호술 반별+전체 4개 KPI 카드, "총점 미포함" 명시, 전체 카드 border-primary/50 강조
- /class-comparison 라우트 + 사이드바 "반별 비교" 링크(학생 조회 다음)가 npm run build 성공으로 검증됨

## Task Commits

1. **Task 1: 반별 비교 유틸 + 핵심간호술 집계 유틸 + 차트/카드 컴포넌트 생성** - `1573f37` (feat)
2. **Task 2: /class-comparison 페이지 라우트 + 사이드바 링크 + 빌드 검증** - `767df99` (feat)

## Files Created/Modified

- `lib/grade-comparison.ts` — ClassComparisonData/NursingSkillsStats 인터페이스 + buildClassComparisonData/computeNursingSkillsStats 함수
- `components/dashboard/class-comparison-chart.tsx` — use client, A/B/C반 grouped BarChart, CLASS_COLORS hsl 직접 값
- `components/dashboard/nursing-skills-stats.tsx` — Server Component, 핵심간호술 4개 KPI 카드, 총점 미포함 명시
- `app/(dashboard)/class-comparison/page.tsx` — Server Component, getGradeData + buildClassComparisonData + computeNursingSkillsStats 호출
- `components/layout/sidebar.tsx` — BarChart2 아이콘 추가, 반별 비교 navItem 추가 (학생 조회 다음)

## Decisions Made

- calcStats 내부 헬퍼로 avg/max/min 일괄 계산 — buildClassComparisonData와 computeNursingSkillsStats에서 공유하여 중복 제거
- NursingSkillsStatsCard는 Server Component로 구현 — 인터랙션 없음, use client 불필요 (CLAUDE.md 아키텍처 규칙 준수)
- 핵심간호술 섹션 헤더에 "총점 미포함" 명시 — 교수가 데이터 독립성을 명확히 인지하도록

## Deviations from Plan

None - 플랜 그대로 실행됨.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 완료: 학생 조회(/students) + 반별 비교(/class-comparison) 페이지 모두 구현됨
- STUD-01, STUD-02, COMP-01, COMP-02 요구사항 모두 충족
- 전체 프로젝트 4개 Phase 모두 완료 — 성적 대시보드 MVP 완성

---
*Phase: 04-student-lookup-class-comparison*
*Completed: 2026-02-23*

## Self-Check: PASSED

- lib/grade-comparison.ts: FOUND
- components/dashboard/class-comparison-chart.tsx: FOUND
- components/dashboard/nursing-skills-stats.tsx: FOUND
- app/(dashboard)/class-comparison/page.tsx: FOUND
- .planning/phases/04-student-lookup-class-comparison/04-02-SUMMARY.md: FOUND
- commit 1573f37: FOUND
- commit 767df99: FOUND
