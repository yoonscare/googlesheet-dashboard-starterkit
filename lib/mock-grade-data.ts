// 정규분포 기반 학생 성적 목 데이터 생성
// 개발/테스트 환경에서 Google Sheets 연결 없이 사용하는 가짜 데이터

import type { StudentGrade, ClassCode } from '@/types/grades';
import { anonymizeName, anonymizeStudentId, PO_THRESHOLDS } from './grade-parser';

// ---------------------------------------------------------------------------
// 정규분포 랜덤 생성 함수
// ---------------------------------------------------------------------------

/**
 * Box-Muller 변환으로 정규분포 랜덤값 생성
 * @param mean - 평균
 * @param std - 표준편차
 * @param min - 최솟값 (클램핑)
 * @param max - 최댓값 (클램핑)
 * @returns 소수점 1자리로 반올림된 정규분포 값
 */
function gaussianRandom(mean: number, std: number, min: number, max: number): number {
  // Box-Muller 변환
  let u1 = 0;
  let u2 = 0;
  // u1이 0이면 ln(0)이 되므로 0 제외
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const value = mean + z * std;
  // min/max 클램핑 후 소수점 1자리 반올림
  return Math.round(Math.min(Math.max(value, min), max) * 10) / 10;
}

// ---------------------------------------------------------------------------
// 이름/학번/병원 목록
// ---------------------------------------------------------------------------

/** 한국 성씨 목록 */
const LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];

/** 한국 이름 앞글자 목록 */
const FIRST_CHARS = ['민', '지', '현', '수', '영', '예', '은', '주', '연', '혜', '다', '윤', '소', '나', '하', '유', '진', '미', '선', '정'];

/** 한국 이름 끝글자 목록 */
const LAST_CHARS = ['아', '나', '은', '이', '희', '진', '경', '미', '현', '수', '영', '연', '원', '우', '준', '훈', '민', '서', '율', '린'];

/** 실습 기관 목록 */
const HOSPITALS = [
  '분당제생병원',
  '서울대학교병원',
  '세브란스병원',
  '아산병원',
  '삼성서울병원',
  '서울성모병원',
  '고려대학교안암병원',
  '강남세브란스병원',
];

// ---------------------------------------------------------------------------
// 학생 생성 함수
// ---------------------------------------------------------------------------

/**
 * 랜덤 한국어 이름 생성 후 익명화
 * @param index - 학생 인덱스 (이름 다양성 확보)
 */
function generateName(index: number): string {
  const lastIdx = (index * 7 + 3) % LAST_NAMES.length;
  const firstIdx = (index * 11 + 5) % FIRST_CHARS.length;
  const endIdx = (index * 13 + 7) % LAST_CHARS.length;
  // 3글자 이름 생성 (성 + 이름 두 글자)
  const rawName = LAST_NAMES[lastIdx] + FIRST_CHARS[firstIdx] + LAST_CHARS[endIdx];
  return anonymizeName(rawName);
}

/**
 * 랜덤 학번 생성 후 익명화
 * 형식: "2020" + 5자리 숫자
 */
function generateStudentId(index: number): string {
  // 입학연도 2020, 5자리 일련번호
  const serial = String(10000 + (index * 317 + 53) % 90000).padStart(5, '0');
  const rawId = `2020${serial}`;
  return anonymizeStudentId(rawId);
}

/**
 * 학생 1명의 성적 데이터 생성
 * @param classCode - 반 코드 (A | B | C)
 * @param index - 반 내 인덱스 (0-based)
 */
