# peterdemirdjiancom

Personal portfolio/resume website. Hugo static site, deployed to Netlify. Node/pnpm is used only for Playwright e2e tests.

## Constraints

- **License**: CC-BY-NC-ND-4.0 — never modify content for redistribution or commercial use
- **Hugo version**: Pinned via `HUGO_VERSION` in `netlify.toml` — keep local Hugo in sync; major bumps require manual review and testing
- **Professional tone**: Never add casual or unprofessional content
- **Security**: Never remove or weaken security headers in `netlify.toml`
- **Dependencies**: Renovate handles routine updates (including the Hugo pin) — don't manually bump versions unless necessary

## Conventions

- Content is Markdown in `content/`; templates are Hugo layouts in `layouts/`
- Styling lives in `static/css/style.css` — no CSS framework, no preprocessor
- pnpm only — never npm or yarn (Playwright is the only Node dependency)
- Test locally with `hugo server` before suggesting changes
- Run `pnpm test` (Playwright e2e) before committing site changes

## Key Files

| File | Purpose |
|------|---------|
| `hugo.toml` | Site config, params, nav menus |
| `content/_index.md` | Home page |
| `content/resume.md` | Resume/CV |
| `content/license.md` | License page |
| `layouts/` | Hugo templates (`index.html`, `404.html`, `_default/`) |
| `static/css/style.css` | Site styles |
| `static/images/` | Static assets, served at `/images/` |
| `netlify.toml` | Build command, `HUGO_VERSION` pin, security headers, redirects |
| `tests/` + `playwright.config.ts` | Playwright e2e tests |
| `package.json` | Playwright deps, Node/pnpm version constraints |
| `renovate.json` | Automated dependency updates |
