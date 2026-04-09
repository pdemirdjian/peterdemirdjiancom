# peterdemirdjiancom

Personal portfolio/resume website. VuePress 2.0, Vue 3, pnpm, deployed to Netlify.

## Constraints

- **License**: CC-BY-NC-ND-4.0 — never modify content for redistribution or commercial use
- **VuePress RC**: On 2.0.0-rc.x — verify compatibility before any major changes
- **Professional tone**: Never add casual or unprofessional content
- **Security**: Never remove or weaken security headers in `netlify.toml`
- **Dependencies**: Renovate handles routine updates — don't manually bump versions unless necessary; major version bumps require testing

## Conventions

- ES modules only (`import`/`export`) — never `var`, never CommonJS
- Vue 3 Composition API for any new components
- pnpm only — never npm or yarn
- Run `pnpm run lint:fix` before committing
- Run `pnpm run security:check` after dependency changes
- Test locally with `pnpm run docs:dev` before suggesting changes

## Key Files

| File | Purpose |
|------|---------|
| `docs/.vuepress/config.js` | VuePress config, navbar, theme |
| `docs/.vuepress/client.ts` | Client-side config (dynamic year) |
| `docs/README.md` | Home page |
| `docs/resume.md` | Resume/CV |
| `netlify.toml` | Deployment + security headers |
| `eslint.config.js` | Linting rules |
| `renovate.json` | Automated dependency updates |
