// PO(학습성과) 분포 집계 유틸
// 3개 학습성과(po2/po5/po3) × (A반/B반/C반/전체) 상/중/하 인원수와 달성률 계산

import type { StudentGrade, ClassCode } from '@/types/grades';
import { getPoGrade, PO_THRESHOLDS } from '@/lib/grade-parser';

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

/** 집계 대상 학습성과 키 */
export type PoKey = 'po2' | 'po5' | 'po3';

/**
 * 반(또는 전체) 기준 PO 상/중/하 분포
 * JSON 직렬화 가능 — Server Component에서 Client Component로 props 전달 가능
 */
export interface PoGradeDistribution {
  /** 총 학생 수 */
  total: number;
  /** 상 등급 인원 */
  high: number;
  /** 중 등급 인원 */
  mid: number;
  /** 하 등급 인원 */
  low: number;
  /** 중 이상 비율 (0-100, 소수점 1자리) — UI 표시용 */
  achieveRate: number;
  /** 달성 여부 — raw 비율(>= 0.8)로 판정하여 부동소수점 반올림 이슈 방지 */
  achieved: boolean;
}

/**
 * 3개 PO 전체 집계 결과
 * - Record<ClassCode | 'all', PoGradeDistribution> 구조로 반별·전체 동일 접근
 */
export interface PoAchievementData {
  po2: Record<ClassCode | 'all', PoGradeDistribution>;
  po5: Record<ClassCode | 'all', PoGradeDistribution>;
  po3: Record<ClassCode | 'all', PoGradeDistribution>;
}

// ---------------------------------------------------------------------------
// 내부 집계 함수 (export하지 않음)
// ---------------------------------------------------------------------------

/**
 * 단일 PO 단일 그룹의 분포를 계산한다.
 * - 빈 배열 가드: total === 0이면 모두 0 반환 (나누기 0 방지)
 * - achieved는 raw 비율로 판정 — achieveRate 반올림으로 인한 불일치 방지
 *
 * @param students - 집계 대상 학생 배열 (반 필터 적용 후)
 * @param poKey - 집계할 학습성과 키
 * @returns 상/중/하 인원수, 달성률, 달성 여부
 */
function computeDistribution(
  students: StudentGrade[],
  poKey: PoKey
): PoGradeDistribution {
  const total = students.length;

  // 빈 배열 가드 — 나누기 0 방지
  if (total === 0) {
    return { total: 0, high: 0, mid: 0, low: 0, achieveRate: 0, achieved: false };
  }

  const threshold = PO_THRESHOLDS[poKey];
  let high = 0;
  let mid = 0;
  let low = 0;

  // 각 학생의 등급을 판정하여 카운트
  for (const s of students) {
    const grade = getPoGrade(s[poKey], threshold);
    if (grade === '상') high++;
    else if (grade === '중') mid++;
    else low++;
  }

  // achieveRate: 소수점 1자리 (UI 표시용)
  const achieveRate = Math.round(((high + mid) / total) * 1000) / 10;

  // achieved: raw 비율로 판정 — 부동소수점 반올림 이슈 방지
  // (예: 79.999...% → achieveRate는 80.0이지만 achieved는 false가 되어야 하는 엣지케이스)
  const achieved = (high + mid) / total >= 0.8;

  return { total, high, mid, low, achieveRate, achieved };
}

// ---------------------------------------------------------------------------
// 공개 집계 함수
// ---------------------------------------------------------------------------

/**
 * 전체 학생 배열에서 3개 PO × (A반/B반/C반/전체) 상/중/하 분포를 계산한다.
 *
 * @param students - 전체 학생 배열
 * @returns po2/po5/po3 각각의 반별·전체 분포 집계
 */
export function computePoAchievement(students: StudentGrade[]): PoAchievementData {
  const poKeys: PoKey[] = ['po2', 'po5', 'po3'];
  const classCodes: ClassCode[] = ['A', 'B', 'C'];

  const result = {} as PoAchievementData;

  for (const poKey of poKeys) {
    // 반별 학생 필터 후 분포 계산
    const classA = students.filter((s) => s.classCode === 'A');
    const classB = students.filter((s) => s.classCode === 'B');
    const classC = students.filter((s) => s.classCode === 'C');

    result[poKey] = {
      A: computeDistribution(classA, poKey),
      B: computeDistribution(classB, poKey),
      C: computeDistribution(classC, poKey),
      all: computeDistribution(students, poKey),
    };

    // classCodes 배열은 타입 안정성을 위해 선언됨 (실제 사용은 위의 명시적 키로)
    void classCodes;
  }

  return result;
}

/**
 * 특정 PO에서 하 등급인 학생 목록을 반환한다.
 * - classCode가 지정되면 해당 반만 필터링
 * - undefined이면 전체 학생에서 필터링
 *
 * @param students - 전체 학생 배열
 * @param poKey - 판정할 학습성과 키
 * @param classCode - 반 코드 (선택적 — undefined이면 전체)
 * @returns 하 등급 학생 배열
 */
export function getLowGradeStudents(
  students: StudentGrade[],
  poKey: PoKey,
  classCode?: ClassCode
): StudentGrade[] {
  const threshold = PO_THRESHOLDS[poKey];

  // 반 필터 적용 (classCode가 없으면 전체)
  const filtered = classCode
    ? students.filter((s) => s.classCode === classCode)
    : students;

  // 하 등급 학생만 반환
  return filtered.filter((s) => getPoGrade(s[poKey], threshold) === '하');
}
