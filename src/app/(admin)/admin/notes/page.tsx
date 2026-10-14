import React from "react";
import { requireAdmin } from "@/lib/auth";
import { getSubjectsTree } from "@/actions/notes";
import { AdminNotesManager } from "@/components/notes/admin-notes-manager";

export default async function AdminNotesPage() {
  await requireAdmin();
  const tree = await getSubjectsTree();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Notes Library Manager
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Create subjects, assign chapter slugs for quiz deep-linking, and upload PDFs directly to Cloudflare R2.
        </p>
      </div>

      <AdminNotesManager initialTree={tree} />
    </div>
  );
}
