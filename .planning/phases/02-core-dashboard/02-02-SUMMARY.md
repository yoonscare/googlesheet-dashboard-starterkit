---
phase: 02-core-dashboard
plan: 02
subsystem: ui
tags: [recharts, histogram, bar-chart, reference-line, client-component, server-component, responsive]

# Dependency graph
requires:
  - phase: 01-data-foundation
    provides: "StudentGrade[], ClassCode 타입, getGradeData()"
  - phase: 02-01
    provides: "computeGradeKpi(), GradeKpiData, GradeKpiCards, MockDataBanner, dashboard/page.tsx 기반"

provides:
  - "buildHistogramData(students): HistogramDataPoint[] — 10점 단위 반별 학생 수 변환 순수 함수"
  - "findCutlineRange(score): string — 컷라인 점수 → 히스토그램 구간 레이블 변환"
  - "HistogramDataPoint 인터페이스 (lib/grade-histogram.ts)"
  - "GradeHistogramChart 컴포넌트 — A/B/C반 grouped BarChart + 컷라인 ReferenceLine"
  - "dashboard/page.tsx 최종 완성 — KPI 카드 + 히스토그램 통합"

affects:
  - 03-po-achievement
  - 04-grading

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Recharts grouped BarChart — stackId 없이 반별 Bar 3개 나란히 배치"
    - "ReferenceLine x prop에 XAxis dataKey 값(문자열) 전달 — 구간 레이블 기준 세로선"
    - "findCutlineRange()와 buildHistogramData()를 같은 모듈에서 export — range 값 불일치 방지"
    - "Server Component에서 buildHistogramData() 호출, HistogramDataPoint[] props로 Client Component 전달"

key-files:
  created:
    - lib/grade-histogram.ts
    - components/dashboard/grade-histogram-chart.tsx
  modified:
    - app/(dashboard)/dashboard/page.tsx

key-decisions:
  - "SCORE_RANGES 상수 배열로 구간 정의 — buildHistogramData()와 findCutlineRange() 모두 동일 레이블 참조"
  - "10개 구간(0-9 ~ 90-100) — 90-100 구간이 11점 범위이나 실제 분포에서 중요 구간"
  - "대표 컷라인 = Math.round((A + B + C) / 3) — 반별 평균으로 단일 ReferenceLine 시각화"
  - "Recharts SVG에서 CSS 변수 불가 → hsl 직접 값 사용 (category-chart.tsx 패턴 준수)"

patterns-established:
  - "히스토그램 유틸: 순수 함수 + SCORE_RANGES 상수로 레이블 일관성 보장"
  - "컷라인 시각화: 히스토그램에서 구간 근사 (ReferenceLine), KPI 카드에서 정확한 점수 텍스트"

requirements-completed: [DASH-02, DASH-03, UI-01, UI-02]

# Metrics
duration: 2min
completed: 2026-02-22
---

# Phase 2 Plan 02: 히스토그램 차트 Summary

**Recharts grouped BarChart로 A/B/C반 10점 단위 성적 분포 히스토그램 구현 + 반별 컷라인 평균 구간에 ReferenceLine 빨간 점선 표시**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-22T14:06:01Z
- **Completed:** 2026-02-22T14:08:28Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `buildHistogramData(students)` 순수 함수 — 10개 구간(0-9 ~ 90-100) 반별 학생 수 집계
- `findCutlineRange(score)` — 컷라인 점수를 HistogramDataPoint.range와 일치하는 레이블로 변환
- `GradeHistogramChart` Client Component — A/B/C반 grouped BarChart + 컷라인 ReferenceLine + 반응형 ResponsiveContainer
- `dashboard/page.tsx` 최종 완성 — KPI 카드 6개 + 히스토그램 full-width 카드 레이아웃

## Task Commits

각 태스크는 원자적으로 커밋되었습니다:

1. **Task 1: 히스토그램 데이터 유틸 + 차트 컴포넌트** - `34cc283` (feat)
2. **Task 2: dashboard/page.tsx 히스토그램 통합 + 빌드 검증** - `8bd62be` (feat)

**Plan metadata:** (docs 커밋 — 아래 최종 커밋)

## Files Created/Modified

- `lib/grade-histogram.ts` — buildHistogramData(), findCutlineRange(), HistogramDataPoint 인터페이스
- `components/dashboard/grade-histogram-chart.tsx` — GradeHistogramChart Client Component, Recharts grouped BarChart
- `app/(dashboard)/dashboard/page.tsx` — buildHistogramData() 호출 + GradeHistogramChart 통합 (placeholder 교체)

## Decisions Made

- **SCORE_RANGES 상수 배열**: buildHistogramData()와 findCutlineRange()가 모두 동일한 레이블 소스를 참조 → range 불일치 버그 원천 차단
- **10개 구간**: 0-9 ~ 90-100 (90-100이 11점 범위이나 Recharts 레이블로만 사용하므로 무관)
- **대표 컷라인**: 반별 3개 컷라인 평균으로 단일 ReferenceLine 표시 — Research Open Question #1 결론 적용
- **hsl 직접 값**: Recharts SVG 내부에서 CSS 변수 미작동 → category-chart.tsx 패턴 준수

## Deviations from Plan

None - 플랜대로 정확하게 실행됨.

## Issues Encountered

- Recharts 빌드 시 `width(-1) and height(-1)` 경고: Next.js SSG 단계에서 브라우저 없이 정적 렌더링 시 발생하는 알려진 경고. 런타임에서는 ResponsiveContainer가 실제 DOM 크기를 받으므로 정상 동작. 빌드 성공 확인.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 완전 완료 — KPI 카드 + 히스토그램 + 컷라인 시각화 모두 구현
- Phase 3 (PO 달성도 분석) 시작 가능 — students 배열에서 po2/po5/po3 필드 활용
- Google Sheets 연결 없이 mock 데이터로 전체 UI 확인 가능
- 실제 Sheets 연결 시 동일 코드로 라이브 데이터 표시

---
*Phase: 02-core-dashboard*
*Completed: 2026-02-22*

## Self-Check: PASSED

- FOUND: lib/grade-histogram.ts
- FOUND: components/dashboard/grade-histogram-chart.tsx
- FOUND: app/(dashboard)/dashboard/page.tsx
- FOUND: .planning/phases/02-core-dashboard/02-02-SUMMARY.md
- FOUND commit: 34cc283 (feat(02-02): 히스토그램 데이터 유틸 + 차트 컴포넌트 구현)
- FOUND commit: 8bd62be (feat(02-02): dashboard/page.tsx에 히스토그램 통합 + 반응형 레이아웃 완성)
