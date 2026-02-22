// 학습성과 달성도 분포표 — Server Component
// 3개 PO × 4개 열(A반/B반/C반/전체) 상/중/하 인원수, 달성률, 달성/미달성 배지를 렌더링한다.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { PoAchievementData } from '@/lib/grade-po';

// 학습성과 레이블 상수 (po 키 → 표시 문자열)
const PO_LABELS = {
  po2: '학습성과2 (대상자간호, 64점)',
  po5: '학습성과5 (안전과질, 8점)',
  po3: '학습성과3 (전문직, 8점)',
} as const;

interface PoAchievementTableProps {
  poData: PoAchievementData;
}

/**
 * 학습성과 달성도 분포표 컴포넌트
 * - 3개 PO(po2/po5/po3) × 4개 열(A반/B반/C반/전체)
 * - 각 셀에 상/중/하 인원수, 달성률 %, 달성/미달성 배지 표시
 * - '전체' 열은 font-bold로 시각적 강조
 * - 태블릿 이하에서 overflow-x-auto로 가로 스크롤 대응
 */
export function PoAchievementTable({ poData }: PoAchievementTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>학습성과 달성도</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-medium text-muted-foreground">
                  학습성과
                </th>
                {(['A반', 'B반', 'C반'] as const).map((col) => (
                  <th
                    key={col}
                    className="px-2 py-2 text-center font-medium text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
                {/* 전체 열은 시각적으로 강조 */}
                <th className="px-2 py-2 text-center font-bold">전체</th>
              </tr>
            </thead>
            <tbody>
              {(['po2', 'po5', 'po3'] as const).map((poKey) => {
                const row = poData[poKey];
                return (
                  <tr key={poKey} className="border-b last:border-0">
                    {/* 학습성과 레이블 */}
                    <td className="py-3 pr-4 font-medium">{PO_LABELS[poKey]}</td>

                    {/* A반, B반, C반 셀 */}
                    {(['A', 'B', 'C'] as const).map((cls) => {
                      const d = row[cls];
                      return (
                        <td key={cls} className="px-2 py-3 text-center">
                          {/* 상/중/하 인원수 */}
                          <div className="text-xs text-muted-foreground">
                            상 {d.high} / 중 {d.mid} / 하 {d.low}
                          </div>
                          {/* 달성률 + 달성/미달성 배지 */}
                          <div className="mt-1 flex items-center justify-center gap-1">
                            <span className="font-semibold">{d.achieveRate}%</span>
                            {d.achieved ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                달성
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <XCircle className="h-3 w-3" />
                                미달성
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* 전체 열 — font-bold로 시각적 강조 */}
                    {(() => {
                      const d = row['all'];
                      return (
                        <td className="px-2 py-3 text-center font-bold">
                          {/* 상/중/하 인원수 */}
                          <div className="text-xs font-normal text-muted-foreground">
                            상 {d.high} / 중 {d.mid} / 하 {d.low}
                          </div>
                          {/* 달성률 + 달성/미달성 배지 */}
                          <div className="mt-1 flex items-center justify-center gap-1">
                            <span className="font-bold">{d.achieveRate}%</span>
                            {d.achieved ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                달성
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <XCircle className="h-3 w-3" />
                                미달성
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
