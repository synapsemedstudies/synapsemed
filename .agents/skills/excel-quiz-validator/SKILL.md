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
