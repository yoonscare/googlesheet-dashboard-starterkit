# Feature Research

**Domain:** Academic grading analytics dashboard (nursing practicum, instructor-facing)
**Researched:** 2026-02-22
**Confidence:** HIGH (project requirements are precise and well-defined; domain patterns verified against multiple university dashboard implementations)

---

## Context

This dashboard serves nursing faculty analyzing practicum grades for 3 classes (~40+ students each).
Data source: Google Sheets (A반, B반, C반 — same structure per sheet).
Primary jobs-to-be-done:
1. Understand how grades are distributed before finalizing relative grades (상대평가)
2. Certify learning outcome achievement rates for accreditation (간호교육인증평가)
3. Compare performance across the three sections fairly

Key constraints:
- Student name privacy required (김*훈 masking)
- A+ / A grade cap: top 40% of each class only
- Learning outcome tiers: 상 (≥85% of max), 중 (60–84%), 하 (<60%)
- No grade entry/modification — read-only analytics on Sheets data

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that make the dashboard feel complete. Missing any of these = product is broken for its purpose.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Summary KPI cards** — total students, class averages, overall average, max/min | Every institutional dashboard leads with aggregate numbers; professors need this at a glance | LOW | Already partially exists in codebase (kpi-cards.tsx); needs new schema for grade data |
| **Grade distribution histogram/bar chart per class** | Standard in every university grade analytics tool (UT Austin, Berkeley, SIUE all lead with this); professors cannot set cutlines without seeing distribution | MEDIUM | One chart per 반 + combined; Recharts BarChart, bin size 5 or 10 points; x-axis = score range, y-axis = student count |
| **Relative grading 40% cutline marker** | Core value of this dashboard; without visual cutline, the tool is not useful for 상대평가 준비. Professors need to see exactly where the top-40% boundary falls | MEDIUM | Sorted score array → find index at 60th percentile from bottom → draw reference line. Recharts ReferenceLine on histogram or sorted bar chart. Display cutline score value prominently |
| **Per-student grade table (searchable, filterable)** | Professors need to look up individual students' component scores; standard in all LMS grade views (Canvas, Blackboard) | MEDIUM | Name column anonymized (김*훈); filter by class; columns = all score components + total; sortable by total score |
| **Score component breakdown** — 사전학습, 보고서, 실습지도교수, 현장지도자, 학습성과(2/5/3), 출석, 핵심간호술 | Professors need to understand *why* a student scored high/low; sub-score visibility is standard in practicum grading tools | MEDIUM | Simple data table column per component; possibly bar chart per component showing class average vs. max |
| **Student name anonymization (김*훈 format)** | Hard requirement; multiple professors share the dashboard; FERPA / Korean personal information protection law equivalent (개인정보보호법) | LOW | Pure data transformation at lib/data.ts parse layer; mask characters between first and last character of name |
| **Dark mode / light mode** | Already exists in codebase; removing it would break existing UI conventions | LOW | Already implemented via next-themes |
| **Responsive layout** | Faculty access on various screen sizes; already exists in codebase | LOW | Already implemented via Tailwind |
| **Login / access control** | Data is not public; already implemented via NextAuth | LOW | Already exists (Google OAuth + email whitelist) |
| **Descriptive statistics per class** — mean, std dev, median, min, max | Standard summary statistics; professors immediately ask these numbers before curving grades; found in every grade analytics tool | LOW | Compute from raw score arrays server-side; display in KPI card or table |

### Differentiators (Competitive Advantage)

