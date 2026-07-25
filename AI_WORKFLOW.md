# AI-Native Workflow Note

## Tools used

I used ChatGPT as an implementation and review assistant while retaining responsibility for architecture, scope and verification.

## Where AI accelerated the work

AI helped scaffold repetitive Next.js route/component code, identify a focused assignment scope, draft validation/error-handling paths, and prepare documentation/checklists.

## What I changed or rejected

I deliberately rejected over-scoped suggestions such as real-time collaboration, comments, version history and DOCX parsing because they would reduce confidence in the required core flows. I also kept authorization on the server rather than relying on generated client-side checks.

## Verification

I verified the product by exercising create → edit → autosave → refresh → reopen, file import, owner sharing, shared-user access, read-only behavior, and unauthorized access. I also added automated tests around the permission function and ran the production build before deployment.

AI output was treated as a draft: code was reviewed for data flow, authentication boundaries, access control, error paths and UX coherence before submission.
