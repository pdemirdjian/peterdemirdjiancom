# Hugo Migration Design

**Date:** 2026-06-19
**Status:** Approved

## Overview

Migrate peterdemirdjian.com from VuePress 2.0 RC (Node.js) to Hugo (Go) to eliminate the Node.js dependency tree, remove recurring Dependabot alert noise, and simplify long-term maintenance. Hugo is a single Go binary — no npm, no lockfile, no transitive CVEs.

## Architecture

### Project Structure

**Before (VuePress):**
```
docs/
  .vuepress/
    config.js
    client.ts
    public/
    styles/
  README.md
  resume.md
  license.md
  404.md
package.json
pnpm-lock.yaml
eslint.config.js
renovate.json
netlify.toml
```

**After (Hugo):**
```
content/
  _index.md
  resume.md
  license.md
layouts/
  _default/
    baseof.html
    single.html
  index.html
  404.html
static/
  images/
    home.png
    favicon.ico
hugo.toml
netlify.toml
renovate.json
.github/
```

### What Gets Removed
- `package.json`, `pnpm-lock.yaml`, `node_modules/`
- `eslint.config.js`
- `docs/.vuepress/` directory
- All VuePress/Vite/Node.js toolchain
- Renovate npm/pnpm package manager configuration

### What Stays
- `netlify.toml` security headers block (unchanged)
- Playwright tests (selectors updated for new HTML structure)
- `.github/` workflows (build command updated, otherwise unchanged)

## Content Migration

| Source | Destination | Notes |
|---|---|---|
| `docs/README.md` | `content/_index.md` | Home page |
| `docs/resume.md` | `content/resume.md` | Content unchanged |
| `docs/license.md` | `content/license.md` | Content unchanged |
| `docs/404.md` | `layouts/404.html` | Hugo 404s are templates, not content files |

The Vue template syntax `{{ new Date().getFullYear() }}` currently embedded in both markdown files moves to `baseof.html` as `{{ now.Format "2006" }}`. This runs at build time rather than in the browser. Since Netlify auto-deploys on every push, the year updates on the next deployment — acceptable for a personal site that sees at least one push per year.

## Templates

No external theme. A custom minimal theme scoped to this site keeps the dependency count at zero.

**`layouts/_default/baseof.html`** — shared shell for all pages:
- `<head>` with title, description, canonical URL, and OG/Twitter meta using Hugo's `.Site` and `.Page` variables
- Google Fonts preconnect links
- Navbar rendered from Hugo menus via `range .Site.Menus.main`
- Footer with `{{ now.Format "2006" }}` copyright year and CC BY-NC-ND 4.0 badge

**`layouts/_default/single.html`** — wraps `{{ .Content }}` for resume and license pages.

**`layouts/index.html`** — home page layout: photo (`/images/home.png`) and about text from `content/_index.md`.

**`layouts/404.html`** — 404 page.

CSS lives in `static/css/style.css` — a single file with minimal styles to replicate the current clean look (navbar, typography, responsive layout). No preprocessor, no build step.

## Configuration

**`hugo.toml`:**

```toml
baseURL = "https://peterdemirdjian.com"
languageCode = "en-US"
title = "Pete Demirdjian"
enableRobotsTXT = true

[params]
  description = "Personal website and resume of Pete Demirdjian, Principal DevOps Engineer"
  author = "Peter Demirdjian"
  ogImage = "/images/home.png"
  twitterID = "@pdemirdjian"

[sitemap]
  changeFreq = "monthly"

[[menus.main]]
  name = "Resume"
  url = "/resume/"
  weight = 1

[[menus.main]]
  name = "License"
  url = "/license/"
  weight = 2

[[menus.main]]
  name = "LinkedIn"
  url = "https://www.linkedin.com/in/peter-demirdjian/"
  weight = 3

[[menus.main]]
  name = "GitHub"
  url = "https://github.com/pdemirdjian/peterdemirdjiancom"
  weight = 4

[[menus.main]]
  name = "Email"
  url = "mailto:code@peterdemirdjian.com"
  weight = 5
```

Hugo generates `sitemap.xml` and `robots.txt` automatically with no plugins.

## Netlify

**`netlify.toml` build block (replaces current pnpm build):**

```toml
[build]
  command = "hugo"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.163.3"  # pinned; updated automatically by Renovate
```

The security headers `[[headers]]` block is unchanged.

No Node.js is installed or invoked during the Netlify build. Hugo is available as a pre-installed binary on Netlify's build image when `HUGO_VERSION` is set.

## Renovate

**`renovate.json`** replaces npm/pnpm configuration with a regex manager that tracks the Hugo binary version pinned in `netlify.toml`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "customManagers": [
    {
      "customType": "regex",
      "fileMatch": ["^netlify\\.toml$"],
      "matchStrings": ["HUGO_VERSION\\s*=\\s*\"(?<currentValue>[^\"]+)\""],
      "depNameTemplate": "gohugoio/hugo",
      "datasourceTemplate": "github-releases",
      "versioningTemplate": "semver"
    }
  ]
}
```

When Hugo publishes a new release on GitHub, Renovate opens a PR updating `HUGO_VERSION` in `netlify.toml`. The PR triggers a Netlify deploy preview so the build can be verified before merging. This replaces the entire current Renovate npm dependency management surface.

## Testing

Playwright tests target rendered HTML and will mostly continue to work since content and nav link text are preserved. Any selectors targeting VuePress-specific CSS classes (`.vp-*`, `.theme-*`) will need updating to match the new minimal custom CSS class names. Test updates happen as part of the implementation, after the templates are finalized.

## Success Criteria

- Site builds locally with `hugo` (single command, no package manager)
- Netlify build passes with no Node.js involvement
- All pages render: home, resume, license, 404
- Navbar links function correctly
- OG meta and sitemap present in output
- Security headers unchanged
- Renovate opens a test PR against a future Hugo release (verifiable after merge)
- Zero open Dependabot alerts
