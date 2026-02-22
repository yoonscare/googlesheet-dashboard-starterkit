// 반별 성적 비교 + 핵심간호술 집계 유틸
// 순수 함수, 서버사이드 전용 (외부 의존성 없음)

import type { StudentGrade, ClassCode } from '@/types/grades';

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

/**
 * Recharts grouped BarChart에 직접 사용하는 반별 비교 데이터 포인트
 * - metric: 지표명 (평균/최고점/최저점)
 * - A/B/C: 각 반의 해당 지표 점수
 */
export interface ClassComparisonData {
  metric: string;
  A: number;
  B: number;
  C: number;
}

/**
 * 핵심간호술 반별/전체 통계
 * - classCode: 반 코드 또는 'all' (전체)
 * - average: 평균 점수 (소수점 1자리)
 * - highest: 최고점
 * - lowest: 최저점
 * - count: 학생 수
 */
export interface NursingSkillsStats {
  classCode: ClassCode | 'all';
  average: number;
  highest: number;
  lowest: number;
  count: number;
}

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * 소수점 1자리로 반올림한다.
 * - Math.round(x * 10) / 10 패턴
 */
function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

/**
 * 점수 배열에서 반별 통계를 계산한다.
 * - 빈 배열이면 { avg: 0, max: 0, min: 0 } 반환 (안전 처리)
 * - 최고점/최저점: reduce 패턴으로 빈 배열 -Infinity/Infinity 방지
 */
function calcStats(scores: number[]): { avg: number; max: number; min: number } {
  if (scores.length === 0) {
    return { avg: 0, max: 0, min: 0 };
  }

  const sum = scores.reduce((s, v) => s + v, 0);
  const avg = round1(sum / scores.length);
  const max = scores.reduce((m, v) => (v > m ? v : m), scores[0]);
  const min = scores.reduce((m, v) => (v < m ? v : m), scores[0]);

  return { avg, max, min };
}

// ---------------------------------------------------------------------------
// 반별 비교 함수
// ---------------------------------------------------------------------------

/**
 * 학생 배열에서 반별 평균/최고점/최저점 비교 데이터를 생성한다.
 *
 * @param students - 전체 학생 성적 배열 (모든 반 포함)
 * @returns ClassComparisonData[] — [{ metric: '평균', A, B, C }, { metric: '최고점', ... }, { metric: '최저점', ... }]
 */
export function buildClassComparisonData(students: StudentGrade[]): ClassComparisonData[] {
  const classCodes: ClassCode[] = ['A', 'B', 'C'];

  // 반별 총점 배열 계산
  const classScores = {} as Record<ClassCode, number[]>;
  for (const cls of classCodes) {
    classScores[cls] = students
      .filter((s) => s.classCode === cls)
      .map((s) => s.totalScore);
  }

  // 반별 통계 계산
  const stats = {} as Record<ClassCode, { avg: number; max: number; min: number }>;
  for (const cls of classCodes) {
    stats[cls] = calcStats(classScores[cls]);
  }

  return [
    {
      metric: '평균',
      A: stats.A.avg,
      B: stats.B.avg,
      C: stats.C.avg,
    },
    {
      metric: '최고점',
      A: stats.A.max,
      B: stats.B.max,
      C: stats.C.max,
    },
    {
      metric: '최저점',
      A: stats.A.min,
      B: stats.B.min,
      C: stats.C.min,
    },
  ];
}

// ---------------------------------------------------------------------------
// 핵심간호술 집계 함수
// ---------------------------------------------------------------------------

/**
 * 학생 배열에서 핵심간호술 점수를 반별/전체로 집계한다.
 * - nursingSkills 필드만 사용 (totalScore와 완전히 독립)
 * - A반/B반/C반/전체 4개 그룹 반환
 * - 빈 그룹은 { average: 0, highest: 0, lowest: 0, count: 0 }
 *
 * @param students - 전체 학생 성적 배열
 * @returns NursingSkillsStats[] — 4개 항목 (A, B, C, all 순서)
 */
export function computeNursingSkillsStats(students: StudentGrade[]): NursingSkillsStats[] {
  const classCodes: ClassCode[] = ['A', 'B', 'C'];
  const result: NursingSkillsStats[] = [];

  // 반별 집계
  for (const cls of classCodes) {
    const scores = students
      .filter((s) => s.classCode === cls)
      .map((s) => s.nursingSkills);

    if (scores.length === 0) {
      result.push({ classCode: cls, average: 0, highest: 0, lowest: 0, count: 0 });
    } else {
      const { avg, max, min } = calcStats(scores);
      result.push({ classCode: cls, average: avg, highest: max, lowest: min, count: scores.length });
    }
  }

  // 전체 집계
  const allScores = students.map((s) => s.nursingSkills);
  if (allScores.length === 0) {
    result.push({ classCode: 'all', average: 0, highest: 0, lowest: 0, count: 0 });
  } else {
    const { avg, max, min } = calcStats(allScores);
    result.push({ classCode: 'all', average: avg, highest: max, lowest: min, count: allScores.length });
  }

  return result;
}
