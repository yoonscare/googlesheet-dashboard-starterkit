// Google Sheets 행 데이터를 StudentGrade 객체로 변환하는 순수 함수 모음
// 외부 라이브러리 없이 네이티브 TypeScript만 사용

import type { StudentGrade, ClassCode, PoGrade } from '@/types/grades';

/**
 * 시트 열 인덱스 맵 (0-based)
 * 실제 시트: A반!A1:AD (또는 그 이상)
 *
 * 주의: 실제 시트 검증 후 인덱스 조정 필요
 * — fetchSheetData('A반!A1:Z3') 로 헤더 행 확인 권장
 */
export const COL = {
  // 기본 정보 (A-E)
  SEQ: 0,        // A: 순번
  PERIOD: 1,     // B: 실습기간
  HOSPITAL: 2,   // C: 실습기관
  STUDENT_ID: 3, // D: 학번
  NAME: 4,       // E: 이름

  // 사전학습 (F-I, 10점 만점) — I가 소계
  PRE_1: 5,      // F: 사전학습 항목1
  PRE_2: 6,      // G: 사전학습 항목2
  PRE_3: 7,      // H: 사전학습 항목3
  PRE_TOTAL: 8,  // I: 사전학습 소계 (10점 만점)

  // 보고서 (J-O, 30점 만점)
  RPT_SELF: 9,   // J: 셀프보고서
  RPT_CASE: 10,  // K: 케이스 보고서
  RPT_EDU: 11,   // L: 교육인 보고서
  RPT_CHECK: 12, // M: 체크 보고서
  RPT_OBJ: 13,   // N: 대상 보고서
  RPT_TOTAL: 14, // O: 보고서 소계 (30점 만점)

  // 실습지도교수 (P-S, 20점 만점)
  PROF_OBJ: 15,   // P: 실습지도교수 대상 (12점)
  PROF_SAFE: 16,  // Q: 실습지도교수 안전 (4점)
  PROF_PRO: 17,   // R: 실습지도교수 전문 (4점)
  PROF_TOTAL: 18, // S: 실습지도교수 소계 (20점 만점)

  // 현장지도자 (T-W, 20점 만점)
  FIELD_OBJ: 19,   // T: 현장지도자 대상 (12점)
  FIELD_SAFE: 20,  // U: 현장지도자 안전 (4점)
  FIELD_PRO: 21,   // V: 현장지도자 전문 (4점)
  FIELD_TOTAL: 22, // W: 현장지도자 소계 (20점 만점)

  // 학습성과 (X-Z)
  PO2: 23, // X: 학습성과2 대상자간호 (64점 만점)
  PO5: 24, // Y: 학습성과5 안전과질 (8점 만점)
  PO3: 25, // Z: 학습성과3 전문직 (8점 만점)

  // 합계 & 출석 (AA, AB)
  PRACTICE_TOTAL: 26, // AA: 실습성적 합계 (80점 만점)
  ATTENDANCE: 27,     // AB: 출석 (20점 만점)

  // 조정 열 (AC) — 조정 점수, 우리 계산 시 무시
  ADJUST: 28, // AC: 조정 열

  // 핵심간호술 (AD)
  NURSING_SKILLS: 29, // AD: 핵심간호술 (100점 만점, 총점 미포함)
} as const;

// ---------------------------------------------------------------------------
// 익명화 함수
// ---------------------------------------------------------------------------

/**
 * 한국어 이름을 익명화한다.
 * - 2글자: 성(첫글자) + * (예: 김수 → 김*)
 * - 3글자 이상: 성(첫글자) + * + 끝글자 (예: 김현우 → 김*우, 사공현우 → 사*우)
 * - 빈 문자열이나 1글자는 그대로 반환
 */
export function anonymizeName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) {
    // 2글자: 성 + *
    return name[0] + '*';
  }
  // 3글자 이상: 성(첫글자) + * + 끝글자
  return name[0] + '*' + name[name.length - 1];
}

/**
 * 학번을 익명화한다.
 * - 7자리 이상: 앞4자리 + *** + 뒤2자리 (예: 202000316 → 2020***16)
 * - 7자리 미만: 그대로 반환
 */
export function anonymizeStudentId(id: string): string {
  if (id.length < 7) return id;
  return id.slice(0, 4) + '***' + id.slice(-2);
}

// ---------------------------------------------------------------------------
// 행 파서
// ---------------------------------------------------------------------------

