# Testing Patterns

**Analysis Date:** 2026-02-22

## Test Framework

**Runner:**
- **Not configured** - No test framework installed (no Jest, Vitest, or other runners in package.json)
- Config file: None present
- No test scripts in package.json

**Assertion Library:**
- Not applicable - no testing framework configured

**Run Commands:**
- No test commands available in `package.json`
- Available commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`

## Test File Organization

**Location:**
- **No test files present** in source code
- Single test file found: `./.claude/get-shit-done/bin/gsd-tools.test.cjs` (unrelated to main codebase)

**Naming:**
- Standard convention would be `*.test.ts` or `*.spec.ts` (not yet applied)

**Structure:**
- No established pattern in codebase

## Test Structure

**Current State:**
- No test files in `app/`, `components/`, `lib/`, or `types/` directories
- Testing infrastructure not implemented

**Patterns (if to be implemented):**
- Would align with Next.js + TypeScript conventions
- Server Components (`getDashboardData`, `DashboardPage`) would use node testing
- Client Components would use React Testing Library or similar
- API routes would use supertest or fetch-based testing

## Mocking

**Framework:**
- Not configured - no mocking library installed
- `lib/mock-data.ts` serves as manual mock data replacement
  - Location: `/lib/mock-data.ts`
  - Exports: `mockDashboardData` constant
  - Used by: `lib/data.ts` as fallback when Google Sheets API unavailable

**Mock Data Pattern:**
```typescript
// From lib/mock-data.ts
export const mockDashboardData: DashboardData = {
  kpi: {
    totalRevenue: 124500000,
    orderCount: 1847,
    averageOrderValue: 67400,
    growthRate: 12.5,
  },
  monthlyRevenue: [
    { month: "1월", revenue: 8500000 },
    // ... 11 more months
  ],
  categoryDistribution: [
    { name: "전자제품", value: 35, fill: "var(--chart-1)" },
    // ... 4 more categories
  ],
  recentOrders: [
    {
      id: "ORD-001",
      customerName: "김철수",
      product: "무선 이어폰 Pro",
      amount: 189000,
      status: "완료",
      date: "2025-01-15",
    },
    // ... 9 more orders
  ],
};
```

**Data Configuration Approach:**
- Fallback mechanism in `lib/data.ts` uses mock data when environment variables not set
- Google Sheets API calls wrapped in try-catch with individual sheet-level fallback
- Each sheet failure independently triggers mock data for that section only

**Code pattern from lib/data.ts:**
```typescript
try {
  const [kpiRows, revenueRows, categoryRows, orderRows] = await Promise.all([
    fetchSheetData("KPI!A1:B5"),
    fetchSheetData("매출!A1:B13"),
    fetchSheetData("카테고리!A1:C6"),
    fetchSheetData("주문!A1:F11"),
  ]);

  return {
    kpi: kpiRows ? parseKpiFromSheet(kpiRows) : mockDashboardData.kpi,
    monthlyRevenue: revenueRows
      ? parseMonthlyRevenueFromSheet(revenueRows)
      : mockDashboardData.monthlyRevenue,
    // ... rest of fallback logic
  };
} catch (error) {
  console.error("Google Sheets 데이터 가져오기 실패, mock 데이터로 대체:", error);
  return mockDashboardData;
}
```

**What to Mock (if implementing unit tests):**
- Google Sheets API responses: Mock `google.sheets()` call
- NextAuth session: Mock `useSession()` hook in Client Components
- Environment variables: Mock `process.env` for configuration tests

**What NOT to Mock (if implementing integration tests):**
- Component rendering logic
- Data parsing functions (test with real/fixture data instead)
- CSS class application via `cn()` utility
- Tailwind responsive behavior

## Fixtures and Factories

**Test Data:**
- Mock data in `lib/mock-data.ts` serves as fixture
- Contains realistic sample data for all dashboard sections (KPI, revenue, categories, orders)
- Korean company names and product names: "김철수", "무선 이어폰 Pro", "ORD-001"

**Location:**
- `lib/mock-data.ts` - primary fixture source
- Single export: `mockDashboardData` constant
- Type: Fully typed to `DashboardData` interface for compile-time safety

**If building test factories:**
Would follow this pattern:
```typescript
// Hypothetical factory structure (not implemented)
function createMockKpiData(overrides?: Partial<KpiData>): KpiData {
  return {
    totalRevenue: 124500000,
    orderCount: 1847,
    averageOrderValue: 67400,
    growthRate: 12.5,
    ...overrides,
  };
}
```

## Coverage

**Requirements:**
- Not enforced - no coverage config present
- No CI/CD checks configured

**View Coverage:**
- No command available
- Would require: `npm install --save-dev jest @types/jest` + configuration

## Test Types

**Unit Tests (to be implemented):**
- **Scope:** Individual functions (parsers, helpers, utilities)
- **Approach:**
  - Data parsing: `parseKpiFromSheet()`, `parseMonthlyRevenueFromSheet()`, etc.
  - Auth logic: `isGoogleOAuthConfigured()`, `getAllowedEmails()`
  - Utilities: `cn()` from `lib/utils.ts`
- **Example test (hypothetical):**
```typescript
// lib/data.test.ts
describe("parseKpiFromSheet", () => {
  it("should extract KPI values from sheet rows", () => {
    const rows = [
      ["지표", "값"],
      ["총매출", "124500000"],
      ["주문수", "1847"],
      ["평균주문금액", "67400"],
      ["성장률", "12.5"],
    ];
    const result = parseKpiFromSheet(rows);
    expect(result.totalRevenue).toBe(124500000);
    expect(result.orderCount).toBe(1847);
  });
});
```

**Integration Tests (to be implemented):**
- **Scope:** Data flow from API to component rendering
- **Approach:**
  - Mock Google Sheets API, test full `getDashboardData()` pipeline
  - Test Server Component data fetching and passing to child components
  - Verify error handling and mock data fallback
- **Example (hypothetical):**
```typescript
// lib/data.integration.test.ts
describe("getDashboardData", () => {
  it("should return mock data when Google Sheets API fails", async () => {
    process.env.GOOGLE_SHEETS_ID = "test-id";
    // Mock googleapis to throw
    jest.mock("googleapis", () => ({
      google: {
        sheets: () => ({
          spreadsheets: {
            values: { get: jest.fn().mockRejectedValue(new Error("API error")) },
          },
        }),
      },
    }));

    const data = await getDashboardData();
    expect(data).toEqual(mockDashboardData);
  });
});
```

**E2E Tests (to be implemented):**
- **Framework:** Playwright or Cypress (not configured)
- **Scope:** User workflows
- **Examples:**
  - Login flow: Visit `/login`, submit credentials, redirect to `/dashboard`
  - Dashboard rendering: Load `/dashboard`, verify all sections render
  - Theme toggle: Click theme button, verify dark mode CSS variables apply
  - Responsive: Test sidebar mobile/desktop toggle behavior

## Common Patterns

**Async Testing (if implemented):**
```typescript
// For server-side async functions
describe("fetchSheetData", () => {
  it("should fetch sheet data successfully", async () => {
    const data = await fetchSheetData("KPI!A1:B5");
    expect(data).toBeDefined();
  });

  it("should return null when not configured", async () => {
    process.env.GOOGLE_SHEETS_ID = "";
    const data = await fetchSheetData("KPI!A1:B5");
    expect(data).toBeNull();
  });
});

