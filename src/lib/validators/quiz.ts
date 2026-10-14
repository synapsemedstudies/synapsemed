import { z } from "zod";

/**
 * Zod schema for validating each row in the imported Excel (.xlsx) quiz spreadsheet.
 * Adheres strictly to the excel-quiz-validator skill and GEMINI.md database contract.
 */
export const QuizRowSchema = z.object({
  question_number: z.coerce.number().int().positive("Question number must be a positive integer"),
  question_text: z.string().min(5, "Question text must be at least 5 characters"),
  option_a: z.string().min(1, "Option A cannot be empty"),
  option_b: z.string().min(1, "Option B cannot be empty"),
  option_c: z.string().min(1, "Option C cannot be empty"),
  option_d: z.string().min(1, "Option D cannot be empty"),
  correct_option: z.enum(["A", "B", "C", "D"], {
    errorMap: () => ({ message: "Correct option must be A, B, C, or D" }),
  }),
  marks: z.coerce.number().positive("Marks must be greater than 0").default(4.0),
  negative_marks: z.coerce.number().min(0, "Negative marks cannot be negative").default(1.0),
  chapter_slug: z.string().optional().nullable().transform((v) => v?.trim() || null),
  explanation: z.string().optional().nullable().transform((v) => v?.trim() || null),
});

export type QuizRow = z.infer<typeof QuizRowSchema>;

export interface RowValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface QuizParseResult {
  validRows: QuizRow[];
  errors: RowValidationError[];
  totalRows: number;
}

/**
 * Normalizes an raw Excel row object:
 * Trims whitespace and standardizes key names (e.g., "Option A" -> "option_a", "Marks" -> "marks")
 */
export function normalizeExcelRow(rawRow: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(rawRow)) {
    const cleanKey = key
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, "_");

    // Standardize common spreadsheet header variants
    let mappedKey = cleanKey;
    if (cleanKey === "q_no" || cleanKey === "question_no" || cleanKey === "qnum" || cleanKey === "#") {
      mappedKey = "question_number";
    } else if (cleanKey === "question" || cleanKey === "q_text" || cleanKey === "stem") {
      mappedKey = "question_text";
    } else if (cleanKey === "a" || cleanKey === "opt_a" || cleanKey === "optiona") {
      mappedKey = "option_a";
    } else if (cleanKey === "b" || cleanKey === "opt_b" || cleanKey === "optionb") {
      mappedKey = "option_b";
    } else if (cleanKey === "c" || cleanKey === "opt_c" || cleanKey === "optionc") {
      mappedKey = "option_c";
    } else if (cleanKey === "d" || cleanKey === "opt_d" || cleanKey === "optiond") {
      mappedKey = "option_d";
    } else if (cleanKey === "answer" || cleanKey === "correct" || cleanKey === "ans") {
      mappedKey = "correct_option";
    } else if (cleanKey === "neg_marks" || cleanKey === "penalty") {
      mappedKey = "negative_marks";
    } else if (cleanKey === "slug" || cleanKey === "chapter") {
      mappedKey = "chapter_slug";
    } else if (cleanKey === "rationale" || cleanKey === "solution") {
      mappedKey = "explanation";
    }

    // Capitalize single-letter correct_option if present
    if (mappedKey === "correct_option" && typeof val === "string") {
      normalized[mappedKey] = val.trim().toUpperCase();
    } else if (typeof val === "string") {
      normalized[mappedKey] = val.trim();
    } else {
      normalized[mappedKey] = val;
    }
  }

  return normalized;
}

/**
 * Validate an array of parsed Excel rows against QuizRowSchema.
 * Returns structured validRows and rowErrors with 1-based spreadsheet row numbers.
 */
export function validateQuizRows(rawRows: Record<string, unknown>[]): QuizParseResult {
  const validRows: QuizRow[] = [];
  const errors: RowValidationError[] = [];

  rawRows.forEach((rawRow, idx) => {
    const rowNumber = idx + 2; // Row 1 is header, so data begins at row 2
    const normalized = normalizeExcelRow(rawRow);

    const parseResult = QuizRowSchema.safeParse(normalized);

    if (parseResult.success) {
      validRows.push(parseResult.data);
    } else {
      for (const issue of parseResult.error.issues) {
        errors.push({
          rowNumber,
          field: issue.path.join(".") || "row",
          message: issue.message,
        });
      }
    }
  });

  return {
    validRows,
    errors,
    totalRows: rawRows.length,
  };
}
