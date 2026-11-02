import React from "react";
import { requireAdmin } from "@/lib/auth";
import { getPYQSyllabusTree } from "@/actions/pyq";
import { AdminPYQManager } from "@/components/pyq/admin-pyq-manager";

export default async function AdminPYQPage() {
  await requireAdmin();
  const syllabusTree = await getPYQSyllabusTree();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Medical College PYQ Manager
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage past university examination questions, model answers, and repeat exam years.
          </p>
        </div>
      </div>

      <AdminPYQManager initialTree={syllabusTree} />
    </div>
  );
}
