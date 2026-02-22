// 성적 KPI 카드 6개 — 총 학생수/전체 평균/최고점/최저점/표준편차/컷라인
// Server Component (인터랙션 없음)

import { Users, BarChart3, TrendingUp, TrendingDown, Activity, Scissors } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GradeKpiData } from '@/types/grades';

interface GradeKpiCardsProps {
  kpi: GradeKpiData;
}

/**
 * 학생 성적 KPI 카드 6개를 그리드로 렌더링한다.
 * - 반응형: md 2열, lg 3열
 * - 6번째 카드(컷라인)는 A/B/C반 컷라인을 한 줄로 표시
 */
export function GradeKpiCards({ kpi }: GradeKpiCardsProps) {
  // 반별 평균 텍스트 — description에 표시
  const classAvgText = `A: ${kpi.classAverages['A']} / B: ${kpi.classAverages['B']} / C: ${kpi.classAverages['C']}`;

  // 반별 컷라인 텍스트
  const cutlineText = `A: ${kpi.cutlines['A']}점 / B: ${kpi.cutlines['B']}점 / C: ${kpi.cutlines['C']}점`;

  const cards = [
    {
      title: '총 학생 수',
      value: `${kpi.totalStudents}명`,
      icon: Users,
      description: '전체 등록 학생',
    },
    {
      title: '전체 평균',
      value: `${kpi.overallAverage}점`,
      icon: BarChart3,
      description: `반별 — ${classAvgText}`,
    },
    {
      title: '최고점',
      value: `${kpi.highest}점`,
      icon: TrendingUp,
      description: '전체 최고 총점',
    },
    {
      title: '최저점',
      value: `${kpi.lowest}점`,
      icon: TrendingDown,
      description: '전체 최저 총점',
    },
    {
      title: '표준편차',
      value: `${kpi.stdDev}`,
      icon: Activity,
      description: '점수 분포 편차',
    },
    {
      title: '상위 40% 컷라인',
      value: cutlineText,
      icon: Scissors,
      description: '상위 40% 경계',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
