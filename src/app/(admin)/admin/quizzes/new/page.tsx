import React from "react";
import { requireAdmin } from "@/lib/auth";
import { getSubjectsTree } from "@/actions/notes";
import { QuizCreatorHub } from "@/components/quizzes/quiz-creator-hub";

export default async function AdminNewQuizPage() {
  await requireAdmin();
  const subjectsTree = await getSubjectsTree();

  return (
    <div className="flex flex-col gap-6">
      <QuizCreatorHub subjectsTree={subjectsTree} />
    </div>
  );
}