Features that distinguish this dashboard from a plain grade spreadsheet and make professors choose it over Excel.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Learning outcome achievement tier analysis (상/중/하)** — per outcome, per class and combined | Directly required for 간호교육인증평가; no spreadsheet does this automatically. Threshold logic: 상 ≥85% of max, 중 60–84%, 하 <60%. Show student counts and percentage in each tier, per 학습성과 (2, 5, 3) | HIGH | Three separate outcome dimensions (64pt/8pt/8pt max). Compute tier per student per outcome → aggregate counts. Table: rows = 학습성과, columns = 반 + 전체, cells = 상/중/하 count (%). This is the accreditation reporting artifact |
| **Multi-class comparison chart (A반 / B반 / C반)** | Professors need to ensure fair evaluation across sections taught by different instructors; side-by-side comparison is a differentiator over per-sheet spreadsheet view | MEDIUM | Grouped bar chart (Recharts BarChart with multiple bars per score range) or Box-and-whisker per class. Show average + std dev per class as overlaid markers. Include comparison table: min/max/mean/median/std per class |
| **Per-student radar chart (component strength/weakness)** | Reveals which sub-areas each student excels at or struggles with; not available in raw spreadsheet; actionable for professor feedback | MEDIUM | Recharts RadarChart; axes = 사전학습/보고서/실습교수/현장지도자/학습성과/출석/핵심간호술 (normalized to % of max); visible on student detail view or hover. Works well for individual coaching conversations |
| **Sorted rank chart with cutline overlay** | Most intuitive view for 상대평가: all students sorted by total score, bar per student, vertical reference line at 40% boundary. Professors can see exactly who is near the boundary | MEDIUM | Recharts BarChart sorted descending; ReferenceLine at rank = ceil(n * 0.40); label showing cutline score value. Anonymized names on x-axis (or rank numbers only for privacy) |
| **핵심간호술 separate tracking** | Scored 0–100 on a separate scale; tracked alongside but not included in 100-point total; professors need a dedicated view | LOW | Separate KPI card and histogram column; clearly labeled as 별도 평가. Risk: easy to conflate with total score if not visually separated |
| **학습성과 달성률 progress indicators** | Visual gauge or progress bar showing what % of students reached 상 or 중+ per outcome; single-glance accreditation status | LOW | Depends on: learning outcome tier analysis feature being built first. Simple progress bar showing % ≥중 (pass threshold) vs 하 |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem useful but create disproportionate complexity, policy risk, or maintenance burden for this specific context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Automatic grade assignment (A+/A/B+/B...)** | Professors want to reduce manual work | A+/A split is professor discretion; auto-assignment creates liability if thresholds are disputed; legal risk under Korean higher education regulations; explicitly out of scope in PROJECT.md | Show cutline score + rank; professor assigns grades in Google Sheets directly |
| **Student-facing view / access** | Students want to see their own grades | This is explicitly a professor-only tool; adding student access requires a completely different auth model, row-level security, and anonymization logic change; doubles scope | Out of scope. Professor can show individual rows verbally |
| **Real-time live refresh (WebSocket/polling)** | Google Sheets data changes during grading season; professors want instant updates | Google Sheets API has rate limits (100 requests/100 seconds per project); adds complexity; professors grade in discrete sessions, not continuously | Manual "새로고침" button that re-fetches server-side; Next.js cache invalidation on demand is sufficient |
| **Grade entry / editing in the dashboard** | Professors want one tool for everything | Google Sheets is the source of truth; building a write path requires conflict resolution, versioning, and audit trail; 3x implementation complexity | Keep dashboard read-only; Google Sheets is the editing surface |
| **Predictive grade modeling / AI recommendations** | Sounds powerful | With 40 students per class, sample size is too small for meaningful prediction; adds complexity without value; misleads with small-N statistics | Show descriptive stats clearly; professors are the domain experts |
| **Email / notification system** | Notify professors when grades are entered | Requires a background job infrastructure (cron, queue); disproportionate for a dashboard used seasonally once per semester | Not needed; professors control when they open the dashboard |
| **Historical semester comparison** | Compare this semester to last semester | Data from past semesters is not in scope (no historical Sheets); schema would need versioning; out of scope for this project | Design schema to allow this in v2 if historical data is archived to Sheets |
| **Student photo / demographic integration** | Richer student profile | Privacy concern (requires additional data source); irrelevant for grade analytics; increases PII exposure risk | Name + student ID (anonymized) is sufficient |

---

## Feature Dependencies

