# Roadmap: 간호학과 아동실습 성적 대시보드

## Overview

기존 매출 대시보드 코드베이스를 간호학과 아동실습 성적 분석 도구로 교체한다. 데이터 레이어(3행 병합 헤더 파싱, 익명화, 폴백)를 먼저 검증한 뒤, 핵심 KPI 뷰와 상대평가 컷라인을 제공하고, 이어서 학습성과 달성도 분석(인증평가 핵심 아티팩트)을 구축하며, 마지막으로 학생 조회와 반 간 비교로 완성한다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Data Foundation** - Google Sheets 3반 파싱·익명화·폴백 데이터 레이어 구축
- [x] **Phase 2: Core Dashboard** - KPI 요약·성적 분포 히스토그램·상대평가 40% 컷라인 뷰 (completed 2026-02-22)
- [x] **Phase 3: Learning Outcomes** - 학습성과 상/중/하 달성도 분석 (인증평가 핵심) (completed 2026-02-23)
- [ ] **Phase 4: Student Lookup and Class Comparison** - 학생 검색·순위 차트·반 간 비교·핵심간호술

## Phase Details

### Phase 1: Data Foundation
**Goal**: 성적 데이터가 Google Sheets 3개 시트에서 정확하게 파싱되어 타입화된 StudentGrade 배열로 흐른다 — 익명화·폴백·컷라인 계산이 올바르게 작동하며, 이후 모든 UI 단계의 신뢰할 수 있는 기반이 된다
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. 앱이 A반/B반/C반 시트에서 학생 데이터를 병렬로 페칭하여 화면에 학생 수가 표시된다
  2. 3행 병합 헤더가 파싱되어 사전학습·보고서·실습교수·현장지도자·학습성과·출석·핵심간호술 점수가 각각 올바른 열에 매핑된다
  3. 화면에 표시되는 모든 학생 이름이 "김*훈" 형태로 익명 처리되어 있으며 원본 이름은 클라이언트에 전달되지 않는다
  4. Google Sheets 연결 실패 시 목 데이터로 폴백되며 `dataSource` 필드가 `'mock'`으로 설정된다 (UI 배너는 Phase 2에서 `dataSource` 값을 읽어 표시)
**Plans**: 2 plans
Plans:
- [x] 01-01-PLAN.md — 학생 성적 타입 정의 + 열 인덱스 파서 + 익명화 함수
- [x] 01-02-PLAN.md — Mock 데이터 생성 + 3반 병렬 페칭 통합 레이어

### Phase 2: Core Dashboard
**Goal**: 교수가 대시보드 첫 화면에서 전체 KPI, 반별 성적 분포, 상대평가 A 컷라인을 한눈에 파악할 수 있다
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. 교수가 대시보드 진입 시 총 학생 수·반별 평균·전체 평균·최고점·최저점·표준편차 KPI 카드를 즉시 확인할 수 있다
  2. 반별 성적 분포 히스토그램에서 10점 단위 구간별 학생 수를 시각적으로 파악할 수 있다
  3. 반별 상위 40% 경계선이 히스토그램 또는 순위 차트에 "A 이상 40% 컷라인" 레이블과 함께 명확히 표시된다
  4. 다크모드/라이트모드 전환이 작동하며 데스크톱과 태블릿 화면에서 레이아웃이 깨지지 않는다
  5. Google Sheets 연결 실패(dataSource가 'mock' 또는 'partial-mock')일 때 상단에 "목 데이터 사용 중" 경고 배너가 표시된다
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — KPI 계산 유틸 + KPI 카드 6개 + Mock 배너 + page.tsx 교체
- [x] 02-02-PLAN.md — 반별 성적 분포 히스토그램 + 컷라인 시각화 + 반응형 레이아웃

### Phase 3: Learning Outcomes
**Goal**: 교수가 학습성과별(대상자간호 LO2·안전과질 LO5·전문직 LO3) 상/중/하 달성 현황을 반별·전체 기준으로 조회하고, 하 등급 학생의 세부 점수를 익명 상태로 드릴다운할 수 있다
**Depends on**: Phase 1
**Requirements**: LO-01, LO-02, LO-03, LO-04
**Success Criteria** (what must be TRUE):
  1. 학습성과 페이지에서 LO2(64점 만점)·LO5(8점 만점)·LO3(8점 만점) 각각의 상/중/하 인원 수와 비율이 A반·B반·C반·전체 열로 표시된다
  2. 각 학습성과에 "달성" 또는 "미달성" 배지가 표시된다 (중 이상 비율 80% 이상이면 달성)
  3. 하 등급 학생 목록이 익명 처리된 상태로 조회 가능하다
  4. 하 등급 학생을 선택하면 사전학습·보고서·실습교수·현장지도자·해당 학습성과 세부점수가 표시된다
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md — PO 집계 유틸 + 분포표 + 학습성과 페이지 + 사이드바 링크
- [x] 03-02-PLAN.md — 하 등급 학생 드릴다운 패널 + 페이지 통합

### Phase 4: Student Lookup and Class Comparison
**Goal**: 교수가 개별 학생을 검색·조회하고, 전체 순위와 40% 컷라인을 시각적으로 확인하며, A/B/C반 간 성적 분포를 나란히 비교할 수 있다
**Depends on**: Phase 2, Phase 3
**Requirements**: STUD-01, STUD-02, COMP-01, COMP-02
**Success Criteria** (what must be TRUE):
  1. 교수가 반별 필터와 이름/학번 검색으로 개별 학생 성적(전 항목)을 테이블에서 조회할 수 있다
  2. 전체 학생 순위 차트에서 총점 기준 순위와 40% 컷라인 경계선이 시각적으로 표시된다
  3. A반·B반·C반의 평균·분포를 나란히 비교하는 차트를 확인할 수 있다
  4. 핵심간호술(100점 만점 별도 평가) 점수가 총점과 분리되어 독립적으로 표시된다
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 2/2 | Complete | 2026-02-22 |
| 2. Core Dashboard | 2/2 | Complete    | 2026-02-22 |
| 3. Learning Outcomes | 2/2 | Complete | 2026-02-23 |
| 4. Student Lookup and Class Comparison | 0/TBD | Not started | - |
