---
status: complete
phase: 04-student-lookup-class-comparison
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-02-23T12:00:00Z
updated: 2026-02-23T12:08:00Z
---

## Current Test

[testing complete]

## Tests

### 1. 사이드바 학생 조회 링크
expected: 사이드바에 "학생 조회" 링크가 Users 아이콘과 함께 표시되고, 클릭하면 /students 페이지로 이동합니다.
result: pass

### 2. 학생 성적 테이블 표시
expected: /students 페이지에 학생 목록 테이블이 표시됩니다. 열: 이름, 학번, 반, 사전학습, 보고서, 실습지도교수, 현장지도자, 총점, 핵심간호술. 핵심간호술 열은 파란색 텍스트로 구분됩니다.
result: pass

### 3. 반별 필터 동작
expected: 테이블 상단에 전체/A반/B반/C반 필터 버튼이 있고, 각 버튼 클릭 시 해당 반 학생만 필터링됩니다. 선택된 버튼은 시각적으로 구분됩니다.
result: pass

### 4. 이름/학번 검색
expected: 검색 입력창에 이름 또는 학번을 입력하면 실시간으로 테이블이 필터링됩니다. 결과가 없으면 "검색 결과가 없습니다" 메시지가 표시됩니다.
result: pass

### 5. 학생 순위 BarChart
expected: 총점 기준 내림차순 순위 막대 차트가 표시됩니다. 반별로 다른 색상이 적용되고, 상위 40% 컷라인이 빨간 점선으로 표시됩니다. 막대 위에 마우스를 올리면 순위/이름/반/총점 정보가 툴팁으로 나타납니다.
result: pass

### 6. 사이드바 반별 비교 링크
expected: 사이드바에 "반별 비교" 링크가 표시되고, 클릭하면 /class-comparison 페이지로 이동합니다.
result: pass

### 7. 반별 비교 grouped BarChart
expected: /class-comparison 페이지에 A/B/C반의 평균, 최고점, 최저점을 비교하는 grouped 막대 차트가 표시됩니다. 반별로 다른 색상이 적용됩니다.
result: pass

### 8. 핵심간호술 KPI 카드
expected: 반별 비교 페이지 하단에 핵심간호술 관련 KPI 카드가 4개 표시됩니다 (A반/B반/C반/전체). "총점 미포함" 문구가 명시되어 있습니다. 전체 카드는 테두리로 강조 표시됩니다.
result: issue
reported: "점수가 최고 최저 다 0점이야"
severity: major

## Summary

total: 8
passed: 7
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "핵심간호술 KPI 카드에 반별+전체 최고점/최저점이 정확한 값으로 표시됨"
  status: failed
  reason: "User reported: 점수가 최고 최저 다 0점이야"
  severity: major
  test: 8
  root_cause: "Google Sheets 핵심간호술 열(AD, index 29)이 비어있거나 열 매핑이 실제 시트와 불일치 — getNum()이 빈 셀/NaN을 0으로 변환하여 모든 nursingSkills가 0이 됨"
  artifacts:
    - path: "lib/grade-parser.ts"
      issue: "COL.NURSING_SKILLS=29 (AD열) 매핑이 실제 시트와 일치하는지 미검증"
    - path: "lib/grade-data.ts"
      issue: "DATA_RANGE='A4:AD' — AD열까지 페칭하지만 실제 시트에 핵심간호술 데이터 존재 여부 불명"
  missing:
    - "실제 Google Sheets 핵심간호술 열 위치 및 데이터 존재 여부 확인"
    - "열 매핑 불일치 시 COL.NURSING_SKILLS 인덱스 수정"
  debug_session: ""
