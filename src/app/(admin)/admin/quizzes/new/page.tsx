import React from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminQuizUploader } from "@/components/quizzes/admin-quiz-uploader";

export default async function AdminNewQuizPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminQuizUploader />
    </div>
  );
}
