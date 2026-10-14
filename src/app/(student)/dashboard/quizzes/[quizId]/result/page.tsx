import React from "react";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { getQuizResultBreakdown } from "@/actions/attempts";
import { QuizResultView } from "@/components/quizzes/quiz-result-view";

export default async function QuizResultPage({
  params,
}: {
  params: { quizId: string };
}) {
  await requireStudent();
  const { quiz, questions, attempt, answers } = await getQuizResultBreakdown(
    params.quizId
  );

  if (!quiz || !attempt) {
    notFound();
  }

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-8 pt-8 pb-20">
      <QuizResultView
        quiz={quiz}
        questions={questions}
        attempt={attempt}
        answers={answers}
      />
    </main>
  );
}
