# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** 교수가 학습성과 달성도와 성적 분포를 시각적으로 분석하여 공정한 상대평가와 인증평가 보고를 효율적으로 할 수 있어야 한다
**Current focus:** Phase 2 - Core Dashboard

## Current Position

Phase: 2 of 4 (Core Dashboard)
Plan: 1 of 2 in current phase
Status: Phase 2 Plan 01 완료 — Plan 02 (히스토그램 차트) 진행 준비
Last activity: 2026-02-22 — Plan 01 (KPI 카드 + Mock 배너) 완료

Progress: [███░░░░░░░] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 2.7 min
- Total execution time: 0.13 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-data-foundation | 2 | 5 min | 2.5 min |
| 02-core-dashboard | 1 | 3 min | 3 min |

**Recent Trend:**
- Last 5 plans: 2 min, 3 min, 3 min
- Trend: stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: 기존 매출 대시보드 코드베이스를 성적 대시보드로 교체 (스택 유지, 데이터 레이어 교체)
- [Init]: 학생 이름 데이터 파싱 시점에 익명화 — UI 레이어가 아닌 grade-parser.ts에서 처리
- [Init]: Google Sheets 연결 실패 시 mock 폴백, dataSource 배너로 명시
- [01-01]: totalScore = practiceTotal + attendance 직접 합산 — 시트 합계 열(AA)의 조정 열 영향 배제
- [01-01]: COL 상수에 열 인덱스 검증 경고 추가 — AB/AC/AD 열 실측 필요
- [01-01]: PO 임계값 85%/60% 적용 (CONTEXT.md 기준)
- [01-02]: mockGradeData는 모듈 로드 시 1회 생성 — 매 호출마다 다른 데이터 생성 방지
- [01-02]: parseClassRows 헬퍼로 usedMock 플래그 추적 — dataSource 결정 로직 명확화
- [01-02]: DATA_RANGE = 'A4:AD' — 헤더 3행 제외, 4행부터 읽기
- [02-01]: 컷라인 계산 Math.ceil(n * 0.4) - 1 인덱스 — 상위 40%의 하한 경계점
- [02-01]: 최고점/최저점 reduce 패턴으로 빈 배열 -Infinity/Infinity 방지
- [02-01]: 반별 평균을 총 학생수 카드 description에 병합 — 카드 수 6개 유지
- [02-01]: GradeKpiData 타입을 types/grades.ts에 추가 (기존 패턴 준수)

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: 실제 Google Sheet의 정확한 열 구조(column-index map)를 개발환경에서 `fetchSheetData('A반!A1:Z3')` 실행하여 확인 필요 — 파서 상수 정의 전 필수
- [Phase 3]: 85%/60% 달성도 임계값 및 LO2(64점)/LO5(8점)/LO3(8점) 기준이 실제 기관 인증 기준과 일치하는지 교수 확인 필요

## Session Continuity

Last session: 2026-02-22
Stopped at: Completed 02-01-PLAN.md (KPI 카드 + Mock 배너 + dashboard page 교체)
Resume file: .planning/phases/02-core-dashboard/02-02-PLAN.md
