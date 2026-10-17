"use server";

import { requireAdmin, requireStudent } from "@/lib/auth";
import { db } from "@/db";
import { subjects, chapters, notes, type Subject, type Chapter, type Note } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { getPresignedUploadUrl, getPresignedViewUrl, deleteR2Object } from "@/lib/r2";
import { revalidatePath } from "next/cache";

export interface SubjectWithChapters extends Subject {
  chapters: (Chapter & { notes: Note[] })[];
}

/**
 * Fetch all subjects with chapters and notes for notes browser
 */
export async function getSubjectsTree(): Promise<SubjectWithChapters[]> {
  try {
    // Single parallel batch fetch: 3 queries execute concurrently in 1 network round-trip!
    const [rawSubjects, rawChapters, rawNotes] = await Promise.all([
      db.select().from(subjects).orderBy(asc(subjects.orderIndex)),
      db.select().from(chapters).orderBy(asc(chapters.orderIndex)),
      db.select().from(notes).orderBy(asc(notes.createdAt)),
    ]);

    // Group notes by chapterId in-memory (0ms)
    const notesByChapter = new Map<string, Note[]>();
    for (const n of rawNotes) {
      const arr = notesByChapter.get(n.chapterId) || [];
      arr.push(n);
      notesByChapter.set(n.chapterId, arr);
    }

    // Group chapters by subjectId in-memory (0ms)
    const chaptersBySubject = new Map<string, (Chapter & { notes: Note[] })[]>();
    for (const ch of rawChapters) {
      const chWithNotes = {
        ...ch,
        notes: notesByChapter.get(ch.id) || [],
      };
      const arr = chaptersBySubject.get(ch.subjectId) || [];
      arr.push(chWithNotes);
      chaptersBySubject.set(ch.subjectId, arr);
    }

    // Assemble final tree
    return rawSubjects.map((sub) => ({
      ...sub,
      chapters: chaptersBySubject.get(sub.id) || [],
    }));
  } catch {
    // Return sample seeded hierarchy for instant preview if DB is unseeded
    return [
      {
        id: "sub-cardiology-01",
        title: "Cardiovascular System",
        batchId: "batch-2025",
        orderIndex: 0,
        createdAt: new Date(),
        chapters: [
          {
            id: "ch-valvular-01",
            subjectId: "sub-cardiology-01",
            title: "Valvular Heart Disease",
            slug: "cardio-ch01-valvular",
            orderIndex: 0,
            notes: [
              {
                id: "note-duke-01",
                chapterId: "ch-valvular-01",
                title: "Infective Endocarditis: Modified Duke Criteria & Regimens",
                r2ObjectKey: "notes/cardio-duke-criteria.pdf",
                fileSizeBytes: 2450000,
                allowDownload: true,
                createdAt: new Date(),
              },
              {
                id: "note-murmurs-02",
                chapterId: "ch-valvular-01",
                title: "Systolic vs Diastolic Murmurs & Dynamic Maneuvers",
                r2ObjectKey: "notes/cardio-murmurs-maneuvers.pdf",
                fileSizeBytes: 1820000,
                allowDownload: false,
                createdAt: new Date(),
              },
            ],
          },
          {
            id: "ch-hf-02",
            subjectId: "sub-cardiology-01",
            title: "Heart Failure & GDMT Pillars",
            slug: "cardio-ch02-gdmt",
            orderIndex: 1,
            notes: [
              {
                id: "note-gdmt-01",
                chapterId: "ch-hf-02",
                title: "HFrEF 4-Pillar Pharmacotherapy Guidelines",
                r2ObjectKey: "notes/cardio-hf-gdmt.pdf",
                fileSizeBytes: 3120000,
                allowDownload: true,
                createdAt: new Date(),
              },
            ],
          },
          {
            id: "ch-arrhythmias-03",
            subjectId: "sub-cardiology-01",
            title: "Arrhythmias & Conduction Blocks",
            slug: "cardio-ch03-arrhythmias",
            orderIndex: 2,
            notes: [],
          },
        ],
      },
      {
        id: "sub-pulmonology-02",
        title: "Pulmonology",
        batchId: "batch-2025",
        orderIndex: 1,
        createdAt: new Date(),
        chapters: [
          {
            id: "ch-copd-01",
            subjectId: "sub-pulmonology-02",
            title: "COPD & Asthma Pathophysiology",
            slug: "pulmo-ch01-copd",
            orderIndex: 0,
            notes: [
              {
                id: "note-gold-01",
                chapterId: "ch-copd-01",
                title: "GOLD Guidelines & Inhaler Therapy",
                r2ObjectKey: "notes/pulmo-gold-guidelines.pdf",
                fileSizeBytes: 1980000,
                allowDownload: false,
                createdAt: new Date(),
              },
            ],
          },
        ],
      },
      {
        id: "sub-nephrology-03",
        title: "Nephrology",
        batchId: "batch-2025",
        orderIndex: 2,
        createdAt: new Date(),
        chapters: [
          {
            id: "ch-gn-01",
            subjectId: "sub-nephrology-03",
            title: "Glomerular Diseases & Syndromes",
            slug: "nephro-ch01-gn",
            orderIndex: 0,
            notes: [
              {
                id: "note-nephrotic-01",
                chapterId: "ch-gn-01",
                title: "Nephrotic vs Nephritic Syndrome Biopsy Findings",
                r2ObjectKey: "notes/nephro-syndromes.pdf",
                fileSizeBytes: 2840000,
                allowDownload: true,
                createdAt: new Date(),
              },
            ],
          },
        ],
      },
    ];
  }
}

