# SynapseMed Website: Latency and Performance Audit

Date: 2026-11-02  
Scope: repository-wide static review of the Next.js application under `src/`, its database queries, client/server rendering boundaries, CSS/assets, and project configuration. This is a code inspection, not a production performance test. No deployed URL, production credentials, representative dataset, or browser trace was provided; therefore timings and user impact are not quantified, and findings should be verified against real traffic before rollout.

## Executive summary

The strongest code-evidenced latency risks are unbounded database reads used only to calculate aggregates and the PYQ page's client-side initial question fetch (which delays useful content until JavaScript has loaded and a server action completes). The admin roster also reads all attempts for all students, while spreadsheet import paths perform sequential per-row database work. The app globally applies animated, large blurred backgrounds and multiple backdrop filters, which can increase rendering cost on lower-end/mobile devices. External Google Fonts are imported from CSS and can delay text/icon rendering. The current app has no bundle analyzer, browser performance test, or reproducible latency budget in its scripts.

The recommended sequence is: capture production-like baseline measurements; replace whole-table reads with database-side aggregates and bounded/paginated queries; render the initial PYQ chapter's data on the server; reduce unnecessary auth round trips; then optimize global rendering and font delivery. Add regression measurements before considering broad caching or infrastructure changes.

## Findings

### P1 — PYQ syllabus loads every question to derive per-chapter counts

`src/actions/pyq.ts:333-369` runs three parallel queries. The third, `db.select().from(pyqQuestions)` at line 338, retrieves every question row, including full question and model-answer text, though the caller only needs a count per chapter. It then counts rows in application memory at lines 345-349. This causes database/network transfer and server memory/CPU to scale with total answer content, on both student and admin PYQ pages. The existing `chapterId` index in `src/db/schema.ts:91-92` can support a grouped count.

Fix: replace the full question read with a grouped `COUNT(*) GROUP BY chapter_id` query (or a joined aggregate), select only `chapterId` and count, then map aggregate results into chapter counts. Confirm the query plan uses the chapter index and compare transferred row/byte counts as the question bank grows.

### P1 — Student quiz list reads all quiz questions and all attempts

`src/app/(student)/dashboard/quizzes/page.tsx:20-35` fetches all published quizzes, all quiz-question ids across every quiz, and all attempts for one student. It groups the question rows in JavaScript at lines 37-41. Work and transfer grow with the entire quiz bank, not with the published quiz list. The `quiz_questions.quiz_id` index exists (`src/db/schema.ts:135-136`); `quiz_attempts` has a unique `(quiz_id, student_id)` index (`src/db/schema.ts:157-158`), although its column order should be checked against actual query plans for student-only lookups.

Fix: aggregate question counts in SQL for published quiz ids, and fetch only needed attempt fields scoped to the published quiz ids/student. Prefer one grouped/left-joined query where practical, with deterministic attempt selection/order. Add pagination if quiz counts can become large. Validate that query rows and transferred bytes remain proportional to the visible list.

### P1 — Admin roster loads every quiz attempt into application memory

`src/actions/students.ts:24-64` reads all students and all rows from `quiz_attempts`, then groups attempts and computes each student's average in application memory. The roster page calls this on load (`src/app/(admin)/admin/students/page.tsx:5-8`). As the cohort and attempt history grow, the query transfers and processes records unrelated to the visible roster. The attempt table has a unique `(quiz_id, student_id)` index (`src/db/schema.ts:157-158`), but no index is evident for aggregating by student alone.

Fix: aggregate attempt count and average percentage by `studentId` in SQL and join/group with roster students; paginate/filter roster results if cohort size can grow. Validate averages and zero-total behavior against the current implementation, and add a `student_id`-leading index only if query plans justify it.

### P1 — Initial PYQ questions are fetched only after client hydration

`src/app/(student)/dashboard/pyq/page.tsx:5-18` awaits the syllabus but passes no initial question data. `src/components/pyq/student-pyq-browser.tsx:47-74` calls `getChapterPYQs` in `useEffect` after mount for the initially selected chapter. The user receives the page shell and then waits for client hydration plus a server-action round trip before seeing the questions. The current UI does show a loading state but does not remove this avoidable initial waterfall.

