# Stack Research

**Domain:** Academic grading analytics dashboard (간호학과 실습 성적 대시보드)
**Researched:** 2026-02-22
**Confidence:** HIGH (core stack verified against Next.js 16.1.6 official docs + Context7; supporting libraries verified against npm and official docs)

---

## Context: Brownfield Constraints

This is a **brownfield project** — the base stack is fixed by the existing codebase. The research question is not "what stack to choose" but "what to add, what to change, and what patterns to adopt" for the new academic grading use case on top of the existing foundation.

**Fixed (do not replace):**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- Tailwind CSS v4 (CSS-based config via `app/globals.css`)
- shadcn/ui (new-york style, `components.json` configured)
- Recharts 3.7.0
- googleapis 171.4.0 (Google Sheets API v4, service account)
- NextAuth.js 5.0.0-beta.30
- next-themes 0.4.6
- TypeScript 5

---

## Recommended Stack

### Core Technologies (existing — confirmed current)

| Technology | Version | Purpose | Why Confirmed |
|------------|---------|---------|---------------|
| Next.js | 16.1.6 | App Router SSR/SSG framework | Official docs verified at nextjs.org/docs (doc version 16.1.6, updated 2026-02-20). `use cache` directive now stable in v16. |
| React | 19.2.3 | UI rendering, Server Components | Ships with Next.js 16. Server Components for data-fetch pages, Client Components only for interactive charts. |
| TypeScript | 5.x | Type safety | Required for robust grading domain model with complex nested types (multi-row headers, score breakdowns). |
| Tailwind CSS | v4 | Utility-first CSS | CSS-based config (`@theme` in globals.css) already configured. No `tailwind.config.ts` needed in v4. |
| shadcn/ui | latest (via `shadcn@3.8.4`) | Accessible component primitives | new-york style configured. `Badge`, `Input`, `Select`, `Tabs` need to be added via `npx shadcn add`. |
| Recharts | 3.7.0 | SVG chart rendering | Latest stable as of 2026-02. RadarChart, BarChart (histogram), ComposedChart, ReferenceLine all available in v3. |
| googleapis | 171.4.0 | Google Sheets API v4 client | Already integrated. `spreadsheets.get` with `fields=sheets(merges,data)` needed for 3-row merged header parsing. |

### New Caching Layer — Use Cache Directive (Next.js 16 native)

**Confidence: HIGH** (verified against official Next.js 16.1.6 docs, updated 2026-02-20)

Next.js 16 promotes `'use cache'` from experimental (v15) to stable feature via `cacheComponents: true`. This replaces `unstable_cache` for caching Google Sheets API calls.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
}
```

```typescript
// lib/sheets.ts — Google Sheets fetch with cache
export async function fetchSheetData(range: string): Promise<string[][] | null> {
  'use cache'
  cacheLife('minutes')       // 15-min stale default; adjust per use case
  cacheTag('sheets-data')    // tag for on-demand revalidation
  // ... googleapis call
}
```

**Why `'use cache'` over `unstable_cache`:**
- `unstable_cache` is deprecated in Next.js 16 (docs explicitly say "replaced by `use cache`")
- `'use cache'` works at function, component, or file level — no wrapper boilerplate
- `cacheLife` and `cacheTag` APIs are cleaner than manual `revalidate`/`tags` options
- Grading data changes infrequently (faculty update sheets manually) — ISR-style 15–60 min revalidation is ideal

### Additional shadcn/ui Components to Install

| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| `badge` | 상/중/하 달성도 등급 표시, A/B/C반 레이블 | `npx shadcn add badge` |
| `input` | 학생 검색 필드 | `npx shadcn add input` |
| `select` | 반 선택 필터 드롭다운 | `npx shadcn add select` |
| `tabs` | 반별 탭 전환 (A반/B반/C반) | `npx shadcn add tabs` |
| `separator` | 섹션 구분선 | `npx shadcn add separator` |
| `tooltip` | 차트 hover 설명, 컷라인 안내 | `npx shadcn add tooltip` |
| `skeleton` | 데이터 로딩 상태 (Suspense fallback) | `npx shadcn add skeleton` |
| `progress` | 학습성과 달성률 바 | `npx shadcn add progress` |

**Note:** Do NOT add `data-table` (TanStack Table wrapper) — the grading table is simple enough for the base `<Table>` component with client-side filter state.

### Recharts Components by Feature

**Confidence: HIGH** (verified against Context7 Recharts docs, version 3.7.0)

| Feature | Recharts Component | Key Props |
|---------|-------------------|-----------|
| 성적 분포 히스토그램 | `<BarChart>` + `<Bar>` | Custom bin grouping in data transform layer |
| 반별 평균 비교 | `<BarChart>` grouped | Multiple `<Bar>` per class (A/B/C) |
| 상위 40% 컷라인 | `<ReferenceLine y={cutline}>` | `stroke="red"`, `strokeDasharray="3 3"`, `label` prop |
| 학생별 레이더 차트 | `<RadarChart>` + `<Radar>` | `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis` |
| 항목별 분포 | `<ComposedChart>` | Combines Bar + Line for mean overlay |
| 학습성과 상/중/하 | `<BarChart>` stacked | `stackId="a"` on each `<Bar>` |
| 조건부 셀 색상 | `<Bar>` + `<Cell>` | Per-bar fill based on score threshold |

**Critical pattern — Reference line for 40% cutline:**
```tsx
// 'use client' component — Recharts requires client
import { ReferenceLine } from 'recharts'

