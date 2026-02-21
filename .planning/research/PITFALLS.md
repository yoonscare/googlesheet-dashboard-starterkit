# Pitfalls Research

**Domain:** 간호학과 실습 성적 대시보드 — Academic Grading Dashboard (Google Sheets + Next.js 16)
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH (Google Sheets API behavior: HIGH via official docs; grading math: HIGH; privacy: MEDIUM via PIPA sources; chart pitfalls: MEDIUM via Recharts issues + visualization research)

---

## Critical Pitfalls

### Pitfall 1: Google Sheets API Silently Truncates Empty Trailing Cells

**What goes wrong:**
The Sheets API does NOT return trailing empty cells. If the sheet has columns `[이름, 사전학습, 보고서, ..., 빈칸]`, the last empty column is simply absent from `response.data.values`. When you do `row[12]` expecting the last score column, you get `undefined` instead of `""`. This turns every downstream `Number(row[12])` into `NaN`, which then corrupts totals and ranking.

This project has 3-row merged headers before student data starts at row 4. If any row in rows 1-3 has shorter column span than expected, the parser will misalign all column indexes.

**Why it happens:**
Developers test with fully populated sheets. Production sheets have empty cells (absent students, not-yet-graded items). The API spec explicitly states: "Trailing empty cells are not included in the response." Most developers only discover this in production.

**How to avoid:**
- Never access `row[N]` directly. Always use a safe accessor: `const cell = (row: string[], idx: number) => row[idx] ?? ""`
- Parse the 3-row header block first to build a column-name-to-index map dynamically, then access columns by name, not by hardcoded index
- Add a unit test with a sparse row: `["김*훈", "", "25", , , "80"]` (missing trailing cells) and verify totals are not NaN

**Warning signs:**
- Student total scores of 0 or NaN appearing for specific students only
- Scores that are exactly correct for the first N students but wrong for later ones (whose rows have fewer filled cells)
- `isNaN(totalScore)` check in UI triggering unexpectedly

**Phase to address:**
Data parsing layer implementation phase. Before writing any parser for the 3-sheet structure, write the column-index mapper first.

---

### Pitfall 2: Merged Cell Headers Return Value Only in Top-Left Cell

**What goes wrong:**
The Google Sheets API v4 returns values only for the top-left cell of a merged range. In this project's 3-row header structure (e.g., "실습평가" spanning 4 columns across rows 1-3), only `row[0][colStart]` contains "실습평가". The other cells in the merged range return `undefined` or an empty string. A naive approach of reading `row[0], row[1], row[2]` to build column names will produce many empty strings, causing misidentification of which column holds which score component.

**Why it happens:**
Developers view the sheet in Google Sheets UI where merged cells look filled. The API does not reconstruct that visual merge — it returns the raw cell grid. This is a documented but commonly missed behavior.

**How to avoid:**
- Use the `spreadsheets.get` endpoint (not `spreadsheets.values.get`) to retrieve `merges` metadata which gives you merge ranges explicitly
- Alternatively, define the column map as a hardcoded constant (since the schema is fixed for this academic year) and document it in `lib/sheets.ts` with the actual column letters from the Google Sheet
- Add a schema version comment in `lib/data.ts`: `// 25-2학기 A/B/C반 schema v1: col0=열번호, col1=실습기간, ...`

**Warning signs:**
- Column names in parsed objects are empty strings
- Score fields parsing as the wrong value (e.g., "사전학습" score appearing in "보고서" field)
- Sum of component scores does not match the total column

**Phase to address:**
Phase 1 (Data ingestion): Define and validate the column map before building any UI. Include a startup validation that checks `헤더_검증()` against the actual sheet.

---

### Pitfall 3: 160-to-100 Scale Conversion Introduces Floating-Point Rounding Errors

**What goes wrong:**
This project's total score is `(실습평가80 + 학습성과80) / 160 * 100`, converting a 160-point raw score to a 100-point total. JavaScript `Number` (IEEE 754 double) makes this treacherous. Example:
```
(127 / 160) * 100 = 79.375   // exact
(128 / 160) * 100 = 80.0     // exact
(129 / 160) * 100 = 80.625   // exact — but
(113 / 160) * 100 = 70.625   // fine
(114 / 160) * 100 = 71.25    // fine
```
The problem arises during the 40% cutline calculation: if you sort by `totalScore` and pick the top 40%, two students at `70.625` and `70.62499999999999` (due to intermediate rounding) will be separated incorrectly. The student ranked just above the cutline may differ based on float imprecision.

