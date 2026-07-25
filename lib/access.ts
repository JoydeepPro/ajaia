type Share = { email: string; permission: "view" | "edit" };
type DocLike = { ownerId: string; shares?: Share[] };

export function accessFor(doc: DocLike, userId: string, email?: string | null) {
  if (doc.ownerId === userId) return { canView: true, canEdit: true, isOwner: true };
  const share = doc.shares?.find(s => s.email.toLowerCase() === (email ?? "").toLowerCase());
  return {
    canView: Boolean(share),
    canEdit: share?.permission === "edit",
    isOwner: false
  };
}