```
[Google Sheets 3-class data fetch]
    └──requires──> [Data parser (3-row header, merged cells)]
                       └──requires──> [Name anonymization (김*훈)]
                                          └──enables──> [Per-student table]
                                          └──enables──> [Per-student radar chart]

[Score arrays per class]
    └──enables──> [KPI cards (mean/std/min/max)]
    └──enables──> [Grade distribution histogram]
                       └──enhances──> [Relative grading 40% cutline marker]
    └──enables──> [Sorted rank chart with cutline]
    └──enables──> [Multi-class comparison chart]

[Per-component score arrays]
    └──enables──> [Score component breakdown table]
    └──enables──> [Per-student radar chart]

[Learning outcome sub-scores (학습성과 2/5/3)]
    └──requires──> [Threshold computation (85%/60% of max)]
                       └──enables──> [상/중/하 tier table]
                                         └──enables──> [달성률 progress indicators]

[핵심간호술 score array (separate 0–100 scale)]
    └──requires──> [Visual separation from 100-pt total]
    └──enables──> [핵심간호술 KPI card + histogram]
```

### Dependency Notes

- **Data parser requires merged-cell handling**: Google Sheets 3-row header with merged cells means `fetchSheetData` must resolve column names by scanning all 3 header rows. This is the highest-risk data layer piece.
- **All visualization features require data parser**: Everything except auth/layout is blocked until the Sheets parser works correctly with real data.
- **Cutline marker requires sorted score array**: Must sort descending and find index at position `Math.ceil(n * 0.40)` (top 40% threshold = minimum A-grade score).
- **Learning outcome tier analysis requires per-outcome score extraction**: 학습성과2(64pt), 학습성과5(8pt), 학습성과3(8pt) are separate columns in the sheet; parser must identify them distinctly.
- **Radar chart enhances per-student table**: Radar is a drill-down detail view; the table must be built first.
- **달성률 progress indicator enhances 상/중/하 table**: Simple derived display; table must exist first.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed for professors to actually use the dashboard instead of Excel.

- [x] Google Sheets 3-class data fetch with 3-row header parser — *without this, nothing works*
- [x] Name anonymization (김*훈) — *hard legal/policy requirement from day 1*
- [x] KPI cards: total students, per-class average, overall average, max/min — *first thing professors look at*
- [x] Grade distribution histogram per class (bin by 5-point range) — *core visualization; can't set cutline without this*
- [x] Relative grading 40% cutline marker on histogram or sorted chart — *the dashboard's core value proposition*
- [x] Descriptive statistics table: mean, std dev, median per class — *professors immediately ask these*
- [x] Per-student score table (searchable, filterable by class) — *lookup capability is non-negotiable*
- [x] Learning outcome 상/중/하 tier analysis table — *accreditation reporting artifact; this is the second core value*

### Add After Validation (v1.x)

Features to add once core is working and professors have given feedback.

- [ ] Per-student radar chart — *trigger: professors request individual diagnostic views after using the table*
- [ ] Multi-class comparison chart (side-by-side grouped bar or box plot) — *trigger: professors want to formally document class equity*
- [ ] Sorted rank chart with cutline overlay — *trigger: professors want clearer visual for grade boundary discussion*
- [ ] 핵심간호술 dedicated KPI card + histogram — *trigger: professors start asking about the separate assessment*
- [ ] 달성률 progress indicator per outcome — *trigger: accreditation preparation season*

### Future Consideration (v2+)

Features to defer until project-market fit is established.

