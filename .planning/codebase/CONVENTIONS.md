# Coding Conventions

**Analysis Date:** 2026-02-22

## Naming Patterns

**Files:**
- **Components:** kebab-case with functional naming: `kpi-cards.tsx`, `revenue-chart.tsx`, `sidebar.tsx`
- **Pages:** kebab-case, nested under route groups: `app/(auth)/login/page.tsx`, `app/(dashboard)/dashboard/page.tsx`
- **Utilities/Libraries:** camelCase with functional suffix: `sheets.ts`, `data.ts`, `mock-data.ts`, `utils.ts`
- **Types:** camelCase with `.ts` extension in `types/` directory: `dashboard.ts`
- **Directories:** kebab-case for feature areas: `components/dashboard/`, `components/layout/`, `components/ui/`, `components/providers/`

**Functions:**
- **camelCase** throughout all code: `getDashboardData()`, `fetchSheetData()`, `parseKpiFromSheet()`, `isGoogleSheetsConfigured()`
- **Predicate functions** prefix with `is` or `get`: `isGoogleOAuthConfigured()`, `isGoogleSheetsConfigured()`, `getAllowedEmails()`
- **Helper/Parser functions** use specific verbs: `parseKpiFromSheet()`, `parseMonthlyRevenueFromSheet()`, `parseCategoryFromSheet()`
- **Event handlers** use `on` prefix: `onClick={() => signOut()}`, `onClick={() => setMobileOpen(true)}`

**Variables:**
- **Constants:** UPPER_SNAKE_CASE for truly immutable values: `navItems` (const object), `errorMessages` (const Record)
- **State variables:** camelCase with descriptive names: `collapsed`, `mobileOpen`, `isLoggedIn`, `session`
- **Data objects:** camelCase: `data`, `row`, `user`, `email`
- **Props interfaces:** PascalCase suffixed with `Props`: `KpiCardsProps`, `RevenueChartProps`, `HeaderProps`

**Types:**
- **Interfaces:** PascalCase for public types: `KpiData`, `MonthlyRevenue`, `CategoryDistribution`, `RecentOrder`, `DashboardData`
- **Type aliases:** PascalCase: `Provider` (from next-auth), `ClassValue` (from clsx)
- **Literal union types:** Korean strings in domain-specific contexts: `"완료" | "처리중" | "취소"` (status field)
- **Generic/shared types:** Use `T`, `K`, `V` patterns sparingly; prefer explicit interface names

## Code Style

**Formatting:**
- **No custom Prettier config** - Uses ESLint defaults
- **Default:** 2-space indentation (Next.js standard)
- **Line length:** No enforced limit in config, but code typically stays under 100 characters
- **Quotes:** Double quotes in JSX/code, single quotes used minimally
- **Semicolons:** Required (enforced by ESLint Next.js config)
- **Trailing commas:** Used in multi-line objects/arrays for consistency

**Linting:**
- **Framework:** ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- **Config location:** `eslint.config.mjs` (ESLint 9 flat config format)
- **Key rules enforced:**
  - Next.js Core Web Vitals rules (images, links, scripts)
  - TypeScript type checking (strict mode)
  - React best practices (hooks rules)
- **Run command:** `npm run lint`

## Import Organization

**Order:**
1. External dependencies (React, next-auth, lucide-react, recharts, etc.)
2. Type imports with `import type` prefix: `import type { KpiData } from "@/types/dashboard"`
3. Internal utilities/functions: `import { fetchSheetData } from "./sheets"`
4. Component imports: `import { Card } from "@/components/ui/card"`
5. Styled/utility helpers: `import { cn } from "@/lib/utils"`

**Examples from codebase:**
```typescript
// From lib/data.ts - shows proper organization
import type {
  DashboardData,
  KpiData,
  MonthlyRevenue,
  CategoryDistribution,
  RecentOrder,
} from "@/types/dashboard";
import { fetchSheetData, isGoogleSheetsConfigured } from "./sheets";
import { mockDashboardData } from "./mock-data";
```

```typescript
// From components/dashboard/revenue-chart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyRevenue } from "@/types/dashboard";
```

**Path Aliases:**
- **Root:** `@/*` maps to project root (e.g., `@/lib/`, `@/components/`, `@/types/`)
- **Defined in:** `tsconfig.json` paths configuration
- **Usage:** Always prefer `@/` paths over relative `../` imports for clarity

## Error Handling

