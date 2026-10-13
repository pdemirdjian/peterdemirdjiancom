# ADR-0001: Render the resume PDF in the Netlify build

- **Status:** Accepted
- **Date:** 2026-10-13
- **Issue:** PDE-202

## Context

Recruiters and ATS forms want a PDF. A separately maintained PDF drifts from `content/resume.md`. Until now, Node/pnpm was used only for the Playwright test toolchain, and the Netlify build ran `hugo` alone.

## Decision

`pnpm build` is the production build: `hugo`, then `playwright install --only-shell chromium`, then `scripts/render-resume.mts`. The renderer serves `public/` through the Netlify emulator, so the PDF renders under the same deploy contract the tests use. It prints `/resume/` with print media to `public/resume.pdf`, with the document title set from Person.

Node/pnpm and Chromium are therefore part of the production build. Tooling that only verifies output, such as `pdfjs-dist` for reading the PDF in `tests/build-output.spec.ts`, stays test-only.

## Alternatives considered

- **Generate in GitHub Actions and deploy from there:** this breaks push-to-main auto-deploys and Netlify deploy previews, and it needs a Netlify deploy token.
- **Commit a hand-maintained PDF:** it drifts from `content/resume.md`.
- **Post-process with `pdf-lib` to set author and subject:** this adds a production dependency for fields recruiters rarely see. Deferred.

## Consequences

- Every Netlify build downloads Chromium's headless shell. A download or launch failure fails the deploy instead of publishing a stale PDF.
- Renovate bumps to `@playwright/test` change the renderer. The build-output tests catch layout regressions (page count, Letter size, Person job title and employer in the text).
- The phone number appears in the public PDF, just as it does on the public resume page.