<ReferenceLine
  y={cutlineScore}
  label={{ value: `상위 40% 컷 (${cutlineScore}점)`, position: 'insideTopRight' }}
  stroke="hsl(0 84% 60%)"
  strokeDasharray="4 4"
/>
```

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | 0.563.0 | Icon set (already installed) | Navigation, KPI card icons, search icon |
| `tailwind-merge` | 3.4.0 | Merge Tailwind classes without conflicts (already installed) | `cn()` utility — already configured in `lib/utils.ts` |
| `clsx` | 2.1.1 | Conditional class building (already installed) | Inside `cn()` utility |
| `tw-animate-css` | 1.4.0 | CSS animation utilities (already installed) | Skeleton shimmer, chart entry animations |

**Do NOT add:**
- `@tanstack/react-table` — overkill for a 40-student table; base shadcn Table + `useState` filter is sufficient
- `zustand` / `jotai` — no global state needed; sheet selection is local component state
- `react-query` / `swr` — server-side data fetching via Server Components is the correct pattern in Next.js 16 App Router; client-side data fetching libraries conflict with the RSC model
- `date-fns` — no date manipulation needed; sheet data uses Korean semester strings directly

---

## Installation

No new runtime dependencies are needed. Only additional shadcn/ui components need to be added:

```bash
# shadcn/ui 추가 컴포넌트 설치
npx shadcn add badge
npx shadcn add input
npx shadcn add select
npx shadcn add tabs
npx shadcn add separator
npx shadcn add tooltip
npx shadcn add skeleton
npx shadcn add progress
```

**next.config.ts change required — enable `use cache`:**
```bash
# next.config.ts에 cacheComponents: true 추가 필요 (런타임 의존성 없음)
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Recharts 3.7.0 (existing) | Chart.js / react-chartjs-2 | Never in this project — Recharts is already installed, React-native SVG approach fits RSC model better than Canvas-based Chart.js |
| Recharts 3.7.0 (existing) | Victory Charts | Only if Recharts RadarChart proves too rigid for custom label formatting — unlikely given v3 customization options |
| shadcn/ui `<Table>` + `useState` | TanStack Table (`@tanstack/react-table`) | Only if pagination beyond 120 students (3 classes × 40), column sorting, or server-side pagination is needed — out of scope |
| `'use cache'` directive | `unstable_cache` | Never — `unstable_cache` is deprecated in Next.js 16, replaced by `'use cache'` per official docs |
| `'use cache'` directive | ISR (`export const revalidate = 300`) | Use route-level `revalidate` export if `cacheComponents: true` causes build issues; semantically equivalent for this use case |
| googleapis (existing) | google-spreadsheet npm package | Only if merged-cell header parsing becomes unmanageable; `google-spreadsheet` wraps googleapis with higher-level API including merge awareness, but adds bundle weight |
| Server Components for data fetching | Client Components + SWR | Never for primary data — grading data is not user-specific real-time data; SSR/ISR is correct. Client components only for interactive UI (search input, class tab selector) |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `unstable_cache` | Deprecated in Next.js 16; docs say "replaced by `use cache`" (verified 2026-02-20) | `'use cache'` directive with `cacheLife()` + `cacheTag()` |
| `middleware.ts` | Already renamed to `proxy.ts` in this project per Next.js 16 convention | `proxy.ts` (already correct) |
| Client-side data fetching (SWR, React Query) | Contradicts Next.js App Router RSC model; fetching on server reduces client JS bundle, removes auth concerns from client | Server Components with `'use cache'` |
| `@tanstack/react-table` | Heavy dependency for a 40-120 row static table; adds complexity for simple search/filter | shadcn `<Table>` + `useState` for client filter |
| Canvas-based chart libraries (Chart.js) | SVG-based Recharts already installed; Canvas charts don't support Tailwind CSS variable theming | Recharts (existing) |
| Multiple Google Sheets API calls without `Promise.all` | Sequential API calls would add 3× latency for A/B/C class sheets | `Promise.all([fetchSheetData('A반!...'), fetchSheetData('B반!...'), fetchSheetData('C반!...')])` |
| Direct `\\n` in private key env without replace | JWT auth fails silently if `GOOGLE_PRIVATE_KEY` newlines not converted | `.replace(/\\n/g, '\n')` already in `lib/sheets.ts` — keep this |
| Displaying real student names | Privacy violation when dashboard shared among faculty | Anonymize at parse layer: `김기훈` → `김*훈` (mask middle character(s)) |

