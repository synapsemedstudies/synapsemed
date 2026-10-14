import React from "react";
import { requireStudent } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { StudentShellClient } from "@/components/ui/student-shell-client";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireStudent();

  return (
    <StudentShellClient student={student} logoutAction={logoutAction}>
      {children}
    </StudentShellClient>
  );
}
