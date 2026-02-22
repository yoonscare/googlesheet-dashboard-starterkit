// 학생 성적 데이터 페칭 통합 레이어
// Google Sheets 3반 병렬 페칭 + 개별 반 폴백 + 전체 폴백 로직

import type { GradeDataResult, StudentGrade, ClassCode } from '@/types/grades';
import { fetchSheetData, isGoogleSheetsConfigured } from './sheets';
import { parseGradeRow } from './grade-parser';
import { mockGradeData, getMockForClass } from './mock-grade-data';

// 데이터 범위: 4행부터 끝까지 (헤더 3행 제외)
const DATA_RANGE = 'A4:AJ';

// ---------------------------------------------------------------------------
// 반별 파싱 헬퍼
// ---------------------------------------------------------------------------

/**
 * 한 반의 페칭 결과를 StudentGrade 배열로 변환한다.
 * - rows가 null이면(페칭 실패) getMockForClass로 mock 대체
 * - rows가 있으면 parseGradeRow로 파싱 후 null 필터링
 *
 * @param rows - fetchSheetData 결과 (null = 페칭 실패)
 * @param classCode - 반 코드
 * @returns StudentGrade 배열과 폴백 여부
 */
function parseClassRows(
  rows: string[][] | null,
  classCode: ClassCode
): { students: StudentGrade[]; usedMock: boolean } {
  if (rows === null) {
    // 해당 반 페칭 실패 → mock으로 대체
    return { students: getMockForClass(classCode), usedMock: true };
  }

  // 파싱 성공 — null 행(빈 행) 필터링
  const students = rows
    .map((row) => parseGradeRow(row, classCode))
    .filter((s): s is StudentGrade => s !== null);

  return { students, usedMock: false };
}

// ---------------------------------------------------------------------------
// 통합 페칭 함수
// ---------------------------------------------------------------------------

/**
 * 전체 학생 성적 데이터를 가져온다.
 *
 * 동작 방식:
 * 1. Google Sheets 환경변수 미설정 → mock 데이터 즉시 반환 (dataSource: 'mock')
 * 2. Promise.all로 A반/B반/C반 병렬 페칭
 *    - 개별 반 페칭 실패 → 해당 반만 mock 대체 (dataSource: 'partial-mock')
 *    - 전체 성공 → dataSource: 'sheets'
 * 3. 전체 try-catch 실패 → 전체 mock 폴백 (dataSource: 'mock')
 *
 * dataSource 필드는 Phase 2에서 '목 데이터 사용 중' 경고 배너 표시에 사용된다.
 *
 * @returns 학생 배열과 데이터 출처를 포함한 GradeDataResult
 */
export async function getGradeData(): Promise<GradeDataResult> {
  // Google Sheets 환경변수 미설정 시 즉시 mock 반환
  if (!isGoogleSheetsConfigured()) {
    return { students: mockGradeData, dataSource: 'mock' };
  }

  try {
    // A반, B반, C반 3개 시트를 병렬 페칭 (성능 최적화)
    // 개별 반 실패는 catch(() => null)로 처리 — 전체 Promise.all이 실패하지 않도록
    const [classARows, classBRows, classCRows] = await Promise.all([
      fetchSheetData(`A반!${DATA_RANGE}`).catch(() => null),
      fetchSheetData(`B반!${DATA_RANGE}`).catch(() => null),
      fetchSheetData(`C반!${DATA_RANGE}`).catch(() => null),
    ]);

    // 반별 파싱 (실패한 반은 mock 대체)
    const classA = parseClassRows(classARows, 'A');
    const classB = parseClassRows(classBRows, 'B');
    const classC = parseClassRows(classCRows, 'C');

    // dataSource 결정
    // - 하나라도 mock 대체되면 'partial-mock'
    // - 전부 sheets에서 성공하면 'sheets'
    const anyMockUsed = classA.usedMock || classB.usedMock || classC.usedMock;
    const dataSource = anyMockUsed ? 'partial-mock' : 'sheets';

    return {
      students: [...classA.students, ...classB.students, ...classC.students],
      dataSource,
    };
  } catch (error) {
    // 전체 페칭 실패 — 전체 mock으로 폴백
    console.error('성적 데이터 페칭 실패, mock 데이터로 대체:', error);
    return { students: mockGradeData, dataSource: 'mock' };
  }
}
