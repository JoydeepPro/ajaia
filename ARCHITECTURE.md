# Architecture Note

## Goal

Ship a coherent collaborative-document product slice within a 4–6 hour engineering timebox.

## Architecture

The browser uses Next.js React components and Tiptap for structured rich-text editing. Supabase provides authentication only. Next.js Route Handlers form the backend boundary, verify the Supabase session server-side, enforce document permissions, and persist data through Mongoose to MongoDB.

Documents contain `ownerId`, `ownerEmail`, Tiptap JSON content, and a small `shares` array containing collaborator email and permission. This keeps the assignment implementation compact while still demonstrating explicit authorization.

## Priorities

1. End-to-end document lifecycle.
2. Formatting that survives refresh.
3. A demonstrable owner/shared-user workflow.
4. Product-relevant file import.
5. Server-side access checks rather than UI-only permissions.
6. Simple deployment and reviewer setup.

## Tradeoffs

Sharing uses normalized email addresses instead of a synchronized application user table. This is sufficient for the assignment and works naturally with Supabase Auth, while avoiding a second identity system.

Autosave is debounced to reduce writes. This is not conflict-safe simultaneous editing; last successful write wins.

`.txt` and `.md` import were chosen over DOCX because they are reliable and testable within the timebox.

## Next 2–4 hours

I would add optimistic save indicators/retry, collaborator management/removal, stronger Markdown parsing, integration tests, and document search. If collaboration were a product priority, I would then evaluate a CRDT/Yjs-based real-time layer rather than implementing ad-hoc concurrent editing.
