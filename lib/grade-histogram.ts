// 히스토그램 데이터 변환 유틸
// 학생 성적 배열을 10점 단위 구간별 반별 학생 수 데이터로 변환한다
// 순수 함수, 서버사이드 전용 (외부 의존성 없음)

import type { StudentGrade } from '@/types/grades';

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

/**
 * 히스토그램 데이터 포인트
 * - 10점 단위 구간별 반별 학생 수
 * - JSON 직렬화 가능 (Server → Client Component props 전달 가능)
 */
export interface HistogramDataPoint {
  /** 점수 구간 레이블 — "0-9", "10-19", ..., "90-100" */
  range: string;
  /** A반 학생 수 */
  A: number;
  /** B반 학생 수 */
  B: number;
  /** C반 학생 수 */
  C: number;
}

// ---------------------------------------------------------------------------
// 구간 정의
// ---------------------------------------------------------------------------

/**
 * 11개 점수 구간 정의
 * - 인덱스 0~9: 0-9, 10-19, ..., 80-89 (각 10점 범위)
 * - 인덱스 10: 90-100 (11점 범위 — 100점 포함)
 */
const SCORE_RANGES: Array<{ label: string; low: number; high: number }> = [
  { label: '0-9', low: 0, high: 9 },
  { label: '10-19', low: 10, high: 19 },
  { label: '20-29', low: 20, high: 29 },
  { label: '30-39', low: 30, high: 39 },
  { label: '40-49', low: 40, high: 49 },
  { label: '50-59', low: 50, high: 59 },
  { label: '60-69', low: 60, high: 69 },
  { label: '70-79', low: 70, high: 79 },
  { label: '80-89', low: 80, high: 89 },
  { label: '90-100', low: 90, high: 100 },
];

// ---------------------------------------------------------------------------
// 메인 함수
// ---------------------------------------------------------------------------

/**
 * 학생 성적 배열을 히스토그램 데이터로 변환한다.
 *
 * @param students - 전체 학생 성적 배열 (모든 반 포함)
 * @returns 10개 구간의 반별 학생 수 데이터 배열
 *
 * @example
 * const data = buildHistogramData(students);
 * // [{ range: "0-9", A: 0, B: 0, C: 0 }, ..., { range: "90-100", A: 5, B: 3, C: 4 }]
 */
export function buildHistogramData(students: StudentGrade[]): HistogramDataPoint[] {
  return SCORE_RANGES.map(({ label, low, high }) => ({
    range: label,
    // 각 반별로 해당 구간에 속하는 학생 수 카운트
    // >= low && <= high: 경계값 포함, 구간 간 겹침 없음 (consecutive exclusive ranges)
    A: students.filter(
      (s) => s.classCode === 'A' && s.totalScore >= low && s.totalScore <= high
    ).length,
    B: students.filter(
      (s) => s.classCode === 'B' && s.totalScore >= low && s.totalScore <= high
    ).length,
    C: students.filter(
      (s) => s.classCode === 'C' && s.totalScore >= low && s.totalScore <= high
    ).length,
  }));
}

// ---------------------------------------------------------------------------
// 컷라인 구간 탐색
// ---------------------------------------------------------------------------

/**
 * 컷라인 점수가 속하는 히스토그램 구간 레이블을 반환한다.
 * - HistogramDataPoint.range 값과 정확히 일치하도록 SCORE_RANGES에서 유도
 *
 * @param cutlineScore - 컷라인 점수 (예: 73.5)
 * @returns 해당 구간 레이블 (예: "70-79")
 *
 * @example
 * findCutlineRange(73.5) // "70-79"
 * findCutlineRange(90)   // "90-100"
 * findCutlineRange(100)  // "90-100"
 */
export function findCutlineRange(cutlineScore: number): string {
  // 90 이상은 마지막 구간
  if (cutlineScore >= 90) return '90-100';

  // 10점 단위 구간 하한 계산 → 해당 구간 레이블 반환
  const low = Math.floor(cutlineScore / 10) * 10;
  const high = low + 9;
  return `${low}-${high}`;
}