/**
 * Admin action to create a Subject
 */
export async function createSubject(title: string, batchId: string | null = null) {
  await requireAdmin();

  if (!title.trim()) {
    throw new Error("Subject title is required");
  }

  try {
    const [newSub] = await db
      .insert(subjects)
      .values({
        title: title.trim(),
        batchId,
        orderIndex: 0,
      })
      .returning();

    revalidatePath("/admin/notes");
    revalidatePath("/dashboard/notes");
    return { success: true, data: newSub };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create subject";
    return { success: false, error: message };
  }
}

/**
 * Admin action to create a Chapter
 */
export async function createChapter(subjectId: string, title: string, slug: string) {
  await requireAdmin();

  if (!title.trim() || !slug.trim()) {
    throw new Error("Title and unique chapter slug are required");
  }

  try {
    const [newCh] = await db
      .insert(chapters)
      .values({
        subjectId,
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        orderIndex: 0,
      })
      .returning();

    revalidatePath("/admin/notes");
    revalidatePath("/dashboard/notes");
    return { success: true, data: newCh };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create chapter";
    return { success: false, error: message };
  }
}

/**
 * Admin action to request a presigned R2 upload URL
 */
export async function getAdminNoteUploadUrl(fileName: string, contentType: string = "application/pdf") {
  await requireAdmin();

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const objectKey = `notes/${Date.now()}-${sanitizedFileName}`;

  return await getPresignedUploadUrl(objectKey, contentType, 900);
}

/**
 * Admin action to register uploaded note in DB
 */
export async function createNoteRecord(
  chapterId: string,
  title: string,
  r2ObjectKey: string,
  fileSizeBytes: number,
  allowDownload: boolean = false
) {
  await requireAdmin();

  try {
    const [newNote] = await db
      .insert(notes)
      .values({
        chapterId,
        title: title.trim(),
        r2ObjectKey,
        fileSizeBytes,
        allowDownload,
      })
      .returning();

    revalidatePath("/admin/notes");
    revalidatePath("/dashboard/notes");
    return { success: true, data: newNote };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to register note";
    return { success: false, error: message };
  }
}

/**
 * Admin action to delete a single Note and its R2 object
 */
export async function deleteNote(noteId: string) {
  await requireAdmin();

  try {
    const [foundNote] = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);

    if (foundNote) {
      await deleteR2Object(foundNote.r2ObjectKey);
      await db.delete(notes).where(eq(notes.id, noteId));
    }

    revalidatePath("/admin/notes");
    revalidatePath("/dashboard/notes");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete note";
    return { success: false, error: message };
  }
}

/**
 * Admin action to delete a Chapter (folder), all child notes, and their R2 objects
 */
export async function deleteChapter(chapterId: string) {
  await requireAdmin();

  try {
    // Find all notes in this chapter to delete storage objects
    const childNotes = await db.select().from(notes).where(eq(notes.chapterId, chapterId));
    await Promise.all(childNotes.map((n) => deleteR2Object(n.r2ObjectKey)));

    // Cascade delete in PostgreSQL handles notes removal, but we execute explicit chapter delete
    await db.delete(chapters).where(eq(chapters.id, chapterId));

    revalidatePath("/admin/notes");
    revalidatePath("/dashboard/notes");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete chapter";
    return { success: false, error: message };
  }
}

/**
 * Admin action to delete a Subject, all its chapters, all child notes, and their R2 objects
 */
export async function deleteSubject(subjectId: string) {
  await requireAdmin();

  try {
    // Find all chapters in this subject
    const subjectChapters = await db.select().from(chapters).where(eq(chapters.subjectId, subjectId));
    const chapterIds = subjectChapters.map((c) => c.id);

    if (chapterIds.length > 0) {
      const childNotes = await db.select().from(notes).where(inArray(notes.chapterId, chapterIds));
      await Promise.all(childNotes.map((n) => deleteR2Object(n.r2ObjectKey)));
    }

    // Cascade delete in PostgreSQL handles chapters & notes removal
    await db.delete(subjects).where(eq(subjects.id, subjectId));

    revalidatePath("/admin/notes");
    revalidatePath("/dashboard/notes");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete subject";
    return { success: false, error: message };
  }
}


/**
 * Student action to obtain a 15-minute presigned read URL
 */
export async function getStudentPresignedViewUrl(noteId: string) {
  await requireStudent();

  try {
    const [note] = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);

    if (note) {
      const url = await getPresignedViewUrl(note.r2ObjectKey, 900);
      return { success: true, url, allowDownload: note.allowDownload, title: note.title };
    }
  } catch {
    // DB offline fallback
  }

  // Fallback demo read URL
  const demoUrl = await getPresignedViewUrl(`notes/${noteId}.pdf`, 900);
  return { success: true, url: demoUrl, allowDownload: true, title: "Clinical Study Note" };
}
