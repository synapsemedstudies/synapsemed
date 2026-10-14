import React from "react";
import { requireStudent } from "@/lib/auth";
import { getStudentMistakes } from "@/actions/mistakes";
import { MistakeNotebookView } from "@/components/mistakes/mistake-notebook-view";

export default async function MistakesPage() {
  await requireStudent();
  const mistakes = await getStudentMistakes();

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-8 pt-6 sm:pt-8 pb-20">
      <MistakeNotebookView initialMistakes={mistakes} />
    </main>
  );
}
