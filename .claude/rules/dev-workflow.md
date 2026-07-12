# Development Workflow

## Commands

```bash
hugo server                # dev server at http://localhost:1313 (live reload)
hugo                       # build static site → public/
pnpm install               # install Playwright test dependencies
pnpm test                  # Playwright e2e (builds site, serves public/ on :8080)
pnpm run test:ui           # interactive test UI
pnpm run test:headed       # tests with browser visible
pnpm run test:debug        # step through with Playwright Inspector
```

Local Hugo should match the `HUGO_VERSION` pin in `netlify.toml`.

## Common Tasks

**Add/update content**: Edit `content/*.md` → check with `hugo server` → commit (Netlify auto-deploys)

**Modify site config or nav**: Edit `hugo.toml` → `hugo server` picks it up on reload

**Change templates**: Edit `layouts/` (`index.html`, `404.html`, `_default/single.html`, `_default/baseof.html`)

**Styling**: Edit `static/css/style.css`

**Add static assets**: Place in `static/` → referenced from the site root (e.g. `static/images/foo.png` → `/images/foo.png`)

**Update dependencies**: Renovate handles this, including the Hugo pin in `netlify.toml` — only intervene for majors or failures

## Troubleshooting

**Build fails**:
1. Check local Hugo version against `HUGO_VERSION` in `netlify.toml`
2. Run `hugo` locally and read the error — template errors name the offending layout file
3. For test failures: `rm -rf node_modules && pnpm install` (only delete `pnpm-lock.yaml` if it's actually corrupted)

**Dev server issues**: Kill port 1313 and restart `hugo server`; Playwright's test server uses port 8080

**Netlify failures**: Check build logs → verify build command is `hugo` and publish dir is `public` → confirm `HUGO_VERSION` in `netlify.toml` is valid → reproduce with the same Hugo version locally
