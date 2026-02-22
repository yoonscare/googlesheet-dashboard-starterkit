---
phase: 03-learning-outcomes
plan: 01
subsystem: ui
tags: [nextjs, typescript, tailwind, recharts, server-component, po-achievement]

# Dependency graph
requires:
  - phase: 01-data-foundation
    provides: getPoGrade, PO_THRESHOLDS, StudentGrade 타입, getGradeData()
  - phase: 02-core-dashboard
    provides: MockDataBanner 컴포넌트, Server Component 패턴
provides:
  - lib/grade-po.ts (computePoAchievement, getLowGradeStudents, PoKey, PoGradeDistribution, PoAchievementData)
  - components/dashboard/po-achievement-table.tsx (분포표 Server Component)
  - app/(dashboard)/learning-outcomes/page.tsx (학습성과 달성도 페이지)
  - 사이드바에 /learning-outcomes 링크
affects:
  - 03-02 (PoLowGradePanel 드릴다운 — learning-outcomes/page.tsx에 통합)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PO 분포 집계 유틸 패턴: computePoAchievement()로 3 PO × 4 열 상/중/하 카운트 + achieveRate + achieved 반환"
    - "Tailwind span 배지 패턴: shadcn Badge 미설치 시 inline-flex span으로 달성/미달성 배지 구현"
    - "achieved = (high + mid) / total >= 0.8 — achieveRate 반올림이 아닌 raw 비율로 판정하여 부동소수점 이슈 방지"

key-files:
  created:
    - lib/grade-po.ts
    - components/dashboard/po-achievement-table.tsx
    - app/(dashboard)/learning-outcomes/page.tsx
  modified:
    - components/layout/sidebar.tsx

key-decisions:
  - "achieved 판정은 achieveRate가 아닌 raw 비율 (high + mid) / total >= 0.8 사용 — 반올림 엣지케이스 방지"
  - "computeDistribution()은 export하지 않음 — 내부 헬퍼, PoAchievementData 구조만 공개"
  - "분포표는 테이블 구현으로 LO-01/LO-02 충족 — 차트 시각화는 v2 ENH-01에서 별도 추가 예정"
  - "GraduationCap 아이콘을 학습성과 사이드바 링크에 사용 (기존 lucide-react 설치분)"

patterns-established:
  - "Pattern 1: PO 분포 집계 유틸 — Server-side 순수 TypeScript, JSON 직렬화 가능 PoAchievementData 반환"
  - "Pattern 2: 반별 학생 필터 — students.filter(s => s.classCode === cls) 패턴으로 A/B/C 분리"
  - "Pattern 3: 학습성과 페이지 Server Component — getGradeData() + computePoAchievement() 연결 패턴"
  - "Pattern 4: Tailwind 배지 — rounded-full + bg-green/red-100 + dark:bg-green/red-900/30 패턴"

requirements-completed: [LO-01, LO-02]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 3 Plan 01: 학습성과 달성도 분포표 Summary

**PO 분포 집계 유틸(computePoAchievement)과 3개 학습성과 × 4열(A/B/C/전체) 달성/미달성 배지 분포표 페이지를 Server Component로 구현**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-22T15:24:13Z
- **Completed:** 2026-02-22T15:27:04Z
- **Tasks:** 2
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments
- `lib/grade-po.ts` 집계 유틸: `computePoAchievement()`로 3개 PO × (A/B/C/전체) 상/중/하 인원수·달성률·달성여부 계산, `getLowGradeStudents()`로 하 등급 학생 추출
- `PoAchievementTable` Server Component: 3개 PO × 4열 분포표, 초록/빨강 Tailwind span 배지, 다크모드 대응, overflow-x-auto 태블릿 대응
- `/learning-outcomes` 라우트 신규 생성, 사이드바에 GraduationCap 아이콘 + "학습성과" 링크 추가
- `npm run build` 성공 — `/learning-outcomes` 정적 페이지로 사전 렌더링 확인

## Task Commits

각 태스크를 원자적으로 커밋:

1. **Task 1: PO 분포 집계 유틸 생성** - `d7f1459` (feat)
2. **Task 2: 분포표 컴포넌트 + 학습성과 페이지 + 사이드바 링크** - `13338fa` (feat)

**Plan metadata:** (이 SUMMARY 커밋)

## Files Created/Modified
- `lib/grade-po.ts` — computePoAchievement, getLowGradeStudents, PoKey/PoGradeDistribution/PoAchievementData 타입 정의
- `components/dashboard/po-achievement-table.tsx` — 분포표 Server Component (3 PO × 4열, 달성/미달성 배지)
- `app/(dashboard)/learning-outcomes/page.tsx` — 학습성과 달성도 페이지 Server Component
- `components/layout/sidebar.tsx` — GraduationCap 아이콘 + 학습성과 /learning-outcomes 링크 추가

## Decisions Made
- `achieved` 판정: `achieveRate >= 80` 대신 raw 비율 `(high + mid) / total >= 0.8` 사용 — 부동소수점 반올림 엣지케이스 방지 (79.999% → 80.0% 표시지만 미달성이어야 할 때)
- `computeDistribution()` 함수는 export하지 않고 내부 헬퍼로만 사용 — 외부 API는 `computePoAchievement()`와 `getLowGradeStudents()`로 명확히 제한
- 분포표는 테이블로 구현 — 테이블이 숫자 정밀도·가독성에 유리, 차트 시각화는 v2 ENH-01에서 추가 예정
- `GraduationCap` 아이콘 사용 — 기존 lucide-react 설치분에 포함, 추가 설치 불필요

## Deviations from Plan

None - 계획대로 정확히 실행됨.

## Issues Encountered

None — `npx tsc --noEmit` 타입 에러 없음, `npm run build` 빌드 성공.

## User Setup Required

None - 외부 서비스 설정 불필요. 기존 Google Sheets 환경변수 설정으로 실데이터 연결 가능.

## Next Phase Readiness
- LO-01(반별·전체 상/중/하 분포 조회), LO-02(달성률 + 배지) 완성
- Plan 03-02에서 `PoLowGradePanel` Client Component 드릴다운 추가 예정
- `getLowGradeStudents(students, poKey, classCode?)` 유틸이 이미 준비됨 — 03-02에서 바로 사용 가능
- `students` 배열을 `page.tsx`에서 `PoLowGradePanel`에 props로 전달하는 패턴 적용 예정

## Self-Check: PASSED

- FOUND: lib/grade-po.ts
- FOUND: components/dashboard/po-achievement-table.tsx
- FOUND: app/(dashboard)/learning-outcomes/page.tsx
- FOUND: components/layout/sidebar.tsx
- FOUND: .planning/phases/03-learning-outcomes/03-01-SUMMARY.md
- FOUND: commit d7f1459 (Task 1)
- FOUND: commit 13338fa (Task 2)

---
*Phase: 03-learning-outcomes*
*Completed: 2026-02-23*