- [ ] Manual "새로고침" cache invalidation button — *defer: Next.js server component reloads suffice for now*
- [ ] Historical semester comparison — *defer: requires archiving past Sheets; not currently available*
- [ ] Score component breakdown bar chart (average vs. max per component) — *defer: table form is sufficient for v1; chart is enhancement*
- [ ] CSV/PDF export of grade summary — *defer: professors can screenshot or export from Google Sheets directly*

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Sheets data parser (3-row merged header) | HIGH | HIGH | P1 — foundation |
| Name anonymization | HIGH | LOW | P1 — legal requirement |
| KPI summary cards | HIGH | LOW | P1 — first screen |
| Grade distribution histogram | HIGH | MEDIUM | P1 — core visualization |
| 40% cutline marker | HIGH | MEDIUM | P1 — core value |
| Descriptive statistics (mean/std/median) | HIGH | LOW | P1 — professors ask immediately |
| Per-student score table | HIGH | MEDIUM | P1 — lookup is essential |
| 학습성과 상/중/하 tier table | HIGH | MEDIUM | P1 — accreditation artifact |
| Multi-class comparison chart | MEDIUM | MEDIUM | P2 — equity verification |
| Sorted rank chart with cutline | MEDIUM | MEDIUM | P2 — clearer cutline view |
| Per-student radar chart | MEDIUM | MEDIUM | P2 — diagnostic detail |
| 핵심간호술 tracking | MEDIUM | LOW | P2 — separate but expected |
| 달성률 progress indicators | MEDIUM | LOW | P2 — quick accreditation status |
| CSV/PDF export | LOW | MEDIUM | P3 — nice to have |
| Historical semester comparison | LOW | HIGH | P3 — future |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Closest comparables are university-internal grade distribution dashboards (not commercial LMS tools, since this is a custom single-purpose dashboard).

| Feature | University Grade Dashboards (UT Austin, Berkeley, SIUE) | Canvas LMS Grade Analytics | Our Approach |
|---------|--------------------------------------------------------|---------------------------|--------------|
| Grade distribution visualization | Bar chart by grade letter or score range | Histogram overlay on gradebook | Score range histogram per class + sorted rank chart |
| Relative grading support | Percentile display only; no cutline | Manual curve tool (separate from analytics) | Integrated 40% cutline visual on distribution |
| Learning outcome analysis | Not present (letter-grade focused) | Rubric scoring by criterion | 상/중/하 tier table with accreditation thresholds (85%/60%) |
| Multi-class comparison | College/dept level aggregation (not section-level equity) | Section comparison in New Analytics | Side-by-side per 반 chart with stats |
| Student privacy | Aggregate only (no individual rows) | Student owns their data; instructor sees all | Anonymized per-student table (교수 전용) |
| Per-student drill-down | Not available in aggregate view | SpeedGrader per-assignment | Anonymized table + radar chart |
| Data source | Institutional data warehouse | Internal LMS gradebook | Google Sheets (서비스 계정 API) |

**Key insight**: No existing tool combines (a) relative grading cutline visualization, (b) Korean nursing accreditation 상/중/하 outcome analysis, and (c) Google Sheets as the live data source in a single dashboard. This is a genuine gap this project fills.

---

## Sources

- [Bold BI Student Performance Dashboard](https://www.boldbi.com/dashboard-examples/education/student-performance-dashboard/) — feature inventory for standard academic dashboards
- [SIUE Grade Analytics Dashboard](https://www.siue.edu/grade-analytics/) — university internal grade distribution dashboard pattern; FERPA privacy model
- [Learning Analytics Dashboard (Springer)](https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-021-00313-7) — radar chart / cohort comparison patterns
- [Korean Academic Grading — Wikipedia](https://en.wikipedia.org/wiki/Academic_grading_in_South_Korea) — 상대평가 40% A-grade limit context
- [Korean Nursing Education Program Outcomes Assessment (JKASNE)](https://jkasne.org/journal/view.php?doi=10.5977/jkasne.2017.23.2.135) — 상/중/하 tier system with 85%/60% thresholds (institution-specific implementation)
- [Far East University Nursing Program Outcome Framework](https://www.kdu.ac.kr/nursing/sub.do?mncd=1735) — concrete example of 상/중/하 criteria in Korean nursing accreditation
- [KABONE (한국간호교육평가원)](http://www.kabone.or.kr/) — Korean Nursing Education Accreditation Board — regulatory body
- [Canvas Grade Distribution FSU](https://support.canvas.fsu.edu/kb/article/1797-canvas-grade-distribution/) — cutline visualization pattern reference
- [Blackboard Curve Grades](https://help.blackboard.com/Learn/Instructor/Original/Grade/Grading_Tasks/Curve_Grades) — relative grading tool pattern
- PROJECT.md — primary source for all domain-specific requirements

---

*Feature research for: 간호학과 아동실습 성적 대시보드 (Nursing Practicum Grade Analytics Dashboard)*
*Researched: 2026-02-22*
