# Codebase Structure

**Analysis Date:** 2026-02-22

## Directory Layout

```
sheet-dashbord-test/
├── app/                          # Next.js App Router pages and API routes
│   ├── (auth)/                   # Auth route group (shared centered layout)
│   │   ├── layout.tsx            # Centered layout for login page
│   │   └── login/
│   │       └── page.tsx          # Login page with Google OAuth / dev mode
│   ├── (dashboard)/              # Protected route group (shared sidebar+header layout)
│   │   ├── layout.tsx            # Sidebar + header + main content layout
│   │   └── dashboard/
│   │       └── page.tsx          # Main dashboard page (server component)
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth.js API handlers
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Root redirect to /dashboard
│   └── globals.css               # Tailwind CSS variables and global styles
├── components/                   # React components (UI + feature)
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── kpi-cards.tsx         # KPI summary cards (server component)
│   │   ├── revenue-chart.tsx     # Monthly revenue line chart (client)
│   │   ├── category-chart.tsx    # Category distribution pie chart (client)
│   │   └── recent-orders-table.tsx # Orders table (server component)
│   ├── layout/                   # Layout components (navigation, headers)
│   │   ├── sidebar.tsx           # Navigation sidebar (client, collapsible)
│   │   ├── header.tsx            # Page header with user menu (client)
│   │   └── theme-toggle.tsx      # Dark mode toggle button (client)
│   ├── providers/                # Context/provider wrappers
│   │   ├── session-provider.tsx  # NextAuth SessionProvider wrapper
│   │   └── theme-provider.tsx    # next-themes ThemeProvider wrapper
│   └── ui/                       # shadcn/ui primitive components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       └── table.tsx
├── lib/                          # Utilities and helpers
│   ├── sheets.ts                 # Google Sheets API wrapper
│   ├── data.ts                   # Data aggregation and parsing
│   ├── mock-data.ts              # Mock dashboard data
│   └── utils.ts                  # General utilities (cn for classnames)
├── types/                        # TypeScript type definitions
│   └── dashboard.ts              # DashboardData and related interfaces
├── public/                       # Static assets (images, fonts, etc.)
├── docs/                         # Project documentation
├── auth.ts                       # NextAuth.js configuration (root level)
├── proxy.ts                      # Route protection proxy (Next.js 16)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration (if present)
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── CLAUDE.md                     # Claude Code project guidance
├── README.md                     # Project documentation
└── .planning/codebase/           # GSD codebase documentation (this directory)
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router pages and API routes
- Contains: Route group directories, page components, API handlers, root layout
- Key files: `page.tsx` for routes, `layout.tsx` for shared layouts, `route.ts` for API endpoints

**(auth):**
- Purpose: Authentication flows (login, registration in future)
- Contains: Login page, centered layout (no sidebar)
- Key files: `login/page.tsx` handles Google OAuth or dev mode login

**(dashboard):**
- Purpose: Protected dashboard and related pages
- Contains: Dashboard page, shared sidebar+header layout
- Key files: `dashboard/page.tsx` is main content, `layout.tsx` provides navigation structure

**components/:**
- Purpose: React components organized by feature/section
- Contains: Presentation logic, no business logic (data fetching)
- Key files: See subdirectories below

**components/dashboard/:**
- Purpose: Dashboard-specific UI components
- Contains: KPI cards, revenue chart, category pie chart, orders table
- Key files: All are either server components (KpiCards, RecentOrdersTable) or client components (RevenueChart, CategoryChart)

**components/layout/:**
- Purpose: Shared layout navigation and header elements
- Contains: Sidebar navigation, page header, theme toggle
- Key files: `sidebar.tsx` (collapsible on desktop, overlay on mobile), `header.tsx` (user menu), `theme-toggle.tsx`

**components/providers/:**
- Purpose: Context wrappers for session and theming
- Contains: SessionProvider (NextAuth), ThemeProvider (next-themes)
- Key files: Both wrap root layout to provide data to entire app

**components/ui/:**
- Purpose: shadcn/ui primitive UI components
- Contains: Button, Card, Table, Avatar, DropdownMenu (installed, not custom)
- Key files: These are library components, not project-specific

**lib/:**
- Purpose: Utilities, helpers, data logic (non-component)
- Contains: API wrappers, data fetching, parsers, mock data, utility functions
- Key files:
  - `sheets.ts`: Google Sheets API client (isGoogleSheetsConfigured, getAuthClient, fetchSheetData)
  - `data.ts`: Data aggregation (getDashboardData, parser functions)
  - `mock-data.ts`: Default data object
  - `utils.ts`: cn() for classnames merging

**types/:**
- Purpose: TypeScript type/interface definitions
- Contains: Dashboard data contracts
- Key files: `dashboard.ts` defines KpiData, MonthlyRevenue, CategoryDistribution, RecentOrder, DashboardData

**public/:**
- Purpose: Static assets served directly
- Contains: Favicon, images, fonts (if not using Google Fonts)
- Key files: Depends on project needs

**docs/:**
- Purpose: Project documentation and guides
- Contains: README, setup guides, API docs
- Key files: README.md, CLAUDE.md

**Root-level files:**
- `auth.ts`: NextAuth configuration with provider selection and email whitelist logic
- `proxy.ts`: Route protection (middleware equivalent in Next.js 16)
- `next.config.ts`: Next.js framework configuration
- `tailwind.config.js`: Tailwind CSS settings (or `@theme` in globals.css v4)
- `tsconfig.json`: TypeScript compiler settings
- `eslint.config.mjs`: Code linting rules
- `package.json`: NPM dependencies and scripts

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout, wraps all pages with SessionProvider and ThemeProvider
- `app/page.tsx`: / route, redirects to /dashboard
- `app/(auth)/login/page.tsx`: /login route, authentication UI
- `app/(dashboard)/dashboard/page.tsx`: /dashboard route, main dashboard UI

**Configuration:**
- `auth.ts`: NextAuth providers, session strategy, email whitelist
- `proxy.ts`: Route protection rules, redirect paths
- `next.config.ts`: Framework settings
- `tsconfig.json`: TypeScript compiler options
- `.env.example`: Required environment variable template

**Core Logic:**
- `lib/sheets.ts`: Google Sheets API integration
- `lib/data.ts`: Data fetching orchestration and parsing
- `lib/mock-data.ts`: Mock data fallback

**Type Definitions:**
- `types/dashboard.ts`: All dashboard-related interfaces (KpiData, MonthlyRevenue, CategoryDistribution, RecentOrder, DashboardData)

**Testing:**
- No test files present in codebase (see TESTING.md for recommendations)

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Components: `PascalCase.tsx` (e.g., `Sidebar.tsx`, `KpiCards.tsx`)
- API routes: `route.ts` (Next.js convention)
- Types: `dashboard.ts` (domain-specific names)
- Utils/helpers: `kebab-case.ts` (e.g., `mock-data.ts`, `sheets.ts`)
- CSS: `globals.css` (global styles), component scoped via Tailwind

**Directories:**
- Feature-based: `components/dashboard/`, `components/layout/`, `components/ui/`
- Route groups: Parentheses `(auth)`, `(dashboard)` (Next.js convention)
- Utilities: `lib/` for non-component code
- Types: `types/` for TypeScript definitions
- API routes: `app/api/` nested under feature namespaces

**Functions:**
- camelCase (e.g., `getDashboardData()`, `fetchSheetData()`, `parseKpiFromSheet()`)
- Parsers: `parse[Type]FromSheet` pattern
- Utility: `is[Condition]()` for boolean checks (e.g., `isGoogleSheetsConfigured()`)

**Variables/Constants:**
- camelCase (e.g., `navItems`, `errorMessages`, `collapsed`)
- Constants: UPPER_SNAKE_CASE only for truly immutable values (none currently used)
- Component props: PascalCase interface names (e.g., `KpiCardsProps`, `RevenueChartProps`)

**Types/Interfaces:**
- PascalCase, descriptive (e.g., `KpiData`, `MonthlyRevenue`, `RecentOrder`, `DashboardData`)
- Props interfaces: `[ComponentName]Props` (e.g., `KpiCardsProps`)

## Where to Add New Code

**New Dashboard Feature (e.g., new chart, metric card):**
- Component file: `components/dashboard/[feature-name].tsx` (PascalCase)
- Type definition: Add interface to `types/dashboard.ts`
- Data parsing: Add parser function to `lib/data.ts` (if data source is Google Sheets)
- Sheet range: Update `getDashboardData()` Promise.all in `lib/data.ts` with new range
- Integration: Import and use in `app/(dashboard)/dashboard/page.tsx`
- Test file (when added): `components/dashboard/[feature-name].test.tsx`

**New Protected Page (e.g., /dashboard/orders, /dashboard/settings):**
- Create directory: `app/(dashboard)/[route-name]/`
- Create page: `app/(dashboard)/[route-name]/page.tsx`
- Reuse layout: `app/(dashboard)/layout.tsx` applies automatically (sidebar + header)
- Add navigation: Update `navItems` array in `components/layout/sidebar.tsx`

**New Utility/Helper:**
- General: `lib/[feature].ts` (e.g., `lib/formatters.ts`, `lib/validators.ts`)
- Data: Extensions to `lib/data.ts` for new data sources or transformations
- Type: Add to `types/dashboard.ts` or create `types/[domain].ts`

**New Authentication Provider:**
- Edit `auth.ts` getProviders() function
- Add provider import and configuration
- Update environment variable references
- Test with .env.local overrides (don't commit secrets)

**New UI Component:**
- If from shadcn/ui: `npx shadcn-ui@latest add [component]`
- Location: `components/ui/[component].tsx` (auto-installed by CLI)
- If custom: `components/[category]/[component].tsx`

**API Endpoint:**
- Create: `app/api/[route]/[...slug]/route.ts`
- Example: `app/api/sheets/sync/route.ts` for custom data sync
- Requires: Export GET, POST, PUT, DELETE handlers as needed
- Auth: Use `auth()` from `auth.ts` to check session in handlers

## Special Directories

**node_modules/:**
- Purpose: Installed NPM dependencies
- Generated: Yes (created by npm install)
- Committed: No (in .gitignore)
- Management: `package.json` specifies versions, package-lock.json locks exact versions

**.next/:**
- Purpose: Next.js build output, cached compilation
- Generated: Yes (created by npm run build)
- Committed: No (in .gitignore)
- Management: Recreate with `npm run build`

**.env.local:**
- Purpose: Local environment variables (secrets, API keys)
- Generated: No (manually created from .env.example)
- Committed: No (in .gitignore, security critical)
- Required vars: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ALLOWED_EMAILS (see CLAUDE.md)

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (created by /gsd:map-codebase command)
- Committed: Yes (for team reference)

**.claude/, .codex/, .bkit/:**
- Purpose: Claude Code and codebase analysis tool configurations
- Generated: Partially (settings files, some templates)
- Committed: Varies (settings yes, agent specs yes, generated outputs may vary)

---

*Structure analysis: 2026-02-22*
