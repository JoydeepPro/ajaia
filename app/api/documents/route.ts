import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Document from "@/models/Document";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const docs = await Document.find({
    $or: [{ ownerId: user.id }, { "shares.email": user.email.toLowerCase() }]
  }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await connectDB();
  const doc = await Document.create({
    title: String(body.title || "Untitled document").slice(0, 120),
    content: body.content || undefined,
    ownerId: user.id,
    ownerEmail: user.email.toLowerCase()
  });
  return NextResponse.json(doc, { status: 201 });
}
