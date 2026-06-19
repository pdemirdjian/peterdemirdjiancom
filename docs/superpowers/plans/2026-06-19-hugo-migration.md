# Hugo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate peterdemirdjian.com from VuePress (Node.js) to Hugo (Go) to eliminate the npm dependency tree and Dependabot alert noise.

**Architecture:** Hugo is a single Go binary — no package manager, no lockfile, no transitive CVEs. The build job in CI becomes Node-free. A minimal `package.json` is kept solely for Playwright integration tests (unavoidable since Playwright requires Node.js). Renovate tracks the pinned Hugo version in `netlify.toml` via GitHub Releases.

**Tech Stack:** Hugo 0.163.3 (Go), Playwright 1.61.0 (tests only), Netlify (deploy), Renovate (version automation)

---

## File Map

| Action | Path | Purpose |
|---|---|---|
| Create | `hugo.toml` | Site config (replaces `docs/.vuepress/config.js`) |
| Create | `content/_index.md` | Home page content |
| Create | `content/resume.md` | Resume content |
| Create | `content/license.md` | License page content |
| Create | `layouts/_default/baseof.html` | Shared HTML shell: head, nav, footer |
| Create | `layouts/_default/single.html` | Template for resume and license |
| Create | `layouts/index.html` | Home page template |
| Create | `layouts/404.html` | 404 template |
| Create | `static/css/style.css` | Site styles |
| Create | `static/images/` | Copied from `docs/.vuepress/public/images/` |
| Modify | `netlify.toml` | Build command, HUGO_VERSION, URL redirects |
| Modify | `renovate.json` | Strip npm config, add Hugo version manager |
| Modify | `.github/workflows/ci.yml` | Full rewrite for Hugo build |
| Modify | `playwright.config.ts` | New webServer command, timeout |
| Modify | `tests/resume.spec.ts` | URL `/resume.html` → `/resume/` |
| Modify | `tests/accessibility.spec.ts` | h1 count 2 → 1 |
| Modify | `package.json` | Keep only Playwright + serve |
| Delete | `docs/.vuepress/` | VuePress config and build toolchain |
| Delete | `docs/README.md` `docs/resume.md` `docs/license.md` `docs/404.md` | Content moved to `content/` |
| Delete | `eslint.config.js` | No JS to lint |

---

## Task 1: Verify Hugo Is Available Locally

**Files:** none

- [ ] **Check if Hugo is installed**

```bash
hugo version
```

Expected output: `hugo v0.163.x-...`

If not installed (command not found):

```bash
brew install hugo
hugo version
```

- [ ] **Confirm version is 0.140.0 or newer** (0.163.3 is the target pin)

---

## Task 2: Create hugo.toml

**Files:**
- Create: `hugo.toml`

- [ ] **Create the file**

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

- [ ] **Verify Hugo can read it**

```bash
hugo config | grep -E "baseURL|title"
```

Expected output contains `peterdemirdjian.com` and `Pete Demirdjian`.

---

## Task 3: Migrate Content Files

**Files:**
- Create: `content/_index.md`
- Create: `content/resume.md`
- Create: `content/license.md`

- [ ] **Create content directory and home page**

```bash
mkdir -p content
```

Write `content/_index.md`:

```markdown
---
title: "Pete Demirdjian"
---

# About Me

I'm a Principal DevOps Engineer currently working at Cargurus building out a cloud for me to angrily yell at while we list cars!

![picture-of-me](/images/home.png)
```

- [ ] **Create resume content**

Write `content/resume.md` — copy the full body from `docs/resume.md` with these changes:
1. Replace the frontmatter block with:
```yaml
---
title: "Resume"
---
```
2. Remove the `<div>` copyright block at the very end of the file (the block starting with `<div style="text-align: center; margin-top: 2rem...">` through the closing `</div>`). The footer copyright lives in `baseof.html` now.

Keep all resume content (Contact Info through Wayfair history) exactly as-is.

- [ ] **Create license content**

