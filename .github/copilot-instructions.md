# GitHub Copilot Instructions

This repository contains the source code for Peter Demirdjian's personal website and portfolio, built with VuePress and deployed on Netlify.

## Project Overview

- **Framework**: VuePress 2.0 (Vue.js-based static site generator)
- **Language**: JavaScript (ES modules), TypeScript configuration
- **Package Manager**: pnpm (check package.json for current version)
- **Node Version**: See engines field in package.json
- **Deployment**: Netlify
- **License**: CC-BY-NC-ND-4.0

## Code Style and Standards

### JavaScript/TypeScript

- Use ES modules (`import`/`export`)
- Follow ESLint configuration with Vue.js and TypeScript support
- Use modern JavaScript features (ES2020+)
- Prefer `const` and `let` over `var`
- Use async/await for asynchronous operations

### Vue.js Components

- Follow Vue 3 Composition API patterns when applicable
- Use TypeScript for type safety in Vue components
- Follow VuePress theme conventions for customizations

### File Organization

- Main site content in `docs/` directory
- VuePress configuration in `docs/.vuepress/config.js`
- Static assets in `docs/.vuepress/public/`
- Component customizations in `docs/.vuepress/`

## Development Commands

When suggesting development workflows, use these npm scripts:

```bash
# Development server
pnpm run docs:dev

# Production build
pnpm run docs:build

# Linting
pnpm run lint
pnpm run lint:fix

# Security auditing
pnpm run security:audit
pnpm run security:check
```

## Architecture Guidelines

### VuePress Configuration

- Keep configuration in `docs/.vuepress/config.js`
- Use ES module syntax
- Configure navbar, theme options, and site metadata
- Maintain clean separation between content and configuration

### Content Structure

- Use Markdown for content pages
- Follow VuePress conventions for frontmatter
- Keep content focused on professional portfolio/resume

### Security Best Practices

- Follow security headers configuration in `netlify.toml`
- Use Content Security Policy appropriately
- Regular security auditing with included scripts
- Use Trivy for container/filesystem security scanning

## Deployment

- Site deploys automatically to Netlify from main branch
- Build command: `pnpm docs:build`
- Publish directory: `docs/.vuepress/dist`
- Environment versions specified in package.json engines field

## Dependencies

### Core Dependencies

- VuePress 2.0 with Vite bundler
- Vue 3.x
- Default VuePress theme

### Development Tools

- ESLint with Vue and TypeScript support
- Sass for styling
- Security auditing tools

## Common Tasks

When helping with this repository:

1. **Content Updates**: Modify files in `docs/` directory
2. **Styling Changes**: Update theme configuration or custom styles
3. **Configuration**: Modify `docs/.vuepress/config.js`
4. **Security**: Use provided security scripts for auditing
5. **Performance**: Consider build optimization and static asset handling

## Best Practices

- Maintain compatibility with VuePress 2.0 RC
- Use semantic versioning for dependency updates
- Keep security headers updated in Netlify configuration
- Test locally with `pnpm run docs:dev` before deployment
- Run linting with `pnpm run lint:fix` before commits
- Perform security audits regularly

## Notes

- This is a personal portfolio site with professional focus
- Content should maintain professional tone and accuracy
- Respect the Creative Commons license (CC-BY-NC-ND-4.0)
- Site includes resume, license information, and contact details
