// 학습성과 달성도 페이지 (Server Component)
// getGradeData()로 학생 데이터를 서버에서 페칭하고, computePoAchievement()로 PO 분포를 계산한 뒤 분포표에 전달한다.

import { getGradeData } from '@/lib/grade-data';
import { computePoAchievement } from '@/lib/grade-po';
import { PoAchievementTable } from '@/components/dashboard/po-achievement-table';
import { MockDataBanner } from '@/components/dashboard/mock-data-banner';
import { PoLowGradePanel } from '@/components/dashboard/po-low-grade-panel';

export default async function LearningOutcomesPage() {
  // 서버에서 학생 성적 데이터 페칭 (Google Sheets 또는 mock 폴백)
  const { students, dataSource } = await getGradeData();

  // 3개 PO × 4개 열(A반/B반/C반/전체) 상/중/하 분포 계산 (순수 함수, 서버사이드)
  const poData = computePoAchievement(students);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">학습성과 달성도</h1>

      {/* Mock 데이터 사용 시 경고 배너 */}
      <MockDataBanner dataSource={dataSource} />

      {/* 3개 PO × 4개 열 분포표 + 달성/미달성 배지 */}
      <PoAchievementTable poData={poData} />

      {/* 하 등급 학생 드릴다운 패널 — PO 탭 → 반 필터 → 학생 선택 → 세부점수 */}
      <PoLowGradePanel students={students} />
    </div>
  );
}
