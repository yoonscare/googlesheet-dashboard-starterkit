# Project Research Summary

**Project:** 간호학과 아동실습 성적 대시보드 (Nursing Practicum Grade Analytics Dashboard)
**Domain:** Academic grading analytics — faculty-facing, read-only, Google Sheets as data source
**Researched:** 2026-02-22
**Confidence:** HIGH

## Executive Summary

This is a brownfield academic analytics dashboard built on a stable, already-deployed Next.js 16 / Google Sheets foundation. The existing codebase is a sales KPI dashboard that must be repurposed into a nursing practicum grading tool for faculty managing three class sections (A반, B반, C반, ~40 students each). The core technical work is replacing the data layer — the app shell, auth, and routing infrastructure are already proven and require no changes. The single hardest technical problem is parsing Google Sheets' 3-row merged-cell header structure into typed student grade objects; every downstream feature depends on this parser being correct before any UI is built.

The recommended approach is to build foundation-first in strict dependency order: typed domain model, then parser with mock fallback, then statistics utilities, then server-rendered views, and finally interactive client-side charts. The two primary value propositions — the relative grading 40% cutline visualization and the learning outcome 상/중/하 accreditation analysis table — are the minimum viable product beyond which the dashboard is just a data viewer professors would use over a spreadsheet. No new runtime dependencies are required; only additional shadcn/ui components and a one-line `next.config.ts` change to enable the stable `'use cache'` directive.

The dominant risks are data-layer correctness (silent column misalignment, floating-point rounding errors in the 160-to-100 score conversion, per-class vs. global cutline calculation) and privacy compliance (Korean PIPA — student names must be anonymized at parse time, never in the UI layer). Both risks are fully preventable with disciplined build order and unit tests written before the data layer is connected to real Sheets data.

---

## Key Findings

### Recommended Stack

The stack is fixed by the existing codebase. No new runtime dependencies are needed. The only configuration change required is adding `cacheComponents: true` to `next.config.ts` to enable the now-stable `'use cache'` directive (which replaces the deprecated `unstable_cache` in Next.js 16). Eight additional shadcn/ui component primitives need to be installed via `npx shadcn add` — all are already available in the configured new-york style.

**Core technologies:**

- **Next.js 16.1.6 (App Router):** Framework — SSR/RSC model keeps API keys server-side; `'use cache'` provides ISR-style caching for Sheets API calls
- **React 19.2.3:** UI rendering — Server Components for data pages, Client Components only where Recharts/useState are required
- **TypeScript 5:** Type safety — critical for complex nested grade domain types with multiple score components
- **Tailwind CSS v4:** Styling — CSS-based config via `app/globals.css`; no `tailwind.config.ts` needed
- **shadcn/ui (new-york):** Component primitives — `Badge`, `Input`, `Select`, `Tabs`, `Skeleton`, `Tooltip`, `Progress`, `Separator` to be added
- **Recharts 3.7.0:** Chart rendering — `BarChart` + `ReferenceLine` for cutline histogram; `RadarChart` for per-student strength/weakness view; `ComposedChart` for class comparison
- **googleapis 171.4.0:** Google Sheets API v4 — existing `lib/sheets.ts` wrapper retained; `spreadsheets.values.get` with header-row column mapping (not `spreadsheets.get` merge metadata)

**Do not add:** `@tanstack/react-table`, `zustand`, `swr`, `react-query`, `date-fns`, `Chart.js`. These are all explicitly out of scope or conflict with the App Router RSC model.

### Expected Features

No existing tool combines relative grading cutline visualization, Korean nursing accreditation 상/중/하 outcome analysis, and Google Sheets as a live data source. This dashboard fills a genuine gap.

