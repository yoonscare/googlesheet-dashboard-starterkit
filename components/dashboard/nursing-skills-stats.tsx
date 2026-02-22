// 핵심간호술 반별+전체 KPI 카드 컴포넌트
// Server Component (인터랙션 없음)
// 핵심간호술은 총점과 완전히 독립된 별도 평가 (100점 만점)

import { Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NursingSkillsStats } from "@/lib/grade-comparison";
import type { ClassCode } from "@/types/grades";

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface NursingSkillsStatsCardProps {
  /** 핵심간호술 통계 — computeNursingSkillsStats() 반환값 */
  stats: NursingSkillsStats[];
}

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/** 반 코드를 카드 제목 레이블로 변환한다 */
function classLabel(classCode: ClassCode | "all"): string {
  if (classCode === "all") return "전체";
  return `${classCode}반`;
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 핵심간호술 반별+전체 KPI 카드
 * - 총점 미포함을 섹션 헤더에 명시
 * - 4개 카드: A반/B반/C반/전체
 * - 각 카드: 평균(크게), 최고점/최저점/학생수(작게)
 */
export function NursingSkillsStatsCard({ stats }: NursingSkillsStatsCardProps) {
  return (
    <div className="space-y-4">
      {/* 섹션 헤더 — "총점 미포함" 명시 */}
      <div>
        <h2 className="text-xl font-semibold">
          핵심간호술 (별도 평가, 총점 미포함)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          100점 만점 별도 평가 — 반별 및 전체 통계
        </p>
      </div>

      {/* 4개 KPI 카드 — 반응형 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const isAll = stat.classCode === "all";

          return (
            <Card
              key={stat.classCode}
              className={isAll ? "border-primary/50" : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {classLabel(stat.classCode)}
                </CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* 평균 점수 — 크게 표시 */}
                <p className="text-2xl font-bold">{stat.average}점</p>

                {/* 최고점/최저점/학생수 — 작게 표시 */}
                <div className="mt-1 space-y-0.5">
                  <p className="text-sm text-muted-foreground">
                    최고: {stat.highest}점 / 최저: {stat.lowest}점
                  </p>
                  <p className="text-sm text-muted-foreground">
                    학생 {stat.count}명
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
