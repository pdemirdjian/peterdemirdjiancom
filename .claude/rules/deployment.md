# Deployment

## Netlify

- **Build command**: `pnpm run docs:build`
- **Publish directory**: `docs/.vuepress/dist`
- **Auto-deploy**: push to main branch
- **Security headers**: configured in `netlify.toml`

## Pre-deploy Checklist

- `pnpm run lint:fix`
- `pnpm run docs:build` (local)
- `pnpm run security:check`
- Verify content renders correctly in dev mode

## Dependencies (Renovate)

- Minor/patch: auto-merged after 3 days
- Major: manual review required (7 day wait)
- VuePress packages: grouped to avoid peer dependency issues
- Security fixes: auto-merged immediately
- Lock file: weekly automated updates
