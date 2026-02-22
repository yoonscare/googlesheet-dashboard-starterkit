// /class-comparison 페이지 — 반별 성적 비교 + 핵심간호술 통계
// Server Component: 데이터 페칭 후 Client 차트 컴포넌트에 props 전달

import { getGradeData } from "@/lib/grade-data";
import {
  buildClassComparisonData,
  computeNursingSkillsStats,
} from "@/lib/grade-comparison";
import { ClassComparisonChart } from "@/components/dashboard/class-comparison-chart";
import { NursingSkillsStatsCard } from "@/components/dashboard/nursing-skills-stats";
import { MockDataBanner } from "@/components/dashboard/mock-data-banner";

/**
 * 반별 성적 비교 페이지
 * - 반별 평균/최고점/최저점 grouped BarChart
 * - 핵심간호술 반별+전체 KPI 카드 (총점과 분리)
 */
export default async function ClassComparisonPage() {
  // Google Sheets 또는 mock 데이터 페칭
  const { students, dataSource } = await getGradeData();

  // 반별 비교 데이터 생성 (평균/최고점/최저점)
  const comparisonData = buildClassComparisonData(students);

  // 핵심간호술 통계 계산 (totalScore와 독립)
  const nursingStats = computeNursingSkillsStats(students);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">반별 비교</h1>

      {/* 데이터 출처 배너 (mock 사용 시 표시) */}
      <MockDataBanner dataSource={dataSource} />

      {/* 반별 성적 비교 grouped BarChart */}
      <ClassComparisonChart data={comparisonData} />

      {/* 핵심간호술 반별+전체 KPI 카드 (총점 미포함) */}
      <NursingSkillsStatsCard stats={nursingStats} />
    </div>
  );
}
