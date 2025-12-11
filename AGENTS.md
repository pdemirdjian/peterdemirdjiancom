# AI Agent Instructions for peterdemirdjiancom

This document provides guidance for AI coding assistants working with Peter Demirdjian's personal website repository.

## Project Overview

**Type**: Personal Portfolio & Resume Website
**Framework**: VuePress 2.0 (Vue.js-based static site generator)
**Language**: JavaScript (ES modules), TypeScript configuration
**Package Manager**: pnpm (see `package.json` for current version)
**Node Version**: See `package.json` engines field
**Deployment**: Netlify (automatic from main branch)
**License**: CC-BY-NC-ND-4.0

## Project Structure

```text
.
├── docs/                      # Main site content
│   ├── .vuepress/
│   │   ├── config.js         # VuePress configuration
│   │   ├── public/           # Static assets
│   │   └── client.ts         # Client-side configuration
│   ├── README.md             # Home page
│   ├── resume.md             # Resume/CV page
│   └── license.md            # License information
├── eslint.config.js          # ESLint configuration
├── netlify.toml              # Netlify deployment config
├── package.json              # Dependencies and scripts
└── pnpm-lock.yaml            # Lock file
```

## Code Standards

### JavaScript/TypeScript

- **Module System**: ES modules (`import`/`export`) only
- **Variables**: Use `const` and `let`, never `var`
- **Async**: Prefer `async`/`await` over callbacks or raw promises
- **Type Safety**: Use TypeScript where applicable
- **Linting**: Follow ESLint configuration with Vue.js and TypeScript support

### Vue.js

- **Version**: Vue 3.x
- **API Style**: Use Composition API when adding new components
- **Components**: Follow VuePress theme conventions
- **TypeScript**: Use types for component props and emits

### Markdown Content

- Use proper frontmatter for VuePress metadata
- Keep content professional and focused on portfolio/resume
- Follow semantic heading hierarchy (h1 → h2 → h3)
- Test local rendering before committing

## Development Workflow

### Starting Development

```bash
# Install dependencies (if needed)
pnpm install

# Start development server with hot reload
pnpm run docs:dev
```

The dev server runs at `http://localhost:8080` by default.

### Building for Production

```bash
# Build static site
pnpm run docs:build
```

Output directory: `docs/.vuepress/dist`

### Code Quality

```bash
# Lint code
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix
```

### Security Auditing

```bash
# Audit dependencies (moderate level)
pnpm run security:audit

# Check for high-severity issues only
pnpm run security:check

# Attempt to auto-fix security issues
pnpm run security:fix

# Run Trivy filesystem scan
pnpm run security:trivy

# Scan for exposed secrets
pnpm run security:trivy:secrets

# Scan configuration files
pnpm run security:trivy:config
```

## Common Tasks

### Adding/Updating Content

1. Edit Markdown files in `docs/`
2. Test locally with `pnpm run docs:dev`
3. Commit changes to trigger Netlify deployment

### Modifying Site Configuration

1. Edit `docs/.vuepress/config.js`
2. Restart dev server to see changes
3. Test build with `pnpm run docs:build`

### Adding Static Assets

- Place files in `docs/.vuepress/public/`
- Reference as `/filename.ext` in Markdown

### Updating Dependencies

1. Update `package.json` or use `pnpm update`
2. Run `pnpm install` to update lock file
3. Test locally before committing
4. Run security audit: `pnpm run security:check`

### Styling Changes

- VuePress uses Sass for styling
- Custom styles can be added via theme configuration
- Maintain responsive design principles

## Deployment

### Netlify Configuration

- **Build Command**: `pnpm docs:build`
- **Publish Directory**: `docs/.vuepress/dist`
- **Auto-deploy**: Triggered on push to main branch
- **Security Headers**: Configured in `netlify.toml`

### Before Deploying

✅ Run linting: `pnpm run lint:fix`
✅ Test build locally: `pnpm run docs:build`
✅ Security audit: `pnpm run security:check`
✅ Verify content renders correctly in dev mode

## Important Constraints

### License Considerations

- **Content License**: CC-BY-NC-ND-4.0
- Content cannot be modified for redistribution
- Content cannot be used commercially
- Source code references should respect license terms

### What to Preserve

- Professional tone and accuracy of resume/portfolio content
- Existing VuePress configuration patterns
- Security headers in Netlify configuration
- Dependency version compatibility with VuePress 2.0 RC

### What to Avoid

- Breaking changes to VuePress 2.0 RC compatibility
- Removing or weakening security configurations
- Casual or unprofessional content additions
- Direct dependency major version bumps without testing

## Troubleshooting

### Build Fails

1. Check Node.js version matches `package.json` engines field
2. Clear cache: `rm -rf docs/.vuepress/.cache docs/.vuepress/.temp`
3. Reinstall dependencies: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
4. Check ESLint errors: `pnpm run lint`

### Development Server Issues

1. Kill existing processes on port 8080
2. Clear VuePress cache directories
3. Restart with `pnpm run docs:dev`

### Netlify Deploy Failures

1. Check build logs in Netlify dashboard
2. Verify build command and publish directory
3. Ensure all dependencies are in `package.json` (not devDependencies for build deps)
4. Test build locally first

## Key Files Reference

| File | Purpose |
|------|---------|
| `docs/.vuepress/config.js` | VuePress site configuration, navbar, theme options |
| `docs/README.md` | Home page content |
| `docs/resume.md` | Resume/CV content |
| `netlify.toml` | Netlify deployment and security headers |
| `package.json` | Dependencies, scripts, Node/pnpm versions |
| `eslint.config.js` | Linting rules and configuration |

## Getting Help

When encountering issues:

1. Check VuePress 2.0 documentation: <https://v2.vuepress.vuejs.org/>
2. Review existing configuration in this repository
3. Test changes locally before committing
4. Check Netlify deploy logs for deployment issues
5. Run security audits after dependency changes

## Best Practices for AI Agents

✅ **DO**:

- Test all changes locally with `pnpm run docs:dev`
- Run linting before committing: `pnpm run lint:fix`
- Preserve existing code style and patterns
- Maintain professional content tone
- Run security audits after dependency updates
- Use semantic versioning awareness
- Consider VuePress 2.0 RC constraints

❌ **DON'T**:

- Make breaking changes without testing
- Modify license or attribution
- Add casual/unprofessional content
- Skip local testing before suggesting changes
- Update dependencies without checking compatibility
- Ignore security audit results
- Remove or weaken security configurations

## Version Management

### Automated Updates via Renovate

This repository uses Renovate Bot for automated dependency management:

- **Minor/Patch Updates**: Auto-merged after 3 days
- **Major Updates**: Require manual review (7 day wait period)
- **VuePress Packages**: Grouped and updated together to avoid peer dependency issues
- **Security Fixes**: Auto-merged immediately
- **Lock File Maintenance**: Weekly automated updates

### Current Version Constraints

Check `package.json` for current versions. Key constraints:

- **VuePress**: 2.0.0-rc.x (Release Candidate - verify compatibility before major changes)
- **Vue**: 3.x (Vue 3 Composition API)
- **Node**: Specified in `engines` field
- **pnpm**: Specified in `engines` and `packageManager` fields

### Best Practices

- Always check `package.json` for current version constraints before suggesting updates
- Test compatibility with VuePress 2.0 RC when proposing changes
- Renovate handles routine updates - don't manually bump versions unless necessary
- Major version changes to VuePress require extra caution due to RC status
