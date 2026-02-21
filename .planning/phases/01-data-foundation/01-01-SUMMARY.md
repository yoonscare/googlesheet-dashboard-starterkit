---
phase: 01-data-foundation
plan: 01
subsystem: database
tags: [typescript, google-sheets, data-parsing, anonymization, grades]

# Dependency graph
requires: []
provides:
  - StudentGrade 인터페이스 (14개 필드) — 전체 데이터 레이어의 핵심 타입
  - ClassCode, PoGrade, DataSource, GradeDataResult 타입
  - COL 열 인덱스 상수 (30개, 0-based)
  - parseGradeRow: string[] 행 → StudentGrade 변환 함수
  - anonymizeName, anonymizeStudentId: 이름/학번 파싱 시점 익명화
  - PO_THRESHOLDS, getPoGrade, isAchieved: 학습성과 등급 유틸
affects:
  - 01-02 (mock 데이터 생성 — StudentGrade 타입 의존)
  - Phase 2 (UI 컴포넌트 — StudentGrade 타입 의존)
  - Phase 3 (분석 로직 — PO_THRESHOLDS, isAchieved 의존)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "순수 함수 파서 패턴 — 외부 라이브러리 없이 네이티브 TypeScript"
    - "파싱 시점 익명화 — 원본 이름/학번이 UI 레이어에 도달하지 않음"
    - "COL as const 객체 — 열 인덱스를 상수로 집중 관리"

key-files:
  created:
    - types/grades.ts
    - lib/grade-parser.ts
  modified: []

key-decisions:
  - "parseGradeRow에서 totalScore = practiceTotal + attendance 직접 합산 (시트 합계 열 무시, 조정 열 배제)"
  - "COL 상수에 '실제 시트 검증 후 인덱스 조정 필요' 경고 주석 추가 — AB~AD 열 실제 위치 미확인"
  - "PO 임계값: 상 85%이상/중 60~85%/하 60%미만 (CONTEXT.md 기준 그대로 적용)"
  - "isAchieved: 중 이상 비율 80% 이상을 달성으로 판정"

patterns-established:
  - "타입 정의는 types/ 디렉터리에 도메인별로 분리 (grades.ts, dashboard.ts 공존)"
  - "파서 함수는 lib/ 에 순수 함수로 구현, 외부 상태 없음"

requirements-completed: [DATA-02, DATA-03]

# Metrics
duration: 2min
completed: 2026-02-22
---

# Phase 1 Plan 01: Data Foundation Summary

**StudentGrade 타입 시스템과 Google Sheets 행 파서, 이름/학번 익명화, 학습성과 등급 유틸을 순수 TypeScript로 구축**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T18:46:12Z
- **Completed:** 2026-02-21T18:48:52Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- types/grades.ts에 StudentGrade 인터페이스(14개 필드), ClassCode/PoGrade/DataSource/GradeDataResult 타입 정의
- lib/grade-parser.ts에 COL 열 인덱스 상수(30개), parseGradeRow 파서, 익명화 함수 2개, 학습성과 유틸 3개 구현
- 익명화 함수 7개 케이스 검증 (2글자/3글자/4글자 이름, 학번, 빈값/단글자 엣지 케이스)
- 전체 프로젝트 `npx tsc --noEmit` 컴파일 에러 없음

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: 학생 성적 타입 정의** - `d5f3c12` (feat)
2. **Task 2: 열 인덱스 상수 + 파서 + 익명화 + 학습성과 등급 유틸** - `86036cd` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `types/grades.ts` - StudentGrade 인터페이스, ClassCode/PoGrade/DataSource/GradeDataResult 타입
- `lib/grade-parser.ts` - COL 상수, parseGradeRow, anonymizeName, anonymizeStudentId, PO_THRESHOLDS, getPoGrade, isAchieved

## Decisions Made
- `totalScore`는 시트 합계 열(AA)을 그대로 쓰지 않고 `practiceTotal + attendance` 직접 합산 — 조정 열(AC) 영향 배제
- COL 상수에 "실제 시트 검증 후 인덱스 조정 필요" 경고 주석 명시 — AB~AD 열은 CONTEXT.md에서 "AB~: 출석, 조정, 핵심간호술" 순으로 언급되어 있어 AC=28(조정), AD=29(핵심간호술)로 추정
- PO 임계값은 CONTEXT.md 기준을 그대로 적용 (po2 상>=54.4/중>=38.4, po5/po3 상>=6.8/중>=4.8)

## Deviations from Plan

없음 — 계획대로 정확하게 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness
- 01-02 플랜(Mock 데이터 생성)이 StudentGrade 타입과 parseGradeRow에 의존 — 즉시 진행 가능
- 실제 Google Sheet 연결 후 COL 상수의 AB/AC/AD 열 인덱스 실측 검증 필요 (기존 Blocker 유지)
- Phase 2 UI 컴포넌트 개발 시 types/grades.ts import 시작 가능

---
*Phase: 01-data-foundation*
*Completed: 2026-02-22*