**Must have (table stakes — v1 launch blockers):**
- Google Sheets 3-class data fetch with 3-row merged-header parser — without this, nothing works
- Name anonymization (김*훈) — hard legal requirement under Korean PIPA from day 1
- KPI summary cards: total students, per-class average, overall average, max/min
- Grade distribution histogram per class (5 or 10-point bins)
- Relative grading 40% cutline marker — the dashboard's core value proposition
- Descriptive statistics per class: mean, std dev, median
- Per-student score table (searchable, filterable by class, anonymized)
- Learning outcome 상/중/하 tier analysis table — accreditation reporting artifact

**Should have (differentiators — v1.x after initial validation):**
- Per-student radar chart showing component strength/weakness (normalized to % of max)
- Multi-class comparison chart: A/B/C반 side-by-side grouped bar or stats table
- Sorted rank chart with cutline overlay (all students ranked descending)
- 핵심간호술 (core nursing skills) dedicated KPI card + histogram (separate 0-100 scale)
- 달성률 progress indicators per learning outcome (% reaching 상 or 중+)

**Defer (v2+):**
- Manual cache invalidation ("새로고침") button
- Historical semester comparison (requires archiving Sheets — not currently available)
- Score component breakdown bar chart (table form sufficient for v1)
- CSV/PDF export

**Anti-features (never build):** Automatic grade assignment, student-facing view, real-time WebSocket refresh, grade entry/editing, predictive grade modeling.

### Architecture Approach

The architecture extends the existing 3-layer data pattern (`sheets.ts` → `data.ts` → page) by inserting a new `lib/grade-parser.ts` layer for 3-row header parsing and a `lib/grade-utils.ts` layer for statistics and cutline computation. Server Components handle all data fetching and aggregate computation; Client Components are limited strictly to Recharts charts and the student table's `useState` search/filter. The existing auth (`proxy.ts`, `auth.ts`), layout (`sidebar`, `header`), and routing infrastructure are unchanged.

**Major components:**

1. `types/grade.ts` — Domain type definitions (`StudentGrade`, `ClassStats`, `OutcomeAggregates`, `GradeDashboardData`); replaces `types/dashboard.ts`
2. `lib/grade-parser.ts` — 3-row header column-index mapper + student row parser + `anonymizeName()` — isolated for unit testing
3. `lib/grade-utils.ts` — `compute40PercentCutline()`, `classifyOutcomeLevel()`, `computeAggregates()` — server-side only, pure functions
4. `lib/data.ts` (rewritten as `getGradeData()`) — `Promise.all` parallel fetch of A/B/C sheets with per-sheet mock fallback; `dataSource: 'live' | 'mock' | 'partial'` field
5. `app/(dashboard)/dashboard/page.tsx` — Overview Server Component: KPI cards + distribution chart + cutline chart
6. `app/(dashboard)/students/` — Student list + `[id]` detail pages (Server); `student-table.tsx` Client Component with `useState` search
7. `app/(dashboard)/outcomes/page.tsx` — Learning outcome 상/중/하 tier table (Server Component, no interactivity)
8. `app/(dashboard)/class/page.tsx` — Multi-class comparison (Server + Client chart)
9. `components/dashboard/*.tsx` — Client chart components: `score-distribution-chart`, `cutline-chart`, `class-comparison-chart`, `student-radar-chart`

### Critical Pitfalls

1. **Google Sheets trailing empty cells return `undefined`, not `""`** — Use a safe cell accessor `(row, idx) => row[idx] ?? ""` everywhere; never use hardcoded column indexes; build column-name-to-index map from header row 2 (세부항목명); unit test with sparse rows before connecting to real data.

2. **Student name anonymization applied in UI layer (too late)** — Apply `anonymizeName()` in `lib/grade-parser.ts` at parse time; the `StudentGrade.name` field must always be pre-anonymized; never log raw Sheets `values` arrays; use a TypeScript branded type `AnonymizedName` to make accidental raw-name usage a compile error.

3. **160-to-100 score conversion introduces floating-point rounding errors** — Always round immediately: `Math.round((rawScore / 160) * 100 * 100) / 100`; store raw score alongside converted score; use raw scores for sort/rank comparisons; unit test `calculateTotalScore()` with 20+ boundary inputs.

