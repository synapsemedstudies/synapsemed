"use client";

import React, { useState, useMemo } from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import type { StudentRosterItem, NewStudentRow } from "@/actions/students";
import { importStudentRoster } from "@/actions/students";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

interface AdminStudentRosterProps {
  initialRoster: StudentRosterItem[];
}

export function AdminStudentRoster({ initialRoster }: AdminStudentRosterProps) {
  const [roster, setRoster] = useState<StudentRosterItem[]>(initialRoster);
  const [searchQuery, setSearchQuery] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedNewStudents, setParsedNewStudents] = useState<NewStudentRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Search filter
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return roster;
    const q = searchQuery.toLowerCase();
    return roster.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q))
    );
  }, [roster, searchQuery]);

  // Export Gradebook via SheetJS
  const handleExportGradebook = () => {
    const data = roster.map((s) => ({
      Roll_Number: s.rollNumber || "N/A",
      Full_Name: s.fullName,
      Medical_Email: s.email,
      Exams_Taken: s.attemptsCount,
      Average_Score_Percent: `${s.averageScorePercent}%`,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gradebook");
    XLSX.writeFile(wb, "SynapseMed_Cohort_Gradebook.xlsx");
  };

  // Download Sample Roster Template via SheetJS
  const handleDownloadRosterTemplate = () => {
    const templateData = [
      {
        full_name: "Student Name A",
        email: "student1@synapsemed.edu",
        roll_number: "MED-2025-110",
      },
      {
        full_name: "Student Name B",
        email: "student2@synapsemed.edu",
        roll_number: "MED-2025-111",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RosterImport");
    XLSX.writeFile(wb, "sample_student_roster_template.xlsx");
  };

  // Handle Excel File Drop for Bulk Import
  const handleFileDrop = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      const parsed: NewStudentRow[] = raw.map((r) => {
        const rowNorm: Record<string, string> = {};
        for (const [k, v] of Object.entries(r)) {
          const keyClean = k.toLowerCase().trim().replace(/[\s\-_]+/g, "_");
          rowNorm[keyClean] = String(v).trim();
        }

        return {
          fullName: rowNorm["full_name"] || rowNorm["name"] || "Medical Student",
          email: rowNorm["email"] || rowNorm["medical_email"] || "",
          rollNumber: rowNorm["roll_number"] || rowNorm["roll"] || "",
          batchId: rowNorm["batch_id"] || rowNorm["batch"] || "batch-2025",
        };
      }).filter((s) => s.email.length > 3);

      setParsedNewStudents(parsed);
      setImportResult(null);
    } catch {
      alert("Failed to parse student roster spreadsheet");
    }
  };

  // Commit imported students
  const handleCommitImport = async () => {
    if (parsedNewStudents.length === 0) return;

    setImporting(true);
    const res = await importStudentRoster(parsedNewStudents);
    setImporting(false);

    if (res.success) {
      setImportResult(`Successfully provisioned ${res.importedCount} student accounts!`);

      // Add to local state
      const now = new Date();
      const added: StudentRosterItem[] = parsedNewStudents.map((p, idx) => ({
        id: `imported-${Date.now()}-${idx}`,
        email: p.email,
        fullName: p.fullName,
        role: "student",
        rollNumber: p.rollNumber,
        batchId: p.batchId || "batch-2025",
        totpSecret: null,
        createdAt: now,
        attemptsCount: 0,
        averageScorePercent: 0,
      }));

      setRoster((prev) => [...added, ...prev]);
      setParsedNewStudents([]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Export / Import Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Student Roster &amp; Cohort Analytics
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Bulk provision up to 1,000 student accounts and export cohort performance reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleExportGradebook}
            className="px-3.5 py-2 rounded-xl liquid-glass-subtle hover:border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400">
              download
            </span>
            <span>Export Gradebook (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setParsedNewStudents([]);
              setImportResult(null);
              setImportModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">group_add</span>
            <span>Bulk Import (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl liquid-badge text-xs font-mono text-slate-300">
            Total Enrolled: <strong className="text-white font-bold">{roster.length}</strong>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, roll number..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/60 transition-all"
          />
        </div>
      </div>

      {/* Roster Table inside ReadingSurface */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <h2 className="font-['Space_Grotesk'] text-base font-bold text-white">
            Enrolled Student Directory
          </h2>
        </div>

        <ReadingSurface className="p-0 overflow-hidden bg-slate-950/90">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-['Space_Grotesk'] uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Roll Number</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Medical Email</th>
                  <th className="p-3.5 text-center">Exams Taken</th>
                  <th className="p-3.5 text-center">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredRoster.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3.5 font-mono text-slate-400 font-semibold">
                      {student.rollNumber || "—"}
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      {student.fullName}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">
                      {student.email}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {student.attemptsCount}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full font-mono font-bold text-[11px]",
                          student.averageScorePercent >= 80
                            ? "bg-emerald-500/20 text-emerald-300"
                            : student.averageScorePercent > 0
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-white/10 text-slate-400"
                        )}
                      >
                        {student.averageScorePercent > 0
                          ? `${student.averageScorePercent}%`
                          : "No attempts"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReadingSurface>
      </GlassCard>

      {/* Bulk Roster Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/80 backdrop-blur-md flex min-h-full items-start sm:items-center justify-center animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0c0e1a]/95 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[24px]">
                  group_add
                </span>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  Bulk Student Account Provisioning
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Template Download Prompt */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300">
              <span>Spreadsheet columns: <code>full_name</code>, <code>email</code>, <code>roll_number</code></span>
              <button
                type="button"
                onClick={handleDownloadRosterTemplate}
                className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Template</span>
              </button>
            </div>

            {/* File Dropzone */}
            <div className="relative border-2 border-dashed border-white/20 hover:border-indigo-400/60 rounded-2xl p-6 text-center transition-all bg-white/[0.01]">
              <input
                type="file"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileDrop(f);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="material-symbols-outlined text-[36px] text-indigo-400 mb-1">
                upload_file
              </span>
              <h4 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-0.5">
                Drop your student roster .xlsx file here
              </h4>
              <p className="text-[11px] text-slate-400">
                SheetJS will parse and validate student records instantly.
              </p>
            </div>

            {/* Parsed Preview */}
            {parsedNewStudents.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-emerald-300 font-bold">
                  {parsedNewStudents.length} Students parsed from spreadsheet:
                </span>
                <div className="max-h-36 overflow-y-auto rounded-xl bg-black/40 border border-white/10 p-2 flex flex-col gap-1 text-xs">
                  {parsedNewStudents.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-1.5 border-b border-white/5 last:border-0 text-slate-300"
                    >
                      <span className="font-semibold text-white">{st.fullName}</span>
                      <span className="font-mono text-slate-400">{st.rollNumber}</span>
                      <span className="font-mono text-indigo-300">{st.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import Status Message */}
            {importResult && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium">
                {importResult}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl liquid-glass-subtle text-slate-300 text-xs font-semibold"
              >
                Close
              </button>

              <button
                type="button"
                disabled={parsedNewStudents.length === 0 || importing}
                onClick={handleCommitImport}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider transition-all",
                  parsedNewStudents.length > 0
                    ? "liquid-btn-primary text-white cursor-pointer hover:brightness-110"
                    : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                )}
              >
                {importing
                  ? "Provisioning Accounts..."
                  : `Import ${parsedNewStudents.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
