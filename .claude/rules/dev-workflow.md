# Development Workflow

## Commands

```bash
pnpm install               # install dependencies
pnpm run docs:dev          # dev server at http://localhost:8080
pnpm run docs:build        # build static site → docs/.vuepress/dist
pnpm run lint              # lint
pnpm run lint:fix          # lint + auto-fix
pnpm run typecheck         # type check (no emit)
pnpm run test              # Playwright e2e (headless)
pnpm run test:ui           # interactive test UI
pnpm run test:headed       # tests with browser visible
pnpm run test:debug        # step through with Playwright Inspector
pnpm run security:audit    # dependency audit (moderate)
pnpm run security:check    # high-severity only
pnpm run security:fix      # attempt auto-fix
pnpm run security:trivy    # Trivy filesystem scan
pnpm run security:trivy:secrets  # scan for exposed secrets
pnpm run security:trivy:config   # scan config files
```

## Common Tasks

**Add/update content**: Edit `docs/*.md` → test with `docs:dev` → commit (Netlify auto-deploys)

**Modify config**: Edit `docs/.vuepress/config.js` → restart dev server → test build

**Add static assets**: Place in `docs/.vuepress/public/` → reference as `/filename.ext` in Markdown

**Update dependencies**: `pnpm update` → `pnpm install` → test locally → `security:check`

**Styling**: Edit via VuePress theme config or `docs/.vuepress/styles/`

## Troubleshooting

**Build fails**:
1. Check Node version matches `package.json` engines field
2. Clear cache: `rm -rf docs/.vuepress/.cache docs/.vuepress/.temp`
3. Reinstall: `rm -rf node_modules && pnpm install` (only delete `pnpm-lock.yaml` if it's actually corrupted)
4. Check lint errors: `pnpm run lint`

**Dev server issues**: Kill port 8080, clear VuePress cache dirs, restart

**Netlify failures**: Check build logs → verify build command/publish dir → confirm Netlify is installing `devDependencies` (it does by default; only an issue if install flags explicitly skip them) → test build locally
