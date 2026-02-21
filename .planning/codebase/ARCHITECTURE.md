# Architecture

**Analysis Date:** 2026-02-22

## Pattern Overview

**Overall:** Next.js 16 App Router with Route Groups, Server Components for data fetching, Client Components for interactivity

**Key Characteristics:**
- Route Groups separate auth (`(auth)`) and dashboard (`(dashboard)`) concerns with distinct layouts
- Server-side data fetching from Google Sheets with mock fallback
- Three-layer data pattern: API wrapper → integration layer → component consumption
- Hybrid rendering: Server Components handle data fetching, Client Components manage state and interactivity
- Route protection via proxy (evolved from middleware.ts in Next.js 16)

## Layers

**API Integration Layer:**
- Purpose: Manages Google Sheets API authentication and data retrieval
- Location: `lib/sheets.ts`
- Contains: Service account JWT auth, spreadsheet range queries, error handling for API failures
- Depends on: googleapis package, environment variables (GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)
- Used by: Data aggregation layer

**Data Aggregation Layer:**
- Purpose: Unified data fetching with sheet-to-type parsing and fallback handling
- Location: `lib/data.ts`
- Contains: Parser functions for KPI, monthly revenue, category distribution, orders; getDashboardData orchestrator
- Depends on: sheets.ts, mock-data.ts, type definitions
- Used by: Page components (server-side)

**Mock Data Layer:**
- Purpose: Default data when Google Sheets not configured, individual sheet fallback on failure
- Location: `lib/mock-data.ts`
- Contains: Complete DashboardData object with sample KPI, revenue, categories, and orders
- Depends on: Type definitions
- Used by: Data aggregation layer

**Page Layer (Server Components):**
- Purpose: Entry points for routes, data fetching orchestration, layout composition
- Location: `app/(auth)/login/page.tsx`, `app/(dashboard)/dashboard/page.tsx`, `app/page.tsx`
- Contains: Async data fetching, component composition, route redirects
- Depends on: Data aggregation layer, presentation components
- Used by: Next.js routing system

**Presentation Layer (Mixed Components):**
- Purpose: UI rendering and user interaction
- Location: `components/dashboard/*` (KPI cards, charts, tables), `components/layout/*` (sidebar, header), `components/ui/*` (shadcn primitives)
- Contains: Server Components (KpiCards, RecentOrdersTable), Client Components (RevenueChart, CategoryChart, Sidebar, Header)
- Depends on: Type definitions, lucide-react icons, Recharts library, shadcn/ui components
- Used by: Page components, other presentation components