**Why it happens:**
Developers do the conversion inline without thinking about accumulated float error. The 160-point denominator does not produce exact binary fractions for many inputs (160 = 32 × 5; 5 is not a power of 2).

**How to avoid:**
- Always round to 2 decimal places immediately after the conversion: `Math.round((rawScore / 160) * 100 * 100) / 100`
- Store raw score (out of 160) in the student data object alongside the converted score; use raw scores for ranking comparisons to avoid double conversion
- Use a dedicated `calculateTotalScore(raw: number): number` utility with a unit test covering at least 10 boundary cases

**Warning signs:**
- Two students with visually identical displayed scores but different sort order
- The cutline shifts by one student between page loads
- `totalScore === cutlineScore` evaluating to `false` for values that look identical on screen

**Phase to address:**
Score calculation utility in data layer — implement and test before any ranking or cutline logic.

---

### Pitfall 4: Relative Grading 40% Cutline Applied to Wrong Population

**What goes wrong:**
The A-grade cap is 40% of each class's student count — NOT 40% of all students combined. If you calculate the cutline across the combined A+B+C roster (e.g., 130 students total, top 52), you will produce a different (wrong) cutline than calculating top 40% per class (e.g., 17 per 43-student class). The requirement states "반별 학생 수의 40%".

A secondary mistake: "40% A 이상" means A+ and A combined must not exceed 40%. If you show just a numeric score cutline without clarifying this, professors may misread it as the A+ cutline only.

**Why it happens:**
Developers familiar with curve grading in Western systems default to a single global curve. The Korean 상대평가 system is applied per-section (반), not per-cohort.

**How to avoid:**
- Calculate cutlines independently for each 반 (A반, B반, C반) using that 반's enrolled student count
- Display cutline label explicitly: "A 이상(A+/A 합산) 40% 컷라인"
- Never auto-assign grades — only display the cutline score value
- Tie-breaking must be clearly documented: when students are tied at the cutline boundary, the current convention (교수 재량) must be surfaced in the UI

**Warning signs:**
- The displayed cutline score is the same for all three classes despite different class sizes or score distributions
- Cutline displayed as a single number without per-class context

**Phase to address:**
Cutline calculation logic — implement per-class, add to `lib/data.ts` as a separate `calculateCutline(students: StudentScore[], capPercent: number): number` function.

---

### Pitfall 5: Student Name Anonymization Applied Inconsistently or Too Late

**What goes wrong:**
Name anonymization (김*훈 pattern: first character + asterisk replacing middle characters + last character) is applied in the UI layer, but if the raw name is ever logged, cached, or sent to the browser in a JSON response, it can be exposed. The three failure modes:

1. **Console.error logging**: If a sheet parse error occurs, the raw row data (including real name) is logged server-side. If server logs are shared, names leak.
2. **Client-side JSON**: If data is fetched via an API route `/api/dashboard`, the full name travels to the browser before being masked in the component.
3. **Search/filter state**: If a student search stores the raw name in React state or URL params, anonymization is bypassed.

Under Korean PIPA (개인정보보호법), student names combined with student numbers and scores constitute personal information. Sharing these with unauthorized faculty (e.g., a logged-in professor from another department) constitutes a violation.

**Why it happens:**
Anonymization is treated as a display concern ("just mask in the JSX") rather than a data concern. The rule should be: names are anonymized at the point of ingestion, before they ever enter any state, log, or response.

**How to avoid:**
- Apply `anonymizeName()` in `lib/data.ts` at parse time, before the student object is returned from any parser
- The `StudentScore` type must never have a `realName` field — only `displayName` (already masked)
- Server-side logging must not log raw row arrays; log only row index and error type
- Add a TypeScript branded type `type AnonymizedName = string & { __brand: 'anonymized' }` to make it impossible to accidentally use a raw name string where an anonymized one is expected

