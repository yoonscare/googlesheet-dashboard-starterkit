# Codebase Concerns

**Analysis Date:** 2026-02-22

## Tech Debt

**No explicit test infrastructure:**
- Issue: Project has zero test files despite complex data fetching and authentication logic
- Files: `lib/sheets.ts`, `lib/data.ts`, `auth.ts`, `app/(auth)/login/page.tsx`
- Impact: No automated verification of Google Sheets API integration, data parsing, or auth flows. Regressions go undetected until production.
- Fix approach: Add Jest/Vitest configuration with unit tests for `sheets.ts` (mocking googleapis), integration tests for `data.ts` (fallback logic), and auth callback tests

**Unvalidated environment variable substitution:**
- Issue: `GOOGLE_PRIVATE_KEY` environment variable handling uses simple string `.replace(/\\n/g, "\n")` without validation or error messaging
- Files: `lib/sheets.ts` (line 19)
- Impact: Malformed private keys fail silently during JWT auth, only surfaced when sheets.ts throws in try/catch. No clear error output to developer.
- Fix approach: Parse and validate private key format before auth client creation; throw explicit error if invalid format detected

**No data validation in sheet parsers:**
- Issue: `parseKpiFromSheet`, `parseMonthlyRevenueFromSheet`, `parseCategoryFromSheet`, `parseOrdersFromSheet` assume sheet data matches expected structure without validation
- Files: `lib/data.ts` (lines 16–56)
- Impact: Malformed or reordered sheet columns silently produce invalid data (0 values, type coercion bugs). No error thrown to indicate schema mismatch.
- Fix approach: Add schema validation (e.g., Zod) to each parser; throw explicit error if sheet structure doesn't match expected layout

**Hardcoded sheet range assumptions:**
- Issue: Fixed ranges like `"KPI!A1:B5"`, `"매출!A1:B13"` baked into `getDashboardData()`
- Files: `lib/data.ts` (lines 76–80)
- Impact: If sheet structure changes (added columns, more rows), silent data loss. Scaling to multiple sheets requires code changes.
- Fix approach: Make ranges configurable via environment variables or a config file

## Security Considerations

**Development-mode credential provider lacks password validation:**
- Risk: When `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` are unset, `auth.ts` enables Credentials Provider with email-only login (no password). Anyone with network access can login as any email address by guessing.
- Files: `auth.ts` (lines 30–54)
- Current mitigation: Development-only feature; `ALLOWED_EMAILS` whitelist can restrict access, but defaults to allow-all if empty
- Recommendations: (1) Remove email-only auth from production; (2) Enforce non-empty `ALLOWED_EMAILS` in production builds; (3) Add warning banner to login UI when dev mode active; (4) Use mock credentials (e.g., `dev@example.com` / `password123`) instead of unrestricted email-only

**Console.error in production code:**
- Risk: `console.error` logs full error objects from Google Sheets API failures, potentially exposing stack traces, service account email, or internal details to client console
- Files: `lib/data.ts` (line 98)
- Current mitigation: Error logged on server-side only, not sent to client
- Recommendations: (1) Use structured logging instead of console; (2) Filter sensitive fields from error logs; (3) Log only error type/code, not full error object

**Google Sheets service account key in .env.local:**
- Risk: GOOGLE_PRIVATE_KEY stored as plaintext in `.env.local`; if `.env.local` is accidentally committed or server is compromised, private key is exposed
- Files: `.env.example`, `lib/sheets.ts`
- Current mitigation: `.env.local` in `.gitignore`, but reliance on manual developer discipline
- Recommendations: (1) Use .env.local strictly; (2) Consider externalizing to secret manager (e.g., HashiCorp Vault, AWS Secrets Manager) for production; (3) Document .env.local security in CLAUDE.md

**Unauthenticated proxy route exposure:**
- Risk: `proxy.ts` middleware protects `/dashboard` but does NOT protect `/api` routes. If custom API routes added without auth checks, they're exposed.
- Files: `proxy.ts` (lines 29–31)
- Current mitigation: No custom API routes yet; only `/api/auth/[...nextauth]/route.ts` which is self-protected
- Recommendations: (1) Extend proxy matcher to include `/api` with explicit whitelist of unprotected endpoints; (2) Add JSDoc requirement: "All new /api routes must have auth checks"

## Error Handling

**No error boundary for chart components:**
- Problem: `RevenueChart` and `CategoryChart` are Client Components using Recharts. If data is invalid or render fails, entire dashboard breaks with no fallback UI
- Files: `components/dashboard/revenue-chart.tsx`, `components/dashboard/category-chart.tsx`
- Impact: Any data type mismatch (e.g., negative revenue) could crash the page
- Recommendation: Wrap in React Error Boundary or add validation before render; catch Recharts render errors

**Unhandled async errors in getDashboardData():**
- Problem: Individual `fetchSheetData()` calls can reject (network error, auth failure), but `Promise.all` only logs generic "Google Sheets data fetch failed". No per-sheet error reporting.
- Files: `lib/data.ts` (lines 74–100)
- Impact: Developer can't distinguish which sheet failed (KPI, revenue, category, or orders). Debugging multi-sheet errors is opaque.
- Recommendation: Use `Promise.allSettled()` instead; log which sheet(s) failed and why

**Missing error UI for sheet integration failures:**
- Problem: Dashboard page (`app/(dashboard)/dashboard/page.tsx`) calls `getDashboardData()` without error handling. If all sheets fail, page displays mock data with no indication that real data fetch failed.
- Files: `app/(dashboard)/dashboard/page.tsx` (line 11)
- Impact: Users don't know if they're viewing live or fallback data
- Recommendation: Add metadata to DashboardData to track which sections used mock vs real data; display subtle indicator in UI

