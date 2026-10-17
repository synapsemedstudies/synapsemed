"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import type { SubjectWithChapters } from "@/actions/notes";
import { getStudentPresignedViewUrl } from "@/actions/notes";
import type { Note } from "@/db/schema";
import { cn } from "@/lib/utils";

interface StudentNotesViewProps {
  subjects: SubjectWithChapters[];
  studentName?: string;
  studentRollNumber?: string;
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

  // Real PDF URL & Loading state
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Full-Screen Controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real presigned view URL whenever active note changes
  useEffect(() => {
    if (!activeNote) {
      setPdfUrl("");
      return;
    }

    let isMounted = true;
    setPdfLoading(true);

    getStudentPresignedViewUrl(activeNote.id)
      .then((res) => {
        if (isMounted) {
          if (res.success && res.url) {
            setPdfUrl(res.url);
          } else {
            setPdfUrl(`/api/mock-r2-view?key=${encodeURIComponent(activeNote.r2ObjectKey)}`);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setPdfUrl(`/api/mock-r2-view?key=${encodeURIComponent(activeNote.r2ObjectKey)}`);
        }
      })
      .finally(() => {
        if (isMounted) setPdfLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeNote]);

  // Fullscreen Handlers (HTML5 Fullscreen API + Portal)
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (document.documentElement as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }
      } catch {
        // Fallback to CSS fullscreen portal
      }
      setIsFullscreen(true);
    } else {
      await exitFullscreen();
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        }
      }
    } catch {
      // ignore
    }
    setIsFullscreen(false);
  };

  // Sync with native Esc key or browser exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    const handleFsChange = () => {
      const isStillFs = Boolean(
        document.fullscreenElement ||
          (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      if (!isStillFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, [isFullscreen]);

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

  const progressPercent =
    totalNotesCount > 0
      ? Math.round((completedNoteIds.size / totalNotesCount) * 100)
      : 0;

  // Active breadcrumb
  const activeBreadcrumb = useMemo(() => {
    if (!activeNote) return null;
    for (const sub of subjects) {
      for (const ch of sub.chapters) {
        if (ch.notes.some((n) => n.id === activeNote.id)) {
          return { subject: sub.title, chapter: ch.title, note: activeNote.title };
        }
      }
    }
    return null;
  }, [subjects, activeNote]);

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
                                      setMobileDrawerOpen(false);
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

        {/* Right PDF Reading Surface */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {activeNote ? (
            <GlassCard className="p-4 md:p-6 flex flex-col gap-4">
              {/* Note Header, Breadcrumb & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div className="overflow-hidden">
                  {activeBreadcrumb && (
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mb-1 truncate">
                      <span>{activeBreadcrumb.subject}</span>
                      <span>&rarr;</span>
                      <span className="text-sky-300">{activeBreadcrumb.chapter}</span>
                    </div>
                  )}

                  <h2 className="font-['Space_Grotesk'] text-lg md:text-xl font-bold text-white truncate">
                    {activeNote.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="material-symbols-outlined text-sky-400 text-[15px]">
                      lock_clock
                    </span>
                    <span>15-min Presigned Cloudflare R2 Stream</span>
                    <span>•</span>
                    <span>{(activeNote.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap shrink-0">
                  {/* Open in New Tab Button */}
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5 transition-all"
                      title="Open full PDF in separate browser tab"
                    >
                      <span className="material-symbols-outlined text-[16px] text-sky-300">
                        open_in_new
                      </span>
                      <span>New Tab</span>
                    </a>
                  )}

                  {/* Full-screen toggle button */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 transition-all shadow-[0_2px_12px_rgba(56,189,248,0.25)] active:scale-95"
                    title="Enter Fullscreen Reader View"
                  >
                    <span className="material-symbols-outlined text-[17px] text-sky-300">
                      fullscreen
                    </span>
                    <span>Fullscreen</span>
                  </button>

                  {/* Mark complete */}
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
                    <span>{completedNoteIds.has(activeNote.id) ? "Completed" : "Mark Read"}</span>
                  </button>

                  {activeNote.allowDownload ? (
                    <a
                      href={pdfUrl}
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

              {/* High-Contrast Reading Surface with Clean Embedded PDF Viewer */}
              <ReadingSurface className="relative overflow-hidden p-3 sm:p-4 bg-slate-950/95 flex flex-col min-h-[640px] h-[720px] rounded-2xl">
                {pdfLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-400 relative z-10">
                    <span className="material-symbols-outlined animate-spin text-[32px] text-sky-400">
                      progress_activity
                    </span>
                    <span className="text-xs font-['Space_Grotesk'] font-medium">
                      Loading secured PDF note from Cloudflare R2...
                    </span>
                  </div>
                ) : pdfUrl ? (
                  <div className="relative z-10 flex-1 w-full h-full flex flex-col rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                    <iframe
                      src={pdfUrl}
                      className="w-full flex-1 h-full min-h-[580px] border-0 rounded-xl bg-slate-900"
                      title={activeNote.title}
                      allow="fullscreen"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                    Unable to load PDF stream.
                  </div>
                )}

                {/* Document Footer */}
                <div className="relative z-10 pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>SynapseMed Clinical Study Material</span>
                  <span className="text-sky-400/80">Secured Presigned Stream</span>
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

      {/* True Fullscreen Portal (Mounted directly to document.body to break out of all parent constraints) */}
      {mounted && isFullscreen && activeNote && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={fullscreenContainerRef}
            className="fixed inset-0 z-[99999] w-screen h-screen bg-[#07080f] flex flex-col p-3 sm:p-4 select-none animate-in fade-in duration-200"
          >
            {/* Fullscreen Top Navigation Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0 gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-white truncate">
                    {activeNote.title}
                  </span>
                  {activeBreadcrumb && (
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      {activeBreadcrumb.subject} &rarr; {activeBreadcrumb.chapter}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5 transition-all"
                    title="Open in separate tab"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                )}

                {activeNote.allowDownload && (
                  <a
                    href={pdfUrl}
                    download
                    className="px-3 py-1.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span className="hidden sm:inline">Download</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={exitFullscreen}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_2px_12px_rgba(244,63,94,0.3)]"
                  title="Exit Fullscreen (Esc)"
                >
                  <span className="material-symbols-outlined text-[16px]">fullscreen_exit</span>
                  <span>Exit Fullscreen</span>
                  <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-black/50 border border-white/10 font-mono text-slate-300">
                    Esc
                  </kbd>
                </button>
              </div>
            </div>

            {/* Fullscreen PDF Reader */}
            <div className="relative flex-1 w-full h-full mt-3 rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex flex-col">
              {pdfLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-[36px] text-sky-400">
                    progress_activity
                  </span>
                  <span className="text-xs font-['Space_Grotesk']">
                    Loading secured PDF document...
                  </span>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full flex-1 h-full border-0 rounded-xl bg-slate-900"
                  title={activeNote.title}
                  allow="fullscreen"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                  Unable to load PDF stream.
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
