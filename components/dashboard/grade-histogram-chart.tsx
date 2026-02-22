"use client";

// 반별 성적 분포 히스토그램 차트
// Recharts는 DOM 조작이 필요하므로 Client Component 필수

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistogramDataPoint } from "@/lib/grade-histogram";
import { findCutlineRange } from "@/lib/grade-histogram";

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface GradeHistogramChartProps {
  /** 히스토그램 데이터 — buildHistogramData() 반환값 */
  data: HistogramDataPoint[];
  /** 반별 상위 40% 컷라인 점수 */
  cutlines: { A: number; B: number; C: number };
}

// ---------------------------------------------------------------------------
// 색상 상수 — Recharts SVG에서는 CSS 변수 대신 hsl 직접 값 사용 (category-chart.tsx 패턴)
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
 * 반별 성적 분포 히스토그램 차트
 * - A/B/C반 grouped BarChart (10점 단위 구간)
 * - 전체 학생 대상 평균 컷라인 구간에 ReferenceLine 표시
 * - 반별 정확한 컷라인 점수는 KPI 카드에서 텍스트로 표시됨 (Plan 01)
 */
export function GradeHistogramChart({ data, cutlines }: GradeHistogramChartProps) {
  // 반별 컷라인 평균으로 대표 컷라인 계산 (시각적 근사 표시용)
  const medianCutline = Math.round((cutlines.A + cutlines.B + cutlines.C) / 3);
  // 대표 컷라인이 속하는 구간 레이블 (HistogramDataPoint.range와 일치)
  const cutlineRange = findCutlineRange(medianCutline);

  return (
    <Card>
      <CardHeader>
        <CardTitle>반별 성적 분포</CardTitle>
      </CardHeader>
      <CardContent>
        {/* h-[350px]로 차트 높이 고정 — ResponsiveContainer가 너비 100% 대응 */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              {/* 그리드 — CSS 변수는 SVG 외부 속성에서 사용 가능 */}
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

              {/* X축 — 점수 구간 레이블 */}
              <XAxis
                dataKey="range"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />

              {/* Y축 — 학생 수 (정수만 표시) */}
              <YAxis
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                allowDecimals={false}
              />

              {/* 툴팁 — Tooltip contentStyle에는 CSS 변수 사용 가능 (HTML 렌더링) */}
              <Tooltip
                formatter={(value, name) => [`${value}명`, `${name}반`]}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelFormatter={(label) => `점수 구간: ${label}점`}
              />

              {/* 범례 */}
              <Legend
                formatter={(value) => `${value}반`}
              />

              {/* A반/B반/C반 grouped bar — stackId 없이 그룹 표시 */}
              <Bar dataKey="A" name="A" fill={CLASS_COLORS.A} />
              <Bar dataKey="B" name="B" fill={CLASS_COLORS.B} />
              <Bar dataKey="C" name="C" fill={CLASS_COLORS.C} />

              {/* 40% 컷라인 구간 표시 — 반별 평균 컷라인 기준 */}
              <ReferenceLine
                x={cutlineRange}
                stroke="hsl(0, 72%, 51%)"
                strokeDasharray="5 5"
                label={{
                  value: `A 이상 40% 컷라인 (${medianCutline}점대)`,
                  position: "top",
                  fill: "hsl(0, 72%, 51%)",
                  fontSize: 12,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
