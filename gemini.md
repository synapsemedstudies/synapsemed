# GEMINI.md — Persistent Architecture, Selective Liquid Glass UI & Zero-Waste Coding Rules

Drop this file directly into the root of your project repository (`./GEMINI.md`) and mirror its core invariants in `.agents/rules/architecture.md` ([Google Antigravity Rules Docs](https://www.google.com/search?q=https%3A%2F%2Fantigravity.google%2Fdocs%2Frules%2F)). [Google Antigravity](https://www.google.com/search?q=https%3A%2F%2Fantigravity.google%2Fdocs%2Fgetting-started%2F) automatically injects this file into every agent run so [Gemini 4 Argon (gemini-4-argon)](https://www.google.com/search?q=https%3A%2F%2Fdevelopers.googleblog.com%2Fgemini-4-argon-for-robotics%2F) enforces production-grade standards and your **Selective Liquid Glass UI** without code bloat.

## 1. System Identity & Target Capacity Enforced Across Every Run

* **Application Scope**: Multi-role **Student Learning & Quiz Portal** designed for **500 to 1,000 active students** and **Admin educators**.
* **Core Capabilities**:
  1. **Role-Based Access Control (RBAC)**: Strict separation between `admin` and `student` accounts at both the Next.js Middleware layer and inside every Server Action.
  2. **Structured Notes Library**: Hierarchical syllabus tree (`Batch -> Subject -> Chapter -> Note`) backed by private [Cloudflare R2](https://www.google.com/search?q=https%3A%2F%2Fdevelopers.cloudflare.com%2Fr2%2Fpricing%2F) storage and short-lived presigned read URLs.
  3. **Admin Excel-to-Quiz Engine**: Client-side preview and server-side transactional ingestion of `.xlsx` quiz files using [SheetJS](https://www.google.com/search?q=https%3A%2F%2Fdocs.sheetjs.com%2Fdocs%2Fgetting-started%2Fexamples%2Fimport%2F) and Zod validation.
  4. **Student Quiz & Mistake Notebook**: Timed quiz runner with `localStorage` auto-save, instant grading, note deep-linking, and automatic indexing of wrong answers into a personal Mistake Notebook.

## 2. Locked Technology Stack Prohibits Unapproved Dependencies

The agent MUST NOT install any package outside this approved stack without explicit user confirmation in the `implementation_plan.md` artifact ([Building with Google Antigravity](https://www.google.com/search?q=https%3A%2F%2Fcodelabs.developers.google.com%2Fbuilding-with-google-antigravity)):

| Architectural Layer | Locked Package / Service | Enforcement Rule |
| :--- | :--- | :--- |
| **Framework & Language** | [Next.js (App Router)](https://www.google.com/search?q=https%3A%2F%2Fnextjs.org%2Fdocs) + TypeScript (`strict: true`) | Use React Server Components by default; add `'use client'` only for interactive leaf components (Excel dropzone, Quiz timer, PDF canvas) |
| **UI & Liquid Glass Styling** | Tailwind CSS + [shadcn/ui](https://www.google.com/search?q=https%3A%2F%2Fui.shadcn.com%2Fdocs%2Ftheming) + [Ein UI](https://www.google.com/search?q=https%3A%2F%2Fui.eindev.ir%2F) / [Magic UI](https://www.google.com/search?q=https%3A%2F%2Fmagicui.design%2F) / [Aceternity UI](https://www.google.com/search?q=https%3A%2F%2Fui.aceternity.com%2F) + `lucide-react` | Use copy-paste `shadcn/ui` and Liquid Glass Tailwind primitives; never install heavy external CSS frameworks (no Material UI, Chakra, or Bootstrap) |
| **Database & Auth** | [Supabase](https://www.google.com/search?q=https%3A%2F%2Fsupabase.com%2Fpricing) (`@supabase/ssr`, `@supabase/supabase-js`) | Enforce session verification via `@supabase/ssr` cookies and PostgreSQL Row-Level Security (RLS) |
| **Database ORM** | [Drizzle ORM](https://www.google.com/search?q=https%3A%2F%2Form.drizzle.team%2Fdocs%2Foverview) (`drizzle-orm`, `drizzle-kit`, `postgres`) | Define all tables in a single `src/db/schema.ts` file; use prepared relational queries and single-transaction bulk inserts |
| **Object Storage** | [Cloudflare R2](https://www.google.com/search?q=https%3A%2F%2Fwww.cloudflare.com%2Fproducts%2Fr2%2F) via `@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner` | Never proxy raw PDF bytes through Next.js API routes; always generate 15-minute presigned PUT/GET URLs |
| **Excel Ingestion** | [SheetJS (xlsx)](https://www.google.com/search?q=https%3A%2F%2Fdocs.sheetjs.com%2Fdocs%2Fsolutions%2Finput%2F) + `zod` | Validate every parsed Excel row against `QuizRowSchema` before enabling the Publish button |

## 3. How to Adopt Liquid Glass UI ("Selective Glass" Architecture for 500–1,000 Students)

To achieve a high-craft **Liquid Glass UI** without causing eye strain during long study sessions or GPU lag on budget student smartphones, the agent MUST implement **Selective Liquid Glass**:

| UI Surface Category | Target Components | Required Tailwind / CSS Token Pattern | Rationale |
| :--- | :--- | :--- | :--- |
| **1. Ambient Canvas Backdrop** | Root layout wrapper (`src/app/layout.tsx`) | Fixed mesh/aurora radial gradients (`bg-slate-950` with subtle `indigo-500/15`, `cyan-500/10`, and `violet-500/15` blurred orbs) | Gives translucent glass layers subtle color depth to refract against |
| **2. Liquid Glass Chrome & Cards (`glass-panel`)** | Floating top navbar, collapsible Subject/Chapter sidebar, Dashboard KPI cards, Quiz countdown timer pill, modals, and Admin Excel dropzone | `backdrop-blur-xl bg-white/10 dark:bg-slate-900/45 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.25)]` ([Ein UI](https://www.google.com/search?q=https%3A%2F%2Fui.eindev.ir%2F), [David UI Liquid Glass](https://www.google.com/search?q=https%3A%2F%2Fwww.creative-tim.com%2Fdavid-ui%2Fdocs%2Fhtml%2Fliquid-glass%2Fusecases)) | Creates crisp specular inner highlights and frosted depth on structural shells |
| **3. High-Contrast Reading & Testing Surfaces (`reading-surface`)** | Inner PDF Note Reader canvas, Quiz Question text card, Option A–D cards, and Scorecard explanations | `bg-white/95 dark:bg-slate-950/90 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100` (WCAG ≥ 4.5:1 contrast) | Eliminates text blur fatigue during 45–60 minute reading and timed test sessions |
| **4. 60 FPS Mobile GPU Guardrail** | Long scrolling lists (50-row Excel preview table, Student Roster table, Mistake Notebook list) | **Max 3 `backdrop-blur` layers per viewport**; apply `backdrop-blur-xl` only to the outer table card container, never to individual `<tr>` or list item rows | Prevents mobile browser repaints and keeps scrolling locked at 60 FPS across all student devices |

## 4. Zero-Waste Code & Anti-Bloat Engineering Laws

1. **Zero Dead Code or Orphan Files**: Never leave commented-out code blocks, `TODO` placeholders, mock data arrays in production components, or unused helper files. If a refactor replaces a component, delete the old file in the same step.
2. **Strict Type Safety (`no-explicit-any`)**: Every function parameter, database query result, Server Action payload, and Excel row must carry an explicit TypeScript type inferred from `zod` or [Drizzle ORM](https://www.google.com/search?q=https%3A%2F%2Form.drizzle.team%2Fdocs%2Foverview). Using `any` or `@ts-ignore` is strictly forbidden.
3. **Single Source of Truth for Validation**: Define all Zod schemas inside `src/lib/validators/` and share them between the client-side UI preview and the Server Action backend.
4. **Flat, Predictable Directory Tree**: Keep the repository strictly organized under `src/`:
   * `src/app/(auth)/` — Liquid Glass login and session callback routes
   * `src/app/(admin)/admin/` — Protected Admin dashboard, Notes uploader, and Excel Quiz importer
   * `src/app/(student)/dashboard/` — Protected Student dashboard, Notes reader, Quiz runner, and Mistake Notebook
   * `src/components/ui/` — Reusable `shadcn/ui` and `GlassCard` / `ReadingSurface` primitives
   * `src/db/schema.ts` & `src/db/index.ts` — Complete PostgreSQL schema and pooled connection client
   * `src/lib/r2.ts` — Presigned URL helpers for [Cloudflare R2](https://www.google.com/search?q=https%3A%2F%2Fdevelopers.cloudflare.com%2Fr2%2Fpricing%2F)
   * `src/lib/validators/` — Shared Zod schemas for Notes, Excel Quiz rows, and Student submissions
   * `src/actions/` — Role-guarded Next.js Server Actions (`notes.ts`, `quizzes.ts`, `attempts.ts`)

## 5. Database Schema Contract (`src/db/schema.ts`)

All database migrations must adhere to these core tables without redundant join tables:

| Table Name | Primary Columns & Constraints | Indexed / Foreign Keys |
| :--- | :--- | :--- |
| `users` | `id (uuid PK)`, `email (unique)`, `full_name`, `role ('admin' \| 'student')`, `roll_number`, `batch_id`, `created_at` | Index on `(batch_id, role)` |
| `subjects` | `id (uuid PK)`, `title`, `batch_id`, `order_index`, `created_at` | Index on `(batch_id, order_index)` |
| `chapters` | `id (uuid PK)`, `subject_id (FK -> subjects.id cascade)`, `title`, `slug (unique)`, `order_index` | Index on `(subject_id, order_index)` |
| `notes` | `id (uuid PK)`, `chapter_id (FK -> chapters.id cascade)`, `title`, `r2_object_key`, `file_size_bytes`, `allow_download (bool default false)`, `created_at` | Index on `chapter_id` |
| `quizzes` | `id (uuid PK)`, `title`, `subject_id (FK)`, `chapter_id (FK nullable)`, `batch_id`, `duration_minutes`, `is_published (bool default false)`, `created_at` | Index on `(batch_id, is_published)` |
| `quiz_questions` | `id (uuid PK)`, `quiz_id (FK -> quizzes.id cascade)`, `question_number`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option ('A'\|'B'\|'C'\|'D')`, `marks (numeric)`, `negative_marks (numeric)`, `chapter_slug (nullable)`, `explanation` | Index on `quiz_id` |
| `quiz_attempts` | `id (uuid PK)`, `quiz_id (FK)`, `student_id (FK -> users.id cascade)`, `score (numeric)`, `total_marks (numeric)`, `answers_json (jsonb)`, `time_taken_seconds`, `submitted_at` | Unique index on `(quiz_id, student_id)` or indexed by attempt timestamp |
| `mistake_items` | `id (uuid PK)`, `student_id (FK -> users.id cascade)`, `question_id (FK -> quiz_questions.id cascade)`, `chapter_slug`, `resolved (bool default false)`, `last_missed_at` | Unique composite index on `(student_id, question_id)` |

## 6. Mandatory Verification Protocol Before Marking Any Task Complete

Before generating the final `Walkthrough` artifact for any slice ([Agentic Coding Verification](https://www.google.com/search?q=https%3A%2F%2Fcloud.google.com%2Fdiscover%2Fwhat-is-agentic-coding)), the agent MUST execute and pass all four checks:

1. **Type & Lint Gate**: Run `npx tsc --noEmit` and `npm run lint`. Fix all warnings and errors until output is 100% clean.
2. **Production Build Gate**: Run `npm run build` to verify that all Next.js App Router pages, Server Actions, and dynamic routes compile cleanly.
3. **Dead-File & Glass Budget Audit**: Run `git status` to confirm no unused files or debug logs remain, and verify that no viewport stacks more than 3 `backdrop-blur` layers.
4. **Live Browser Verification**: Launch Antigravity's built-in browser controller against `http://localhost:3000` and execute the user flow for the active slice (e.g., logging in, uploading `sample_quiz_upload_template.xlsx`, or completing a timed quiz).