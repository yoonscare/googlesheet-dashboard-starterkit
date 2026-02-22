"use client";

// 반별 성적 비교 grouped BarChart
// Recharts는 DOM 조작이 필요하므로 Client Component 필수

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassComparisonData } from "@/lib/grade-comparison";

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface ClassComparisonChartProps {
  /** 반별 비교 데이터 — buildClassComparisonData() 반환값 */
  data: ClassComparisonData[];
}

// ---------------------------------------------------------------------------
// 색상 상수 — Recharts SVG에서는 CSS 변수 대신 hsl 직접 값 사용 (grade-histogram-chart.tsx 패턴)
// ---------------------------------------------------------------------------

const CLASS_COLORS = {
  A: "hsl(220, 70%, 50%)", // chart-1 근사값 (파랑)
  B: "hsl(160, 60%, 45%)", // chart-2 근사값 (초록)
  C: "hsl(30, 80%, 55%)",  // chart-3 근사값 (주황)
};

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 반별 성적 비교 grouped BarChart
 * - A/B/C반의 평균/최고점/최저점을 나란히 표시
 * - stackId 없이 3개 Bar를 grouped으로 표시
 */
export function ClassComparisonChart({ data }: ClassComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>반별 성적 비교</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            {/* 그리드 — CSS 변수는 SVG 외부 속성에서 사용 가능 */}
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

            {/* X축 — 지표명 (평균/최고점/최저점) */}
            <XAxis
              dataKey="metric"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />

            {/* Y축 — 점수 0~100 고정 */}
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />

            {/* 툴팁 — Tooltip contentStyle에는 CSS 변수 사용 가능 (HTML 렌더링) */}
            <Tooltip
              formatter={(value, name) => [`${value}점`, `${name}반`]}
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}
            />

            {/* 범례 */}
            <Legend
              formatter={(value) => `${value}반`}
            />

            {/* A반/B반/C반 grouped bar — stackId 없이 그룹 표시 */}
            <Bar dataKey="A" name="A" fill={CLASS_COLORS.A} />
            <Bar dataKey="B" name="B" fill={CLASS_COLORS.B} />
            <Bar dataKey="C" name="C" fill={CLASS_COLORS.C} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