function generateStudent(classCode: ClassCode, index: number): StudentGrade {
  // 반별 시드 오프셋으로 반마다 다른 패턴
  const classOffset = classCode === 'A' ? 0 : classCode === 'B' ? 1000 : 2000;
  const seed = classOffset + index;

  // 병원 선택 (결정적 선택 — 같은 index는 같은 병원)
  const hospital = HOSPITALS[(seed * 3 + 1) % HOSPITALS.length];

  // 점수 항목별 정규분포 생성
  const preLearning = gaussianRandom(7.5, 1.5, 0, 10);
  const reportTotal = gaussianRandom(23, 4, 0, 30);
  const profTotal = gaussianRandom(16, 2.5, 0, 20);
  const fieldTotal = gaussianRandom(15.5, 2.5, 0, 20);
  const practiceTotal = Math.round((preLearning + reportTotal + profTotal + fieldTotal) * 10) / 10;
  const attendance = gaussianRandom(19, 1, 10, 20);
  const totalScore = Math.round((practiceTotal + attendance) * 10) / 10;

  // 학습성과 점수 (시트 수식 시뮬레이션)
  const po2 = gaussianRandom(52, 8, 0, 64);
  const po5 = gaussianRandom(6.5, 1.2, 0, 8);
  const po3 = gaussianRandom(6.5, 1.2, 0, 8);

  // 핵심간호술 (100점 만점)
  const nursingSkills = gaussianRandom(82, 10, 0, 100);

  return {
    name: generateName(seed),
    studentId: generateStudentId(seed),
    classCode,
    hospital,
    preLearning,
    reportTotal,
    profTotal,
    fieldTotal,
    practiceTotal,
    attendance,
    totalScore,
    po2,
    po5,
    po3,
    nursingSkills,
  };
}

// ---------------------------------------------------------------------------
// 하 등급 학생 보장
// ---------------------------------------------------------------------------

/**
 * 특정 반 학생 목록에서 하 등급 학생 수를 확인하고,
 * 부족하면 마지막 몇 명의 PO 점수를 낮게 강제 설정한다.
 * - 하 등급 기준: po2 < 38.4, po5 < 4.8, po3 < 4.8
 */
function ensureLowGradeStudents(students: StudentGrade[]): StudentGrade[] {
  const result = [...students];

  // 현재 하 등급 학생 수 계산 (po2/po5/po3 중 하나라도 하 등급)
  const hasLowGrade = (s: StudentGrade) =>
    s.po2 < PO_THRESHOLDS.po2.mid ||
    s.po5 < PO_THRESHOLDS.po5.mid ||
    s.po3 < PO_THRESHOLDS.po3.mid;

  const lowGradeCount = result.filter(hasLowGrade).length;

  // 최소 3명 보장 (2-3명 목표)
  if (lowGradeCount < 3) {
    const deficit = 3 - lowGradeCount;
    // 뒤에서부터 deficit 명의 PO 점수를 하 등급으로 강제 설정
    for (let i = result.length - 1; i >= result.length - deficit; i--) {
      const student = { ...result[i] };
      // po2를 하 등급 범위로 낮춤 (38.4 미만)
      student.po2 = Math.round(gaussianRandom(25, 5, 10, 37) * 10) / 10;
      // po5도 낮춤 (4.8 미만)
      student.po5 = Math.round(gaussianRandom(3, 0.8, 0, 4.7) * 10) / 10;
      result[i] = student;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 반별 학생 배열 생성
// ---------------------------------------------------------------------------

/** A반 42명 학생 데이터 생성 */
const classAStudents: StudentGrade[] = ensureLowGradeStudents(
  Array.from({ length: 42 }, (_, i) => generateStudent('A', i))
);

/** B반 42명 학생 데이터 생성 */
const classBStudents: StudentGrade[] = ensureLowGradeStudents(
  Array.from({ length: 42 }, (_, i) => generateStudent('B', i))
);

/** C반 42명 학생 데이터 생성 */
const classCStudents: StudentGrade[] = ensureLowGradeStudents(
  Array.from({ length: 42 }, (_, i) => generateStudent('C', i))
);

// ---------------------------------------------------------------------------
// 공개 Export
// ---------------------------------------------------------------------------

/**
 * 전체 126명 학생 mock 데이터 (A반 42 + B반 42 + C반 42)
 * - 각 반에 최소 3명의 하 등급 학생 포함
 * - 모든 이름/학번은 파싱 시점에 익명화됨
 */
export const mockGradeData: StudentGrade[] = [
  ...classAStudents,
  ...classBStudents,
  ...classCStudents,
];

/**
 * 특정 반의 mock 데이터만 반환한다.
 * - 개별 시트 페칭 실패 시 해당 반만 mock으로 대체하는 폴백용
 *
 * @param classCode - 반 코드 (A | B | C)
 * @returns 해당 반 42명 학생 데이터
 */
export function getMockForClass(classCode: ClassCode): StudentGrade[] {
  switch (classCode) {
    case 'A': return classAStudents;
    case 'B': return classBStudents;
    case 'C': return classCStudents;
  }
}
