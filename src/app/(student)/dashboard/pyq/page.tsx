import React from "react";
import { requireStudent } from "@/lib/auth";
import { getPYQSyllabusTree, getChapterPYQs } from "@/actions/pyq";
import { StudentPYQBrowser } from "@/components/pyq/student-pyq-browser";

export default async function StudentPYQPage({
  searchParams,
}: {
  searchParams: { chapter?: string };
}) {
  await requireStudent();
  const syllabus = await getPYQSyllabusTree();

  // Resolve initial chapter on server to eliminate client fetch waterfall
  let initialChapterId = searchParams.chapter;
  if (!initialChapterId && syllabus.length > 0 && syllabus[0].chapters.length > 0) {
    initialChapterId = syllabus[0].chapters[0].id;
  }

  const initialQuestions = initialChapterId
    ? await getChapterPYQs(initialChapterId)
    : [];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] pb-12">
      <StudentPYQBrowser
        syllabus={syllabus}
        initialChapterId={initialChapterId}
        initialQuestions={initialQuestions}
      />
    </div>
  );
}