/**
 * 2차원 문자열 배열의 한 행을 StudentGrade 객체로 변환한다.
 * - 이름 열이 비어있으면 null 반환 (빈 행 스킵)
 * - 이름/학번은 파싱 시점에 익명화 — 원본 데이터는 여기서 폐기
 *
 * @param row - Google Sheets에서 가져온 1개 행 (string[])
 * @param classCode - 해당 반 코드 (A | B | C)
 * @returns StudentGrade 객체 또는 null
 */
export function parseGradeRow(row: string[], classCode: ClassCode): StudentGrade | null {
  // 빈 행 스킵: 이름 열이 비어있으면 null 반환
  const rawName = (row[COL.NAME] ?? '').trim();
  if (!rawName) return null;

  /** 숫자 변환 헬퍼 — NaN이면 0 반환 (trailing empty cells 대응) */
  const getNum = (idx: number): number => {
    const val = Number(row[idx]);
    return isNaN(val) ? 0 : val;
  };

  // 총점 = 실습성적(practiceTotal) + 출석(attendance) — 시트 합계가 아닌 직접 합산
  // 조정 열(AC)은 무시한다
  const practiceTotal = getNum(COL.PRACTICE_TOTAL);
  const attendance = getNum(COL.ATTENDANCE);
  const totalScore = practiceTotal + attendance;

  return {
    // 기본 정보 — 이름/학번 익명화 처리
    name: anonymizeName(rawName),
    studentId: anonymizeStudentId((row[COL.STUDENT_ID] ?? '').trim()),
    classCode,
    hospital: (row[COL.HOSPITAL] ?? '').trim(),

    // 점수 항목
    preLearning: getNum(COL.PRE_TOTAL),
    reportTotal: getNum(COL.RPT_TOTAL),
    profTotal: getNum(COL.PROF_TOTAL),
    fieldTotal: getNum(COL.FIELD_TOTAL),
    practiceTotal,
    attendance,
    totalScore,

    // 학습성과 (시트 수식 결과 그대로 사용)
    po2: getNum(COL.PO2),
    po5: getNum(COL.PO5),
    po3: getNum(COL.PO3),

    // 별도 평가
    nursingSkills: getNum(COL.NURSING_SKILLS),
  };
}

// ---------------------------------------------------------------------------
// 학습성과 등급 유틸
// ---------------------------------------------------------------------------

/**
 * 학습성과별 임계값 상수 (만점 × 85%, 만점 × 60%)
 * - 상: 85% 이상, 중: 60-85%, 하: 60% 미만
 */
export const PO_THRESHOLDS = {
  po2: { max: 64, high: 54.4, mid: 38.4 }, // 64 × 0.85 = 54.4, 64 × 0.60 = 38.4
  po5: { max: 8,  high: 6.8,  mid: 4.8  }, // 8  × 0.85 = 6.8,  8  × 0.60 = 4.8
  po3: { max: 8,  high: 6.8,  mid: 4.8  }, // 8  × 0.85 = 6.8,  8  × 0.60 = 4.8
} as const;

/**
 * 학습성과 점수를 상/중/하 등급으로 판정한다.
 * - score >= high → '상'
 * - score >= mid  → '중'
 * - otherwise     → '하'
 *
 * @param score - 해당 학습성과 점수
 * @param threshold - 임계값 객체 { high, mid }
 */
export function getPoGrade(
  score: number,
  threshold: { high: number; mid: number }
): PoGrade {
  if (score >= threshold.high) return '상';
  if (score >= threshold.mid) return '중';
  return '하';
}

/**
 * 학습성과 달성 여부를 판정한다.
 * - 해당 학습성과에서 중 이상(상 또는 중) 비율이 80% 이상이면 true
 * - 빈 배열이면 false
 *
 * @param students - 학생 성적 배열
 * @param poKey - 판정할 학습성과 키 ('po2' | 'po5' | 'po3')
 */
export function isAchieved(
  students: StudentGrade[],
  poKey: 'po2' | 'po5' | 'po3'
): boolean {
  if (students.length === 0) return false;

  const threshold = PO_THRESHOLDS[poKey];
  const achievedCount = students.filter((s) => {
    const grade = getPoGrade(s[poKey], threshold);
    return grade === '상' || grade === '중';
  }).length;

  return achievedCount / students.length >= 0.8;
}