**Warning signs:**
- Any `console.log` or `console.error` that includes `row` or `values` arrays from the Sheets response
- Student objects with a `name` field that contains full Korean names (3+ characters with no asterisk)
- URL parameters containing Korean name characters

**Phase to address:**
Phase 1 data layer — anonymization must be the very first transformation step in each sheet parser, before any other processing.

---

### Pitfall 6: Google Sheets API Rate Limit Exceeded Under Multi-User Load

**What goes wrong:**
The default Google Sheets API quota is 500 requests per 100 seconds per project and 100 requests per 100 seconds per user. This project fetches 3 sheets (A반, B반, C반) per dashboard load, using `Promise.all`. If 10 professors load the dashboard simultaneously:
- 10 users × 3 sheets = 30 API calls in near-simultaneous burst
- At 50 concurrent users: 150 calls — approaching the 100/100s per-user limit since all calls use the same service account (one "user")

Under load, the API returns HTTP 429. The current codebase has no retry logic — it falls back to mock data silently. Professors see stale mock data and assume it is real.

**Why it happens:**
Development and testing always uses one user, so rate limits are never hit. Service accounts count as a single user, amplifying the problem.

**How to avoid:**
- Add server-side in-memory caching with a 5-minute TTL (e.g., `node-cache` or a simple `Map` with timestamp): cache the parsed student data keyed by sheet name + spreadsheet ID
- In Next.js 15+, use `unstable_cache` or `fetch` with `revalidate: 300` (5 minutes) to leverage the built-in Data Cache
- Add exponential backoff retry (max 3 attempts) in `lib/sheets.ts` for 429 responses
- Show a visible "데이터 마지막 업데이트: X분 전" timestamp in the UI so professors know cache age

**Warning signs:**
- Dashboard shows mock data (no real students) after refresh for certain users
- Server logs show "Google Sheets 데이터 가져오기 실패" with 429 status codes
- Load testing with 5+ simultaneous users triggers failures

**Phase to address:**
Phase 1 Google Sheets integration — add caching before connecting to real sheet data; it is much harder to retrofit later.

---

## Moderate Pitfalls

### Pitfall 7: Learning Outcome Achievement Thresholds Calculated Against Wrong Denominator

**What goes wrong:**
학습성과 달성도 기준 (상/중/하) are calculated as:
- 상: student score / 해당 학습성과 만점 >= 85%
- 중: 60% ~ 85%
- 하: < 60%

The three learning outcomes have different maximum scores:
- 학습성과2 (대상자간호): 64점 만점
- 학습성과5 (안전과질): 8점 만점
- 학습성과3 (전문직): 8점 만점

A common mistake is using the wrong denominator — applying the 64-point maximum to the 8-point outcomes, or normalizing all three to 100 before applying thresholds (which changes the distribution).

**How to avoid:**
- Define a typed config object:
  ```typescript
  const LEARNING_OUTCOMES = [
    { id: 'LO2', label: '대상자간호', maxScore: 64 },
    { id: 'LO5', label: '안전과질',  maxScore: 8  },
    { id: 'LO3', label: '전문직',    maxScore: 8  },
  ] as const;
  ```
- Always compute `achievement = score / outcome.maxScore` with the correct `outcome.maxScore`, not a hardcoded constant
- Unit test: a student with 6.8/8 on LO5 should be 상 (85%), not 중

---

### Pitfall 8: Class Size Changes Breaking 40% Count Calculation

**What goes wrong:**
If a student withdraws or is added mid-semester, the actual enrolled count changes. If the system hardcodes "A반 = 43명", the cutline calculation will be wrong. The 40% cap must be calculated from the actual number of rows in the sheet, not a configured constant.

**How to avoid:**
- Derive student count dynamically from parsed row count: `const eligibleCount = students.filter(s => s.isEnrolled).length`
- Do not hardcode class sizes anywhere. The sheet itself is the source of truth.

---

### Pitfall 9: Recharts BarChart with No Data Renders Broken Empty SVG

