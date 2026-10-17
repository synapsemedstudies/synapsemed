"use client";

import React, { useState } from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import type { SubjectWithChapters } from "@/actions/notes";
import {
  createSubject,
  createChapter,
  getAdminNoteUploadUrl,
  createNoteRecord,
  deleteNote,
  deleteChapter,
  deleteSubject,
} from "@/actions/notes";
import { cn } from "@/lib/utils";

interface AdminNotesManagerProps {
  initialTree: SubjectWithChapters[];
}

export function AdminNotesManager({ initialTree }: AdminNotesManagerProps) {
  const [tree, setTree] = useState<SubjectWithChapters[]>(initialTree);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialTree[0]?.id || ""
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialTree[0]?.chapters[0]?.id || ""
  );

  // Forms state
  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterSlug, setNewChapterSlug] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [allowDownload, setAllowDownload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Subject & Chapter objects
  const activeSubject = tree.find((s) => s.id === selectedSubjectId);
  const activeChapter = tree
    .flatMap((s) => s.chapters)
    .find((c) => c.id === selectedChapterId);

  // Handle Create Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;

    setStatusMessage(null);
    const res = await createSubject(newSubjectTitle);
    if (res.success && res.data) {
      setTree((prev) => [
        ...prev,
        {
          ...res.data,
          chapters: [],
        },
      ]);
      setSelectedSubjectId(res.data.id);
      setNewSubjectTitle("");
      setStatusMessage({ type: "success", text: `Subject "${res.data.title}" created successfully!` });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to create subject" });
    }
  };

  // Handle Create Chapter
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !newChapterTitle.trim() || !newChapterSlug.trim()) return;

    setStatusMessage(null);
    const res = await createChapter(selectedSubjectId, newChapterTitle, newChapterSlug);
    if (res.success && res.data) {
      setTree((prev) =>
        prev.map((sub) => {
          if (sub.id === selectedSubjectId) {
            return {
              ...sub,
              chapters: [...sub.chapters, { ...res.data, notes: [] }],
            };
          }
          return sub;
        })
      );
      setSelectedChapterId(res.data.id);
      setNewChapterTitle("");
      setNewChapterSlug("");
      setStatusMessage({ type: "success", text: `Chapter "${res.data.title}" registered with slug "${res.data.slug}"!` });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to create chapter" });
    }
  };

  // Handle Direct Presigned R2 Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChapterId) return;

    const finalTitle = noteTitle.trim() || file.name.replace(/\.[^/.]+$/, "");
    setUploading(true);
    setStatusMessage(null);

    try {
      // Step 1: Request presigned PUT URL from server
      const { uploadUrl, objectKey } = await getAdminNoteUploadUrl(file.name, file.type || "application/pdf");

      // Step 2: Direct browser PUT upload to Cloudflare R2 (zero Next.js server byte proxying)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/pdf",
        },
        body: file,
      });

      if (!uploadRes.ok && uploadUrl.startsWith("http")) {
        throw new Error(`R2 upload responded with status ${uploadRes.status}`);
      }

      // Step 3: Register note record in database
      const dbRes = await createNoteRecord(
        selectedChapterId,
        finalTitle,
        objectKey,
        file.size,
        allowDownload
      );

      if (dbRes.success && dbRes.data) {
        setTree((prev) =>
          prev.map((sub) => ({
            ...sub,
            chapters: sub.chapters.map((ch) => {
              if (ch.id === selectedChapterId) {
                return {
                  ...ch,
                  notes: [...ch.notes, dbRes.data],
                };
              }
              return ch;
            }),
          }))
        );
        setNoteTitle("");
        setStatusMessage({
          type: "success",
          text: `PDF "${finalTitle}" uploaded directly to Cloudflare R2 and indexed under ${activeChapter?.title}!`,
        });
      } else {
        throw new Error(dbRes.error || "Failed to register note record");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Handle Delete Subject
  const handleDeleteSubject = async (subjectId: string, subjectTitle: string, chapterCount: number) => {
    const warning =
      chapterCount > 0
        ? `Are you sure you want to delete subject "${subjectTitle}" and all ${chapterCount} chapter(s)/notes inside it? This cannot be undone.`
        : `Are you sure you want to delete subject "${subjectTitle}"?`;

    if (!confirm(warning)) return;

    setIsDeleting(true);
    setStatusMessage(null);

    const res = await deleteSubject(subjectId);
    setIsDeleting(false);

    if (res.success) {
      const updatedTree = tree.filter((s) => s.id !== subjectId);
      setTree(updatedTree);

      if (selectedSubjectId === subjectId) {
        const nextSub = updatedTree[0];
        setSelectedSubjectId(nextSub?.id || "");
        setSelectedChapterId(nextSub?.chapters[0]?.id || "");
      }

      setStatusMessage({
        type: "success",
        text: `Subject "${subjectTitle}" was deleted successfully.`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Failed to delete subject",
      });
    }
  };

  // Handle Delete Chapter (Folder)
  const handleDeleteChapter = async (chapterId: string, chapterTitle: string, noteCount: number) => {
    const warning =
      noteCount > 0
        ? `Are you sure you want to delete folder "${chapterTitle}" and all ${noteCount} note(s) inside it? This cannot be undone.`
        : `Are you sure you want to delete folder "${chapterTitle}"?`;

    if (!confirm(warning)) return;

    setIsDeleting(true);
    setStatusMessage(null);

    const res = await deleteChapter(chapterId);
    setIsDeleting(false);

    if (res.success) {
      setTree((prev) =>
        prev.map((sub) => ({
          ...sub,
          chapters: sub.chapters.filter((ch) => ch.id !== chapterId),
        }))
      );

      if (selectedChapterId === chapterId) {
        const currentSub = tree.find((s) => s.chapters.some((ch) => ch.id === chapterId));
        const remainingChapters = currentSub?.chapters.filter((ch) => ch.id !== chapterId) || [];
        setSelectedChapterId(remainingChapters[0]?.id || "");
      }

      setStatusMessage({
        type: "success",
        text: `Folder "${chapterTitle}" was deleted successfully.`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Failed to delete folder",
      });
    }
  };

  // Handle Delete Note
  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete note "${noteTitle}"? This will remove the PDF from storage and cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setStatusMessage(null);

    const res = await deleteNote(noteId);
    setIsDeleting(false);

    if (res.success) {
      setTree((prev) =>
        prev.map((sub) => ({
          ...sub,
          chapters: sub.chapters.map((ch) => ({
            ...ch,
            notes: ch.notes.filter((n) => n.id !== noteId),
          })),
        }))
      );

      setStatusMessage({
        type: "success",
        text: `Note "${noteTitle}" was deleted successfully.`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Failed to delete note",
      });
    }
  };


  return (
    <div className="flex flex-col gap-6">
      {/* 3-Step Structured Architecture Stepper Guide */}
      <GlassCard className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[20px]">
              account_tree
            </span>
            <h3 className="font-['Space_Grotesk'] text-sm md:text-base font-bold text-white">
              Syllabus Structure: Subject &rarr; Chapter &rarr; Note
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full liquid-badge text-sky-300">
            Cloudflare R2 Presigned
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Every clinical PDF note is indexed by Subject and Chapter for high-speed search and direct deep linking from student quiz scorecards directly into corresponding notes.
        </p>

        {/* Responsive Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={cn(
            "p-3 rounded-xl border transition-all text-xs flex flex-col gap-1",
            selectedSubjectId
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200"
              : "bg-white/[0.02] border-white/10 text-slate-400"
          )}>
            <div className="flex items-center gap-1.5 font-['Space_Grotesk'] font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[11px]">1</span>
              <span>Choose Subject</span>
            </div>
            <span className="text-[11px] truncate text-slate-400">
              {activeSubject?.title || "e.g. Cardiology"}
            </span>
          </div>

          <div className={cn(
            "p-3 rounded-xl border transition-all text-xs flex flex-col gap-1",
            selectedChapterId
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200"
              : "bg-white/[0.02] border-white/10 text-slate-400"
          )}>
            <div className="flex items-center gap-1.5 font-['Space_Grotesk'] font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[11px]">2</span>
              <span>Target Chapter</span>
            </div>
            <span className="text-[11px] truncate text-slate-400">
              {activeChapter?.title || "e.g. Heart Failure"}
            </span>
          </div>

          <div className={cn(
            "p-3 rounded-xl border transition-all text-xs flex flex-col gap-1",
            uploading
              ? "bg-sky-500/20 border-sky-400/40 text-sky-200 animate-pulse"
              : "bg-white/[0.02] border-white/10 text-slate-400"
          )}>
            <div className="flex items-center gap-1.5 font-['Space_Grotesk'] font-bold">
              <span className="w-5 h-5 rounded-full bg-sky-500/30 text-sky-300 flex items-center justify-center text-[11px]">3</span>
              <span>Upload PDF</span>
            </div>
            <span className="text-[11px] truncate text-slate-400">
              {uploading ? "Direct R2 PUT..." : "Presigned R2 Drop"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Live Breadcrumb Confirmation Pill */}
      {activeChapter && (
        <div className="px-4 py-2.5 rounded-xl liquid-glass-subtle border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] flex-wrap">
            <span className="text-indigo-400 font-semibold">Active Destination:</span>
            <span className="text-white font-medium">{activeSubject?.title}</span>
            <span>&rarr;</span>
            <span className="text-sky-300 font-bold">{activeChapter.title}</span>
            <span className="text-slate-500">({activeChapter.slug})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Target Ready for PDF
            </span>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() =>
                handleDeleteChapter(
                  activeChapter.id,
                  activeChapter.title,
                  activeChapter.notes.length
                )
              }
              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-['Space_Grotesk'] font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
              title={`Delete folder "${activeChapter.title}"`}
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              <span>Delete Folder</span>
            </button>
          </div>
        </div>
      )}

      {/* Status banner */}
      {statusMessage && (
        <div
          className={cn(
            "p-3.5 rounded-xl text-xs font-medium flex items-center gap-2",
            statusMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300"
              : "bg-rose-500/15 border border-rose-400/30 text-rose-300"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">
            {statusMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Syllabus Structure Builder & Quick Selector */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Create Subject Card */}
          <GlassCard className="p-5">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]">
                create_new_folder
              </span>
              <span>1. Add Medical Subject</span>
            </h3>

            <form onSubmit={handleCreateSubject} className="flex gap-2">
              <input
                type="text"
                value={newSubjectTitle}
                onChange={(e) => setNewSubjectTitle(e.target.value)}
                placeholder="e.g. Dermatology / Pathology"
                className="flex-1 h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70"
              />
              <button
                type="submit"
                className="px-4 h-10 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold shrink-0"
              >
                Add
              </button>
            </form>
          </GlassCard>

          {/* Create Chapter Card */}
          <GlassCard className="p-5">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-400 text-[18px]">
                note_add
              </span>
              <span>2. Add Chapter (with Quiz Link Slug)</span>
            </h3>

            <form onSubmit={handleCreateChapter} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const sub = tree.find(s => s.id === e.target.value);
                    if (sub && sub.chapters.length > 0) {
                      setSelectedChapterId(sub.chapters[0].id);
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#0c0e1a] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-indigo-400/70"
                >
                  {tree.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Chapter Title</label>
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => {
                    setNewChapterTitle(e.target.value);
                    if (!newChapterSlug) {
                      setNewChapterSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  placeholder="e.g. Psoriasis & Eczema"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Unique Slug (For automatic Quiz question deep linking)
                </label>
                <input
                  type="text"
                  value={newChapterSlug}
                  onChange={(e) => setNewChapterSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. derm-ch01-psoriasis"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70"
                />
              </div>

              <button
                type="submit"
                className="mt-1 w-full h-10 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold"
              >
                Create Chapter
              </button>
            </form>
          </GlassCard>

          {/* Quick Syllabus Tree Target Selector */}
          <GlassCard className="p-4 max-h-72 overflow-y-auto">
            <span className="text-[11px] font-['Space_Grotesk'] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              3. Click Any Chapter to Target Upload
            </span>
            <div className="flex flex-col gap-2">
              {tree.map((sub) => (
                <div key={sub.id} className="flex flex-col gap-1 border-b border-white/[0.05] pb-2 last:border-b-0 group/sub">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-indigo-400">folder</span>
                      <span className="truncate">{sub.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({sub.chapters.length})</span>
                    </span>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDeleteSubject(sub.id, sub.title, sub.chapters.length)}
                      className="opacity-40 hover:opacity-100 p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all text-xs shrink-0"
                      title={`Delete subject "${sub.title}" and its contents`}
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>

                  <div className="ml-3 flex flex-col gap-1">
                    {sub.chapters.map((ch) => (
                      <div key={ch.id} className="flex items-center gap-1 group/ch">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubjectId(sub.id);
                            setSelectedChapterId(ch.id);
                          }}
                          className={cn(
                            "flex-1 p-2 rounded-lg text-xs text-left transition-all flex items-center justify-between",
                            selectedChapterId === ch.id
                              ? "liquid-pill-active text-white font-semibold"
                              : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                          )}
                        >
                          <span className="truncate">{ch.title}</span>
                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            <span className="text-[10px] font-mono text-slate-400">
                              {ch.notes.length} notes
                            </span>
                            {selectedChapterId === ch.id && (
                              <span className="material-symbols-outlined text-sky-400 text-[14px]">
                                arrow_forward
                              </span>
                            )}
                          </div>
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(ch.id, ch.title, ch.notes.length);
                          }}
                          className="opacity-40 hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all shrink-0"
                          title={`Delete folder "${ch.title}"`}
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Direct Presigned Cloudflare R2 Upload Zone & Notes In Chapter */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  4. Direct Cloudflare R2 Presigned Uploader
                </h3>
                <span className="text-xs text-slate-400">
                  Target Chapter:{" "}
                  <strong className="text-sky-300 font-semibold">
                    {activeChapter?.title || "None selected"}
                  </strong>{" "}
                  <span className="font-mono text-[10px] text-slate-500">({activeChapter?.slug})</span>
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full liquid-badge text-sky-300">
                15-Min Presigned PUT
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1.5">
                  Custom Display Title (Optional)
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Leave empty to use PDF file name"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70"
                />
              </div>

              {/* Download Permission Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300">
                  Allow students to download raw PDF file (Unchecked = in-browser view only)
                </span>
              </label>

              {/* Direct File Dropzone */}
              <div className="relative border-2 border-dashed border-white/20 hover:border-indigo-400/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-white/[0.01] hover:bg-white/[0.03]">
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={uploading || !selectedChapterId}
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />

                <span className="material-symbols-outlined text-[42px] text-indigo-400 mb-2">
                  {uploading ? "hourglass_top" : "cloud_upload"}
                </span>

                <h4 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-1">
                  {uploading ? "Uploading directly to Cloudflare R2..." : `Click or drag PDF for "${activeChapter?.title || "chapter"}"`}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Zero Next.js server memory buffering. Direct presigned browser PUT to Cloudflare R2 object storage.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Notes currently inside selected Chapter */}
          <GlassCard className="p-6">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Notes in &ldquo;{activeChapter?.title || "Selected Chapter"}&rdquo;</span>
              <span className="text-xs font-mono text-slate-400">
                {activeChapter?.notes.length || 0} files indexed
              </span>
            </h3>

            {activeChapter && activeChapter.notes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {activeChapter.notes.map((note) => (
                  <ReadingSurface
                    key={note.id}
                    className="p-3.5 bg-slate-900/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="material-symbols-outlined text-[18px] text-indigo-400">
                        picture_as_pdf
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white truncate">{note.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Key: {note.r2ObjectKey} • {(note.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-mono",
                          note.allowDownload
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        )}
                      >
                        {note.allowDownload ? "Downloadable" : "View Only"}
                      </span>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                        title={`Delete note "${note.title}"`}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </ReadingSurface>
                ))}
              </div>
            ) : (
              <ReadingSurface className="p-6 text-center text-xs text-slate-400 bg-slate-900/60">
                No notes uploaded to this chapter yet. Drop a PDF above to add.
              </ReadingSurface>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
