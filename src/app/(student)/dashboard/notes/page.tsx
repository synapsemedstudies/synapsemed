import React from "react";
import { requireStudent } from "@/lib/auth";
import { getSubjectsTree } from "@/actions/notes";
import { StudentNotesView } from "@/components/notes/student-notes-view";

export default async function NotesPage() {
  const student = await requireStudent();
  const subjectsTree = await getSubjectsTree();

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-8 pb-20">
      <div className="flex flex-col w-full max-w-7xl mx-auto pt-6 sm:pt-8">
        <div className="mb-6">
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Structured Notes Library
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Hierarchical study notes backed by Cloudflare R2 storage.
          </p>
        </div>

        <StudentNotesView
          subjects={subjectsTree}
          studentName={student.fullName}
        />
      </div>
    </main>
  );
}