**What goes wrong:**
When Recharts `<BarChart>` receives an empty `data={[]}` array (e.g., during initial load or if a class has zero students), it renders an empty SVG with broken axes. There is no built-in "No Data" state in Recharts. This can cause a white blank area with no explanation, making professors think the page is broken.

**How to avoid:**
- Wrap every Recharts chart with a guard:
  ```tsx
  if (!data || data.length === 0) return <EmptyChart message="데이터 없음" />;
  ```
- For grade distribution histograms, pre-populate all bins (0-9, 10-19, ..., 90-100) with count 0 so the chart always has a full x-axis even when a bin has no students

---

### Pitfall 10: Radar Chart Axes with Different Scales Visually Distort Comparisons

**What goes wrong:**
This project has score components with vastly different maximum values (사전학습 10점, 보고서 30점, 실습지도교수 20점, 현장지도자 20점, 출석 20점, 핵심간호술 100점). If the radar chart plots raw scores on the same axis scale, students who scored full marks on 10-point categories appear weaker than those who scored 80/100 on 핵심간호술. The visual comparison is misleading.

**How to avoid:**
- Normalize each axis to percentage: `displayValue = (rawScore / maxScore) * 100`
- Label axes clearly with `항목명 (최대 N점)`
- Never plot raw scores across axes with different maximums

---

### Pitfall 11: Silent Mock Data Fallback Masquerades as Real Data

**What goes wrong:**
The existing architecture falls back to mock data when Google Sheets fetch fails. For the sales dashboard, this is acceptable. For a grading dashboard, professors making decisions based on mock student data is a serious error — they might believe a grade distribution is fine when real data failed to load.