## Fragile Areas

**Currency formatting in multiple places:**
- Files: `components/dashboard/kpi-cards.tsx` (line 15), `components/dashboard/revenue-chart.tsx` (line 40), `components/dashboard/recent-orders-table.tsx` (line 54)
- Why fragile: `₩${(amount / 10000).toLocaleString()}만` (10,000 KRW units) hardcoded in three components; `₩${amount.toLocaleString()}` hardcoded in table. If formatting rule changes, must update multiple places.
- Safe modification: Create utility function in `lib/utils.ts` (e.g., `formatKRW(amount, units?: 'won'|'ten-thousand')`) and use consistently
- Test coverage: No tests for formatting edge cases (negative values, zero, decimals)

**Status badge styling tightly coupled to Recharts and hardcoded status values:**
- Files: `components/dashboard/recent-orders-table.tsx` (lines 20–25)
- Why fragile: `statusStyles` object maps status literals directly to Tailwind classes. Adding a new status (e.g., "반품중") requires code change in component. Color palette not DRY with CSS variables.
- Safe modification: Move status config to `types/dashboard.ts` as array of objects with status, label, and CSS variable references
- Test coverage: No tests for missing status values

**Hardcoded timezone assumptions:**
- Problem: Order dates stored as `"YYYY-MM-DD"` strings (e.g., `"2025-01-15"`). No timezone info; unclear if dates are UTC, KST, or user's local timezone.
- Files: `lib/mock-data.ts`, sheet parsing in `lib/data.ts`
- Impact: Date filtering/sorting could be off by a day depending on deployment timezone
- Recommendation: Store dates with explicit timezone (ISO 8601 with Z suffix or explicit offset); add comment documenting timezone assumption

**Client session not null-checked in header:**
- Files: `components/layout/header.tsx` (line 22)
- Why fragile: `session?.user?.name` and `session?.user?.email` are safely optional-chained, but if session is null, avatar shows "U" and dropdown shows `null` in labels
- Impact: Confusing UX if auth fails but page still loads; suggests degraded state is acceptable
- Safe modification: Render "Loading..." or minimal UI if session is null; add error boundary

## Performance Bottlenecks

**No caching for Google Sheets data:**
- Problem: `getDashboardData()` fetches all 4 sheets via API on every dashboard page load. No caching strategy.
- Files: `lib/data.ts` (line 68)
- Current capacity: Assuming 100 concurrent users, that's 400 API calls/load. Google Sheets API quota is 500 calls/100s per user/project by default.
- Scaling path: (1) Add server-side caching with 5–15 minute TTL (e.g., `node-cache` or Redis); (2) Implement incremental sync (polling for changes); (3) Use Google Sheets webhook notifications if available

**Promise.all blocks on slowest sheet:**
- Problem: `Promise.all([kpi, revenue, category, orders])` waits for all 4 sheets. If one sheet is slow (network latency, large data), entire dashboard blocks.
- Files: `lib/data.ts` (line 76)
- Impact: Perceived load time = slowest sheet latency + parse time (typically 500ms–2s per sheet)
- Improvement path: Fetch sheets in parallel but render progressively; use React Suspense boundaries per card/chart to show placeholders for slow sheets

**No pagination for recent orders:**
- Problem: All 10 orders fetched and rendered in table every load, even if user only sees 5 due to viewport
- Files: `lib/mock-data.ts` (lines 38–120), `components/dashboard/recent-orders-table.tsx`
- Impact: Negligible now (10 rows), but O(n) memory growth as order history grows
- Improvement path: Add pagination or lazy-load with intersection observer

## Scaling Limits

**Mock data hardcoded and large:**
- Limit: `mockDashboardData` in `lib/mock-data.ts` is ~120 lines of data (KPI, 12 months, 5 categories, 10 orders)
- What breaks: If testing with 100+ orders or 50+ categories, mock data must be manually updated; no factory/generator
- Scaling path: Create mock data factory (e.g., using `faker` library) to generate arbitrary size datasets for testing

**Chart color palette limited to 5 variables:**
- Limit: `var(--chart-1)` through `var(--chart-5)` in `app/globals.css`
- What breaks: If category distribution has 6+ categories, colors repeat or run out
- Scaling path: Generate dynamic color palette or use a color generation library; document expected max categories

## Test Coverage Gaps

**Google Sheets API integration untested:**
- What's not tested: `fetchSheetData()` and `getAuthClient()` - core integration with googleapis library
- Files: `lib/sheets.ts`
- Risk: Any change to JWT auth setup, scope, or API call structure breaks silently in production
- Priority: High

**Data parsing logic untested:**
- What's not tested: `parseKpiFromSheet()`, `parseMonthlyRevenueFromSheet()`, `parseCategoryFromSheet()`, `parseOrdersFromSheet()` - all assume data shape but don't validate
- Files: `lib/data.ts` (lines 16–56)
- Risk: Malformed sheet data produces invalid domain objects (e.g., `NaN` revenue, missing status)
- Priority: High

**Auth flow untested:**
- What's not tested: `signIn` callback with email whitelist, JWT session callback, dev credentials provider
- Files: `auth.ts` (lines 66–80)
- Risk: Whitelist logic can be bypassed or silently broken by NextAuth version changes
- Priority: High

**Component render with mock data untested:**
- What's not tested: `KpiCards`, `RevenueChart`, `CategoryChart`, `RecentOrdersTable` with various data shapes (empty, malformed, extreme values)
- Files: `components/dashboard/*.tsx`
- Risk: Chart rendering errors or UX bugs (negative revenue, 0 orders, missing categories)
- Priority: Medium

---

*Concerns audit: 2026-02-22*
