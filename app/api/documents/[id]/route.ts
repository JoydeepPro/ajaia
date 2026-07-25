import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Document from "@/models/Document";
import { requireUser } from "@/lib/auth";
import { accessFor } from "@/lib/access";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const doc = await Document.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = accessFor(doc as any, user.id, user.email);
  if (!access.canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ ...doc, access });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const doc = await Document.findById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = accessFor(doc, user.id, user.email);
  if (!access.canEdit) return NextResponse.json({ error: "Read-only document" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    doc.title = title.slice(0, 120);
  }
  if (body.content) doc.content = body.content;
  await doc.save();
  return NextResponse.json(doc);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const doc = await Document.findById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.ownerId !== user.id) return NextResponse.json({ error: "Only owner can delete" }, { status: 403 });
  await doc.deleteOne();
  return NextResponse.json({ ok: true });
}
