import React from "react";
import { requireStudent } from "@/lib/auth";
import { getPYQSyllabusTree } from "@/actions/pyq";
import { StudentPYQBrowser } from "@/components/pyq/student-pyq-browser";

export default async function StudentPYQPage({
  searchParams,
}: {
  searchParams: { chapter?: string };
}) {
  await requireStudent();
  const syllabus = await getPYQSyllabusTree();

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] pb-12">
      <StudentPYQBrowser
        syllabus={syllabus}
        initialChapterId={searchParams.chapter}
      />
    </div>
  );
}