**Authentication Layer:**
- Purpose: NextAuth.js configuration with provider selection and email whitelist
- Location: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`
- Contains: Provider configuration (Google OAuth or dev Credentials), JWT session strategy, email validation callback
- Depends on: next-auth packages, environment variables (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ALLOWED_EMAILS)
- Used by: Proxy for route protection, page components for session data

**Route Protection:**
- Purpose: Enforce authentication on protected routes
- Location: `proxy.ts`
- Contains: Unauthenticated request redirection to /login, authenticated user redirection to /dashboard
- Depends on: auth.ts, NextAuth exports
- Used by: Next.js middleware chain

## Data Flow

**Initial Request to /dashboard:**

1. Proxy checks req.auth for session
2. If no session → redirect to /login
3. If session exists → NextResponse.next() allows route
4. DashboardPage executes as Server Component
5. getDashboardData called → checks isGoogleSheetsConfigured()
6. If configured: Promise.all([...sheet fetches]) with parallel requests
7. Each parser function (parseKpiFromSheet, etc.) transforms sheet rows to typed objects
8. If any sheet fails → individual mock fallback for that data section
9. DashboardData object passed to child components
10. KpiCards, RevenueChart, CategoryChart, RecentOrdersTable render with data
11. Charts marked "use client" hydrate in browser for interactivity

**Google Sheets Integration:**

1. Environment setup: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY
2. GOOGLE_PRIVATE_KEY: `\\n` (escaped newlines) converted to actual newlines in sheets.ts line 19
3. JWT auth client created on each fetchSheetData call
4. Spreadsheet ranges: "KPI!A1:B5", "매출!A1:B13", "카테고리!A1:C6", "주문!A1:F11"
5. Response values converted to 2D string array, then parsed by type-specific functions
6. If response.data.values is undefined/null → sheet fetch returns null → mock fallback used

**Error Handling Flow:**

1. fetchSheetData catches exceptions → console.error logged
2. Individual sheet failure → only that data section falls back to mock
3. getDashboardData wraps all sheet calls in try/catch → if entire batch fails, full mock returned
4. Auth errors on /login → error param passed in query string → errorMessages mapped to Korean UI

**State Management:**

- No global state management (Redux, Zustand, etc.)
- Session state: Managed by NextAuth.js, accessed via useSession() in Client Components
- UI state: Local useState in Sidebar (collapsed, mobileOpen), Header (dropdown), ThemeProvider (dark mode)
- Data state: Immutable, passed as props from server to client components

## Key Abstractions

**DashboardData Interface:**
- Purpose: Centralized type definition for all dashboard-level data
- Examples: `types/dashboard.ts` defines KpiData, MonthlyRevenue, CategoryDistribution, RecentOrder, DashboardData
- Pattern: Composition of smaller interfaces, used as parameter/return types throughout

**Route Groups:**
- Purpose: Organize routes with shared layouts without affecting URL structure
- Examples: `app/(auth)/` contains login, applies centered layout; `app/(dashboard)/` contains protected dashboard with sidebar+header
- Pattern: Parentheses in directory names are stripped from URL paths

**Server vs Client Component Split:**
- Purpose: Optimize rendering and interactivity boundaries
- Server: DashboardPage, KpiCards, RecentOrdersTable (no interactivity, data fetching)
- Client: RevenueChart, CategoryChart (Recharts DOM access), Sidebar (useState), Header (useSession, DropdownMenu), ThemeProvider (next-themes)

**Parsing Functions:**
- Purpose: Transform sheet rows (2D string arrays) to typed objects
- Examples: parseKpiFromSheet, parseMonthlyRevenueFromSheet, parseCategoryFromSheet, parseOrdersFromSheet
- Pattern: Each takes rows: string[][], returns typed array or single object

## Entry Points

**Root Page (/):**
- Location: `app/page.tsx`
- Triggers: Direct navigation to `/`
- Responsibilities: Redirect to `/dashboard` (enforced auth flow)

**Login Page (/login):**
- Location: `app/(auth)/login/page.tsx`
- Triggers: Unauthenticated user accessing protected route, or explicit /login navigation
- Responsibilities: Display Google OAuth button (if configured) or dev email login form, handle searchParams error query, render Korean error messages

**Dashboard Page (/dashboard):**
- Location: `app/(dashboard)/dashboard/page.tsx`
- Triggers: Authenticated user accessing `/dashboard` route
- Responsibilities: Fetch data via getDashboardData(), compose KPI cards + charts + table, pass data to child components

**Auth API Routes (/api/auth/[...nextauth]):**
- Location: `app/api/auth/[...nextauth]/route.ts`
- Triggers: NextAuth callback requests (signin, callback, signout, etc.)
- Responsibilities: Export NextAuth handlers for all auth flow endpoints

## Error Handling

**Strategy:** Graceful degradation with fallback data, user-facing error messages in Korean

**Patterns:**

1. **API Failures:** fetchSheetData catches exceptions, returns null; getDashboardData maps null to mock data for that section
2. **Auth Errors:** Caught by NextAuth, redirected to /login?error=code; errorMessages object maps codes to Korean UI text
3. **Invalid Data:** Parsers use nullish coalescing (e.g., `row[0] ?? ""`, `Number(row[1] ?? 0)`) to provide defaults
4. **Missing Env Vars:** isGoogleSheetsConfigured() returns false; flows to mock data; login page shows dev mode banner
5. **Email Whitelist:** ALLOWED_EMAILS empty string → all emails allowed; non-empty → includes() check enforces list

## Cross-Cutting Concerns

**Logging:**
- Google Sheets fetch failures: `console.error("Google Sheets 데이터 가져오기 실패, mock 데이터로 대체:", error)` in lib/data.ts
- No production logging framework configured (can add Sentry, LogRocket as needed)

**Validation:**
- Email whitelist: Checked in auth.ts signIn callback, returns true/false
- Sheet range format: Assumed correct (A1:B5, etc.); no runtime validation of range syntax
- Type safety: TypeScript interfaces prevent misuse at compile time

**Authentication:**
- Google OAuth: AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET check in auth.ts
- Dev mode: Credentials provider accepts any email, stores id="dev-user-1"
- Session: JWT strategy stores token.sub as user.id in session callback
- Redirect: Proxy enforces /login for unauthenticated, /dashboard for authenticated

---

*Architecture analysis: 2026-02-22*
