import { NextResponse } from "next/server";

export async function GET() {
  // Return a minimal valid PDF byte stream for testing
  const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 77 >> stream
BT /F1 24 Tf 72 712 Td (SynapseMed Clinical Study Note) Tj 0 -36 Td (Cloudflare R2 Watermarked Reader) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000249 00000 n 
0000000377 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
456
%%EOF`;

  return new NextResponse(minimalPdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=study_note.pdf",
    },
  });
}
