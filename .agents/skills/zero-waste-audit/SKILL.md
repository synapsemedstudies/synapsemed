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
