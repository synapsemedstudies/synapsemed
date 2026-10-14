import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("user_role", ["admin", "student"]);
export const optionEnum = pgEnum("quiz_option", ["A", "B", "C", "D"]);

// 1. Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    fullName: text("full_name").notNull(),
    role: roleEnum("role").notNull().default("student"),
    rollNumber: text("roll_number"),
    batchId: text("batch_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    batchRoleIdx: index("users_batch_role_idx").on(table.batchId, table.role),
  })
);

// 2. Subjects Table
export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    batchId: text("batch_id"),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    batchOrderIdx: index("subjects_batch_order_idx").on(table.batchId, table.orderIndex),
  })
);

// 3. Chapters Table
export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => ({
    subjectOrderIdx: index("chapters_subject_order_idx").on(table.subjectId, table.orderIndex),
  })
);

// 4. Notes Table
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    r2ObjectKey: text("r2_object_key").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull().default(0),
    allowDownload: boolean("allow_download").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    chapterIdx: index("notes_chapter_idx").on(table.chapterId),
  })
);

// 5. Quizzes Table
export const quizzes = pgTable(
  "quizzes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
    chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
    batchId: text("batch_id"),
    durationMinutes: integer("duration_minutes").notNull().default(15),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    batchPublishedIdx: index("quizzes_batch_published_idx").on(table.batchId, table.isPublished),
  })
);

// 6. Quiz Questions Table
export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    questionNumber: integer("question_number").notNull(),
    questionText: text("question_text").notNull(),
    optionA: text("option_a").notNull(),
    optionB: text("option_b").notNull(),
    optionC: text("option_c").notNull(),
    optionD: text("option_d").notNull(),
    correctOption: optionEnum("correct_option").notNull(),
    marks: numeric("marks", { precision: 5, scale: 2 }).notNull().default("4.00"),
    negativeMarks: numeric("negative_marks", { precision: 5, scale: 2 }).notNull().default("1.00"),
    chapterSlug: text("chapter_slug"),
    explanation: text("explanation"),
  },
  (table) => ({
    quizIdx: index("quiz_questions_quiz_idx").on(table.quizId),
  })
);

// 7. Quiz Attempts Table
export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: numeric("score", { precision: 6, scale: 2 }).notNull().default("0.00"),
    totalMarks: numeric("total_marks", { precision: 6, scale: 2 }).notNull().default("0.00"),
    answersJson: jsonb("answers_json").notNull(),
    timeTakenSeconds: integer("time_taken_seconds").notNull().default(0),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    quizStudentIdx: uniqueIndex("quiz_attempts_quiz_student_idx").on(table.quizId, table.studentId),
  })
);

// 8. Mistake Items Table
export const mistakeItems = pgTable(
  "mistake_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    chapterSlug: text("chapter_slug"),
    resolved: boolean("resolved").notNull().default(false),
    lastMissedAt: timestamp("last_missed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    studentQuestionIdx: uniqueIndex("mistake_items_student_question_idx").on(
      table.studentId,
      table.questionId
    ),
  })
);

// Relational Definitions
export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
  mistakeItems: many(mistakeItems),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  chapters: many(chapters),
  quizzes: many(quizzes),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [chapters.subjectId],
    references: [subjects.id],
  }),
  notes: many(notes),
  quizzes: many(quizzes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  chapter: one(chapters, {
    fields: [notes.chapterId],
    references: [chapters.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [quizzes.subjectId],
    references: [subjects.id],
  }),
  chapter: one(chapters, {
    fields: [quizzes.chapterId],
    references: [chapters.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  mistakeItems: many(mistakeItems),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  student: one(users, {
    fields: [quizAttempts.studentId],
    references: [users.id],
  }),
}));

export const mistakeItemsRelations = relations(mistakeItems, ({ one }) => ({
  student: one(users, {
    fields: [mistakeItems.studentId],
    references: [users.id],
  }),
  question: one(quizQuestions, {
    fields: [mistakeItems.questionId],
    references: [quizQuestions.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type MistakeItem = typeof mistakeItems.$inferSelect;
export type NewMistakeItem = typeof mistakeItems.$inferInsert;