---

## Stack Patterns by Variant

**Google Sheets 병합 셀 헤더(3행) 파싱 시:**
- Use `spreadsheets.get` with `fields=sheets(merges,data)` + `ranges=['A반!A1:ZZ3']` to get merge ranges
- Map column index → score category using merge span data
- Parse student rows starting at row 4 (`A반!A4:ZZ`)
- Keep merge detection logic in `lib/sheets.ts`, column mapping in `lib/data.ts`

**학생 검색/필터 (반 선택 + 이름 검색) 시:**
- Fetch all 3 classes as Server Component
- Pass data to Client Component wrapper with `useState` for filter state
- Filter in-memory (120 students max — no server-side pagination needed)
- Pattern: Server Component fetches → Client Component controls filter → renders filtered subset

**레이더 차트 (학생별 항목 강약점) 시:**
- Normalize scores to percentage of max before plotting (e.g., 사전학습 10점 만점 → 0~100%)
- Use `domain={[0, 100]}` on `PolarRadiusAxis` for consistent scale across items
- 5~7 axes maximum for readability

**다크모드 호환 차트 색상 시:**
- Recharts SVG cannot read CSS variables directly (SVG context limitation)
- Pattern already in project: map `var(--chart-1..5)` to hardcoded HSL values per theme
- Or: read `document.documentElement` computed style in Client Component to get resolved oklch values

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `next@16.1.6` | `react@19.2.3` | Verified — React 19 is the required peer for Next.js 16 |
| `next-auth@5.0.0-beta.30` | `next@16.1.6` | Uses `AUTH_` prefix env vars; `proxy.ts` export (not `middleware.ts`) |
| `recharts@3.7.0` | `react@19.2.3` | v3 rewrote state management; React 19 compatible. No breaking changes vs. v3.0 for chart types used. |
| `tailwindcss@4.x` | shadcn/ui (new-york) | CSS-based config; shadcn components import from `shadcn/tailwind.css` — already configured |
| `googleapis@171.4.0` | `next@16.1.6` | Server-only import; never import in Client Components. Use in Server Components or API routes only. |
| `'use cache'` directive | `next@16.x` with `cacheComponents: true` | Stable in v16.0.0+; NOT available in v15 without experimental flag |

---

## Sources

- **Next.js official docs** — `https://nextjs.org/docs/app/api-reference/directives/use-cache` (doc-version: 16.1.6, last-updated: 2026-02-20) — `use cache` directive stable in v16, `unstable_cache` deprecated
- **Next.js official docs** — `https://nextjs.org/docs/app/api-reference/functions/unstable_cache` (doc-version: 16.1.6, last-updated: 2026-02-20) — confirms "replaced by `use cache`"
- **Context7 /recharts/recharts** (version 3.7.0, HIGH reputation, score 88.7) — RadarChart, ReferenceLine, BarChart with Cell, ComposedChart patterns verified
- **npm recharts** — `https://www.npmjs.com/package/recharts` — latest version 3.7.0 confirmed
- **Google Sheets API v4 REST docs** — `https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get` — `fields=sheets(merges,data)` + `includeGridData=true` for merged header detection
- **shadcn/ui official docs** — `https://ui.shadcn.com/docs/components` — Badge, Input, Select, Tabs, Separator, Tooltip, Skeleton, Progress available for new-york style
- **Context7 /vercel/next.js** (version 16.1.6, HIGH reputation, score 89.5) — Server Component data fetching patterns, `unstable_cache` ISR, App Router caching strategies

---

*Stack research for: 간호학과 아동실습 성적 대시보드 (academic grading analytics dashboard)*
*Researched: 2026-02-22*