4. **40% cutline calculated globally across all classes instead of per-class** — The Korean 상대평가 40% A-grade cap is per-section (반), not per-cohort; calculate `compute40PercentCutline()` independently for each 반; derive student count from actual parsed rows, never hardcode class sizes; label the cutline explicitly as "A 이상(A+/A 합산) 40% 컷라인".

5. **Silent mock data fallback masquerades as real grade data** — Add `dataSource: 'live' | 'mock' | 'partial'` to `GradeDashboardData`; display a visible warning banner when `dataSource !== 'live'`; disable the cutline display when `dataSource === 'mock'` to prevent professors from making real grading decisions on fake data.

---

## Implications for Roadmap

Based on research, the build order is strictly dependency-driven. No UI work can be validated until the data layer is correct. The data parser is the highest-risk component and the single blocker for everything else.

### Phase 1: Data Foundation
**Rationale:** Every feature — KPI cards, histograms, cutline, outcome analysis, student table — is blocked until `StudentGrade[]` flows correctly from Google Sheets. This phase contains the two highest-severity pitfalls (sparse cell parsing and anonymization) that are very costly to fix after UI is built on top of bad data.
**Delivers:** `types/grade.ts`, `lib/grade-parser.ts` (with `anonymizeName()`), `lib/grade-utils.ts`, `lib/mock-grade-data.ts`, `lib/data.ts` (rewritten with `getGradeData()` + `dataSource` field), `next.config.ts` updated with `cacheComponents: true`
**Addresses:** Sheets data parser, name anonymization, mock fallback with visible indicator, floating-point rounding utility, per-class cutline calculation function
**Avoids:** Pitfalls 1 (trailing empty cells), 2 (anonymization too late), 3 (rounding errors), 4 (global cutline), 5 (silent mock), 6 (rate limits — add caching here)
**Verification gate:** Unit tests covering sparse rows, NaN totals, anonymization output, cutline per class, and LO tier thresholds with correct denominators (64, 8, 8) must all pass before Phase 2 begins.

### Phase 2: Core Dashboard Views (MVP)
**Rationale:** With a verified data layer, server-rendered views and KPI cards can be built rapidly using props from `getGradeData()`. This delivers the minimum viable dashboard professors can open and immediately find useful.
**Delivers:** `app/(dashboard)/dashboard/page.tsx` (Overview: KPI cards + mock-data warning banner), `components/dashboard/kpi-cards.tsx` (replaced for grade domain), `components/dashboard/score-distribution-chart.tsx` (Client, Recharts BarChart histogram with fixed 10-point bins), `components/dashboard/cutline-chart.tsx` (Client, ReferenceLine on sorted rank chart)
**Uses:** `shadcn add badge skeleton progress` — install before this phase
**Implements:** Server Component data fetch + Client Chart boundary pattern; `Suspense` + streaming for chart loading states
**Avoids:** Pitfall 9 (Recharts empty data crash — pre-populate all bins with count 0); dark mode chart color mapping (hardcode HSL values, not CSS vars, for Recharts SVG)

### Phase 3: Student Table and Individual Views
**Rationale:** Lookup capability is non-negotiable for professors; without per-student drill-down, the dashboard cannot replace spreadsheet lookups. Builds on verified data layer; isolated from Phase 2 charts.
**Delivers:** `app/(dashboard)/students/page.tsx`, `components/dashboard/student-table.tsx` (Client, `useState` search + class filter, anonymized names, all score components as columns), `app/(dashboard)/students/[id]/page.tsx`, `components/dashboard/student-radar-chart.tsx` (Client, normalized to % of max per axis)
**Uses:** `shadcn add input select tabs` — install before this phase
**Avoids:** Pitfall 10 (radar chart with different scales — normalize all axes to 0-100%); student detail must be URL-addressable (`/students/[id]`), not client-side modal state

