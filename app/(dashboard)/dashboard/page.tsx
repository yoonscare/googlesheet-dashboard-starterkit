// 메인 대시보드 페이지 (Server Component)
// Phase 1 데이터 파이프라인(getGradeData)과 KPI 컴포넌트를 연결한다

import { getGradeData } from '@/lib/grade-data';
import { computeGradeKpi } from '@/lib/grade-kpi';
import { GradeKpiCards } from '@/components/dashboard/grade-kpi-cards';
import { MockDataBanner } from '@/components/dashboard/mock-data-banner';

export default async function DashboardPage() {
  // 서버에서 학생 성적 데이터 페칭 (Google Sheets 또는 mock 폴백)
  const { students, dataSource } = await getGradeData();

  // KPI 지표 계산 (순수 함수, 서버사이드)
  const kpi = computeGradeKpi(students);

  return (
    <div className="space-y-6">
      {/* Mock 데이터 사용 시 경고 배너 */}
      <MockDataBanner dataSource={dataSource} />

      {/* KPI 요약 카드 6개 */}
      <GradeKpiCards kpi={kpi} />

      {/* 히스토그램 차트: Plan 02에서 구현 */}
    </div>
  );
}