Fix: resolve the selected initial chapter and its questions in the server page, pass them as initial props, and preserve chapter switching through a server action or route/data request. Reconcile initial chapter selection with `searchParams.chapter`, including invalid IDs. Keep loading feedback for subsequent chapter changes. Compare time-to-first-question and LCP before/after.

### P1 — Bulk imports serialize database requests

`importStudentRoster` in `src/actions/students.ts:72-103` performs a lookup and, for new rows, an insert sequentially for each spreadsheet row (up to 1,000 by its comment). `importPYQsBulk` in `src/actions/pyq.ts:529-554` performs one awaited insert per row inside a transaction. These paths are not typical student page loads, but large imports can take many sequential database round trips and hold a transaction open.

Fix: validate and normalize the complete input first, then use set-based lookups and multi-row inserts with conflict handling. Chunk only as needed for parameter/statement limits. For roster imports, preserve existing-email behavior and report actual inserted counts; do not claim success if the database operation fails. For PYQs, preserve all-or-nothing semantics or explicitly document changed partial-import behavior.

### P2 — Redundant student authorization runs twice on protected pages

The student layout runs `requireStudent()` at `src/app/(student)/dashboard/layout.tsx:5-13`, and page components such as `src/app/(student)/dashboard/pyq/page.tsx:10-12` and `src/app/(student)/dashboard/quizzes/page.tsx:99-101` call it again. `getCurrentUser` is wrapped in React `cache()` (`src/lib/auth.ts:23`), so this may be deduplicated within a single server render; it should not be assumed to add an extra network request without measurement. Separately, when auth user metadata lacks role, `src/lib/auth.ts:75-80` performs a DB lookup after `supabase.auth.getUser()`, adding a sequential network round trip.

Fix: verify request traces first. Keep the layout as the authorization boundary and remove redundant page-level checks only if all page access paths are protected by that layout and server actions retain their own guards. Ensure trusted role metadata is consistently populated/maintained, or consolidate identity/role resolution into an efficient server-side path. Do not weaken authorization to improve latency.

### P2 — Global backdrop animation and glass blur can tax mobile rendering

The root layout includes `AmbientBackdrop` on every route (`src/app/layout.tsx:14-18`). It renders four oversized animated blurred gradients (`src/components/ui/glass.tsx:7-18`); the CSS keeps all four animations active and sets `will-change` (`src/app/globals.css:107-169`). Glass cards apply `backdrop-filter: blur(28px)` or `blur(20px)` (`src/app/globals.css:45-69`), and the React card component uses `backdrop-blur-xl` (`src/components/ui/glass.tsx:39-45`). These effects can trigger substantial paint/compositing work on low-powered devices, especially with many cards; this is a rendering/interaction risk rather than evidence of server latency.

Fix: profile scrolling and interaction on representative low-end mobile hardware. Use a static/less costly background on small screens and under `prefers-reduced-motion`, reduce the number/size of animated layers, avoid persistent `will-change` where profiling shows no benefit, and use lower/no blur for dense card lists. Preserve the visual design where the performance trace shows no regression.

### P2 — CSS imports third-party fonts without an app-managed loading strategy

`src/app/globals.css:1-2` imports Google Fonts stylesheets for Inter, Space Grotesk, and Material Symbols. External font stylesheet discovery and font downloads can delay font rendering and introduce a third-party dependency in the critical path. No evidence here establishes the actual delay, since connection and cache conditions vary.

Fix: measure cold-cache font loading and layout shifts. Prefer self-hosted/subset font files or Next.js font optimization with explicit subsets, weights, and `display: swap`; keep icon assets/font subsets as small as feasible. Provide a system-font fallback and ensure icons remain legible while loading.

### P2 — Quiz result path repeats quiz and question reads

