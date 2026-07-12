# Deployment

## Netlify

- **Build command**: `hugo`
- **Publish directory**: `public`
- **Hugo version**: pinned via `HUGO_VERSION` in `netlify.toml` (`[build.environment]`)
- **Auto-deploy**: push to main branch
- **Security headers**: configured in `netlify.toml` — never weaken them
- **Redirects**: `netlify.toml` also handles HTTPS/www canonicalization and legacy `.html` → clean-URL redirects

## Pre-deploy Checklist

- `hugo` builds cleanly (local)
- `pnpm test` (Playwright e2e) passes
- Verify content renders correctly with `hugo server`

## Dependencies (Renovate)

- Minor/patch: auto-merged after 3 days
- Major: manual review required — Hugo majors wait 7 days
- Hugo pin in `netlify.toml` is updated by a custom Renovate regex manager
- Security fixes: auto-merged immediately
- Lock file: automated updates