**How to avoid:**
- Add a `dataSource: 'live' | 'mock' | 'partial'` field to the dashboard data object
- Display a prominent warning banner when `dataSource !== 'live'`: "⚠️ 실시간 데이터 로드 실패 — 표시된 데이터는 실제 성적이 아닙니다"
- Consider disabling the cutline display entirely when `dataSource === 'mock'`

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded column indexes (`row[3]`, `row[7]`) | Fast to write | Any sheet structure change (added column, reordered) silently corrupts all scores | Never — use column name map |
| Anonymization in UI layer only | Simple JSX code | Names leak via logs, API responses, React DevTools | Never for this domain |
| Single hardcoded `GOOGLE_SHEETS_ID` for all 3 sheets | One env var | Cannot use multiple spreadsheets (e.g., separate sheet per professor) | MVP only, document the limitation |
| No caching (`fetch` per request) | Always fresh data | Rate limit exceeded at 10+ concurrent professors | Acceptable in development only |
| `Math.round(score)` at display time only | Score looks clean | Intermediate NaN propagation causes silent 0s | Never — round at calculation |
| Mock data fallback without UI indicator | No broken UI | Professors make real decisions on fake data | Never for grade data |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Sheets API | Forgetting to share the spreadsheet with the service account email | Service account email (`xxx@project.iam.gserviceaccount.com`) must be added as "뷰어" to the Google Sheet explicitly |
| Google Sheets API | `GOOGLE_PRIVATE_KEY` with literal `\n` strings failing in production | Current code handles this with `.replace(/\\n/g, "\n")` — validate this works in the deployed environment (Vercel, Docker) with a startup health check |
| Google Sheets API | Requesting range `A반!A1:Z200` when sheet tab name contains Korean — URL encoding issues | Sheet names with Korean characters must be quoted in range notation: `'A반'!A1:Z200` (single quotes around sheet name) |
| Google Sheets API | Using `spreadsheets.values.get` for merged cell detection | Use `spreadsheets.get` with `includeGridData: false` to get `merges` metadata without fetching cell data |
| NextAuth v5 beta | `AUTH_` prefix env vars not recognized in some deployment environments | Verify `AUTH_SECRET` is set; in Vercel, this env var must be explicitly set — it is not auto-generated |
| Recharts | Server-side rendering crash (`window is not defined`) | All Recharts components require `"use client"` directive; they cannot be rendered in Server Components |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `Promise.all` fetching 3 sheets on every request | 1-3 second load per professor, 429 errors under load | Server-side cache with 5-minute TTL | 5+ concurrent professor sessions |
| Parsing all 120+ students on every render | Slow initial load; React hydration delay | Parse once on server, pass typed array to client; memoize expensive calculations | 200+ student datasets |
| Recharts rendering student table (100+ rows) without pagination | Browser freeze on mobile/low-end devices | Virtualize list or paginate; show top 20 with "더보기" | 40+ students per class without pagination |
| No React Error Boundary around chart components | One bad data point crashes entire dashboard | Wrap each chart in `<ErrorBoundary fallback={<ChartError />}>` | First occurrence of NaN score |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Raw student names in server-side logs | PIPA violation — names + scores constitute personal information | Log only row index and error type; never log raw Sheets `values` arrays |
| Credentials Provider active in production | Any email can log in as any professor without password | Ensure `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set in production; add startup check that aborts if Credentials Provider would be active |
| `ALLOWED_EMAILS` left empty in production | All Google-authenticated users (any email) can access student grades | Enforce non-empty `ALLOWED_EMAILS` for production; add server-side validation at startup |
| Unprotected `/api` routes returning student data | Student grades accessible without authentication | Any new API route returning grade data must check session; extend `proxy.ts` matcher to include `/api/grades/*` |
| Google Sheet shared with too many viewers | Professor from another department can directly access raw student data in Sheets | Limit Google Sheet sharing to the service account email only; remove any human editor access |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing raw score out of 160 without context | Professor confused about whether a student "passed" | Always show converted 100-point total prominently; show 160-point raw as secondary |
| Cutline displayed as exact score without tie-breaking guidance | Professor unsure what to do when 3 students share the cutline score | Add tooltip: "동점 처리는 교수 재량입니다" |
| Grade distribution histogram with auto-bin sizes | Bins may not align with common grade thresholds (60, 70, 80, 90) | Use fixed 10-point bins starting from 0; pre-populate empty bins with count 0 |
| 상/중/하 counts without percentage context | Professor cannot tell if "하: 3명" is 3% or 30% of class | Always show both count and percentage: "하: 3명 (7%)" |
| Dark mode chart colors that fail WCAG contrast | Professors with visual impairment cannot distinguish histogram bars | Test chart colors against WCAG AA (4.5:1 contrast ratio) in both light and dark modes |
| Student search that requires exact name match | Professors cannot find partially-remembered names | Search on anonymized display name, not raw name; support partial match on student number |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Score totals**: Verify `sum(components) === totalScore` for every student, not just the first one — trailing empty cells can make later students sum to 0
- [ ] **Cutline**: Confirm cutline is calculated per-class, not globally across all 3 classes
- [ ] **Anonymization**: Confirm no raw Korean full names (3+ characters, no asterisk) appear in browser Network tab responses or server logs
- [ ] **Mock data indicator**: Confirm a visible warning appears when Google Sheets is unavailable — do not trust the "dashboard shows data" as proof of live data
- [ ] **Learning outcome denominators**: Verify LO2 uses 64 as denominator and LO5/LO3 use 8 — not all using the same value
- [ ] **Sheet tab names with Korean**: Test API call with `'A반'!A1:Z100` quoted range (Korean sheet names require single quotes in Sheets API range notation)
- [ ] **Empty class scenario**: Verify dashboard does not crash if one of the 3 sheets returns zero student rows
- [ ] **Service account sharing**: Confirm the service account email is explicitly shared with the Google Sheet — API returns 403 silently otherwise (falls back to mock)
- [ ] **Production credentials mode**: Confirm `AUTH_GOOGLE_ID` is set in production environment so Credentials Provider is disabled

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Column index misalignment discovered after deployment | HIGH | Define authoritative column map, re-parse all sheets, re-verify 5+ student totals manually |
| Anonymization bypass discovered (names in logs/responses) | HIGH | Rotate service account key, audit all server logs for names, patch and redeploy within hours |
| 40% cutline calculated globally instead of per-class | MEDIUM | Fix calculation function, invalidate cached results, notify professors that previous display was incorrect |
| 160-to-100 rounding errors causing wrong sort order | MEDIUM | Fix rounding utility, re-sort, check if any student ranking changed; document the correction |
| Mock data shown without warning to professors | MEDIUM | Add `dataSource` indicator immediately; notify professors to disregard any decisions made during outage period |
| Rate limit exceeded in production | LOW | Add caching layer (1-2 hours to implement); temporarily increase cache TTL while fix is deployed |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Trailing empty cells / sparse row parsing | Phase 1: Data ingestion layer | Unit test with sparse student row (missing trailing cells); verify no NaN in totals |
| Merged cell header misalignment | Phase 1: Column map definition | Print parsed column names for rows 1-3 of test sheet; compare to expected schema |
| 160-to-100 rounding errors | Phase 1: Score calculation utility | Unit test `calculateTotalScore()` with 20+ boundary inputs; verify stable sort |
| Per-class vs global 40% cutline | Phase 2: Cutline feature | Manually calculate cutline for A반 only using spreadsheet; compare to dashboard output |
| Anonymization applied too late | Phase 1: Data layer (same phase as parsing) | Inspect browser Network tab — no response should contain Korean full names without asterisk |
| Rate limit / caching | Phase 1: Sheets integration | Simulate 10 rapid page refreshes; verify no 429 errors and no mock data shown |
| LO threshold with wrong denominator | Phase 3: Learning outcome analysis | Cross-check 상/중/하 counts for 3 students by hand using correct denominators |
| Class size hardcoding | Phase 2: Cutline feature | Change sheet to have one fewer student; verify cutline count recalculates |
| Mock data without UI indicator | Phase 1: Data layer | Deliberately misconfigure `GOOGLE_SHEETS_ID`; verify warning banner appears |
| Credentials Provider in production | Pre-deployment checklist | Attempt login without `AUTH_GOOGLE_ID` set; should fail or show warning |

---

## Sources

- Google Sheets API v4 — Empty trailing cells behavior: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values (official docs — HIGH confidence)
- Google Sheets API — Merged cells return value only in top-left cell: https://issuetracker.google.com/issues/36753230 (issue tracker — MEDIUM confidence)
- Google Sheets API — Sparse data / empty cell index out of range: https://forum.golangbridge.org/t/google-sheets-api-empty-cells/24491 (community — MEDIUM confidence)
- Google Sheets API — 403 Permission Denied with service accounts: https://www.roelpeters.be/solved-the-caller-does-not-have-permission-using-the-api-with-a-private-google-spreadsheet/ (MEDIUM confidence)
- Google Sheets API — Rate limits 500 req/100s per project: https://developers.google.com/workspace/sheets/api/limits (official docs — HIGH confidence)
- Recharts — Empty chart no built-in "No Data" state: https://github.com/recharts/recharts/issues/1581 (GitHub issue — MEDIUM confidence)
- Korean PIPA anonymization requirements: https://pandectes.io/blog/an-overview-of-south-koreas-personal-information-protection-act-pipa/ (MEDIUM confidence)
- Korean PIPA 2025 updates: https://crossborderadvisorysolutions.com/personal-information-protection-act-pipa-updates-2025/ (MEDIUM confidence)
- Korean university grading system 상대평가: https://en.wikipedia.org/wiki/Academic_grading_in_South_Korea (MEDIUM confidence)
- Academic grading rounding errors: https://www.math.stonybrook.edu/~moira/mat517-spr14/files/Statistics/CalculationgGradesArticle.pdf (MEDIUM confidence)
- Blackboard grade precision 15 decimal places: https://help.blackboard.com/Learn/Administrator/Hosting/Course_Management/Managing_Courses/Decimal_Handling (MEDIUM confidence)
- Radar chart misleading scales: https://www.highcharts.com/blog/tutorials/radar-chart-explained-when-they-work-when-they-fail-and-how-to-use-them-right/ (MEDIUM confidence)
- Next.js 15 caching defaults changed: https://nextjs.org/docs/app/getting-started/caching-and-revalidating (official docs — HIGH confidence)
- Student privacy FERPA/GDPR 47% low compliance: https://secureprivacy.ai/blog/student-data-privacy-governance (MEDIUM confidence)

---
*Pitfalls research for: 간호학과 실습 성적 대시보드 (Academic Grading Dashboard)*
*Researched: 2026-02-22*
