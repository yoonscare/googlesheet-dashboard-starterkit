# External Integrations

**Analysis Date:** 2026-02-22

## APIs & External Services

**Google Services:**
- Google Sheets API v4 - Fetch dashboard data from spreadsheets (orders, KPI, revenue, categories)
  - SDK/Client: `googleapis` (v171.4.0)
  - Auth: Service account (email + private key)
  - Implementation: `lib/sheets.ts` with `fetchSheetData()` function
  - Service account credentials: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
- Google OAuth 2.0 - User authentication
  - SDK/Client: NextAuth.js with Google Provider
  - Auth: Client ID and secret via `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
  - Implementation: `auth.ts` with `getProviders()` logic (auto-enables if env vars present)
- Google Static Images - User profile picture CDN
  - Host: `lh3.googleusercontent.com`
  - Configuration: `next.config.ts` image remote patterns

## Data Storage

**Databases:**
- Not detected - No persistent database backend
- Data source: Google Sheets only (read-only via API)
  - Sheets: KPI, 매출 (Monthly Revenue), 카테고리 (Category Distribution), 주문 (Orders)
  - Range-based fetching: `KPI!A1:B5`, `매출!A1:B13`, `카테고리!A1:C6`, `주문!A1:F11`
  - Parsing logic: `lib/data.ts` with type-specific parsers (parseKpiFromSheet, parseMonthlyRevenueFromSheet, etc.)

**File Storage:**
- Local filesystem only - No cloud storage integration detected

**Caching:**
- None detected - All data fetches are on-demand from Sheets or mock fallback

## Authentication & Identity

**Auth Provider:**
- NextAuth.js v5.0.0-beta.30 (beta)
  - Configuration file: `auth.ts`
  - Session strategy: JWT (required for Credentials Provider)

**Auth Flow Logic:**
- **Google OAuth (if configured):**
  - Enabled when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` environment variables are set
  - Provider: `next-auth/providers/google`
  - Callback: Email whitelist validation via `ALLOWED_EMAILS` environment variable
  - Returns: `{ id, name, email, image }`

- **Credentials Provider (development mode):**
  - Fallback when Google OAuth environment variables are not set
  - Allows direct email login without password
  - Returns: `{ id: "dev-user-1", name, email, image: null }`

**Authorization:**
- Email whitelist: `ALLOWED_EMAILS` environment variable (comma-separated)
- If empty, all authenticated users are allowed
- Whitelist check in `signIn` callback in `auth.ts`

**Route Protection:**
- Proxy-based protection via `proxy.ts` (Next.js 16 replaces middleware.ts)
- Protected routes: `/dashboard/*`
- Unauthenticated redirect: to `/login`
- Authenticated redirect: `/login` users redirect to `/dashboard`

## Monitoring & Observability

**Error Tracking:**
- None detected - No error tracking service integrated

**Logs:**
- Console-based only
- Error logging: `console.error()` in `lib/data.ts` for Google Sheets fetch failures
- Example: "Google Sheets 데이터 가져오기 실패, mock 데이터로 대체"

## CI/CD & Deployment

**Hosting:**
- Not specified - Designed for Node.js server deployment
- Compatible with Vercel (Next.js native), AWS Lambda, Docker, self-hosted

**CI Pipeline:**
- Not detected - No GitHub Actions, CircleCI, or Jenkins configuration present

## Environment Configuration

**Required env vars (for full functionality):**
- `AUTH_SECRET` - Session encryption key (critical for production)
- `GOOGLE_SHEETS_ID` - Spreadsheet ID for live data
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key (note: escape newlines as `\\n`)

**Optional env vars:**
- `AUTH_GOOGLE_ID` - Enables Google OAuth (if both this and AUTH_GOOGLE_SECRET present)
- `AUTH_GOOGLE_SECRET` - Enables Google OAuth
- `ALLOWED_EMAILS` - Email whitelist (empty = allow all)

**Secrets location:**
- `.env.local` (local development, not committed)
- Production: Deploy platform environment variables (Vercel, AWS, etc.)
- Template: `.env.example` (checked in)

## Fallback & Offline Behavior

**Mock Data:**
- Location: `lib/mock-data.ts`
- Triggered when:
  - `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, or `GOOGLE_PRIVATE_KEY` not set
  - Google Sheets API fetch fails
  - Individual sheet fetch fails (graceful per-section fallback in `getDashboardData()`)
- Data structure: Complete `DashboardData` object with sample KPI, revenue, categories, orders
- Fallback strategy: `Promise.all()` fetches with try-catch; failed sheets revert to mock via `mockDashboardData.kpi`, etc.

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- NextAuth session callbacks:
  - `signIn` - Email whitelist validation
  - `session` - Inject user ID into session

---

*Integration audit: 2026-02-22*
