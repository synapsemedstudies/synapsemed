import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sql = postgres(databaseUrl, { max: 1 });

async function seed() {
  console.log("🌱 Starting Database Seeding on:", supabaseUrl);

  // 1. Seed Faculty Admin
  const adminEmail = "admin@synapsemed.edu";
  const adminPassword = "AdminPassword123!";
  console.log(`\nCreating Admin Account: ${adminEmail}...`);

  let adminId: string;
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: "Dr. Faculty Administrator",
      role: "admin",
    },
  });

  if (adminErr) {
    if (adminErr.message.includes("already registered") || adminErr.message.includes("already exists")) {
      console.log("  ↳ Admin already exists in Supabase Auth. Fetching existing user...");
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const existing = usersList.users.find((u) => u.email === adminEmail);
      adminId = existing?.id || "00000000-0000-0000-0000-000000000001";
    } else {
      console.error("  ↳ Error creating admin in auth:", adminErr.message);
      adminId = "00000000-0000-0000-0000-000000000001";
    }
  } else {
    adminId = adminAuth.user.id;
    console.log("  ↳ Admin created in Supabase Auth with ID:", adminId);
  }

  // Insert/upsert into PostgreSQL users table
  await sql`
    INSERT INTO users (id, email, full_name, role, created_at)
    VALUES (${adminId}, ${adminEmail}, 'Dr. Faculty Administrator', 'admin', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET role = 'admin', full_name = 'Dr. Faculty Administrator'
  `;
  console.log("  ↳ Admin upserted in PostgreSQL users table.");

  // 2. Seed Student User
  const studentEmail = "student@synapsemed.edu";
  const studentPassword = "StudentPassword123!";
  console.log(`\nCreating Student Account: ${studentEmail}...`);

  let studentId: string;
  const { data: studentAuth, error: studentErr } = await supabase.auth.admin.createUser({
    email: studentEmail,
    password: studentPassword,
    email_confirm: true,
    user_metadata: {
      full_name: "Aakash Sharma (Student)",
      role: "student",
      roll_number: "MBBS-2024-042",
    },
  });

  if (studentErr) {
    if (studentErr.message.includes("already registered") || studentErr.message.includes("already exists")) {
      console.log("  ↳ Student already exists in Supabase Auth. Fetching existing user...");
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const existing = usersList.users.find((u) => u.email === studentEmail);
      studentId = existing?.id || "00000000-0000-0000-0000-000000000002";
    } else {
      console.error("  ↳ Error creating student in auth:", studentErr.message);
      studentId = "00000000-0000-0000-0000-000000000002";
    }
  } else {
    studentId = studentAuth.user.id;
    console.log("  ↳ Student created in Supabase Auth with ID:", studentId);
  }

  await sql`
    INSERT INTO users (id, email, full_name, role, roll_number, created_at)
    VALUES (${studentId}, ${studentEmail}, 'Aakash Sharma', 'student', 'MBBS-2024-042', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET role = 'student', full_name = 'Aakash Sharma', roll_number = 'MBBS-2024-042'
  `;
  console.log("  ↳ Student upserted in PostgreSQL users table.");

  // 3. Seed Medical Subjects & Chapters
  console.log("\nSeeding Subjects & Chapters...");

  // Subject 1: Anatomy
  const [subAnat] = await sql`
    INSERT INTO subjects (title, batch_id, order_index)
    VALUES ('Human Anatomy', 'batch-2025', 1)
    RETURNING id
  `;
  const [chapBrachial] = await sql`
    INSERT INTO chapters (subject_id, title, slug, order_index)
    VALUES (${subAnat.id}, 'Upper Limb & Brachial Plexus', 'upper-limb-brachial-plexus', 1)
    RETURNING id
  `;
  const [chapInguinal] = await sql`
    INSERT INTO chapters (subject_id, title, slug, order_index)
    VALUES (${subAnat.id}, 'Abdomen & Inguinal Canal', 'abdomen-inguinal-canal', 2)
    RETURNING id
  `;

  // Subject 2: Pathology
  const [subPath] = await sql`
    INSERT INTO subjects (title, batch_id, order_index)
    VALUES ('General & Systemic Pathology', 'batch-2025', 2)
    RETURNING id
  `;
  const [chapNeoplasia] = await sql`
    INSERT INTO chapters (subject_id, title, slug, order_index)
    VALUES (${subPath.id}, 'Neoplasia & Carcinogenesis', 'neoplasia-carcinogenesis', 1)
    RETURNING id
  `;

  // Subject 3: Pharmacology
  const [subPharm] = await sql`
    INSERT INTO subjects (title, batch_id, order_index)
    VALUES ('Medical Pharmacology', 'batch-2025', 3)
    RETURNING id
  `;
  const [chapANS] = await sql`
    INSERT INTO chapters (subject_id, title, slug, order_index)
    VALUES (${subPharm.id}, 'Autonomic Nervous System', 'autonomic-nervous-system', 1)
    RETURNING id
  `;

  console.log("  ↳ Created 3 Subjects and 4 Chapters.");

  // 4. Seed PYQ Questions
  console.log("\nSeeding Previous Year Questions (LAQ, SAQ, Cases)...");

  await sql`
    INSERT INTO pyq_questions (subject_id, chapter_id, question_type, question_text, marks, repeat_years, exam_name, model_answer)
    VALUES 
    (
      ${subAnat.id}, ${chapBrachial.id}, 'laq',
      'Describe the Brachial Plexus under following headings: Formation, Trunks, Divisions, Cords, and Branches. Discuss the anatomical basis and clinical features of Erb-Duchenne Palsy.',
      10, '2024, 2022, 2020, 2017', 'University Annual Exam',
      '### 1. Formation\nFormed by anterior primary rami of cervical spinal nerves C5, C6, C7, C8, and T1.\n\n### 2. Trunks\n* **Upper Trunk**: C5 + C6 roots\n* **Middle Trunk**: C7 root\n* **Lower Trunk**: C8 + T1 roots\n\n### 3. Cords\n* **Lateral Cord**: Anterior divisions of Upper & Middle trunks (C5, C6, C7).\n* **Medial Cord**: Anterior division of Lower trunk (C8, T1).\n* **Posterior Cord**: Posterior divisions of all three trunks.\n\n### 4. Erb''s Palsy (C5, C6 injury)\n* **Site of Injury**: Erb''s point.\n* **Deformity**: "Policeman''s tip" hand — adducted arm, medially rotated, pronated forearm.'
    ),
    (
      ${subAnat.id}, ${chapBrachial.id}, 'saq',
      'Write a short note on Klumpke''s Paralysis.',
      5, '2023, 2021, 2019', 'University Supple Exam',
      '### 1. Definition\nInjury to the lower trunk of the brachial plexus (C8, T1).\n\n### 2. Etiology\nExcessive upward pull on the arm during difficult delivery or falling from a height clutching a branch.\n\n### 3. Clinical Presentation: Claw Hand (Main en griffe)\n* Hyperextension at MCP joints and hyperflexion at IP joints.\n* Associated Horner''s syndrome (ptosis, miosis, anhidrosis) if T1 sympathetic fibers are torn.'
    ),
    (
      ${subAnat.id}, ${chapInguinal.id}, 'laq',
      'Describe the Inguinal Canal: Boundaries, Contents, and Defensive Mechanisms preventing herniation.',
      10, '2024, 2021, 2018', 'University Annual Exam',
      '### 1. Extent\nOblique canal, ~4 cm long, from deep inguinal ring to superficial inguinal ring above inguinal ligament.\n\n### 2. Boundaries\n* **Anterior Wall**: External oblique aponeurosis, lateral 1/3 reinforced by internal oblique.\n* **Posterior Wall**: Fascia transversalis, medial 1/3 reinforced by conjoint tendon.\n* **Roof**: Arched fibers of internal oblique and transversus abdominis.\n* **Floor**: Grooved upper surface of inguinal ligament.\n\n### 3. Defensive Mechanisms\n1. Flap-valve mechanism of obliquity.\n2. Keith''s shutter mechanism (internal oblique contraction).\n3. Ball-valve mechanism (cremasteric contraction).'
    ),
    (
      ${subPath.id}, ${chapNeoplasia.id}, 'laq',
      'Define Neoplasia. Differentiate between Benign and Malignant tumors. Enumerate the Hallmarks of Cancer.',
      10, '2024, 2022, 2020', 'University Annual Exam',
      '### 1. Willis Definition\n"A neoplasm is an abnormal mass of tissue, the growth of which exceeds and is uncoordinated with that of normal tissues..."\n\n### 2. Benign vs Malignant\n* **Differentiation**: Benign is well-differentiated; Malignant shows anaplasia and cellular pleomorphism.\n* **Metastasis**: Absent in benign; hallmark unequivocal sign of malignancy.\n\n### 3. Hallmarks of Cancer (Hanahan & Weinberg)\n1. Self-sufficiency in growth signals\n2. Insensitivity to anti-growth signals\n3. Evading apoptosis\n4. Limitless replicative potential\n5. Sustained angiogenesis\n6. Tissue invasion and metastasis\n7. Warburg effect / altered metabolism'
    ),
    (
      ${subPharm.id}, ${chapANS.id}, 'laq',
      'Classify Anticholinesterases. Discuss the mechanism of action, clinical uses, and treatment of Organophosphate poisoning.',
      10, '2023, 2021, 2019', 'University Annual Exam',
      '### 1. Classification\n* **Reversible**: Physostigmine, Neostigmine, Pyridostigmine, Donepezil, Edrophonium.\n* **Irreversible (Organophosphates)**: Malathion, Parathion, Echothiophate, Nerve gases (Sarin, Soman, Tabun).\n\n### 2. Treatment of OP Poisoning\n1. Decontamination (remove clothing, wash skin with soap/water).\n2. **Atropine** (Specific antidote for muscarinic symptoms) — 2 mg IV every 5-10 min until atropinization (dry mouth, dilated pupils, heart rate > 100 bpm).\n3. **Pralidoxime (PAM)** (Cholinesterase reactivator) — administer early before "aging" of enzyme occurs.'
    )
  `;

  console.log("  ↳ Created 5 detailed university PYQ questions with model answers.");

  console.log("\n==================================================");
  console.log("✅ SEEDING COMPLETE!");
  console.log("==================================================");
  console.log("\n👑 Admin Account:");
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role:     admin (Redirects to /admin)`);
  console.log("\n🎓 Student Account:");
  console.log(`   Email:    ${studentEmail}`);
  console.log(`   Password: ${studentPassword}`);
  console.log(`   Roll:     MBBS-2024-042 (Redirects to /dashboard)`);
  console.log("\n⚡ Local Dev Demo Buttons:");
  console.log("   You can also click 'Admin View' or 'Student View' directly on /login without typing passwords!");
  console.log("==================================================\n");

  await sql.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