`getQuizResultBreakdown` in `src/actions/attempts.ts:222-225` calls `getQuizForRunner`, which selects the quiz and its full question set at lines 139-147, then separately loads the student's attempt at lines 230-240. The page also calls `requireStudent` in its wrapper (inspect `src/app/(student)/dashboard/quizzes/[quizId]/result/page.tsx` during implementation). Some data is necessarily needed for the review, but duplicated user resolution and selecting columns not needed by the result view may add latency and payload.

Fix: inspect the result component's exact fields, project only those columns, and load the required quiz/questions/attempt with appropriately scoped queries. Avoid re-fetching authentication/user data if React request memoization already handles it; confirm from traces.

### P3 — Admin quiz overview fetches all question IDs to count them

`src/actions/quizzes.ts:168-187` fetches every quiz and every quiz-question `quizId`, then counts in memory. This repeats the aggregate anti-pattern in the admin experience and scales with the entire question bank.

Fix: calculate question counts in SQL grouped by quiz id, limit the quiz list to a page if it can grow, and return only fields rendered in the admin view.

### P3 — Excel parsing library is imported into client-side admin features

`src/components/pyq/admin-pyq-manager.tsx:16` and `src/components/students/admin-student-roster.tsx:7` import `xlsx` in client components. `src/components/quizzes/admin-quiz-uploader.tsx:5` also imports it. The package is sizable and may inflate admin route JavaScript, though route-level chunking may keep it out of student bundles; bundle analysis is needed to establish actual transfer cost.

Fix: inspect production route chunks. Dynamically load the parser only when an admin opens/imports a spreadsheet, or move parsing to a server endpoint if file size/security/UX tradeoffs allow. Set upload-size and row-count limits. Verify the XLSX parser isn't included in student route chunks.

### P3 — No defined performance budgets or repeatable measurement tooling

`package.json:4-12` provides build/typecheck/lint but no performance test, bundle report, or Lighthouse/trace workflow. Without reproducible metrics, latency regressions and the effect of optimization cannot be assessed. No production deployment latency data was available for this review.

Fix: establish representative mobile and desktop journeys and record LCP, INP, CLS, TTFB, server/action duration, database query duration, rows/bytes returned, and client JS per route. Add bundle analysis and a CI check for gross regressions; use trend thresholds rather than flaky hard assertions initially.

## Implementation plan

### Phase 0 — Establish the baseline (before changing behavior)

1. Test representative production-like paths: landing/login, student dashboard, PYQ first load and chapter switch, quiz list, quiz start, quiz result, and admin quiz/PYQ screens.
2. Capture cold and warm navigation metrics on desktop and a constrained mobile profile: Web Vitals (LCP/INP/CLS), TTFB, first-question visible time, route JS bytes, and browser long tasks.
3. Instrument server-side request/action duration and database query timing. Record rows/bytes for high-cardinality queries. Keep user-specific data out of logs.
4. Document test environment, database size, cache state, geographic region, and repeat count. Use medians and p75/p95, not one-off timings.

Acceptance: a checked-in or shareable baseline with repeatable steps, and a small set of agreed route-level budgets based on client expectations.

### Phase 1 — Remove unbounded aggregation reads

1. Replace the PYQ all-question read with grouped chapter counts.
2. Replace student quiz list all-question reads with SQL counts for published quizzes, and restrict attempts to that student's visible quizzes.
3. Replace admin roster all-attempt reads with grouped count/average queries and paginate the roster where appropriate.
4. Replace admin quiz overview all-question reads with grouped counts; paginate if the UI can show large datasets.
5. Review query plans and schema indexes for actual filter/group/order paths. Add migrations only when query plans justify them; do not add speculative indexes.
6. Keep output ordering stable and handle empty records consistently.

Acceptance: result data is unchanged; no query selects full question/answer text just to count; query payload grows with requested list/aggregate results rather than all stored rows; typecheck/build pass.

### Phase 2 — Make bulk imports set-based

1. Normalize and validate all roster/PYQ rows before opening database transactions.
2. Replace per-row lookups/inserts with bulk insert and conflict handling, preserving duplicate-email semantics.
3. Use bounded chunks where statement size or database parameter limits require them, while preserving the intended transaction guarantees.
4. Return accurate inserted/skipped counts and surface database errors instead of reporting successful imports on failure.
5. Benchmark the documented 1,000-student import and a representative PYQ workbook.

