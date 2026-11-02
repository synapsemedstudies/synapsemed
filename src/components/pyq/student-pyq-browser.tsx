"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { FormattedContent } from "@/components/ui/formatted-content";
import type { SubjectWithPYQChapters } from "@/actions/pyq";
import { getChapterPYQs } from "@/actions/pyq";
import type { PYQQuestion } from "@/db/schema";

interface StudentPYQBrowserProps {
  syllabus: SubjectWithPYQChapters[];
  initialChapterId?: string;
}

export function StudentPYQBrowser({
  syllabus,
  initialChapterId,
}: StudentPYQBrowserProps) {
  // Find initial subject & chapter
  const defaultSubject = syllabus[0];
  const defaultChapter =
    syllabus.flatMap((s) => s.chapters).find((c) => c.id === initialChapterId) ||
    defaultSubject?.chapters[0];

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    defaultSubject?.id || ""
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    defaultChapter?.id || ""
  );

  // Filter & Search states
  const [typeFilter, setTypeFilter] = useState<"all" | "laq" | "saq" | "case">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<PYQQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Expanded question IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Active Subject & Chapter
  const activeSubject = syllabus.find((s) => s.id === selectedSubjectId);
  const activeChapter = activeSubject?.chapters.find((c) => c.id === selectedChapterId);

  // Load questions for the selected chapter
  useEffect(() => {
    if (!selectedChapterId) return;

    let isMounted = true;
    setLoading(true);

    getChapterPYQs(selectedChapterId)
      .then((data) => {
        if (isMounted) {
          setQuestions(data);
          // By default expand the first question so student immediately sees format
          if (data.length > 0) {
            setExpandedIds(new Set([data[0].id]));
          } else {
            setExpandedIds(new Set());
          }
        }
      })
      .catch((err) => console.error("Failed to load questions:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedChapterId]);

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Expand all / Collapse all
  const expandAll = () => {
    setExpandedIds(new Set(questions.map((q) => q.id)));
  };
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (typeFilter !== "all" && q.questionType !== typeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = q.questionText.toLowerCase().includes(query);
        const ansMatch = q.modelAnswer.toLowerCase().includes(query);
        const yearMatch = q.repeatYears.toLowerCase().includes(query);
        return textMatch || ansMatch || yearMatch;
      }
      return true;
    });
  }, [questions, typeFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Mobile Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-['Space_Grotesk'] font-bold uppercase tracking-wider">
              MBBS University PYQs
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-slate-300 text-xs font-['Space_Grotesk'] font-semibold">
              {activeSubject?.title || "Medical College Exam Portal"}
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            {activeChapter?.title || "Select a Chapter"}
          </h1>
        </div>

        {/* Mobile Topic Drawer Trigger */}
        <div className="sm:hidden">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="w-full py-2.5 px-4 rounded-xl liquid-glass-card border border-indigo-400/30 text-white text-xs font-semibold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-indigo-400">
                menu_book
              </span>
              <span>Change Subject / Chapter</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {mobileDrawerOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Question Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Subject & Chapter Navigator (Desktop + Mobile Drawer) */}
        <div
          className={`lg:col-span-4 flex flex-col gap-4 ${
            mobileDrawerOpen ? "block" : "hidden lg:flex"
          }`}
        >
          <GlassCard className="p-4 flex flex-col gap-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xs font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">
                  account_tree
                </span>
                <span>Subjects &amp; Topics</span>
              </h2>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label className="text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                Select Specialty
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setSelectedSubjectId(sId);
                  const s = syllabus.find((sub) => sub.id === sId);
                  if (s && s.chapters.length > 0) {
                    setSelectedChapterId(s.chapters[0].id);
                  }
                  setMobileDrawerOpen(false);
                }}
                className="w-full bg-[#0c0e1a]/90 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-medium"
              >
                {syllabus.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                    {sub.title} ({sub.chapters.reduce((a, b) => a + b.pyqCount, 0)} Qs)
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter List */}
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1">
              <label className="text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                Chapters in {activeSubject?.title}
              </label>
              {activeSubject?.chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChapterId(ch.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between group ${
                    selectedChapterId === ch.id
                      ? "liquid-btn-primary text-white font-semibold shadow-[0_4px_16px_rgba(99,102,241,0.4)]"
                      : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/5"
                  }`}
                >
                  <span className="truncate pr-2 group-hover:text-white transition-colors">
                    {ch.title}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-mono ${
                      selectedChapterId === ch.id
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {ch.pyqCount}
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Question Feed */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Controls Bar: Type Filters, Search, Expand All */}
          <GlassCard className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all shrink-0 ${
                  typeFilter === "all"
                    ? "liquid-pill-active text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("laq")}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all shrink-0 ${
                  typeFilter === "laq"
                    ? "liquid-pill-active text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Long Essays (10M)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("saq")}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all shrink-0 ${
                  typeFilter === "saq"
                    ? "liquid-pill-active text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Short Notes (5M)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("case")}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all shrink-0 ${
                  typeFilter === "case"
                    ? "liquid-pill-active text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Cases
              </button>
            </div>

            {/* Search Input & Expand/Collapse Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0c0e1a]/80 border border-white/10 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[14px]">
                  search
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Expand All Answers"
                >
                  Expand All
                </button>
                <span className="text-slate-600 text-xs">/</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Collapse All Answers"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Loading State */}
          {loading && (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-xs font-['Space_Grotesk']">Loading past university questions...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredQuestions.length === 0 && (
            <GlassCard className="p-10 flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-[36px]">
                quiz
              </span>
              <p className="text-sm font-semibold text-white">No questions found</p>
              <p className="text-xs text-slate-400 max-w-sm">
                {searchQuery
                  ? "No past questions match your search query. Try clearing the search."
                  : "No questions match the selected filter for this chapter."}
              </p>
            </GlassCard>
          )}

          {/* Question List (Using ReadingSurface for zero text blur & max contrast) */}
          {!loading &&
            filteredQuestions.map((q) => {
              const isExpanded = expandedIds.has(q.id);

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-white/10 bg-[#0e1222]/90 shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-200"
                >
                  {/* Card Header & Question Stem */}
                  <div
                    onClick={() => toggleExpand(q.id)}
                    className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors flex flex-col gap-3 select-none"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Type Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-wider ${
                            q.questionType === "laq"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : q.questionType === "case"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          }`}
                        >
                          {q.questionType === "laq"
                            ? "Long Essay (LAQ)"
                            : q.questionType === "case"
                            ? "Clinical Case"
                            : "Short Note (SAQ)"}
                        </span>

                        {/* Marks Badge */}
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 text-[10px] font-bold font-mono">
                          {q.marks} Marks
                        </span>

                        {/* Repeat Years / Exam Tag */}
                        {q.repeatYears && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-['Space_Grotesk'] text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                            <span className="material-symbols-outlined text-[13px] text-sky-400">
                              history
                            </span>
                            <span>Exam: {q.repeatYears}</span>
                          </span>
                        )}
                      </div>

                      {/* Expand / Collapse Indicator */}
                      <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-['Space_Grotesk'] font-semibold">
                        <span>{isExpanded ? "Hide Answer" : "View Model Answer"}</span>
                        <span className="material-symbols-outlined text-[18px]">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      </div>
                    </div>

                    {/* Question Text with formatted markdown */}
                    <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                      <FormattedContent content={q.questionText} />
                    </div>
                  </div>

                  {/* Expandable Model Answer Body (WCAG 4.5:1 High Contrast Reading Surface) */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-[#070913] p-5 sm:p-6 flex flex-col gap-4 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-['Space_Grotesk'] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">
                            verified
                          </span>
                          <span>University Model Answer &bull; Structured Framework</span>
                        </span>
                      </div>

                      {/* Formatted Model Answer Content */}
                      <ReadingSurface className="p-5 sm:p-6 text-xs sm:text-sm bg-slate-950/80 border-slate-800">
                        <FormattedContent content={q.modelAnswer} />
                      </ReadingSurface>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
