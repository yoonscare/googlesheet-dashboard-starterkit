# Requirements: 간호학과 아동실습 성적 대시보드

**Defined:** 2026-02-22
**Core Value:** 교수가 학습성과 달성도와 성적 분포를 시각적으로 분석하여 공정한 상대평가와 인증평가 보고를 효율적으로 할 수 있어야 한다.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data Foundation

- [ ] **DATA-01**: 시스템이 Google Sheets 3개 시트(A반, B반, C반)에서 성적 데이터를 페칭할 수 있다
- [ ] **DATA-02**: 시스템이 3행 병합 헤더 구조를 정확히 파싱하여 각 열을 올바른 항목에 매핑할 수 있다
- [ ] **DATA-03**: 시스템이 학생 이름을 데이터 레이어에서 익명 처리(김*훈 형태)하여 원본 이름이 클라이언트에 전달되지 않는다
- [ ] **DATA-04**: Google Sheets 연결 실패 시 시스템이 목 데이터로 폴백하며, 목 데이터임을 명확히 표시한다

### Dashboard Overview

- [ ] **DASH-01**: 교수가 대시보드 진입 시 KPI 요약 카드(총 학생수, 반별 평균, 전체 평균, 최고점, 최저점, 표준편차)를 한 눈에 확인할 수 있다
- [ ] **DASH-02**: 교수가 반별 성적 분포 히스토그램을 통해 점수대별 학생 수를 파악할 수 있다
- [ ] **DASH-03**: 교수가 반별 상위 40% 컷라인(상대평가 A등급 경계선)을 차트에서 시각적으로 확인할 수 있다

### Learning Outcomes (학습성과 — 핵심)

- [ ] **LO-01**: 교수가 학습성과별(학습성과2 대상자간호 64점, 학습성과5 안전과질 8점, 학습성과3 전문직 8점) 상/중/하 인원 분포를 반별 + 전체 기준으로 확인할 수 있다
- [ ] **LO-02**: 각 학습성과에 대해 중 이상 학생 비율(달성률 %)이 표시되고, 80% 이상이면 '달성', 미만이면 '미달성' 배지가 표시된다
- [ ] **LO-03**: 교수가 학습성과별 하 등급 학생 목록을 익명 처리된 상태로 조회할 수 있다
- [ ] **LO-04**: 하 등급 학생의 각 평가 항목별 점수 상세(사전학습, 보고서, 실습교수, 현장지도자, 해당 학습성과 세부점수)를 확인할 수 있다

### Student Management

- [ ] **STUD-01**: 교수가 전체 학생 성적 테이블에서 반별 필터링과 이름/학번 검색을 통해 개별 학생 성적을 조회할 수 있다
- [ ] **STUD-02**: 교수가 총점 기준 순위 차트에서 전체 학생의 순위와 40% 컷라인 경계를 시각적으로 확인할 수 있다

### Class Comparison

- [ ] **COMP-01**: 교수가 A/B/C반의 평균, 분포를 나란히 비교하는 차트를 확인할 수 있다
- [ ] **COMP-02**: 핵심간호술(100점 만점 별도 평가) 데이터가 총점과 분리되어 별도로 추적·표시된다

### UI/UX

- [ ] **UI-01**: 대시보드가 다크모드/라이트모드를 지원한다
- [ ] **UI-02**: 대시보드가 데스크톱/태블릿에서 반응형으로 표시된다

## v2 Requirements

### Enhanced Analytics

- **ENH-01**: 학생별 레이더 차트로 항목별 강약점 시각화
- **ENH-02**: 항목별(사전학습/보고서/실습교수/현장지도자) 점수 분포 상세 차트
- **ENH-03**: 학습성과별 하 학생 관리 이력(개선 계획 등) 기록 기능

### Export

- **EXP-01**: 학습성과 달성도 리포트 PDF/CSV 내보내기
- **EXP-02**: 인쇄용 성적 보고서 형식

## Out of Scope

| Feature | Reason |
|---------|--------|
| 자동 등급 부여 (A+/A/B+...) | A+/A 구분이 교수 재량이므로 컷라인 참고용만 제공 |
| 학생 직접 열람 | 교수 전용 대시보드, 학생 접근 시 별도 인증 체계 필요 |
| 성적 입력/수정 | Google Sheets가 원본, 대시보드는 읽기 전용 |
| 실시간 WebSocket 갱신 | API 제한, 새로고침으로 충분 |
| 과거 학기 비교 | 과거 데이터 미보유, v2+ 검토 |
| AI 예측/추천 | 40명 표본으로 통계적 유의미성 부족 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| LO-01 | Phase 3 | Pending |
| LO-02 | Phase 3 | Pending |
| LO-03 | Phase 3 | Pending |
| LO-04 | Phase 3 | Pending |
| STUD-01 | Phase 4 | Pending |
| STUD-02 | Phase 4 | Pending |
| COMP-01 | Phase 4 | Pending |
| COMP-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 — traceability updated to match 4-phase roadmap (COMP-01/02 moved from Phase 5 to Phase 4)*
