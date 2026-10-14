"use client";

import React, { useState, useMemo } from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import type { SubjectWithChapters } from "@/actions/notes";
import type { Note } from "@/db/schema";
import { cn } from "@/lib/utils";

interface StudentNotesViewProps {
  subjects: SubjectWithChapters[];
  studentName: string;
  studentRollNumber: string;
}

export function StudentNotesView({
  subjects,
  studentName,
  studentRollNumber,
}: StudentNotesViewProps) {
  // Find first note as default
  const defaultNote = useMemo(() => {
    for (const sub of subjects) {
      for (const ch of sub.chapters) {
        if (ch.notes.length > 0) return ch.notes[0];
      }
    }
    return null;
  }, [subjects]);

  const [activeNote, setActiveNote] = useState<Note | null>(defaultNote);
  const [searchQuery, setSearchQuery] = useState("");
  const [completedNoteIds, setCompletedNoteIds] = useState<Set<string>>(new Set());
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Set<string>>(
    new Set(subjects.map((s) => s.id))
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Toggle complete
  const toggleCompleted = (noteId: string) => {
    setCompletedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  // Toggle subject accordion
  const toggleSubject = (subjectId: string) => {
    setExpandedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  // Filtered tree
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase();

    return subjects
      .map((sub) => ({
        ...sub,
        chapters: sub.chapters
          .map((ch) => ({
            ...ch,
            notes: ch.notes.filter(
              (n) =>
                n.title.toLowerCase().includes(q) ||
                ch.title.toLowerCase().includes(q) ||
                sub.title.toLowerCase().includes(q)
            ),
          }))
          .filter((ch) => ch.notes.length > 0 || ch.title.toLowerCase().includes(q)),
      }))
      .filter((sub) => sub.chapters.length > 0 || sub.title.toLowerCase().includes(q));
  }, [subjects, searchQuery]);

  // Total notes count
  const totalNotesCount = useMemo(() => {
    let count = 0;
    for (const s of subjects) {
      for (const c of s.chapters) {
        count += c.notes.length;
      }
    }
    return count;
  }, [subjects]);

  const progressPercent = totalNotesCount > 0 ? Math.round((completedNoteIds.size / totalNotesCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls: Mobile drawer toggle & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            className="lg:hidden px-3.5 py-2 rounded-xl liquid-glass-card text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-2 text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              {mobileDrawerOpen ? "close" : "folder_open"}
            </span>
            <span>{mobileDrawerOpen ? "Close Tree" : "Browse Syllabus"}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-['Space_Grotesk'] text-slate-400">
              Study Progress:
            </span>
            <span className="text-xs font-['Space_Grotesk'] font-bold text-sky-300">
              {progressPercent}%
            </span>
            <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or chapters..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/60 transition-all"
          />
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Syllabus Tree (Collapsible on mobile) */}
        <div
          className={cn(
            "lg:col-span-4 flex-col gap-4",
            mobileDrawerOpen ? "flex" : "hidden lg:flex"
          )}
        >
          <GlassCard className="p-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
              <span className="text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider text-slate-300">
                Syllabus Hierarchy
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full liquid-badge text-indigo-300">
                {totalNotesCount} Notes
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredSubjects.map((sub) => {
                const isExpanded = expandedSubjectIds.has(sub.id);

                return (
                  <div key={sub.id} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleSubject(sub.id)}
                      className="flex items-center justify-between p-2 rounded-lg text-xs font-['Space_Grotesk'] font-bold text-white hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-sky-400 transition-transform duration-200">
                          {isExpanded ? "folder_open" : "folder"}
                        </span>
                        <span>{sub.title}</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-slate-500">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="ml-3 pl-3 border-l border-white/[0.08] flex flex-col gap-2 mt-1">
                        {sub.chapters.map((ch) => (
                          <div key={ch.id} className="flex flex-col gap-1">
                            <span className="text-[11px] font-medium text-slate-400 px-1.5 py-0.5">
                              {ch.title}
                            </span>
                            <div className="flex flex-col gap-1">
                              {ch.notes.map((note) => {
                                const isSelected = activeNote?.id === note.id;
                                const isDone = completedNoteIds.has(note.id);

                                return (
                                  <div
                                    key={note.id}
                                    onClick={() => {
                                      setActiveNote(note);
                                      setMobileDrawerOpen(false); // Auto close drawer on mobile selection
                                    }}
                                    className={cn(
                                      "group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all duration-200",
                                      isSelected
                                        ? "liquid-pill-active text-white font-medium"
                                        : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span
                                        className={cn(
                                          "material-symbols-outlined text-[16px] shrink-0",
                                          isDone ? "text-emerald-400" : "text-slate-400"
                                        )}
                                      >
                                        {isDone ? "check_circle" : "description"}
                                      </span>
                                      <span className="truncate">{note.title}</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCompleted(note.id);
                                      }}
                                      title={isDone ? "Mark incomplete" : "Mark as read"}
                                      className="p-1 text-slate-400 hover:text-emerald-300 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">
                                        {isDone ? "done_all" : "check"}
                                      </span>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Watermarked PDF Reading Surface */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {activeNote ? (
            <GlassCard className="p-4 md:p-6 flex flex-col gap-4">
              {/* Note Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="font-['Space_Grotesk'] text-lg md:text-xl font-bold text-white">
                    {activeNote.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="material-symbols-outlined text-sky-400 text-[15px]">
                      lock_clock
                    </span>
                    <span>15-min Cloudflare R2 Presigned Access</span>
                    <span>•</span>
                    <span>{(activeNote.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => toggleCompleted(activeNote.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-semibold transition-all flex items-center gap-1.5",
                      completedNoteIds.has(activeNote.id)
                        ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300"
                        : "liquid-glass-subtle text-slate-300 hover:text-white"
                    )}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {completedNoteIds.has(activeNote.id) ? "check_circle" : "check"}
                    </span>
                    <span>{completedNoteIds.has(activeNote.id) ? "Completed" : "Mark as Read"}</span>
                  </button>

                  {activeNote.allowDownload ? (
                    <a
                      href={`/api/mock-r2-view?key=${encodeURIComponent(activeNote.r2ObjectKey)}`}
                      download
                      className="px-3 py-1.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Download</span>
                    </a>
                  ) : (
                    <span
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-xs font-['Space_Grotesk'] flex items-center gap-1 cursor-not-allowed"
                      title="Admin disabled file download for this resource"
                    >
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>View Only</span>
                    </span>
                  )}
                </div>
              </div>

              {/* High-Contrast Reading Surface with Watermark Canvas */}
              <ReadingSurface className="relative overflow-hidden min-h-[550px] p-6 bg-slate-950/95 flex flex-col justify-between">
                {/* Anti-Leak Diagonal Watermark Layer */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-around opacity-[0.07] rotate-[-25deg] scale-125"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="text-white text-sm font-mono whitespace-nowrap tracking-widest text-center"
                    >
                      SYNAPSEMED • {studentName.toUpperCase()} • {studentRollNumber} • CONFIDENTIAL MEDICAL NOTE
                    </div>
                  ))}
                </div>

                {/* PDF Content Canvas / Mock Reader */}
                <div className="relative z-10 flex flex-col gap-6 text-slate-200">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-sky-300">
                        Section 1: Clinical Framework &amp; Core Diagnostics
                      </span>
                      <span className="text-xs text-slate-400">Page 1 of 4</span>
                    </div>
                    <p className="text-xs md:text-sm leading-relaxed text-slate-300">
                      Modified Duke criteria diagnostic framework: Definite diagnosis requires 2 Major criteria, 1 Major + 3 Minor criteria, or 5 Minor criteria. Major criteria include positive blood cultures for typical organisms (e.g. S. viridans, S. aureus, Enterococcus) from separate venipunctures, and evidence of endocardial involvement demonstrated on echocardiography (vegetation, abscess, or new partial dehiscence of prosthetic valve).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 block mb-2">
                      Section 2: Pharmacotherapy &amp; Empiric Coverage
                    </span>
                    <p className="text-xs md:text-sm leading-relaxed text-slate-300">
                      Native valve empiric regimen: Ampicillin-Sulbactam plus Gentamicin (or Vancomycin plus Gentamicin in penicillin-allergic patients). Prosthetic valve empiric coverage: Vancomycin plus Gentamicin plus Rifampin (minimum 6 weeks duration). Renal monitoring parameters must be tracked weekly for trough aminoglycoside concentrations.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 block mb-2">
                      Section 3: Key Surgical Indications
                    </span>
                    <ul className="text-xs md:text-sm text-slate-300 list-disc list-inside space-y-1">
                      <li>Refractory cardiogenic shock or acute severe aortic/mitral regurgitation</li>
                      <li>Uncontrolled infection (persistent bacteremia &gt; 7 days despite targeted therapy)</li>
                      <li>Perivalvular abscess, fistula, or enlarging vegetation (&gt; 10 mm with prior emboli)</li>
                      <li>Fungal endocarditis or highly resistant pathogens</li>
                    </ul>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="relative z-10 pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>SynapseMed Verified Clinical Material</span>
                  <span>Watermarked to: {studentRollNumber}</span>
                </div>
              </ReadingSurface>
            </GlassCard>
          ) : (
            <ReadingSurface className="p-12 text-center text-slate-400">
              Select a chapter from the syllabus tree to open study notes.
            </ReadingSurface>
          )}
        </div>
      </div>
    </div>
  );
}
