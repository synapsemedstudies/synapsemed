"use server";

import { requireAdmin, requireStudent } from "@/lib/auth";
import { db } from "@/db";
import {
  subjects,
  chapters,
  pyqQuestions,
  type Subject,
  type Chapter,
  type PYQQuestion,
} from "@/db/schema";
import { eq, asc, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ChapterWithPYQCount extends Chapter {
  pyqCount: number;
}

export interface SubjectWithPYQChapters extends Subject {
  chapters: ChapterWithPYQCount[];
}

export type SubjectWithChapters = Subject & {
  chapters: Chapter[];
};

export async function getSubjectsTree(): Promise<SubjectWithChapters[]> {
  return getPYQSyllabusTree();
}

export interface CreatePYQInput {
  subjectId: string;
  chapterId: string;
  questionType: "laq" | "saq" | "case";
  questionText: string;
  marks: number;
  repeatYears: string;
  examName?: string;
  modelAnswer: string;
}

/**
 * Default fallback syllabus tree for medical college professional exams
 * if database is not yet seeded.
 */
const FALLBACK_SYLLABUS: SubjectWithPYQChapters[] = [
  {
    id: "sub-anatomy-01",
    title: "Human Anatomy",
    batchId: "batch-2025",
    orderIndex: 1,
    createdAt: new Date(),
    chapters: [
      {
        id: "chap-brachial-01",
        subjectId: "sub-anatomy-01",
        title: "Upper Limb & Brachial Plexus",
        slug: "upper-limb-brachial-plexus",
        orderIndex: 1,
        pyqCount: 3,
      },
      {
        id: "chap-inguinal-02",
        subjectId: "sub-anatomy-01",
        title: "Abdomen & Inguinal Canal",
        slug: "abdomen-inguinal-canal",
        orderIndex: 2,
        pyqCount: 2,
      },
      {
        id: "chap-circle-willis-03",
        subjectId: "sub-anatomy-01",
        title: "Neuroanatomy & Circle of Willis",
        slug: "neuroanatomy-circle-of-willis",
        orderIndex: 3,
        pyqCount: 2,
      },
    ],
  },
  {
    id: "sub-pathology-02",
    title: "General & Systemic Pathology",
    batchId: "batch-2025",
    orderIndex: 2,
    createdAt: new Date(),
    chapters: [
      {
        id: "chap-neoplasia-01",
        subjectId: "sub-pathology-02",
        title: "Neoplasia & Carcinogenesis",
        slug: "neoplasia-carcinogenesis",
        orderIndex: 1,
        pyqCount: 2,
      },
      {
        id: "chap-cardio-path-02",
        subjectId: "sub-pathology-02",
        title: "Rheumatic Heart Disease & Atherosclerosis",
        slug: "rhd-atherosclerosis",
        orderIndex: 2,
        pyqCount: 2,
      },
    ],
  },
  {
    id: "sub-pharmacology-03",
    title: "Medical Pharmacology",
    batchId: "batch-2025",
    orderIndex: 3,
    createdAt: new Date(),
    chapters: [
      {
        id: "chap-ans-01",
        subjectId: "sub-pharmacology-03",
        title: "Autonomic Nervous System & Anticholinesterases",
        slug: "ans-anticholinesterases",
        orderIndex: 1,
        pyqCount: 2,
      },
      {
        id: "chap-antimicrobials-02",
        subjectId: "sub-pharmacology-03",
        title: "Antimicrobial Agents & Beta-Lactams",
        slug: "antimicrobials-beta-lactams",
        orderIndex: 2,
        pyqCount: 2,
      },
    ],
  },
];

/**
 * Fallback initial questions when database has not yet been populated
 */
const FALLBACK_QUESTIONS: Record<string, PYQQuestion[]> = {
  "chap-brachial-01": [
    {
      id: "pyq-brachial-laq-01",
      subjectId: "sub-anatomy-01",
      chapterId: "chap-brachial-01",
      questionType: "laq",
      questionText:
        "Describe the Brachial Plexus under following headings: Formation, Trunks, Divisions, Cords, and Branches. Discuss the anatomical basis and clinical features of Erb-Duchenne Palsy.",
      marks: 10,
      repeatYears: "2024, 2022, 2020, 2017",
      examName: "University Annual Exam",
      modelAnswer: `### 1. Formation
Formed by the anterior primary rami of cervical spinal nerves C5, C6, C7, C8, and thoracic nerve T1, with contributions from C4 (prefixed) or T2 (postfixed).

### 2. Components
* **Roots**: C5, C6, C7, C8, T1 emerging between scalenus anterior and medius.
* **Trunks**:
  - Upper Trunk: Formed by union of C5 & C6 roots.
  - Middle Trunk: Continuation of C7 root.
  - Lower Trunk: Formed by union of C8 & T1 roots.
* **Divisions**: Each trunk divides into Anterior (flexor) and Posterior (extensor) divisions beneath the clavicle.
* **Cords (named by relation to 2nd part of axillary artery)**:
  - Lateral Cord: Anterior divisions of Upper & Middle trunks (C5, C6, C7).
  - Medial Cord: Anterior division of Lower trunk (C8, T1).
  - Posterior Cord: Posterior divisions of all three trunks (C5, C6, C7, C8, T1).

### 3. Major Branches
* **Lateral Cord**: Lateral pectoral nerve, Musculocutaneous nerve, Lateral root of Median nerve.
* **Medial Cord**: Medial pectoral, Medial cutaneous of arm, Medial cutaneous of forearm, Ulnar nerve, Medial root of Median nerve.
* **Posterior Cord**: Upper subscapular, Thoracodorsal, Lower subscapular, Axillary, Radial nerve (ULTRA).

### 4. Erb's Palsy (Upper Plexus Lesion - C5, C6)
* **Site of injury**: Erb's point (junction of 6 nerves).
* **Cause**: Undue separation of head from shoulder (birth trauma, fall on shoulder).
* **Muscles paralyzed**: Biceps brachii, Brachialis, Deltoid, Supraspinatus, Infraspinatus, Supinator.
* **Deformity**: "Policeman's tip" or "Waiter's tip" hand.
  - Arm hangs by the side (adducted).
  - Pronated and medially rotated forearm.
  - Loss of sensation over the lateral aspect of the arm and forearm.`,
      createdAt: new Date(),
    },
    {
      id: "pyq-brachial-saq-02",
      subjectId: "sub-anatomy-01",
      chapterId: "chap-brachial-01",
      questionType: "saq",
      questionText: "Write a short note on Klumpke's Paralysis.",
      marks: 5,
      repeatYears: "2023, 2021, 2019",
      examName: "University Supple Exam",
      modelAnswer: `### 1. Definition & Root Involvement
Lesion of the lower trunk of the brachial plexus involving spinal segments **C8 and T1**.

### 2. Etiology
* Excessive upward pull on the arm during breech delivery.
* Person falling from a height and clutching at a tree branch.

### 3. Muscles Paralyzed
* All intrinsic muscles of the hand (interossei, lumbricals, thenar, hypothenar).
* Ulnar flexors of wrist and digits (Flexor carpi ulnaris, Flexor digitorum profundus medial half).

### 4. Deformity: Claw Hand (Main en griffe)
* Hyperextension at metacarpophalangeal (MCP) joints due to unopposed extensor digitorum.
* Hyperflexion at interphalangeal (IP) joints due to loss of lumbricals and interossei.

### 5. Associated Horner's Syndrome
If sympathetic fibers in T1 root are involved:
* Ptosis (drooping eyelid)
* Miosis (constricted pupil)
* Anhidrosis (loss of sweating on ipsilateral face)
* Enophthalmos (sunken eyeball).`,
      createdAt: new Date(),
    },
    {
      id: "pyq-brachial-case-03",
      subjectId: "sub-anatomy-01",
      chapterId: "chap-brachial-01",
      questionType: "case",
      questionText:
        "A 32-year-old cyclist fell onto his right shoulder. On examination, his right upper limb is adducted and internally rotated with the forearm pronated. (a) What is the provisional diagnosis? (b) Name the neurological point injured. (c) What muscles are paralyzed?",
      marks: 5,
      repeatYears: "2024",
      examName: "University Terminal Exam",
      modelAnswer: `### (a) Provisional Diagnosis
**Erb-Duchenne Palsy (Upper Brachial Plexus Injury - C5, C6)**.

### (b) Neurological Point Injured
**Erb's Point** — located at the anterior triangle of the neck where 6 nerves meet:
1. C5 root
2. C6 root
3. Upper trunk
4. Nerve to subclavius
5. Suprascapular nerve
6. Anterior & posterior divisions of upper trunk.

### (c) Muscles Paralyzed
* Abductors of shoulder: Deltoid, Supraspinatus (arm hangs adducted).
* Lateral rotators of shoulder: Infraspinatus, Teres minor (arm internally rotated).
* Flexors of elbow: Biceps brachii, Brachialis (elbow extended).
* Supinators: Supinator, Biceps (forearm pronated).`,
      createdAt: new Date(),
    },
  ],
  "chap-inguinal-02": [
    {
      id: "pyq-inguinal-laq-01",
      subjectId: "sub-anatomy-01",
      chapterId: "chap-inguinal-02",
      questionType: "laq",
      questionText:
        "Describe the Inguinal Canal under: Extent, Boundaries, Contents, and Defensive Mechanisms preventing herniation.",
      marks: 10,
      repeatYears: "2023, 2021, 2018",
      examName: "University Annual Exam",
      modelAnswer: `### 1. Extent & Dimensions
An oblique intermuscular canal in the lower part of anterior abdominal wall, ~4 cm long, extending from deep inguinal ring to superficial inguinal ring directly above medial half of inguinal ligament.

### 2. Boundaries
* **Anterior Wall**: Skin, superficial fascia, external oblique aponeurosis (full length); lateral 1/3 reinforced by internal oblique.
* **Posterior Wall**: Fascia transversalis (full length); medial 1/3 reinforced by conjoint tendon (falx inguinalis).
* **Roof (Superior)**: Arched fibers of internal oblique and transversus abdominis.
* **Floor (Inferior)**: Grooved upper surface of inguinal ligament; lacunar ligament at medial end.

### 3. Contents
* **Males**: Spermatic cord and ilioinguinal nerve (traverses canal through superficial ring).
* **Females**: Round ligament of the uterus and ilioinguinal nerve.

### 4. Defensive / Shutter Mechanisms
1. **Flap-valve mechanism**: Obliquity of canal — increase in intra-abdominal pressure presses anterior and posterior walls together.
2. **Shutter mechanism of Keith**: Arched fleshy fibers of internal oblique contract and approximate towards inguinal ligament, lowering the roof.
3. **Ball-valve mechanism**: Contraction of cremaster muscle pulls testes up, plugging superficial inguinal ring.
4. **Slit-valve mechanism**: Contraction of external oblique pillars closes the superficial ring.`,
      createdAt: new Date(),
    },
    {
      id: "pyq-inguinal-saq-02",
      subjectId: "sub-anatomy-01",
      chapterId: "chap-inguinal-02",
      questionType: "saq",
      questionText: "Differentiate between Direct and Indirect Inguinal Hernia.",
      marks: 5,
      repeatYears: "2024, 2022, 2019",
      examName: "University Supple Exam",
      modelAnswer: `### Comparative Analysis

| Feature | Indirect Inguinal Hernia | Direct Inguinal Hernia |
| :--- | :--- | :--- |
| **Age of occurrence** | Younger individuals / infants | Elderly males with weak musculature |
| **Path of exit** | Traverses deep ring, entire canal, enters scrotum | Protrudes directly through Hesselbach triangle |
| **Relation to Inf. Epigastric Artery** | **Lateral** to artery | **Medial** to artery |
| **Shape of swelling** | Pear-shaped, along cord | Globular, localized |
| **Internal Ring Occlusion Test** | Swelling does **not** reappear when ring is pressed | Swelling **reappears** medial to finger |
| **Strangulation risk** | High risk due to narrow neck | Very rare / low risk |`,
      createdAt: new Date(),
    },
  ],
  "chap-neoplasia-01": [
    {
      id: "pyq-neoplasia-laq-01",
      subjectId: "sub-pathology-02",
      chapterId: "chap-neoplasia-01",
      questionType: "laq",
      questionText:
        "Define Neoplasia. Enumerate differences between Benign and Malignant tumors. Discuss the Hallmarks of Cancer.",
      marks: 10,
      repeatYears: "2024, 2022, 2020",
      examName: "University Annual Exam",
      modelAnswer: `### 1. Willis Definition of Neoplasm
"A neoplasm is an abnormal mass of tissue, the growth of which exceeds and is uncoordinated with that of normal tissues, and persists in the same excessive manner after cessation of stimuli which evoked the change."

### 2. Benign vs Malignant Tumors

| Characteristic | Benign Tumor | Malignant Tumor |
| :--- | :--- | :--- |
| **Differentiation** | Well-differentiated, resembles tissue of origin | Anaplastic, pleomorphic, loss of polarity |
| **Rate of growth** | Slow, progressive | Rapid, erratic, atypical mitoses |
| **Capsule & Invasion** | Well-encapsulated, non-infiltrative | Non-encapsulated, highly invasive |
| **Metastasis** | **Absent** (hallmark of benign) | **Present** (unequivocal sign of malignancy) |

### 3. Hanahan & Weinberg Hallmarks of Cancer
1. **Self-sufficiency in growth signals** (e.g. *KRAS*, *HER2/neu*).
2. **Insensitivity to growth-inhibitory signals** (loss of *RB*, *TP53*).
3. **Altered cellular metabolism** (Warburg effect — aerobic glycolysis).
4. **Evasion of apoptosis** (overexpression of *BCL2*, mutation of *BAX*).
5. **Limitless replicative potential** (Telomerase reactivation).
6. **Sustained angiogenesis** (upregulation of *VEGF*).
7. **Tissue invasion and metastasis** (loss of E-cadherin, secretion of MMPs).
8. **Evasion of immune surveillance** (PD-L1 expression, down-regulation of MHC-I).`,
      createdAt: new Date(),
    },
  ],
};

/**
 * Fetch medical college syllabus tree with PYQ count per chapter.
 */
export async function getPYQSyllabusTree(): Promise<SubjectWithPYQChapters[]> {
  try {
    const [rawSubjects, rawChapters, questionCounts] = await Promise.all([
      db.select().from(subjects).orderBy(asc(subjects.orderIndex)),
      db.select().from(chapters).orderBy(asc(chapters.orderIndex)),
      db
        .select({
          chapterId: pyqQuestions.chapterId,
          count: sql<number>`count(*)::int`,
        })
        .from(pyqQuestions)
        .groupBy(pyqQuestions.chapterId),
    ]);

    if (rawSubjects.length === 0) {
      return FALLBACK_SYLLABUS;
    }

    // Count questions per chapter from SQL aggregate
    const countMap = new Map<string, number>();
    for (const q of questionCounts) {
      countMap.set(q.chapterId, q.count);
    }

    // Map chapters to subjects
    const chaptersBySubject = new Map<string, ChapterWithPYQCount[]>();
    for (const ch of rawChapters) {
      const chWithCount: ChapterWithPYQCount = {
        ...ch,
        pyqCount: countMap.get(ch.id) || 0,
      };
      const arr = chaptersBySubject.get(ch.subjectId) || [];
      arr.push(chWithCount);
      chaptersBySubject.set(ch.subjectId, arr);
    }

    return rawSubjects.map((s) => ({
      ...s,
      chapters: chaptersBySubject.get(s.id) || [],
    }));
  } catch (err) {
    console.error("Error loading syllabus tree from DB, serving fallback:", err);
    return FALLBACK_SYLLABUS;
  }
}

/**
 * Fetch all PYQs for a specific chapter, sorted by marks desc (LAQs first, then SAQs).
 */
export async function getChapterPYQs(chapterId: string): Promise<PYQQuestion[]> {
  try {
    const results = await db
      .select()
      .from(pyqQuestions)
      .where(eq(pyqQuestions.chapterId, chapterId))
      .orderBy(desc(pyqQuestions.marks), desc(pyqQuestions.createdAt));

    if (results.length > 0) {
      return results;
    }

    // Return fallback sample questions if DB not populated
    return FALLBACK_QUESTIONS[chapterId] || [];
  } catch (err) {
    console.error("Error fetching chapter PYQs from DB, serving fallback:", err);
    return FALLBACK_QUESTIONS[chapterId] || [];
  }
}

/**
 * Create a new PYQ question. Role-guarded for Admin faculty.
 */
export async function createPYQQuestion(
  input: CreatePYQInput
): Promise<{ success: boolean; data?: PYQQuestion; error?: string }> {
  await requireAdmin();

  if (!input.questionText.trim()) {
    return { success: false, error: "Question text is required" };
  }
  if (!input.modelAnswer.trim()) {
    return { success: false, error: "Model answer is required" };
  }

  try {
    const [inserted] = await db
      .insert(pyqQuestions)
      .values({
        subjectId: input.subjectId,
        chapterId: input.chapterId,
        questionType: input.questionType,
        questionText: input.questionText.trim(),
        marks: input.marks || 5,
        repeatYears: input.repeatYears.trim(),
        examName: input.examName?.trim() || "University Exam",
        modelAnswer: input.modelAnswer.trim(),
      })
      .returning();

    revalidatePath("/admin/pyq");
    revalidatePath("/dashboard/pyq");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { success: true, data: inserted };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create PYQ question";
    return { success: false, error: msg };
  }
}

/**
 * Delete a PYQ question. Role-guarded for Admin faculty.
 */
export async function deletePYQQuestion(
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await db.delete(pyqQuestions).where(eq(pyqQuestions.id, questionId));

    revalidatePath("/admin/pyq");
    revalidatePath("/dashboard/pyq");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete PYQ question";
    return { success: false, error: msg };
  }
}