### Phase 4: Learning Outcome Analysis (Accreditation View)
**Rationale:** The 상/중/하 outcome analysis table is the second core value proposition and the accreditation reporting artifact. It is architecturally simple (Server Component, no interactivity) but requires correct threshold calculation logic verified in Phase 1.
**Delivers:** `app/(dashboard)/outcomes/page.tsx`, `components/dashboard/outcomes-band.tsx` (상/중/하 tier table: rows = 학습성과 LO2/LO5/LO3, columns = A반/B반/C반/전체, cells = count + percentage), 달성률 progress indicators per outcome
**Avoids:** Pitfall 7 (wrong denominator — must use 64 for LO2, 8 for LO5/LO3 from the typed `LEARNING_OUTCOMES` config constant); always display "N명 (X%)" not count alone

### Phase 5: Multi-Class Comparison and Polish
**Rationale:** Class equity comparison is a differentiator but not a blocker. Building it last allows it to reuse patterns validated in Phase 2-4. This phase also adds navigation, sidebar updates, and any UX polish items.
**Delivers:** `app/(dashboard)/class/page.tsx`, `components/dashboard/class-comparison-chart.tsx` (Client, grouped Recharts BarChart A/B/C side-by-side), per-class descriptive statistics table (mean/std/median/min/max), sidebar `navItems` updated with all 4 routes
**Uses:** `shadcn add tooltip separator` — install before this phase
**Avoids:** Chart color WCAG contrast check in both light and dark modes; cutline tie-breaking tooltip ("동점 처리는 교수 재량입니다")

### Phase Ordering Rationale

- **Data before UI:** Architecture research confirms all visualization features are blocked until `parseStudentRows()` works correctly with real sheet data. Building charts first and connecting data later is the single most common mistake in this category of project.
- **Parser isolation:** Keeping `grade-parser.ts` separate from `sheets.ts` (API wrapper) and `data.ts` (orchestrator) is required for unit testability — the highest-risk component must be independently testable without a live Sheets connection.
- **Server before Client:** KPI cards and the outcome table are Server Components with no interactivity; they can be validated end-to-end with mock data before any Recharts client component is written.
- **Cutline and outcomes as separate phases:** The cutline (Phase 2) and 상/중/하 table (Phase 4) are the two core value propositions. Separating them allows incremental delivery and faculty validation at Phase 2 completion.
- **Comparison last:** Multi-class comparison requires all three per-class data pipelines to be correct; building it last reduces debugging surface area.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Data Foundation):** The 3-row merged header parsing is the highest uncertainty item. The exact column structure of the real Google Sheet must be confirmed before column-index map constants are defined. Research-phase recommended to inspect actual sheet schema.
- **Phase 4 (Learning Outcomes):** The precise threshold percentages (85%/60%) and learning outcome denominator values (64/8/8) must be confirmed against the actual institutional accreditation criteria — sources show these can vary by institution. Validate against the actual 25-2학기 sheet or with the faculty sponsor before implementation.

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 2 (Core Dashboard):** Server Component + Recharts BarChart with ReferenceLine is a well-documented Next.js App Router pattern; no novel integrations.
- **Phase 3 (Student Table):** `useState` search filter + shadcn Table is standard; `[id]` dynamic routes are standard App Router.
- **Phase 5 (Polish):** Grouped BarChart and sidebar nav updates are straightforward; no novel integration.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Brownfield — existing versions verified against official docs (Context7 Next.js 16.1.6, npm recharts 3.7.0). `'use cache'` stable status confirmed in Next.js 16 official docs dated 2026-02-20. No new runtime dependencies; only shadcn components. |
| Features | HIGH | Requirements are precise and well-defined via PROJECT.md. Domain patterns cross-referenced against SIUE, Berkeley, UT Austin grade dashboards and KABONE accreditation framework. Feature boundaries are clear. |
| Architecture | HIGH | Brownfield — existing codebase fully inspected. Build order derived from actual component dependency graph. Server/Client boundaries follow verified Next.js App Router patterns. |
| Pitfalls | MEDIUM-HIGH | Google Sheets API behavior (trailing cells, merged cells, rate limits) verified via official docs. Privacy (PIPA) and grading math pitfalls supported by multiple sources at MEDIUM confidence. Chart pitfalls from Recharts GitHub issues at MEDIUM confidence. |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact Google Sheet column schema:** The column-index map in `lib/grade-parser.ts` must be confirmed against the actual production Google Sheet. Research assumes the schema described in ARCHITECTURE.md is correct (행1 = category, 행2 = item name, 행3 = max score, 행4+ = student data). Any deviation will require parser changes before Phase 2 can start. Validate by running `fetchSheetData('A반!A1:Z3')` and printing raw output in a development environment.
- **Learning outcome threshold confirmation:** The 85%/60% thresholds and 64/8/8 max scores should be confirmed with the faculty client before Phase 4 implementation. These values are cited from external Korean nursing accreditation sources but may be institution-specific.
- **Class enrollment confirmation:** The parser derives student count from non-empty rows, which handles mid-semester withdrawals correctly, but the exact range (`A반!A1:P100`) should be adjusted once actual student count per class is confirmed. If classes exceed 100 rows including headers, the range ceiling must be raised.
- **Google Sheet sharing:** The service account email must be explicitly shared as "뷰어" on the production Google Sheet. This is a deployment prerequisite, not a code concern, but must be on the pre-deployment checklist.