// For client-side async (using React Testing Library)
describe("RevenueChart", () => {
  it("should render chart with data", async () => {
    render(<RevenueChart data={mockDashboardData.monthlyRevenue} />);
    await waitFor(() => {
      expect(screen.getByText("월별 매출 추이")).toBeInTheDocument();
    });
  });
});
```

**Error Testing:**
```typescript
// Testing error fallback mechanism
describe("getDashboardData error handling", () => {
  it("should fallback to mock data on KPI sheet failure", async () => {
    // Mock sheets to fail for KPI only
    const mockFetchSheetData = jest
      .fn()
      .mockResolvedValueOnce(null) // KPI fails
      .mockResolvedValue([["1월", "8500000"]]); // Others succeed

    const data = await getDashboardData();
    expect(data.kpi).toEqual(mockDashboardData.kpi); // Uses mock
    expect(data.monthlyRevenue).not.toEqual(mockDashboardData.monthlyRevenue); // Uses real
  });

  it("should log error to console on complete failure", async () => {
    const consoleSpy = jest.spyOn(console, "error");
    process.env.GOOGLE_SHEETS_ID = "invalid";

    await getDashboardData();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Google Sheets 데이터"),
      expect.any(Error)
    );
  });
});
```

## Development Testing Approach

**Current Manual Testing Pattern:**
1. **Environment config testing:**
   - Without `GOOGLE_SHEETS_ID` etc.: App displays mock data
   - With credentials: App fetches from Google Sheets
   - Tested by running `npm run dev` with/without `.env.local`

2. **Component visual testing:**
   - Run `npm run dev` → visit pages in browser
   - Check responsive behavior at different breakpoints
   - Toggle dark mode, verify theme variables apply

3. **Authentication testing:**
   - Without `AUTH_GOOGLE_ID`: Dev mode credentials provider appears
   - With credentials: Google OAuth button appears
   - Test whitelist: Set `ALLOWED_EMAILS`, verify only those emails can log in

4. **Error scenario testing:**
   - Simulate API error: Modify Google Sheets ID to invalid value
   - Verify: Mock data displays, error logged to console
   - Check: Page still usable, no blank areas

---

*Testing analysis: 2026-02-22*
