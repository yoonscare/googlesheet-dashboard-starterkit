"use client";

// 전체 학생 순위 BarChart — 총점 기준 내림차순 + 40% 컷라인 ReferenceLine
// Recharts는 DOM 조작이 필요하므로 Client Component 필수

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RankDataPoint } from "@/lib/grade-rank";

// ---------------------------------------------------------------------------
// 색상 상수 — grade-histogram-chart.tsx와 동일한 반별 색상
// Recharts SVG에서는 CSS 변수 대신 hsl 직접 값 사용
// ---------------------------------------------------------------------------

const CLASS_COLORS = {
  A: "hsl(220, 70%, 50%)", // 파랑 — A반
  B: "hsl(160, 60%, 45%)", // 초록 — B반
  C: "hsl(30, 80%, 55%)",  // 주황 — C반
};

// ---------------------------------------------------------------------------
// 커스텀 Tooltip
// ---------------------------------------------------------------------------

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RankDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "13px",
      }}
    >
      <p className="font-semibold">{data.rank}등 — {data.name}</p>
      <p>반: {data.classCode}반</p>
      <p>총점: {data.totalScore}점</p>
      <p
        style={{
          color: data.aboveCutline ? "hsl(220, 70%, 50%)" : "hsl(0, 0%, 60%)",
          fontWeight: data.aboveCutline ? 600 : 400,
        }}
      >
        {data.aboveCutline ? "상위 40%" : "하위 60%"}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 타입 정의
// ---------------------------------------------------------------------------

interface StudentRankChartProps {
  /** buildRankData() 반환값 — 총점 내림차순 정렬된 순위 배열 */
  data: RankDataPoint[];
  /** computeOverallCutline() 반환값 — 전체 상위 40% 컷라인 점수 */
  cutlineScore: number;
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

/**
 * 전체 학생 순위 BarChart
 * - X축: 순위 번호 (10단위 tick 표시)
 * - Y축: 총점 (0~100)
 * - 반별 색상 Cell 적용
 * - aboveCutline 여부로 투명도(opacity) 차별화
 * - 40% 컷라인 수평 빨간 점선 ReferenceLine
 * - 학생 수가 많을 경우 가로 스크롤 지원
 */
export function StudentRankChart({ data, cutlineScore }: StudentRankChartProps) {
  // 학생 수에 따른 차트 너비 계산 — 최소 800px, 학생당 8px
  const chartWidth = Math.max(800, data.length * 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>전체 학생 순위 (총점 기준)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 가로 스크롤 래퍼 — 학생 수가 많을 때 */}
        <div className="overflow-x-auto">
          <div style={{ width: chartWidth }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                {/* 그리드 */}
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

                {/* X축 — 순위 번호, 10단위 tick */}
                <XAxis
                  dataKey="rank"
                  interval={9}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  label={{
                    value: "순위",
                    position: "insideBottom",
                    offset: -2,
                    fill: "var(--color-muted-foreground)",
                    fontSize: 12,
                  }}
                />

                {/* Y축 — 총점 0~100 */}
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  label={{
                    value: "총점",
                    angle: -90,
                    position: "insideLeft",
                    fill: "var(--color-muted-foreground)",
                    fontSize: 12,
                  }}
                />

                {/* 커스텀 툴팁 */}
                <Tooltip content={<CustomTooltip />} />

                {/* 40% 컷라인 수평 빨간 점선 */}
                <ReferenceLine
                  y={cutlineScore}
                  stroke="hsl(0, 72%, 51%)"
                  strokeDasharray="5 5"
                  label={{
                    value: `40% 컷라인 (${cutlineScore}점)`,
                    position: "insideTopRight",
                    fill: "hsl(0, 72%, 51%)",
                    fontSize: 11,
                  }}
                />

                {/* 순위 Bar — Cell로 반별 색상 + aboveCutline 투명도 적용 */}
                <Bar dataKey="totalScore" name="총점" isAnimationActive={false}>
                  {data.map((entry) => (
                    <Cell
                      key={`cell-${entry.rank}`}
                      fill={CLASS_COLORS[entry.classCode]}
                      opacity={entry.aboveCutline ? 1 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 하단 범례 — Recharts Legend 대신 커스텀 div */}
        <div className="mt-3 flex items-center justify-center gap-6">
          {(["A", "B", "C"] as const).map((cls) => (
            <div key={cls} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: CLASS_COLORS[cls] }}
              />
              <span className="text-sm text-muted-foreground">{cls}반</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
