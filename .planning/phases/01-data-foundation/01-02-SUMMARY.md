---
phase: 01-data-foundation
plan: 02
subsystem: database
tags: [typescript, google-sheets, mock-data, normal-distribution, anonymization, grades, parallel-fetch]

# Dependency graph
requires:
  - phase: 01-01
    provides: "StudentGrade 인터페이스, ClassCode, GradeDataResult 타입, parseGradeRow, anonymizeName, anonymizeStudentId, PO_THRESHOLDS"
provides:
  - mockGradeData: 정규분포 기반 126명(3반 x 42명) 학생 mock 데이터, 각 반 최소 3명 하 등급 포함
  - getMockForClass: 반별 mock 데이터 반환 (개별 시트 폴백용)
  - getGradeData: Google Sheets 3반 병렬 페칭 + 개별 반/전체 폴백 통합 함수
  - dataSource 필드: 'sheets' | 'partial-mock' | 'mock' — Phase 2 경고 배너 기반 데이터
affects:
  - Phase 2 (UI 컴포넌트 — getGradeData() 호출, dataSource 배너 표시)
  - Phase 3 (분석 로직 — getGradeData()로 전체 학생 데이터 접근)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Box-Muller 변환 정규분포 패턴 — 외부 랜덤 라이브러리 없이 현실적 mock 데이터 생성"
    - "개별 반 catch(() => null) 패턴 — Promise.all 중 일부 실패 시 전체 실패 방지"
    - "parseClassRows 헬퍼 — 성공/실패 결과를 StudentGrade[] + usedMock 페어로 추상화"
    - "ensureLowGradeStudents — 정규분포 생성 후 하 등급 학생 최솟값 보장"

key-files:
  created:
    - lib/mock-grade-data.ts
    - lib/grade-data.ts
  modified: []

key-decisions:
  - "mockGradeData는 모듈 로드 시 1회 생성 — 매 호출마다 다른 데이터 생성 방지"
  - "classOffset(0/1000/2000) seed 패턴으로 반마다 독립적인 이름/병원 패턴 확보"
  - "parseClassRows 반환 타입 { students, usedMock }으로 dataSource 결정 로직을 getGradeData에서 명확히 분리"
  - "DATA_RANGE = 'A4:AD' — 헤더 3행 제외, 실제 시트 구조에 맞춰 4행부터 읽기"

patterns-established:
  - "3-레이어 성적 데이터 패턴: types/grades.ts → lib/grade-parser.ts → lib/grade-data.ts"
  - "개별 폴백 패턴: fetchSheetData().catch(() => null) → parseClassRows에서 null 감지 → getMockForClass 대체"
  - "dataSource 필드로 UI 레이어에 폴백 상태 투명하게 전달"

requirements-completed: [DATA-01, DATA-04]

# Metrics
duration: 3min
completed: 2026-02-22
---

# Phase 1 Plan 02: Data Foundation Summary

**정규분포 기반 126명 학생 mock 데이터와 Google Sheets 3반 병렬 페칭 + 개별/전체 폴백 통합 레이어 — dataSource 필드로 Phase 2 배너 기반 완성**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-21T18:51:41Z
- **Completed:** 2026-02-21T18:54:44Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- lib/mock-grade-data.ts: Box-Muller 정규분포로 126명(3반 x 42명) 학생 성적 데이터 생성, 각 반 최소 3명 하 등급 보장
- lib/grade-data.ts: getGradeData() — isGoogleSheetsConfigured() 체크 → Promise.all 3반 병렬 페칭 → 개별 반 폴백 → 전체 catch 폴백
- dataSource 필드('sheets' | 'partial-mock' | 'mock')로 Phase 2 "목 데이터 사용 중" 배너의 데이터 기반 제공
- `npx tsc --noEmit` 타입 에러 없음, `npm run build` 프로덕션 빌드 통과, 기존 lib/data.ts 영향 없음

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: 정규분포 기반 Mock 학생 성적 데이터 생성** - `2d03176` (feat)
2. **Task 2: 3반 병렬 페칭 통합 레이어 구현** - `b6f90f7` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `lib/mock-grade-data.ts` - gaussianRandom, generateStudent, ensureLowGradeStudents, mockGradeData, getMockForClass
- `lib/grade-data.ts` - parseClassRows 헬퍼, getGradeData() 통합 함수 (fetchSheetData + parseGradeRow + mock 폴백)

## Decisions Made
- `mockGradeData`는 모듈 로드 시 1회 생성 — Math.random() 기반이나 매 호출마다 변경되지 않도록 상수로 고정
- `classOffset` seed 패턴(A=0, B=1000, C=2000)으로 반마다 다른 이름/병원 할당 — 현실적 다양성 확보
- `parseClassRows` 헬퍼를 별도 함수로 분리 — usedMock 플래그를 통해 dataSource 결정 로직 명확화
- `DATA_RANGE = 'A4:AD'` — 헤더 행 3줄 제외, 4행부터 끝까지 읽기 (PLAN.md 명세 기반)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness
- Phase 2 UI 컴포넌트에서 `getGradeData()` 호출하여 즉시 데이터 사용 가능
- `dataSource` 필드로 "목 데이터 사용 중" 배너 표시 로직 구현 가능
- 기존 Google Sheets COL 열 인덱스 검증 필요 (Blocker 유지 — Phase 1 완료 후 실측 권장)

---
*Phase: 01-data-foundation*
*Completed: 2026-02-22*
