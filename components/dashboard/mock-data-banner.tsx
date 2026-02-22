// Mock 데이터 경고 배너 — dataSource 상태를 시각적으로 알림
// Server Component (인터랙션 없음, use client 불필요)

import type { DataSource } from '@/types/grades';

interface MockDataBannerProps {
  dataSource: DataSource;
}

/**
 * 데이터 출처가 mock 또는 partial-mock일 때 경고 배너를 표시한다.
 * - 'sheets'이면 아무것도 렌더링하지 않음
 * - 'partial-mock'이면 일부 반 폴백 경고 표시
 * - 'mock'이면 전체 mock 사용 경고 표시
 */
export function MockDataBanner({ dataSource }: MockDataBannerProps) {
  // Google Sheets 연결 성공 시 배너 미표시
  if (dataSource === 'sheets') return null;

  const message =
    dataSource === 'partial-mock'
      ? '일부 반 데이터를 목 데이터로 대체 중입니다 (Google Sheets 연결 오류)'
      : '목 데이터 사용 중 — Google Sheets 연결이 설정되지 않았습니다';

  return (
    <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
      {message}
    </div>
  );
}
