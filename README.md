# Ajaia Docs

A focused Google-Docs-inspired full-stack editor built for the Ajaia AI-Native Full Stack Developer Assignment.

## Features

- Supabase email/password authentication
- Create, rename, save, reopen and delete documents
- Tiptap rich-text editor: bold, italic, underline, H1/H2, bullet and numbered lists
- MongoDB persistence preserving Tiptap JSON formatting
- Import `.txt` and `.md` files as editable documents
- Share by email with `view` or `edit` permission
- Dashboard clearly separates owned and shared documents
- Debounced autosave, validation and permission checks
- Automated access-control tests

## Stack

Next.js, TypeScript, Tiptap, MongoDB/Mongoose, Supabase Auth, Vitest.

## Local setup

1. Create a MongoDB Atlas database (or local MongoDB).
2. Create a Supabase project and enable Email authentication.
3. Copy `.env.example` to `.env.local`.
4. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `MONGODB_URI`
5. Run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Testing

```bash
npm test
```

## Sharing demo

Create two Supabase accounts, e.g. `owner@example.com` and `teammate@example.com`. Sign in as the owner, create a document, press Share and enter the second account's email. Sign in as that account to see the document under **Shared with me**.

Sharing is email-based by design: MongoDB stores the authenticated owner's Supabase user ID plus normalized emails for collaborators.

## File import

Supported formats: `.txt` and `.md`. Imported content becomes a new editable document. Markdown is intentionally imported as text rather than implementing a full Markdown parser within the assignment timebox.

## Deployment

Deploy to Vercel and add the same three environment variables. In Supabase Authentication URL configuration, add the production Vercel URL as an allowed site/redirect URL.

## Scope cuts

Real-time multi-cursor editing, comments, version history, DOCX parsing and attachment storage were intentionally excluded to prioritize reliable core document, persistence and sharing flows.