Acceptance: bulk import outcomes are unchanged for valid and duplicate records; database round trips are substantially reduced; failure and partial-input cases return truthful statuses.

### Phase 3 — Remove the initial PYQ client request waterfall

1. Determine the initially selected chapter on the server using the requested chapter when valid, otherwise the existing first-chapter default.
2. Fetch its questions with the syllabus and pass them into the browser as initial data.
3. Ensure client navigation replaces stale data safely, handles rapid chapter changes, and provides an error state rather than leaving a previous chapter's questions onscreen.
4. Consider URL state for chapter changes if it benefits reload/deep-link behavior; avoid adding a broad client data cache before measuring.

Acceptance: initial question content is in the first server-rendered response; first-question-visible time improves without breaking chapter selection/search/filter behavior.

### Phase 4 — Reduce auth and route data overhead

1. Trace `getCurrentUser` and layout/page `requireStudent` calls to confirm React `cache()` behavior in this Next.js version.
2. Remove only verified redundant page checks; retain server-action checks and route/layout protection.
3. Measure accounts without Supabase role metadata and decide whether role resolution can avoid the sequential DB lookup safely.
4. Project only fields used by quiz result rendering, and consolidate or avoid repeated result-page reads where the data is identical.

Acceptance: fewer measured auth/data round trips, with authorization tests confirming students/admins cannot cross protected areas.

### Phase 5 — Reduce client rendering and initial transfer cost

1. Produce production bundle analysis by route, focusing on XLSX and client-only code.
2. Lazy-load admin spreadsheet features or parser code behind explicit import actions, and verify no XLSX code ships to student routes.
3. Test the ambient background/glass styles under CPU throttling and reduced-motion settings. Apply targeted mobile/dense-list fallbacks only where traces show expensive rendering.
4. Replace external font CSS imports with optimized/self-hosted fonts and validate fallback rendering, CLS, and icon display.

Acceptance: no visual/functional regressions; reduced route JS/font critical path and no sustained animation-induced long tasks on target mobile hardware.

### Phase 6 — Verify, monitor, and tune from evidence

1. Repeat exactly the Phase 0 journeys with the same environment and data volume.
2. Compare p50/p75/p95 for first-question-visible time, TTFB, DB duration, LCP/INP/CLS, and JS bytes.
3. Run production build and typecheck; execute authorization, PYQ chapter-switch, quiz listing, and result regression tests.
4. Roll out in small increments and monitor errors, query latency, and Web Vitals. Only add caching/CDN/database pool changes when observed bottlenecks point to them.

## Prioritization snapshot

| Priority | Work | Why first |
| --- | --- | --- |
| P1 | SQL aggregates for PYQ and quiz counts | Removes avoidable unbounded data transfer and app-side aggregation |
| P1 | Server-render initial PYQ questions | Removes hydration-plus-action waterfall for first content |
| P1 | Admin roster SQL aggregation | Avoids scanning and transferring all attempt rows |
| P1 | Bulk import batching | Avoids sequential per-row database round trips |
| P1 | Baseline instrumentation | Prevents guessing and validates every change |
| P2 | Auth/result query path review | Potential sequential round trips; verify before refactor |
| P2 | Mobile blur/animation and font loading | Likely rendering/critical path concerns, requiring device profiling |
| P3 | XLSX route chunking and admin pagination | Prevents admin feature cost or list size growth from affecting UX |

## Limits and non-findings

This audit does not claim that the database, hosting provider, network region, or connection pool is the root cause: production traces and configuration were not provided. `src/db/index.ts:12-19` configures a postgres-js pool of up to 10 connections with `prepare: false`, but whether this is appropriate depends on deployment concurrency and the Supabase pooler mode; tune only after observing pool waits, connection errors, or database saturation. Similarly, `next.config.mjs` has no special caching/image settings, but the inspected source did not establish that image delivery is a latency contributor. The project includes local fallback/demo records on DB failures; that behavior can mask backend availability issues and should be clearly separated from real production performance/availability reporting.
