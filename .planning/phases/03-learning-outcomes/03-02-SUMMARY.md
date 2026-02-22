---
phase: 03-learning-outcomes
plan: 02
subsystem: ui
tags: [nextjs, typescript, tailwind, client-component, drilldown, po-analysis]

# Dependency graph
requires:
  - phase: 03-01
    provides: getLowGradeStudents, PoKey, StudentGrade, learning-outcomes/page.tsx
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-to-Client props 패턴: Server Component에서 StudentGrade[] plain object 배열을 Client Component에 직렬화하여 전달"
    - "Client-side 순수 함수 패턴: getLowGradeStudents()는 googleapis 미사용 순수 TypeScript — Client Component에서 직접 import"
    - "드릴다운 UI 패턴: PO 탭 변경 시 selectedStudent + selectedClass 초기화, 반 필터 변경 시 selectedStudent 초기화"

key-files:
  created:
    - components/dashboard/po-low-grade-panel.tsx
  modified:
    - app/(dashboard)/learning-outcomes/page.tsx

key-decisions:
  - "getLowGradeStudents()를 Client Component에서 직접 호출 — 순수 TypeScript 함수로 googleapis 의존성 없음"
  - "PO 탭 변경 시 selectedClass도 함께 초기화 — 탭 전환 후 이전 반 필터가 남아 혼란 방지"

requirements-completed: [LO-03, LO-04]

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 3 Plan 02: 하 등급 학생 드릴다운 패널 Summary

**PO 탭(LO2/LO5/LO3) + 반 필터(전체/A/B/C) + 하 등급 학생 익명 목록 + 학생 클릭 시 5개 세부점수 드릴다운 Client Component를 구현하고 학습성과 페이지에 통합**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-22T15:30:46Z
- **Completed:** 2026-02-22T15:32:00Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- `components/dashboard/po-low-grade-panel.tsx` Client Component 신규 생성
  - `"use client"` + useState 3개 (selectedPo/selectedClass/selectedStudent)
  - PO 탭 3개(LO2 대상자간호 / LO5 안전과질 / LO3 전문직) Tailwind 버튼 스타일
  - 반 필터 4개(전체/A반/B반/C반) — PO 탭과 독립적 행으로 배치
  - 하 등급 학생 N명 카운트 헤더 + 익명 이름 목록
  - 빈 상태: "하 등급 학생 없음" 점선 테두리 박스
  - 선택된 학생: 사전학습/보고서/실습교수/현장지도자 + 해당 PO 점수(빨강 강조) 5개 항목
  - 미선택 상태: "학생을 선택하면 세부점수가 표시됩니다" 안내 박스
- `app/(dashboard)/learning-outcomes/page.tsx`에 PoLowGradePanel 통합
  - PoAchievementTable 아래에 `<PoLowGradePanel students={students} />` 추가
  - "Plan 03-02에서 추가 예정" 주석 제거
- `npm run build` 성공 — `/learning-outcomes` 정적 페이지 사전 렌더링 확인

## Task Commits

각 태스크를 원자적으로 커밋:

1. **Task 1: 하 등급 학생 드릴다운 Client Component 구현** - `4d36db5` (feat)
2. **Task 2: 학습성과 페이지에 드릴다운 패널 통합** - `850ec42` (feat)

**Plan metadata:** (이 SUMMARY 커밋)

## Files Created/Modified

- `components/dashboard/po-low-grade-panel.tsx` — PoLowGradePanel Client Component (PO 탭, 반 필터, 하 등급 학생 목록, 세부점수 드릴다운)
- `app/(dashboard)/learning-outcomes/page.tsx` — PoLowGradePanel import + 렌더링 추가

## Decisions Made

- `getLowGradeStudents()`를 Client Component에서 직접 호출 — googleapis 미사용 순수 TypeScript 함수이므로 서버 전용 제약 없음
- PO 탭 변경 시 `selectedClass`도 함께 `'all'`로 초기화 — 탭 전환 후 이전 반 필터 잔류로 인한 UX 혼란 방지
- `StudentGrade[]` 배열은 plain object 배열로 함수/Map 미포함 — Server → Client props 직렬화 가능

## Deviations from Plan

None - 계획대로 정확히 실행됨.

## Issues Encountered

None — `npx tsc --noEmit` 타입 에러 없음, `npm run build` 빌드 성공.

## User Setup Required

None - 추가 설정 불필요. Google Sheets 환경변수 설정 시 실데이터 연결 가능.

## Next Phase Readiness

- LO-03(하 등급 학생 익명 목록 조회), LO-04(하 등급 학생 세부점수 드릴다운) 완성
- Phase 3 모든 요구사항(LO-01 ~ LO-04) 충족
- Phase 4 진행 가능

## Self-Check: PASSED

- FOUND: components/dashboard/po-low-grade-panel.tsx
- FOUND: app/(dashboard)/learning-outcomes/page.tsx
- FOUND: commit 4d36db5 (Task 1)
- FOUND: commit 850ec42 (Task 2)

---
*Phase: 03-learning-outcomes*
*Completed: 2026-02-23*
