import React from "react";
import { requireAdmin } from "@/lib/auth";
import { getStudentRoster } from "@/actions/students";
import { AdminStudentRoster } from "@/components/students/admin-student-roster";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const roster = await getStudentRoster();

  return (
    <div className="flex flex-col gap-6">
      <AdminStudentRoster initialRoster={roster} />
    </div>
  );
}
