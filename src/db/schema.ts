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
    totpSecret: text("totp_secret"),
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

// 4. PYQ Questions Table (Medical College Previous Year Questions & Model Answers)
export const pyqQuestionTypeEnum = pgEnum("pyq_question_type", ["laq", "saq", "case"]);

export const pyqQuestions = pgTable(
  "pyq_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    questionType: pyqQuestionTypeEnum("question_type").notNull().default("saq"),
    questionText: text("question_text").notNull(),
    marks: integer("marks").notNull().default(5),
    repeatYears: text("repeat_years").notNull().default(""), // e.g. "2024, 2022, 2019"
    examName: text("exam_name").default("University Exam"),
    modelAnswer: text("model_answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    chapterTypeIdx: index("pyq_questions_chapter_type_idx").on(table.chapterId, table.questionType),
    subjectIdx: index("pyq_questions_subject_idx").on(table.subjectId),
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
    studentIdx: index("quiz_attempts_student_idx").on(table.studentId),
  })
);

// Relational Definitions
export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  chapters: many(chapters),
  quizzes: many(quizzes),
  pyqQuestions: many(pyqQuestions),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [chapters.subjectId],
    references: [subjects.id],
  }),
  quizzes: many(quizzes),
  pyqQuestions: many(pyqQuestions),
}));

export const pyqQuestionsRelations = relations(pyqQuestions, ({ one }) => ({
  subject: one(subjects, {
    fields: [pyqQuestions.subjectId],
    references: [subjects.id],
  }),
  chapter: one(chapters, {
    fields: [pyqQuestions.chapterId],
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

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
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

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type PYQQuestion = typeof pyqQuestions.$inferSelect;
export type NewPYQQuestion = typeof pyqQuestions.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