Write `content/license.md` — copy the full body from `docs/license.md` with these changes:
1. Replace the frontmatter block with:
```yaml
---
title: "License"
---
```
2. Remove the final line: `© {{ new Date().getFullYear() }} Peter Demirdjian. All rights reserved.` (copyright is in baseof.html now).

Keep all other license content exactly as-is.

---

## Task 4: Create Base Layout

**Files:**
- Create: `layouts/_default/baseof.html`

- [ ] **Create directory**

```bash
mkdir -p layouts/_default
```

- [ ] **Write baseof.html**

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} | {{ .Site.Title }}{{ end }}</title>
  <meta name="description" content="{{ with .Description }}{{ . }}{{ else }}{{ .Site.Params.description }}{{ end }}">
  <link rel="canonical" href="{{ .Permalink }}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} | {{ .Site.Title }}{{ end }}">
  <meta property="og:description" content="{{ with .Description }}{{ . }}{{ else }}{{ .Site.Params.description }}{{ end }}">
  <meta property="og:url" content="{{ .Permalink }}">
  <meta property="og:image" content="{{ .Site.BaseURL | strings.TrimSuffix "/" }}{{ .Site.Params.ogImage }}">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:site" content="{{ .Site.Params.twitterID }}">
  <meta name="twitter:title" content="{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} | {{ .Site.Title }}{{ end }}">
  <meta name="twitter:description" content="{{ with .Description }}{{ . }}{{ else }}{{ .Site.Params.description }}{{ end }}">

  <link rel="icon" href="/images/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <nav>
      <a href="/" class="site-title">{{ .Site.Title }}</a>
      <ul>
        {{ range .Site.Menus.main }}
        <li>
          <a href="{{ .URL }}"{{ if hasPrefix .URL "http" }} rel="noopener" target="_blank"{{ end }}>{{ .Name }}</a>
        </li>
        {{ end }}
      </ul>
    </nav>
  </header>
  <main>
    {{ block "main" . }}{{ end }}
  </main>
  <footer>
    <div style="margin-bottom: 0.5rem;">
      © {{ now.Format "2006" }} Peter Demirdjian. Licensed under
      <a href="/license/" style="color: #3b82f6; text-decoration: none;">CC BY-NC-ND 4.0</a>.
    </div>
    <div>
      <a rel="license noopener" href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">
        <img alt="Creative Commons License" style="border-width:0; height: 20px; border-radius: 0; margin: 0.5rem auto 0;"
             src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" />
      </a>
    </div>
  </footer>
</body>
</html>
```

---

## Task 5: Create Page Templates

**Files:**
- Create: `layouts/_default/single.html`
- Create: `layouts/index.html`
- Create: `layouts/404.html`

- [ ] **Write single.html** (used for /resume/ and /license/)

```html
{{ define "main" }}
<article>
  {{ .Content }}
</article>
{{ end }}
```

- [ ] **Write index.html** (home page)

```html
{{ define "main" }}
{{ .Content }}
{{ end }}
```

- [ ] **Write 404.html**

```html
{{ define "main" }}
<h1>404 – Page Not Found</h1>
<p>The page you're looking for doesn't exist.</p>
<p><a href="/">Return home</a></p>
{{ end }}
```

---

## Task 6: Create CSS

**Files:**
- Create: `static/css/style.css`

- [ ] **Create directory**

```bash
mkdir -p static/css
```

- [ ] **Write style.css**

```css
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #2c3e50;
  background: #fff;
}

