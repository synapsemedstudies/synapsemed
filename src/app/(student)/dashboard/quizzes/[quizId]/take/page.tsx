import React from "react";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { getQuizForRunner } from "@/actions/attempts";
import { QuizRunner } from "@/components/quizzes/quiz-runner";

export default async function TakeQuizPage({
  params,
}: {
  params: { quizId: string };
}) {
  await requireStudent();
  const { quiz, questions } = await getQuizForRunner(params.quizId);

  if (!quiz) {
    notFound();
  }

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-8 pt-6 pb-20">
      <QuizRunner quiz={quiz} questions={questions} />
    </main>
  );
}
