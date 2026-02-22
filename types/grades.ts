// 학생 성적 도메인 타입 정의
// Google Sheets에서 파싱한 성적 데이터의 타입 시스템

/** 반 코드 — A반, B반, C반 */
export type ClassCode = 'A' | 'B' | 'C';

/** 학습성과 등급 — 상(85% 이상)/중(60-85%)/하(60% 미만) */
export type PoGrade = '상' | '중' | '하';

/** 데이터 출처 — 폴백 상태 표시용 */
export type DataSource = 'sheets' | 'mock' | 'partial-mock';

/**
 * 학생 성적 인터페이스
 * - 이름/학번은 grade-parser.ts에서 익명화 후 저장됨
 * - 총점 = 실습성적(80) + 출석(20) = 100점 만점
 * - 핵심간호술은 별도 평가로 총점에 미포함
 */
export interface StudentGrade {
  // 기본 정보 (익명화됨)
  /** 익명화된 이름 (예: 김*우) */
  name: string;
  /** 익명화된 학번 (예: 2020***16) */
  studentId: string;
  /** 반 코드 */
  classCode: ClassCode;
  /** 실습 기관명 (원본 그대로) */
  hospital: string;

  // 점수 항목
  /** 사전학습 소계 — 만점 10점 */
  preLearning: number;
  /** 보고서 소계 — 만점 30점 (셀프/케이스/교육인/체크/대상 합산) */
  reportTotal: number;
  /** 실습지도교수 소계 — 만점 20점 (대상12 + 안전4 + 전문4) */
  profTotal: number;
  /** 현장지도자 소계 — 만점 20점 (대상12 + 안전4 + 전문4) */
  fieldTotal: number;
  /** 실습성적 합계 — 만점 80점 (사전학습+보고서+지도교수+현장지도자) */
  practiceTotal: number;
  /** 출석 점수 — 만점 20점 */
  attendance: number;
  /** 총점 — 만점 100점 (실습성적80 + 출석20) */
  totalScore: number;

  // 학습성과 점수 (시트 수식으로 계산됨 — 그대로 사용)
  /** 학습성과2 (대상자간호) — 만점 64점 */
  po2: number;
  /** 학습성과5 (안전과질) — 만점 8점 */
  po5: number;
  /** 학습성과3 (전문직) — 만점 8점 */
  po3: number;

  // 별도 평가
  /** 핵심간호술 점수 — 만점 100점, 총점 미포함 */
  nursingSkills: number;
}

/**
 * 성적 데이터 결과 인터페이스
 * - 학생 배열과 데이터 출처를 함께 반환
 */
export interface GradeDataResult {
  students: StudentGrade[];
  dataSource: DataSource;
}

/**
 * 대시보드 KPI 데이터 인터페이스
 * - computeGradeKpi()로 계산된 집계 지표 모음
 */
export interface GradeKpiData {
  /** 전체 학생 수 */
  totalStudents: number;
  /** 반별 평균 점수 (소수점 1자리) */
  classAverages: Record<ClassCode, number>;
  /** 전체 평균 점수 (소수점 1자리) */
  overallAverage: number;
  /** 최고점 */
  highest: number;
  /** 최저점 */
  lowest: number;
  /** 표준편차 (소수점 1자리) */
  stdDev: number;
  /** 반별 상위 40% 컷라인 점수 */
  cutlines: Record<ClassCode, number>;
}
