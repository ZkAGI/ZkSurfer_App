import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs"; // ensures fs works in app router

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "voices");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".dat";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const fullPath = path.join(uploadsDir, name);

    await fs.writeFile(fullPath, buffer);

    // Public URL served by Next from /public
    const url = `/uploads/voices/${name}`;
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
