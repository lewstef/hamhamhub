<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules
- Only commit and push code on demand (do not push code automatically without explicit user instruction).
- Document every newly developed or modified functionality, both functionally and technically. If the user forgets to ask, proactively prompt them to align on documentation. This includes:
  - Updating the appropriate section in [README.md](file:///d:/ai/antigravity/hamhamhub/README.md) (or creating a new section if it covers a new domain or subsystem).
  - Documenting all new or modified Server Actions in `src/app/actions/` with complete JSDoc comments explaining input parameters, return values, side effects, redirect behavior, and security guards.
  - Adding comments to complex frontend logic or new components explaining their purpose, state management, and props.

# Known Issues & Gotchas

## Turbopack dev cache stale 404s (Next.js 16)
If a route that exists on disk suddenly returns 404 in development, the Turbopack dev cache (`.next/dev/`) is likely stale. Fix:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```
This was confirmed on 2026-07-10 on the `/backoffice/organizations/account-information/[id]` route.

