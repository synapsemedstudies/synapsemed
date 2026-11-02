"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, quizAttempts, type User } from "@/db/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface StudentRosterItem extends User {
  attemptsCount: number;
  averageScorePercent: number;
}

export interface NewStudentRow {
  fullName: string;
  email: string;
  rollNumber: string;
  batchId?: string;
}

/**
 * Fetch all enrolled students with cohort statistics.
 * Calls requireAdmin() as its very first line.
 */
export async function getStudentRoster(): Promise<StudentRosterItem[]> {
  await requireAdmin();

  try {
    const [rawStudents, attemptStats] = await Promise.all([
      db
        .select()
        .from(users)
        .where(eq(users.role, "student"))
        .orderBy(desc(users.createdAt)),
      db
        .select({
          studentId: quizAttempts.studentId,
          attemptsCount: sql<number>`count(*)::int`,
          averageScorePercent: sql<number>`coalesce(round(avg(case when nullif(total_marks::numeric, 0) is not null then (score::numeric / total_marks::numeric) * 100 else 0 end)), 0)::int`,
        })
        .from(quizAttempts)
        .groupBy(quizAttempts.studentId),
    ]);

    const statsByStudent = new Map<string, { count: number; avgPct: number }>();
    for (const stat of attemptStats) {
      statsByStudent.set(stat.studentId, {
        count: stat.attemptsCount,
        avgPct: stat.averageScorePercent,
      });
    }

    return rawStudents.map((st) => {
      const stats = statsByStudent.get(st.id);
      return {
        ...st,
        attemptsCount: stats?.count || 0,
        averageScorePercent: stats?.avgPct || 0,
      };
    });
  } catch (err) {
    console.error("Failed to fetch student roster:", err);
    return [];
  }
}

/**
 * Bulk import up to 1,000 student accounts from Excel rows.
 * Calls requireAdmin() as its very first line.
 */
export async function importStudentRoster(newStudents: NewStudentRow[]): Promise<{
  success: boolean;
  importedCount: number;
  skippedCount: number;
  totalReceived: number;
  error?: string;
}> {
  await requireAdmin();

  if (!newStudents || newStudents.length === 0) {
    return { success: false, importedCount: 0, skippedCount: 0, totalReceived: 0, error: "No student records provided" };
  }

  try {
    const validRows = newStudents.filter((s) => s.email?.trim() && s.fullName?.trim());
    if (validRows.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: newStudents.length,
        totalReceived: newStudents.length,
        error: "No valid rows with email and full name found",
      };
    }

    // Deduplicate within the uploaded spreadsheet itself
    const emailMap = new Map<string, NewStudentRow>();
    for (const r of validRows) {
      const email = r.email.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, r);
      }
    }

    const uniqueEmails = Array.from(emailMap.keys());

    // Single-query check for existing emails across database
    const existingUsers = await db
      .select({ email: users.email })
      .from(users)
      .where(inArray(users.email, uniqueEmails));

    const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase()));

    const toInsert = uniqueEmails
      .filter((email) => !existingEmailSet.has(email))
      .map((email) => {
        const s = emailMap.get(email)!;
        return {
          email,
          fullName: s.fullName.trim(),
          role: "student" as const,
          rollNumber: s.rollNumber ? s.rollNumber.trim() : null,
          batchId: s.batchId ? s.batchId.trim() : "batch-2025",
        };
      });

    let imported = 0;
    const CHUNK_SIZE = 100;
    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);
      await db.insert(users).values(chunk);
      imported += chunk.length;
    }

    revalidatePath("/admin");
    revalidatePath("/admin/students");

    return {
      success: true,
      importedCount: imported,
      skippedCount: newStudents.length - imported,
      totalReceived: newStudents.length,
    };
  } catch (err: unknown) {
    console.error("Bulk roster import failed:", err);
    const msg = err instanceof Error ? err.message : "Failed to import students";
    return {
      success: false,
      importedCount: 0,
      skippedCount: newStudents.length,
      totalReceived: newStudents.length,
      error: msg,
    };
  }
}
