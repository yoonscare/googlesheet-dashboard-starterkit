// 학생 성적 조회 페이지 — Server Component
// getGradeData()로 데이터 페칭 → 순위 계산 → 테이블/차트 컴포넌트에 props 전달

import { getGradeData } from "@/lib/grade-data";
import { buildRankData, computeOverallCutline } from "@/lib/grade-rank";
import { StudentTable } from "@/components/dashboard/student-table";
import { StudentRankChart } from "@/components/dashboard/student-rank-chart";
import { MockDataBanner } from "@/components/dashboard/mock-data-banner";

/**
 * /students 라우트 페이지
 * - 전체 학생 성적 테이블 (반별 필터 + 이름/학번 검색)
 * - 전체 학생 총점 순위 차트 (반별 색상 + 40% 컷라인)
 */
export default async function StudentsPage() {
  // 학생 데이터 페칭 (Sheets → mock 폴백)
  const { students, dataSource } = await getGradeData();

  // 총점 내림차순 순위 데이터 생성
  const rankData = buildRankData(students);

  // 전체 40% 컷라인 점수 계산
  const cutlineScore = computeOverallCutline(students);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">학생 성적 조회</h1>

      {/* 목 데이터 사용 경고 배너 (sheets 연결 시 미표시) */}
      <MockDataBanner dataSource={dataSource} />

      {/* 학생 성적 테이블 — 반별 필터 + 이름/학번 검색 */}
      <StudentTable students={students} />

      {/* 전체 학생 순위 차트 — 반별 색상 BarChart + 40% 컷라인 */}
      <StudentRankChart data={rankData} cutlineScore={cutlineScore} />
    </div>
  );
}
