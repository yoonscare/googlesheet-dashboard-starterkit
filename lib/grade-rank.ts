// 전체 학생 순위 계산 유틸
// 총점 기준 내림차순 정렬 + 전체 40% 컷라인 계산
// 순수 함수, 서버사이드 전용 (외부 의존성 없음)

import type { StudentGrade, ClassCode } from '@/types/grades';

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

/**
 * 순위 데이터 포인트 — 차트 렌더링에 필요한 최소 정보
 */
export interface RankDataPoint {
  /** 순위 (1-based, 1등부터) */
  rank: number;
  /** 익명화된 학생 이름 */
  name: string;
  /** 반 코드 */
  classCode: ClassCode;
  /** 총점 */
  totalScore: number;
  /** 상위 40% 여부 — cutline 이상이면 true */
  aboveCutline: boolean;
}

// ---------------------------------------------------------------------------
// 메인 계산 함수
// ---------------------------------------------------------------------------

/**
 * 학생 배열을 총점 내림차순으로 정렬하여 순위 데이터를 생성한다.
 *
 * - 원본 배열 변경 금지 (spread 복사 후 정렬)
 * - 전체 40% 컷라인: Math.ceil(n * 0.4) - 1 인덱스의 점수
 * - aboveCutline: 해당 학생의 순위(index)가 cutIndex 이하이면 true
 * - 빈 배열이면 [] 반환
 *
 * @param students - 전체 학생 성적 배열
 * @returns 총점 내림차순 정렬된 RankDataPoint[] (rank는 1부터 시작)
 */
export function buildRankData(students: StudentGrade[]): RankDataPoint[] {
  if (students.length === 0) return [];

  // 원본 배열 변경 금지 — spread 복사 후 정렬
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);

  // 전체 상위 40% 컷라인 인덱스
  const cutIndex = Math.ceil(sorted.length * 0.4) - 1;

  return sorted.map((student, idx) => ({
    rank: idx + 1,
    name: student.name,
    classCode: student.classCode,
    totalScore: student.totalScore,
    aboveCutline: idx <= cutIndex,
  }));
}

/**
 * 전체 학생 상위 40% 컷라인 점수를 반환한다.
 *
 * - 총점 내림차순 정렬 후 Math.ceil(n * 0.4) - 1 인덱스의 totalScore
 * - 빈 배열이면 0 반환
 *
 * @param students - 전체 학생 성적 배열
 * @returns 컷라인 점수 (정수)
 */
export function computeOverallCutline(students: StudentGrade[]): number {
  if (students.length === 0) return 0;

  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);
  const cutIndex = Math.ceil(sorted.length * 0.4) - 1;
  return sorted[cutIndex].totalScore;
}