---

## Sources

### Primary (HIGH confidence)

- **Context7 /vercel/next.js** (version 16.1.6, score 89.5) — `'use cache'` directive stable in v16, `unstable_cache` deprecated, Server/Client Component data fetching patterns, props serialization requirements
- **Next.js official docs** — `https://nextjs.org/docs/app/api-reference/directives/use-cache` (doc-version 16.1.6, updated 2026-02-20) — `use cache` stable, `cacheLife`, `cacheTag` APIs
- **Context7 /recharts/recharts** (version 3.7.0, score 88.7) — RadarChart, ReferenceLine, BarChart with Cell, ComposedChart patterns
- **Google Sheets API v4 REST docs** — `https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get` — field selection, merged cell value behavior
- **Google Sheets API rate limits** — `https://developers.google.com/workspace/sheets/api/limits` — 500 req/100s per project
- **Context7 /websites/googleapis_dev_nodejs_googleapis** — `spreadsheets.values.get` merged cell behavior confirmation
- **Existing codebase** — `lib/sheets.ts`, `lib/data.ts`, `types/dashboard.ts`, `app/(dashboard)/dashboard/page.tsx` directly inspected — HIGH confidence on brownfield constraints

### Secondary (MEDIUM confidence)

- **SIUE Grade Analytics Dashboard** — `https://www.siue.edu/grade-analytics/` — university grade distribution dashboard feature patterns; FERPA privacy model
- **Learning Analytics Dashboard (Springer)** — `https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-021-00313-7` — radar chart and cohort comparison patterns
- **JKASNE nursing program outcome assessment** — `https://jkasne.org/journal/view.php?doi=10.5977/jkasne.2017.23.2.135` — 상/중/하 tier system with 85%/60% thresholds
- **Korean PIPA** — `https://pandectes.io/blog/an-overview-of-south-koreas-personal-information-protection-act-pipa/` — anonymization requirements
- **Korean university grading 상대평가** — `https://en.wikipedia.org/wiki/Academic_grading_in_South_Korea` — 40% A-grade cap context
- **Recharts GitHub issue #1581** — Empty chart / no built-in "No Data" state

### Tertiary (LOW confidence — needs validation)

- **Far East University Nursing Program Outcome Framework** — `https://www.kdu.ac.kr/nursing/sub.do?mncd=1735` — concrete 상/중/하 criteria example (institution-specific; may not match this project's institution)
- **Google Sheets merged cells issue tracker** — `https://issuetracker.google.com/issues/36753230` — merged cell top-left-only value behavior (community confirmation of documented behavior)

---

*Research completed: 2026-02-22*
*Ready for roadmap: yes*
