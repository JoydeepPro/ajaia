import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Document from "@/models/Document";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email, permission = "edit" } = await req.json();
  const normalized = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  if (!["view", "edit"].includes(permission))
    return NextResponse.json({ error: "Invalid permission" }, { status: 400 });

  await connectDB();
  const { id } = await params;
  const doc = await Document.findById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.ownerId !== user.id) return NextResponse.json({ error: "Only owner can share" }, { status: 403 });
  if (normalized === user.email.toLowerCase())
    return NextResponse.json({ error: "Document is already yours" }, { status: 400 });

  const existing = doc.shares.find((s: any) => s.email === normalized);
  if (existing) existing.permission = permission;
  else doc.shares.push({ email: normalized, permission });
  await doc.save();
  return NextResponse.json(doc);
}