**Patterns:**
- **Try-catch blocks:** Used for async operations with network calls (Google Sheets API)
  - Location: `lib/data.ts` in `getDashboardData()` function
  - Strategy: Log error with `console.error()`, then fallback to mock data
  - Example: `catch (error) { console.error("Google Sheets 데이터 가져오기 실패, mock 데이터로 대체:", error); return mockDashboardData; }`

- **Null coalescing:** Used for optional values: `email ?? ""`, `Name ?? "사용자"`
- **Type narrowing:** Cast types when necessary: `const email = credentials?.email as string;`
- **Boolean checks:** Use truthy/falsy directly: `if (!isGoogleSheetsConfigured())`, `if (allowed.length === 0)`

- **Authentication errors:** Handled via NextAuth callback signature, error codes mapped to Korean messages in `app/(auth)/login/page.tsx`
  - Error mapping: `errorMessages` Record with codes like `AccessDenied`, `Configuration`, `Verification`
  - Redirect strategy: Failed auth redirects to `/login?error=CODE`, page displays Korean message

## Logging

**Framework:** `console` (built-in)

**Patterns:**
- **Error logging:** `console.error("Human readable message in Korean:", error)`
  - Location: `lib/data.ts` line 98
  - Format: Descriptive Korean message + error object

- **Development logging:** Comments above code sections explain logic in Korean
  - Example: `// Google OAuth가 설정되어 있으면 Google Provider 사용`
  - Used in: `auth.ts`, `lib/data.ts`, component files

- **No debug/info logging** - codebase relies on comments for tracing, no structured logging library

## Comments

**When to Comment:**
- **Function headers:** JSDoc-style blocks for exported functions with parameters and return values
  - Example from `lib/sheets.ts`: `/** Google Sheets 환경변수가 모두 설정되었는지 확인 */`
  - Used for: Public exports only, not internal helpers
  - Language: Korean

- **Logic explanations:** Inline comments for non-obvious logic (Korean)
  - Example: `// .env 파일에서 \\n을 실제 줄바꿈 문자로 변환`
  - Used in: Complex string transformations, special case handling

- **Section markers:** Divider comments for logical sections
  - Format: `// --- [Section Name] ---`
  - Example: `// --- Google Sheets 데이터 파서 ---` (from `lib/data.ts`)

**JSDoc/TSDoc:**
- Used minimally, only for public API functions
- Format: `/** Description in Korean */` for one-liners
- Example: `/** 환경변수에서 허용된 이메일 목록을 파싱 */`

## Function Design

**Size:**
- Most functions range 5-30 lines
- Longer functions (30+ lines) break logic into sub-functions with clear names
- Largest: `parseOrdersFromSheet()` at 9 lines, `getDashboardData()` at 34 lines (multi-step process)

**Parameters:**
- Destructured props in components: `export function KpiCards({ data }: KpiCardsProps)`
- Single objects preferred over multiple parameters
- Optional parameters use `?` syntax in interfaces

**Return Values:**
- Explicit type annotations on function signatures: `export async function fetchSheetData(range: string): Promise<string[][] | null>`
- Components return JSX wrapped in single fragment: `<> ... </>`
- Async functions return Promises with explicit typing

**Example from codebase:**
```typescript
// From auth.ts - simple predicate
function isGoogleOAuthConfigured(): boolean {
  return !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

// From lib/data.ts - data transformation
function parseKpiFromSheet(rows: string[][]): KpiData {
  const dataRows = rows.slice(1);
  const getValue = (index: number) => Number(dataRows[index]?.[1] ?? 0);
  return {
    totalRevenue: getValue(0),
    orderCount: getValue(1),
    averageOrderValue: getValue(2),
    growthRate: getValue(3),
  };
}
```

## Module Design

**Exports:**
- **Named exports** for functions: `export function getDashboardData()`, `export async function fetchSheetData()`
- **Default exports** for pages: `export default async function DashboardPage()`
- **Type exports:** `export interface KpiData { ... }` in `types/dashboard.ts`

- **Single responsibility:** Each file has one clear purpose
  - `sheets.ts` - Google Sheets API wrapping only
  - `data.ts` - Data aggregation and parsing only
  - `auth.ts` - Authentication configuration only

**Barrel Files:**
- **Not used** - Components import directly from their files
- Example: `import { KpiCards } from "@/components/dashboard/kpi-cards"` (not from a `index.ts`)
- Import paths are explicit and long, preferring clarity over brevity

---

*Convention analysis: 2026-02-22*