header {
  border-bottom: 1px solid #eaecef;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.site-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  text-decoration: none;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

nav ul a {
  color: #2c3e50;
  text-decoration: none;
  font-size: 0.9rem;
}

nav ul a:hover { color: #3eaf7c; }

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

h1, h2, h3 {
  font-weight: 600;
  line-height: 1.25;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

h1 { font-size: 2rem; border-bottom: 1px solid #eaecef; padding-bottom: 0.5rem; }
h2 { font-size: 1.5rem; border-bottom: 1px solid #eaecef; padding-bottom: 0.3rem; }
h3 { font-size: 1.1rem; }

a { color: #3eaf7c; text-decoration: none; }
a:hover { text-decoration: underline; }

table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
th, td { border: 1px solid #eaecef; padding: 0.5rem 1rem; text-align: left; }
th { background: #f6f8fa; }

ul, ol { padding-left: 1.5rem; }
li { margin: 0.25rem 0; }

img { max-width: 100%; height: auto; display: block; margin: 1rem auto; }

hr { border: none; border-top: 1px solid #eaecef; margin: 2rem 0; }

footer {
  border-top: 1px solid #eaecef;
  text-align: center;
  padding: 2rem 1.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

footer a { color: #3b82f6; }

@media (max-width: 640px) {
  nav ul { gap: 0.75rem; }
  nav { flex-wrap: wrap; height: auto; padding: 0.75rem 0; }
  header { height: auto; }
  h1 { font-size: 1.5rem; }
}
```

---

## Task 7: Copy Static Assets and Update .gitignore

**Files:**
- Create: `static/images/` (copied from existing)

- [ ] **Copy images**

```bash
mkdir -p static/images
cp docs/.vuepress/public/images/home.png static/images/
cp docs/.vuepress/public/images/favicon.ico static/images/
```

- [ ] **Verify files exist**

```bash
ls static/images/
```

Expected: `favicon.ico  home.png`

- [ ] **Add Hugo output to .gitignore**

Check if `.gitignore` exists:
```bash
cat .gitignore 2>/dev/null || echo "(no .gitignore)"
```

Add `public/` to it (create the file if it doesn't exist):
```bash
echo "public/" >> .gitignore
```

Verify:
```bash
grep "public/" .gitignore
```

---

## Task 8: First Hugo Build — Verify Locally

**Files:** none modified

- [ ] **Build the site**

```bash
hugo
```

Expected output ends with something like:
```
                   | EN
-------------------+-----
  Pages            | 10
  Paginator pages  |  0
  Non-page files   |  0
  Static files     |  3
  Processed images |  0
  Aliases          |  0
  Cleaned          |  0

Total in X ms
```

- [ ] **Verify output**

```bash
ls public/
```

Expected: `404.html  css/  images/  index.html  license/  resume/  robots.txt  sitemap.xml`

- [ ] **Start dev server and spot-check pages**

```bash
hugo server --port 1313
```

Open in browser:
- `http://localhost:1313/` — verify "About Me" heading and photo
- `http://localhost:1313/resume/` — verify resume content renders, no Vue syntax visible
- `http://localhost:1313/license/` — verify license content renders
- Verify navbar links are present on all pages
- Verify footer shows current year and CC license badge

Stop the server with `Ctrl+C`.

- [ ] **Commit checkpoint**

```bash
git add hugo.toml content/ layouts/ static/ .gitignore
git commit -m "feat: add Hugo site structure (content, layouts, styles)"
```

---

## Task 9: Update playwright.config.ts

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Update the webServer block and baseURL**

Replace the entire `webServer` block and `use.baseURL`:

```typescript
use: {
  baseURL: 'http://localhost:8080',
  trace: 'on-first-retry',
},
```

```typescript
webServer: {
  command: process.env.CI
    ? 'pnpm exec serve public --listen 8080'
    : 'hugo && pnpm exec serve public --listen 8080',
  port: 8080,
  reuseExistingServer: !process.env.CI,
  timeout: 60000,
},
```

The baseURL stays the same (port 8080). The change is the command: in CI, `public/` is pre-built and cached by the build job so we only serve it. Locally, `hugo` runs first to produce `public/` then `serve` starts.

---

## Task 10: Update Playwright Tests

**Files:**
- Modify: `tests/resume.spec.ts`
- Modify: `tests/accessibility.spec.ts`

- [ ] **Update resume URL** (`tests/resume.spec.ts`)

Replace every occurrence of `/resume.html` with `/resume/`:

```typescript
// Line 6: was page.goto('/resume.html')
await page.goto('/resume/')

// Line 23: was page.goto('/resume.html')
await page.goto('/resume/')
```

The full updated file:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Resume Page', () => {
  test('should load resume page', async ({ page }) => {
    await page.goto('/resume/')

    await expect(page).toHaveTitle(/Pete Demirdjian/)

    await expect(page.locator('h2').first()).toBeVisible()
    await expect(page.getByText('Contact Info').first()).toBeVisible()
  })

  test('should have contact information', async ({ page }) => {
    await page.goto('/resume/')

    const hasContactInfo = await page.locator('body').textContent()
    expect(hasContactInfo).toBeTruthy()
  })

  test('should navigate from home to resume', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Resume' }).first()).toBeVisible()

    await page.goto('/resume/')

    await expect(page).toHaveURL(/.*resume/)
    await expect(page.getByText('Contact Info').first()).toBeVisible()
  })
})
```

- [ ] **Fix h1 count** (`tests/accessibility.spec.ts`)

The VuePress default theme renders the site title as an h1 in the nav, giving 2 h1s on the home page. The custom Hugo theme uses an `<a>` tag for the site title — only the page content heading is an h1.

Replace:
```typescript
await expect(h1).toHaveCount(2) // One for site title, one for page heading
```

With:
```typescript
await expect(h1).toHaveCount(1) // Page content heading only
```

---

## Task 11: Slim Down package.json

**Files:**
- Modify: `package.json`
- Regenerate: `pnpm-lock.yaml`

- [ ] **Rewrite package.json** (keep only Playwright and serve)

```json
{
  "name": "peterdemirdjiancom",
  "version": "0.0.1",
  "private": true,
  "packageManager": "pnpm@11.7.0",
  "engines": {
    "pnpm": "11.7.0"
  },
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug"
  },
  "devDependencies": {
    "@playwright/test": "1.61.0",
    "serve": "14.2.4"
  }
}
```

- [ ] **Check the exact serve version currently in use**

```bash
grep '"serve"' pnpm-lock.yaml | head -3
```

Use whatever version appears there in `package.json` above.

- [ ] **Reinstall with new package.json**

```bash
corepack pnpm install
```

Expected: installs only Playwright and serve (~few hundred packages vs the old thousands).

- [ ] **Verify**

```bash
corepack pnpm list --depth 0
```

Expected: only `@playwright/test` and `serve` appear as direct deps.

---

## Task 12: Run Playwright Tests Locally

- [ ] **Run the full test suite**

```bash
corepack pnpm test --project=chromium
```

The webServer will run `hugo && pnpm exec serve public --listen 8080` automatically.

Expected: all tests in `home.spec.ts`, `resume.spec.ts`, `seo.spec.ts`, `mobile.spec.ts`, `accessibility.spec.ts` pass.

- [ ] **If any test fails**, inspect the failure:

```bash
corepack pnpm test --project=chromium --reporter=list
```

Common causes:
- **Selector mismatch**: check the rendered HTML at `public/index.html` and adjust the selector
- **Missing `public/`**: run `hugo` manually first, then retry
- **Port conflict**: ensure nothing else is on 8080

- [ ] **Commit**

```bash
git add playwright.config.ts tests/resume.spec.ts tests/accessibility.spec.ts package.json pnpm-lock.yaml
git commit -m "test: update Playwright for Hugo (URLs, selectors, webServer)"
```

---

## Task 13: Update netlify.toml

**Files:**
- Modify: `netlify.toml`

- [ ] **Replace the build block** (lines 1–8 of current file)

Replace:
```toml
# Netlify Build Configuration

[build]
  publish = "docs/.vuepress/dist"
  command = "pnpm docs:build"

# Netlify will automatically detect Node.js version from .nvmrc
# and pnpm version from package.json packageManager field
```

With:
```toml
# Netlify Build Configuration

[build]
  publish = "public"
  command = "hugo"

[build.environment]
  HUGO_VERSION = "0.163.3"
```

- [ ] **Add URL redirects for old VuePress `.html` paths** (add before the security redirects block)

```toml
# Redirect old VuePress-style URLs to Hugo clean URLs
[[redirects]]
  from = "/resume.html"
  to = "/resume/"
  status = 301
  force = true

[[redirects]]
  from = "/license.html"
  to = "/license/"
  status = 301
  force = true
```

- [ ] **Remove now-irrelevant security redirects** for paths that no longer exist

Find and remove the following two redirect blocks (they block access to package.json and pnpm-lock.yaml, which won't exist in the Hugo output):
```toml
[[redirects]]
  from = "/package.json"
  to = "/404"
  status = 404

[[redirects]]
  from = "/pnpm-lock.yaml"
  to = "/404"
  status = 404
```

Leave all other redirect blocks unchanged.

- [ ] **Verify the build section looks correct**

```bash
grep -A 6 '^\[build\]' netlify.toml
```

Expected output:
```
[build]
  publish = "public"
  command = "hugo"

[build.environment]
  HUGO_VERSION = "0.163.3"
```

---

## Task 14: Update renovate.json

**Files:**
- Modify: `renovate.json`

- [ ] **Replace renovate.json entirely**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "assignees": ["@pdemirdjian"],
  "extends": [
    "config:best-practices",
    "helpers:pinGitHubActionDigestsToSemver",
    "security:openssf-scorecard"
  ],
  "customManagers": [
    {
      "customType": "regex",
      "description": "Update Hugo version in netlify.toml",
      "managerFilePatterns": ["/^netlify\\.toml$/"],
      "matchStrings": ["HUGO_VERSION\\s*=\\s*\"(?<currentValue>[^\"]+)\""],
      "depNameTemplate": "gohugoio/hugo",
      "datasourceTemplate": "github-releases",
      "versioningTemplate": "semver"
    },
    {
      "customType": "regex",
      "description": "Update Trivy version in GitHub Actions workflows",
      "managerFilePatterns": ["/^\\.github/workflows/[^/]+\\.ya?ml$/"],
      "matchStrings": [
        "#\\s*renovate:\\s*datasource=github-releases\\s+depName=aquasecurity/trivy\\n\\s*version:\\s*['\"]?(?<currentValue>v?[\\d.]+)['\"]?"
      ],
      "datasourceTemplate": "github-releases",
      "depNameTemplate": "aquasecurity/trivy"
    }
  ],
  "packageRules": [
    {
      "automerge": true,
      "matchUpdateTypes": ["minor", "patch", "pin", "digest"],
      "minimumReleaseAge": "3d"
    },
    {
      "description": "Hugo major versions require manual review",
      "matchDepNames": ["gohugoio/hugo"],
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "minimumReleaseAge": "7d"
    }
  ],
  "vulnerabilityAlerts": {
    "automerge": true,
    "assignees": ["@pdemirdjian"],
    "labels": ["security"],
    "minimumReleaseAge": "0d"
  },
  "osvVulnerabilityAlerts": true,
  "separateMajorMinor": true,
  "minimumReleaseAge": "3d"
}
```

---

## Task 15: Rewrite .github/workflows/ci.yml

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Replace ci.yml entirely**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0

      - name: Get Hugo version from netlify.toml
        run: |
          HUGO_VERSION=$(grep 'HUGO_VERSION' netlify.toml | cut -d'"' -f2)
          echo "HUGO_VERSION=${HUGO_VERSION}" >> $GITHUB_ENV

      - name: Install Hugo
        run: |
          wget -q -O hugo.deb \
            "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb"
          sudo dpkg -i hugo.deb
          rm hugo.deb
          hugo version

      - name: Build website
        run: hugo

      - name: Verify build output
        run: |
          test -f public/index.html || { echo "Build failed: public/index.html not found"; exit 1; }
          test -f public/resume/index.html || { echo "Build failed: resume page not found"; exit 1; }
          test -f public/sitemap.xml || { echo "Build failed: sitemap.xml not found"; exit 1; }
          echo "Build successful!"

      - name: Cache build for integration tests
        uses: actions/cache/save@27d5ce7f107fe9357f9df03efb73ab90386fccae # v5.0.5
        with:
          path: public/
          key: build-${{ github.sha }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: website-build
          path: public/
          retention-days: 7

  integration-tests:
    name: Integration Tests (${{ matrix.browser }})
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0

      - uses: pnpm/action-setup@0ebf47130e4866e96fce0953f49152a61190b271 # v6.0.9

      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version: "24.17.0"
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Restore cached build
        uses: actions/cache/restore@27d5ce7f107fe9357f9df03efb73ab90386fccae # v5.0.5
        with:
          path: public/
          key: build-${{ github.sha }}
          fail-on-cache-miss: true

      - name: Get Playwright version
        id: playwright-version
        run: echo "version=$(pnpm list @playwright/test --json | jq -r '.[0].devDependencies["@playwright/test"].version')" >> $GITHUB_OUTPUT

      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@27d5ce7f107fe9357f9df03efb73ab90386fccae # v5.0.5
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ matrix.browser }}-${{ steps.playwright-version.outputs.version }}

      - name: Install Playwright browser
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: pnpm exec playwright install ${{ matrix.browser }}

      - name: Install Playwright system dependencies
        run: pnpm exec playwright install-deps ${{ matrix.browser }}

      - name: Run Playwright tests
        run: pnpm exec playwright test --project=${{ matrix.browser }}

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 7
```

- [ ] **Commit config changes**

```bash
git add netlify.toml renovate.json .github/workflows/ci.yml
git commit -m "chore: update Netlify, Renovate, and CI for Hugo build"
```

---

## Task 16: Remove VuePress Files

**Files:**
- Delete: `docs/.vuepress/`
- Delete: `docs/README.md`, `docs/resume.md`, `docs/license.md`, `docs/404.md`
- Delete: `eslint.config.js`

Note: `docs/superpowers/` stays — it contains plans and specs.

- [ ] **Delete VuePress toolchain directory**

```bash
rm -rf docs/.vuepress
```

- [ ] **Delete VuePress content files** (content is now in `content/`)

```bash
rm docs/README.md docs/resume.md docs/license.md docs/404.md
```

- [ ] **Verify docs/superpowers/ is untouched**

```bash
ls docs/superpowers/specs/
```

Expected: spec file is still present.

- [ ] **Delete ESLint config** (no JS to lint)

```bash
rm eslint.config.js
```

- [ ] **Commit the deletions**

```bash
git add -u
git commit -m "chore: remove VuePress toolchain and content (migrated to Hugo)"
```

---

## Task 17: Final Build and Test Verification

- [ ] **Full clean build**

```bash
rm -rf public
hugo
```

- [ ] **Verify all expected output files exist**

```bash
test -f public/index.html && echo "✓ home"
test -f public/resume/index.html && echo "✓ resume"
test -f public/license/index.html && echo "✓ license"
test -f public/404.html && echo "✓ 404"
test -f public/sitemap.xml && echo "✓ sitemap"
test -f public/robots.txt && echo "✓ robots"
test -f public/css/style.css && echo "✓ css"
test -f public/images/home.png && echo "✓ image"
```

All 8 should print ✓.

- [ ] **Run full Playwright suite across all browsers**

```bash
corepack pnpm test
```

Expected: all tests pass for chromium, firefox, webkit, Mobile Chrome, Mobile Safari.

- [ ] **Final commit**

```bash
git add -A
git status
```

If clean (nothing unstaged), create final commit if anything was left:
```bash
git commit -m "feat: complete Hugo migration from VuePress" --allow-empty-message
```

Or if there are changes:
```bash
git commit -m "feat: complete Hugo migration from VuePress"
```

- [ ] **Verify git log looks clean**

```bash
git log --oneline -6
```

Expected commits (most recent first):
```
<sha> feat: complete Hugo migration from VuePress
<sha> chore: remove VuePress toolchain and content (migrated to Hugo)
<sha> chore: update Netlify, Renovate, and CI for Hugo build
<sha> test: update Playwright for Hugo (URLs, selectors, webServer)
<sha> feat: add Hugo site structure (content, layouts, styles)
<sha> docs: add Hugo migration design spec
```
