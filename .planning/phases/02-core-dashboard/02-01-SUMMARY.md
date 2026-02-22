---
phase: 02-core-dashboard
plan: 01
subsystem: ui
tags: [kpi, react, server-component, tailwind, lucide-react, shadcn]

# Dependency graph
requires:
  - phase: 01-data-foundation
    provides: "getGradeData(), StudentGrade, DataSource, ClassCode 타입"

provides:
  - "computeGradeKpi(students): GradeKpiData — KPI 계산 순수 함수"
  - "GradeKpiData 인터페이스 (types/grades.ts)"
  - "GradeKpiCards 컴포넌트 — 6개 KPI 카드 반응형 그리드"
  - "MockDataBanner 컴포넌트 — dataSource 경고 배너"
  - "dashboard/page.tsx — getGradeData() + computeGradeKpi() 연결 완료"

affects:
  - 02-02-histogram
  - 03-po-achievement
  - 04-grading

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component에서 getGradeData() → computeGradeKpi() 연결 패턴"
    - "KPI 카드 — cards 배열 + map 렌더링 패턴 (shadcn Card 기반)"
    - "MockDataBanner — dataSource prop 조건부 렌더링 (null 반환으로 제거)"

key-files:
  created:
    - lib/grade-kpi.ts
    - components/dashboard/grade-kpi-cards.tsx
    - components/dashboard/mock-data-banner.tsx
  modified:
    - types/grades.ts
    - app/(dashboard)/dashboard/page.tsx

key-decisions:
  - "컷라인 계산: Math.ceil(n * 0.4) - 1 인덱스 — 상위 40%의 하한 경계점"
  - "최고점/최저점: reduce 패턴으로 빈 배열 -Infinity/Infinity 방지"
  - "반별 평균을 총 학생수 카드 description에 포함 (카드 수 6개 유지)"
  - "GradeKpiCards는 Server Component — props는 JSON 직렬화 가능한 값만"

patterns-established:
  - "KPI 계산: computeGradeKpi(students) — Server Component에서만 호출"
  - "데이터 배너: dataSource 값 기반 조건부 표시, 'sheets'이면 null"
  - "그리드: md:grid-cols-2 lg:grid-cols-3 (6개 카드용)"

requirements-completed: [DASH-01, DASH-03, UI-01, UI-02]

# Metrics
duration: 3min
completed: 2026-02-22
---

# Phase 2 Plan 01: KPI 카드 + Mock 배너 Summary

**Phase 1 getGradeData() 파이프라인을 UI에 연결하여 총 학생수/반별 평균/최고점/최저점/표준편차/40% 컷라인 KPI 카드 6개와 dataSource 경고 배너를 대시보드에 표시**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-22T13:58:56Z
- **Completed:** 2026-02-22T14:02:16Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- `computeGradeKpi(students)` 순수 함수 구현 — 빈 배열 엣지 케이스 안전 처리
- `GradeKpiCards` Server Component — 6개 KPI 카드 반응형 3열 그리드 (lucide-react + shadcn Card)
- `MockDataBanner` Server Component — mock/partial-mock 조건부 경고 배너
- `dashboard/page.tsx` 완전 교체 — 기존 매출 대시보드 제거, 성적 KPI 연결 완료

## Task Commits

각 태스크는 원자적으로 커밋되었습니다:

1. **Task 1: KPI 계산 유틸 + GradeKpiData 타입 정의** - `cd233e9` (feat)
2. **Task 2: KPI 카드 + Mock 배너 + dashboard/page.tsx 교체** - `6cd662a` (feat)

**Plan metadata:** (docs 커밋 — 아래 최종 커밋)

## Files Created/Modified

- `lib/grade-kpi.ts` — computeGradeKpi() 순수 함수, 반별 평균/전체 평균/최고점/최저점/표준편차/컷라인 계산
- `types/grades.ts` — GradeKpiData 인터페이스 추가 (기존 타입 확장)
- `components/dashboard/grade-kpi-cards.tsx` — 6개 KPI 카드 Server Component
- `components/dashboard/mock-data-banner.tsx` — dataSource 경고 배너 Server Component
- `app/(dashboard)/dashboard/page.tsx` — getGradeData() + computeGradeKpi() 연결, 기존 매출 컴포넌트 제거

## Decisions Made

- 컷라인 계산: `Math.ceil(n * 0.4) - 1` 인덱스 사용 — 내림차순 정렬 후 상위 40%의 최하위 점수
- 최고점/최저점: `reduce` 패턴으로 `Math.max/min(...[])` = -Infinity/Infinity 방지
- 반별 평균(`A: n / B: n / C: n`)을 총 학생수 카드 description에 병합 — 카드 수 6개 유지
- `GradeKpiData` 타입은 `types/grades.ts`에 추가 (별도 파일 미생성, 기존 패턴 준수)

## Deviations from Plan

None - 플랜대로 정확하게 실행됨.

## Issues Encountered

- ESLint 전체 실행 시 `.claude/` 디렉토리의 gsd-tools.cjs 파일에서 `require()` 에러 발생 — 당 태스크 변경 파일과 무관한 기존 도구 파일 이슈. 태스크 파일 단독 린트는 에러 없음 확인.

## Next Phase Readiness

- Phase 2 Plan 02 준비 완료 — 히스토그램 차트 구현을 위한 데이터 구조(students 배열) 가용
- KPI 카드가 데이터를 표시하므로 Plan 02에서 histogram placeholder를 실제 Recharts 컴포넌트로 교체 가능
- Google Sheets 연결 없이도 mock 데이터로 전체 UI 확인 가능

---
*Phase: 02-core-dashboard*
*Completed: 2026-02-22*
