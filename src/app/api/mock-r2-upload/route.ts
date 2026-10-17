import { NextResponse, type NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const buffer = Buffer.from(await request.arrayBuffer());
    const filePath = path.join(process.cwd(), "public", "mock-storage", key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: "File stored in local mock storage." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
