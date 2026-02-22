# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** 교수가 학습성과 달성도와 성적 분포를 시각적으로 분석하여 공정한 상대평가와 인증평가 보고를 효율적으로 할 수 있어야 한다
**Current focus:** Phase 3 - Learning Outcomes

## Current Position

Phase: 3 of 4 (Learning Outcomes — PO 달성도 분석)
Plan: 1 of 2 완료 — Plan 01(분포표 + 사이드바) 완료, Plan 02(드릴다운 패널) 진행 준비
Status: Phase 3 Plan 01 완료
Last activity: 2026-02-23 — Plan 01 (PO 분포 집계 유틸 + 분포표 + 학습성과 페이지) 완료

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 2.8 min
- Total execution time: 0.19 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-data-foundation | 2 | 5 min | 2.5 min |
| 02-core-dashboard | 2 | 5 min | 2.5 min |
| 03-learning-outcomes | 1 | 3 min | 3 min |

**Recent Trend:**
- Last 5 plans: 2 min, 3 min, 3 min, 2 min, 3 min
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
- [Phase 02-02]: SCORE_RANGES 상수 배열로 구간 정의 — buildHistogramData()와 findCutlineRange() 동일 레이블 참조
- [Phase 02-02]: 대표 컷라인 = Math.round((A+B+C)/3) — 반별 평균으로 단일 ReferenceLine 시각화
- [Phase 02-02]: Recharts SVG에서 CSS 변수 불가 → hsl 직접 값 사용 (category-chart.tsx 패턴)
- [03-01]: achieved 판정은 achieveRate가 아닌 raw 비율 (high + mid) / total >= 0.8 사용 — 부동소수점 반올림 엣지케이스 방지
- [03-01]: computeDistribution()은 export하지 않음 — 내부 헬퍼, 외부 API는 computePoAchievement()와 getLowGradeStudents()로 제한
- [03-01]: 분포표는 테이블로 구현 — 차트 시각화는 v2 ENH-01에서 추가 예정
- [03-01]: GraduationCap 아이콘을 학습성과 사이드바 링크에 사용 (기존 lucide-react 설치분)

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: 실제 Google Sheet의 정확한 열 구조(column-index map)를 개발환경에서 `fetchSheetData('A반!A1:Z3')` 실행하여 확인 필요 — 파서 상수 정의 전 필수
- [Phase 3]: 85%/60% 달성도 임계값 및 LO2(64점)/LO5(8점)/LO3(8점) 기준이 실제 기관 인증 기준과 일치하는지 교수 확인 필요

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 03-01-PLAN.md (PO 분포 집계 유틸 + 분포표 + 학습성과 페이지 + 사이드바 링크)
Resume file: .planning/phases/03-learning-outcomes/03-02-PLAN.md (PoLowGradePanel 드릴다운 패널)
