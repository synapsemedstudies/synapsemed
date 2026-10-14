# Google Antigravity `/goal` Prompt Pack, Selective Liquid Glass UI & `.agents/skills` Guide

Use this playbook with [Gemini 4 Argon (gemini-4-argon)](https://www.google.com/search?q=https%3A%2F%2Fdevelopers.googleblog.com%2Fgemini-4-argon-for-robotics%2F) inside [Google Antigravity](https://www.google.com/search?q=https%3A%2F%2Fantigravity.google%2Fdocs%2Fgetting-started%2F) to build the entire **Student Learning & Quiz Portal (500–1,000 Students)** with a **Selective Liquid Glass UI** across five clean, verifiable vertical slices without writing code by hand.

## 1. Initial Folder Setup & Environment Variables Takes 3 Minutes

Create an empty project folder on your machine, open it in [Google Antigravity](https://www.google.com/search?q=https%3A%2F%2Fantigravity.google%2F), and place `GEMINI.md` in the root directory. Create a `.env.example` file (and populate `.env.local` with your keys from [Supabase](https://www.google.com/search?q=https%3A%2F%2Fsupabase.com%2Fpricing) and [Cloudflare R2](https://www.google.com/search?q=https%3A%2F%2Fdevelopers.cloudflare.com%2Fr2%2Fpricing%2F)):

```env
# Supabase Database & Auth (Free Tier supports 50,000 MAUs & 500 MB DB)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Cloudflare R2 Object Storage ($0 Egress Fees, 10 GB Free Storage)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="student-notes-portal"
```

## 2. How to Adopt Liquid Glass UI ("Selective Glass" Rules & Reusable Primitives)

Instead of applying heavy blur everywhere—which causes eye fatigue on PDF notes and frame drops on student phones—this setup enforces **Selective Liquid Glass** using [shadcn/ui](https://www.google.com/search?q=https%3A%2F%2Fui.shadcn.com%2Fdocs%2Ftheming) alongside open-source Liquid Glass patterns from [Ein UI](https://www.google.com/search?q=https%3A%2F%2Fui.eindev.ir%2F), [Magic UI](https://www.google.com/search?q=https%3A%2F%2Fmagicui.design%2F), and [Aceternity UI](https://www.google.com/search?q=https%3A%2F%2Fui.aceternity.com%2F):

* **Apply Liquid Glass (`GlassCard` / `GlassShell`) to structural chrome & cards**: Use `backdrop-blur-xl bg-white/10 dark:bg-slate-900/45 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.25)]` on the floating top navbar, collapsible Subject/Chapter sidebar, Dashboard KPI cards, Quiz countdown timer pill, modal dialogs, and the Admin Excel dropzone ([David UI Liquid Glass](https://www.google.com/search?q=https%3A%2F%2Fwww.creative-tim.com%2Fdavid-ui%2Fdocs%2Fhtml%2Fliquid-glass%2Fusecases)).
* **Keep reading and testing surfaces high-contrast matte (`ReadingSurface`)**: Inside the inner PDF Note Reader canvas and Quiz Question stem/option cards, use a crisp, high-opacity surface (`bg-white/95 dark:bg-slate-950/90 border border-slate-200/80 dark:border-white/10`) so students get sharp text contrast during 45–60 minute study sessions.
* **Cap `backdrop-blur` layers at 3 per viewport for 60 FPS**: Never apply `backdrop-blur` to individual `<tr>` table rows or long scrolling list items; blur only the outer container shell so mobile scrolling stays locked at 60 FPS.

## 3. Three Custom `.agents/skills` Packages Enforce Zero-Waste & Liquid Glass Quality

[Google Antigravity](https://www.google.com/search?q=https%3A%2F%2Fantigravity.google%2Fdocs%2Fskills%2F) loads `SKILL.md` files from `.agents/skills/` on demand using progressive disclosure ([Authoring Antigravity Skills Codelab](https://www.google.com/search?q=https%3A%2F%2Fcodelabs.developers.google.com%2Fgetting-started-with-antigravity-skills)). Before running your first `/goal` prompt, ask Antigravity to create these three skill files (or paste them directly):

### Skill 1: `.agents/skills/liquid-glass-ui/SKILL.md`

```markdown
---
name: liquid-glass-ui
description: Enforces Selective Liquid Glass UI tokens, specular inner borders, high-contrast reading surfaces, and the 3-layer mobile GPU blur cap across all pages and components.
---
# Selective Liquid Glass UI Skill

When building or styling any layout, page, or component:
1. Render a fixed ambient background in the root layout (`bg-slate-950` with subtle blurred radial gradient orbs in `indigo-500/15`, `cyan-500/10`, and `violet-500/15`) so translucent glass layers have rich depth to refract.
2. Use `<GlassCard>` (`backdrop-blur-xl bg-white/10 dark:bg-slate-900/45 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.25)] rounded-2xl`) for floating navbars, sidebars, KPI cards, timer pills, and dropzones.
3. Use `<ReadingSurface>` (`bg-white/95 dark:bg-slate-950/90 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl`) for inner PDF note canvases, quiz question stems, answer options, and explanations to guarantee WCAG >= 4.5:1 readability.
4. Never exceed 3 simultaneous `backdrop-blur` layers in a single viewport, and never place `backdrop-blur` on repeating `<tr>` or list rows.
```

### Skill 2: `.agents/skills/zero-waste-audit/SKILL.md`

```markdown
---
name: zero-waste-audit
description: Audits the codebase after any feature implementation or refactor to eliminate dead code, unused imports, duplicate helpers, and TypeScript errors before completing a task.
---
# Zero-Waste Codebase Audit Skill

Run this checklist before generating the final Walkthrough artifact for any task:
1. Run `npx tsc --noEmit` and resolve every TypeScript error without using `any` or `@ts-ignore`.
2. Search modified files for `console.log`, `TODO`, or hardcoded mock arrays and remove them.
3. Verify that every Server Action in `src/actions/` calls `requireAdmin()` or `requireStudent()` as its very first line.
4. Run `npm run build` to confirm zero build or bundling regressions.
```

### Skill 3: `.agents/skills/excel-quiz-validator/SKILL.md`

```markdown
---
name: excel-quiz-validator
description: Enforces strict SheetJS (.xlsx) parsing and Zod row validation rules when building or modifying the Admin Excel Quiz Upload and Student Roster Import features.
---
# Excel Quiz & Roster Validation Skill

When implementing or updating Excel (.xlsx) upload features with SheetJS:
1. Parse workbooks using `XLSX.read(buffer, { type: 'array' })` and extract rows with `XLSX.utils.sheet_to_json(sheet, { defval: '' })`.
2. Normalize header names (trim whitespace, lowercase) and validate every row against `QuizRowSchema` in `src/lib/validators/quiz.ts`.
3. Never silently skip invalid rows. Return a structured `{ validRows, rowErrors: [{ rowNumber, field, message }] }` object so the Admin UI highlights exact spreadsheet row numbers in red before enabling database insertion.
4. Insert all `quiz_questions` inside a single Drizzle ORM `db.transaction()` block so partial quiz uploads can never occur.
```

## 4. Five Sequential `/goal` Prompts Build the Complete Production App

Run these five prompts **one by one** in Antigravity with `gemini-4-argon` selected ([Google for Developers Blog](https://www.google.com/search?q=https%3A%2F%2Fdevelopers.googleblog.com%2Fgemini-4-argon-for-robotics%2F)). After submitting each prompt, inspect the `implementation_plan.md` artifact in the Auxiliary Pane ([Building with Google Antigravity](https://www.google.com/search?q=https%3A%2F%2Fcodelabs.developers.google.com%2Fbuilding-with-google-antigravity)) and click **Proceed**.

| Slice # | Target Milestone | What Antigravity Builds & Verifies Autonomously |
| :--- | :--- | :--- |
| **Slice 1** | Foundation, DB Schema, RBAC Auth & Glass Shell | Next.js App Router scaffold, Drizzle PostgreSQL schema, `/admin` vs `/student` middleware guards, and `GlassCard` / `ReadingSurface` primitives |
| **Slice 2** | Structured Notes & Cloudflare R2 Reader | Admin Subject/Chapter CRUD, R2 presigned PDF uploader, and Student watermarked `ReadingSurface` PDF viewer inside a Liquid Glass sidebar shell |
| **Slice 3** | Admin Excel-to-Quiz Pipeline | Liquid Glass drag-and-drop `.xlsx` quiz uploader with SheetJS + Zod live row validation preview and transactional DB publish |
| **Slice 4** | Live Student Quiz Engine | Timed quiz interface with frosted timer pill, high-contrast `ReadingSurface` question cards, `localStorage` auto-save, and scorecard deep links |
| **Slice 5** | Mistake Notebook & Production Polish | Auto-generated Mistake Notebook, custom 10-question retry quiz generator, Admin Excel roster import, and full zero-waste + 60 FPS audit |

### Copy-Paste Prompt for Slice 1: Foundation, Database Schema, Auth & Liquid Glass Primitives

> `/goal` Read `GEMINI.md` and apply the `liquid-glass-ui` skill to initialize Slice 1 of the Student Learning & Quiz Portal.
> 1. Scaffold a clean Next.js (App Router) + TypeScript (`strict: true`) + Tailwind CSS + `shadcn/ui` project if not already initialized.
> 2. Create `src/components/ui/glass.tsx` exporting reusable `<AmbientBackdrop />`, `<GlassCard />` (frosted `backdrop-blur-xl` with specular inner border), and `<ReadingSurface />` (high-contrast matte surface for dense text/PDFs) components following Section 3 of `GEMINI.md`.
> 3. Configure Drizzle ORM (`src/db/schema.ts` and `src/db/index.ts`) implementing all tables defined in `GEMINI.md` (`users`, `subjects`, `chapters`, `notes`, `quizzes`, `quiz_questions`, `quiz_attempts`, `mistake_items`) with proper foreign keys and indexes for 1,000 concurrent students.
> 4. Implement Supabase SSR authentication (`@supabase/ssr`) with Next.js Middleware (`src/middleware.ts`) that routes authenticated `admin` users to `/admin` and `student` users to `/dashboard`, strictly blocking cross-role access.
> 5. Create reusable server-side auth guards (`requireAdmin()` and `requireStudent()`) in `src/lib/auth.ts`, and build responsive Liquid Glass Login (`/login`), Admin Shell (`/admin`), and Student Shell (`/dashboard`) layouts.
> 6. Execute the `zero-waste-audit` skill (`npx tsc --noEmit` and `npm run build`) and verify the Liquid Glass shells and login redirect logic in the local browser before completing the Walkthrough artifact.

### Copy-Paste Prompt for Slice 2: Structured Notes Library & Cloudflare R2 Watermarked Reader

> `/goal` Read `GEMINI.md` and apply the `liquid-glass-ui` skill to implement Slice 2: Structured Study Notes Library with Cloudflare R2.
> 1. Build `src/lib/r2.ts` using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to generate 15-minute presigned PUT URLs (for Admin PDF uploads) and 15-minute presigned GET URLs (for Student viewing) with zero PDF byte proxying through Next.js servers.
> 2. Build the Admin Notes Manager (`/admin/notes`) using `<GlassCard />` containers, allowing Admins to create/reorder `Subjects` and `Chapters` (each with a unique `chapter_slug` like `physics-ch01`), upload PDF notes directly to Cloudflare R2 via presigned URL, and toggle `allow_download`.
> 3. Build the Student Notes Portal (`/dashboard/notes`) featuring a collapsible Liquid Glass Subject -> Chapter sidebar tree, keyword search filter, "Mark as Completed" progress toggle, and an in-browser PDF viewer mounted inside a high-contrast `<ReadingSurface />` that overlays a subtle diagonal watermark (`"{student.full_name} • {student.roll_number}"`).
> 4. Run `zero-waste-audit` (`npx tsc --noEmit` and `npm run build`) and verify creating a subject/chapter and rendering the student notes view in the local browser.

### Copy-Paste Prompt for Slice 3: Admin Excel (`.xlsx`) Quiz Upload & Live Validation Pipeline

> `/goal` Read `GEMINI.md` and apply the `excel-quiz-validator` and `liquid-glass-ui` skills to implement Slice 3: Admin Excel-to-Quiz Ingestion Engine.
> 1. Create `src/lib/validators/quiz.ts` defining `QuizRowSchema` with Zod for columns: `question_number`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option` (`A`|`B`|`C`|`D`), `marks`, `negative_marks`, `chapter_slug`, and `explanation`.
> 2. Build the Admin Quiz Uploader tab (`/admin/quizzes/new`) with a "Download Sample `.xlsx` Template" button and a `<GlassCard />` drag-and-drop `.xlsx` upload zone powered by SheetJS (`xlsx`).
> 3. When an `.xlsx` file is dropped, parse it immediately in the browser and render a preview table inside `<ReadingSurface />` (with zero `backdrop-blur` on individual `<tr>` rows for 60 FPS scrolling) alongside a highlighted red error banner listing exact spreadsheet row numbers and fields for any invalid row.
> 4. Build the `createQuizFromExcel` Server Action (`src/actions/quizzes.ts`) guarded by `requireAdmin()` that re-validates the payload with Zod and inserts the `quizzes` record plus all `quiz_questions` rows inside a single Drizzle ORM `db.transaction()`.
> 5. Verify the upload flow in the local browser using `sample_quiz_upload_template.xlsx`, confirm the published quiz appears in the database, and run `zero-waste-audit`.

### Copy-Paste Prompt for Slice 4: Student Timed Quiz Runner, Auto-Save & Scorecard Deep Links

> `/goal` Read `GEMINI.md` and apply the `liquid-glass-ui` skill to implement Slice 4: Student Quiz Center & Auto-Grading Engine.
> 1. Update the Student Dashboard (`/dashboard`) and Quiz Center (`/dashboard/quizzes`) using `<GlassCard />` Bento KPI cards to display published quizzes for the student's batch with status badges (`New`, `In Progress`, `Completed`) and score summaries.
> 2. Build the interactive Timed Quiz Runner (`/dashboard/quizzes/[quizId]/take`) featuring a floating Liquid Glass countdown timer pill and question palette, paired with high-contrast `<ReadingSurface />` question stems and clickable option cards, plus automatic `localStorage` state persistence on every tap.
> 3. Build the `submitQuizAttempt` Server Action (`src/actions/attempts.ts`) guarded by `requireStudent()` that calculates positive and negative marks on the server, records the `quiz_attempts` row, and automatically upserts any incorrectly answered questions into `mistake_items` inside a single transaction.
> 4. Build the Student Scorecard page (`/dashboard/quizzes/[quizId]/result`) showing total score, accuracy percentage, step-by-step answer explanations, and a direct "Review Concept Note" button on any question whose `chapter_slug` matches a chapter in the Structured Notes Library.
> 5. Run `zero-waste-audit` and verify taking, refreshing mid-quiz, and submitting a quiz in the local browser.

### Copy-Paste Prompt for Slice 5: Mistake Notebook, Student Bulk Roster Import & Final Polish

> `/goal` Read `GEMINI.md` and apply the `liquid-glass-ui` and `zero-waste-audit` skills to implement Slice 5: Student Mistake Notebook, Admin Bulk Student Import, and Cohort Analytics.
> 1. Build the Student Mistake Notebook (`/dashboard/mistakes`) listing all questions the student previously missed inside `<ReadingSurface />` cards (grouped by subject and `chapter_slug`), plus a Liquid Glass "Practice My Mistakes (10-Question Custom Quiz)" button that generates an instant revision quiz from unresolved `mistake_items` and marks questions as `resolved = true` once answered correctly.
> 2. Add an Admin Student Roster Import modal on `/admin/students` using SheetJS (`xlsx`) so the Admin can upload an Excel sheet (`full_name`, `email`, `roll_number`, `batch_id`) to bulk-provision up to 1,000 student accounts and export a CSV/Excel gradebook of cohort quiz scores.
> 3. Perform a complete repository sweep using `zero-waste-audit` and `liquid-glass-ui`: verify zero unused files, max 3 `backdrop-blur` layers per viewport, zero TypeScript warnings (`npx tsc --noEmit`), a clean production build (`npm run build`), and end-to-end browser verification across both Admin and Student portals.
