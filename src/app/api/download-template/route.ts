import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const sampleData = [
    {
      question_number: 1,
      question_text: "A 42-year-old male with a history of IV drug use presents with high fever and a new holosystolic murmur best heard at the lower left sternal border that increases with inspiration (Carvallo sign). Which valve and typical organism are most likely involved?",
      option_a: "Mitral valve; Streptococcus viridans",
      option_b: "Tricuspid valve; Staphylococcus aureus",
      option_c: "Aortic valve; Enterococcus faecalis",
      option_d: "Pulmonic valve; Pseudomonas aeruginosa",
      correct_option: "B",
      marks: 4,
      negative_marks: 1,
      chapter_slug: "cardio-ch01-valvular",
      explanation: "IV drug use is classically associated with right-sided infective endocarditis (tricuspid valve) caused by Staphylococcus aureus. The murmur of tricuspid regurgitation accentuates during inspiration.",
    },
    {
      question_number: 2,
      question_text: "According to ACC/AHA guidelines, which four guideline-directed medical therapy (GDMT) drug classes form the cornerstone of mortality reduction in Heart Failure with Reduced Ejection Fraction (HFrEF)?",
      option_a: "ARNI/ACEi, Beta-Blocker, MRA, SGLT2 inhibitor",
      option_b: "Loop diuretic, Digoxin, Hydralazine, Nitrates",
      option_c: "Calcium channel blocker, ARB, Statin, Aspirin",
      option_d: "Thiazide diuretic, ACEi, Aldosterone antagonist, Ivabradine",
      correct_option: "A",
      marks: 4,
      negative_marks: 1,
      chapter_slug: "cardio-ch02-gdmt",
      explanation: "The four pillars of HFrEF mortality reduction are: 1) ARNI or ACEi/ARB, 2) Evidence-based Beta-Blocker (Carvedilol, Metoprolol Succinate, Bisoprolol), 3) Mineralocorticoid receptor antagonist (MRA), and 4) SGLT2 inhibitor.",
    },
    {
      question_number: 3,
      question_text: "A 28-year-old female presents with hematuria, periorbital edema, and hypertension 2 weeks after recovering from pharyngitis. Serum C3 complement level is markedly depressed. What classic renal biopsy immunofluorescence pattern is expected?",
      option_a: "Linear IgG deposition along the GBM",
      option_b: "Granular 'starry sky' subepithelial humps with IgG and C3",
      option_c: "Spike-and-dome subepithelial immune deposits",
      option_d: "Mesangial IgA nephropathy deposits",
      correct_option: "B",
      marks: 4,
      negative_marks: 1,
      chapter_slug: "nephro-ch01-gn",
      explanation: "Post-streptococcal glomerulonephritis (PSGN) typically presents 1-3 weeks post-pharyngitis with low C3. Immunofluorescence shows granular 'starry-sky' lumpy-bumpy appearance and subepithelial electron-dense humps.",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "QuizQuestions");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": 'attachment; filename="sample_quiz_upload_template.xlsx"',
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
