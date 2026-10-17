import { NextResponse, type NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

function generateNotePdf(title: string, subtitle: string): Buffer {
  const t = (title || "Clinical Study Note").replace(/[\(\)]/g, "");
  const sub = (subtitle || "SynapseMed Medical Faculty Notes").replace(/[\(\)]/g, "");

  const stream1 = `BT
/F2 20 Tf 50 730 Td (${t}) Tj
/F1 11 Tf 0 -26 Td (${sub}) Tj
0 -18 Td (Verified Medical Education Material - Confidential Study Copy) Tj
0 -36 Td (/F2 13 Tf) Tj
/F2 13 Tf (Section 1: Diagnostic Criteria & Core Framework) Tj
/F1 10 Tf 0 -22 Td (- Primary criteria and clinical indications for definitive diagnostic assessment.) Tj
0 -16 Td (- Physical examination pearls, maneuvers, and vital sign correlations.) Tj
0 -16 Td (- Sensitivity and specificity of first-line diagnostic markers.) Tj
0 -32 Td (/F2 13 Tf) Tj
/F2 13 Tf (Section 2: Pharmacotherapy & Guideline-Directed Therapy) Tj
/F1 10 Tf 0 -22 Td (- Empiric and targeted antimicrobial / pharmacological regimens.) Tj
0 -16 Td (- Key adverse effects, dose adjustments, and renal clearance parameters.) Tj
0 -16 Td (- Treatment duration and criteria for escalation or surgical evaluation.) Tj
ET`;

  const stream2 = `BT
/F2 18 Tf 50 730 Td (Clinical Pearls & Board Review Summary) Tj
/F1 10 Tf 0 -26 Td (High-Yield Exam Scenarios:) Tj
0 -20 Td (1. Patient presentations with acute versus subacute disease manifestations.) Tj
0 -16 Td (2. Interpretation of diagnostic imaging, electrocardiograms, and echocardiography.) Tj
0 -16 Td (3. Complications, risk stratification, and indications for urgent intervention.) Tj
0 -32 Td (/F2 13 Tf) Tj
/F2 13 Tf (Summary Table & Key Formulas:) Tj
/F1 10 Tf 0 -20 Td (- Initial Line of Defense: Immediate stabilization and prompt empiric therapy.) Tj
0 -16 Td (- Monitoring Schedule: Daily clinical re-evaluation and therapeutic drug monitoring.) Tj
0 -16 Td (- Discharge Criteria: Hemodynamic stability, negative repeat cultures, oral step-down.) Tj
ET`;

  const s1Len = Buffer.byteLength(stream1);
  const s2Len = Buffer.byteLength(stream2);

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>\nendobj\n";
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>\nendobj\n";
  const obj4 = "4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>\nendobj\n";
  const obj5 = `5 0 obj\n<< /Length ${s1Len} >>\nstream\n${stream1}\nendstream\nendobj\n`;
  const obj6 = `6 0 obj\n<< /Length ${s2Len} >>\nstream\n${stream2}\nendstream\nendobj\n`;
  const obj7 = "7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj8 = "8 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";

  const header = "%PDF-1.4\n";
  const objs = [obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8];
  const offsets: number[] = [];
  let currentOffset = Buffer.byteLength(header);

  let body = "";
  for (let i = 0; i < objs.length; i++) {
    offsets.push(currentOffset);
    body += objs[i];
    currentOffset += Buffer.byteLength(objs[i]);
  }

  let xref = `xref\n0 9\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`;
  return Buffer.from(header + body + xref + trailer);
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (key) {
    // 1. Check if uploaded file exists on local mock disk
    const filePath = path.join(process.cwd(), "public", "mock-storage", key);
    try {
      const fileBuffer = await fs.readFile(filePath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${path.basename(key)}"`,
        },
      });
    } catch {
      // File not found on disk, continue to generate high-fidelity dynamic study PDF
    }
  }

  // 2. Generate a valid multi-page PDF based on key/title
  const cleanTitle = key
    ? key
        .replace(/^notes\//, "")
        .replace(/\.pdf$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Clinical Study Note";

  const pdfBuffer = generateNotePdf(cleanTitle, "SynapseMed Medical Faculty Notes");

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${key ? path.basename(key) : "study_note.pdf"}"`,
    },
  });
}
