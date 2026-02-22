// KPI 계산 유틸 — 학생 성적 배열에서 대시보드 핵심 지표 계산
// 순수 함수, 서버사이드 전용 (외부 의존성 없음)

import type { StudentGrade, ClassCode, GradeKpiData } from '@/types/grades';

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * 숫자 배열의 평균을 계산한다.
 * - 빈 배열이면 0 반환
 */
function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

/**
 * 소수점 1자리로 반올림한다.
 * - Math.round(x * 10) / 10 패턴
 */
function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

// ---------------------------------------------------------------------------
// 메인 계산 함수
// ---------------------------------------------------------------------------

/**
 * 학생 성적 배열에서 대시보드 KPI를 계산한다.
 *
 * @param students - 전체 학생 성적 배열 (모든 반 포함)
 * @returns GradeKpiData — 총 학생수/반별 평균/전체 평균/최고점/최저점/표준편차/컷라인
 */
export function computeGradeKpi(students: StudentGrade[]): GradeKpiData {
  const classCodes: ClassCode[] = ['A', 'B', 'C'];

  // 전체 학생 총점 배열
  const allScores = students.map((s) => s.totalScore);

  // 총 학생 수
  const totalStudents = students.length;

  // 전체 평균 (소수점 1자리)
  const overallAverage = round1(avg(allScores));

  // 최고점 — Math.max(...[]) = -Infinity 방지, reduce 패턴 사용
  const highest =
    allScores.length === 0
      ? 0
      : allScores.reduce((max, v) => (v > max ? v : max), allScores[0]);

  // 최저점 — Math.min(...[]) = Infinity 방지, reduce 패턴 사용
  const lowest =
    allScores.length === 0
      ? 0
      : allScores.reduce((min, v) => (v < min ? v : min), allScores[0]);

  // 표준편차 (소수점 1자리)
  // 공식: sqrt(sum((x - mean)^2) / n)
  let stdDev = 0;
  if (allScores.length > 0) {
    const mean = avg(allScores);
    const variance =
      allScores.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      allScores.length;
    stdDev = round1(Math.sqrt(variance));
  }

  // 반별 평균 계산
  const classAverages = {} as Record<ClassCode, number>;
  for (const cls of classCodes) {
    const classScores = students
      .filter((s) => s.classCode === cls)
      .map((s) => s.totalScore);
    classAverages[cls] = round1(avg(classScores));
  }

  // 반별 상위 40% 컷라인 계산
  // - 해당 반 totalScore 내림차순 정렬
  // - Math.ceil(n * 0.4) - 1 인덱스의 점수 = 상위 40%의 하한선
  // - 빈 반이면 0
  const cutlines = {} as Record<ClassCode, number>;
  for (const cls of classCodes) {
    const classScores = students
      .filter((s) => s.classCode === cls)
      .map((s) => s.totalScore)
      .sort((a, b) => b - a); // 내림차순

    if (classScores.length === 0) {
      cutlines[cls] = 0;
    } else {
      const cutIndex = Math.ceil(classScores.length * 0.4) - 1;
      cutlines[cls] = classScores[cutIndex];
    }
  }

  return {
    totalStudents,
    classAverages,
    overallAverage,
    highest,
    lowest,
    stdDev,
    cutlines,
  };
}
