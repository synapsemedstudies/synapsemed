import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ success: true, message: "Mock R2 upload accepted." });
}

export async function POST() {
  return NextResponse.json({ success: true, message: "Mock R2 upload accepted." });
}