/**
 * Create a Subject if needed. Role-guarded for Admin faculty.
 */
export async function createSubject(
  title: string
): Promise<{ success: boolean; data?: Subject; error?: string }> {
  await requireAdmin();

  if (!title.trim()) {
    return { success: false, error: "Subject title is required" };
  }

  try {
    const [inserted] = await db
      .insert(subjects)
      .values({
        title: title.trim(),
        batchId: "batch-2025",
        orderIndex: 0,
      })
      .returning();

    revalidatePath("/admin/pyq");
    revalidatePath("/dashboard/pyq");
    return { success: true, data: inserted };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create subject";
    return { success: false, error: msg };
  }
}

/**
 * Create a Chapter if needed. Role-guarded for Admin faculty.
 */
export async function createChapter(
  subjectId: string,
  title: string,
  slug: string
): Promise<{ success: boolean; data?: Chapter; error?: string }> {
  await requireAdmin();

  if (!title.trim() || !slug.trim()) {
    return { success: false, error: "Chapter title and slug are required" };
  }

  try {
    const [inserted] = await db
      .insert(chapters)
      .values({
        subjectId,
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        orderIndex: 0,
      })
      .returning();

    revalidatePath("/admin/pyq");
    revalidatePath("/dashboard/pyq");
    return { success: true, data: inserted };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create chapter";
    return { success: false, error: msg };
  }
}

/**
 * Bulk insert questions from Excel workbook rows.
 */
export async function importPYQsBulk(
  items: CreatePYQInput[]
): Promise<{ success: boolean; insertedCount?: number; error?: string }> {
  await requireAdmin();

  if (!items || items.length === 0) {
    return { success: false, error: "No items provided for import" };
  }

  try {
    let count = 0;
    const CHUNK_SIZE = 100;
    await db.transaction(async (tx) => {
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        await tx.insert(pyqQuestions).values(
          chunk.map((item) => ({
            subjectId: item.subjectId,
            chapterId: item.chapterId,
            questionType: item.questionType,
            questionText: item.questionText.trim(),
            marks: item.marks || 5,
            repeatYears: item.repeatYears?.trim() || "",
            examName: item.examName?.trim() || "University Exam",
            modelAnswer: item.modelAnswer.trim(),
          }))
        );
        count += chunk.length;
      }
    });

    revalidatePath("/admin/pyq");
    revalidatePath("/dashboard/pyq");
    return { success: true, insertedCount: count };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to import questions";
    return { success: false, error: msg };
  }
}
