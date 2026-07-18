# Peter Demirdjian's Personal Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/2880dcbd-41ef-4bba-bbf5-bd7b51008b7e/deploy-status)](https://app.netlify.com/projects/willowy-peony-b2b133/deploys)

This is the source code for my personal website and portfolio.

## About

Personal website built with Hugo, showcasing my work and resume as a Principal DevOps Engineer.

## Development

```bash
# Install dependencies (Playwright/test tooling only)
pnpm install

# Install pre-commit hooks (required for development)
pre-commit install

# Start development server
hugo server

# Build for production
hugo

# Run end-to-end tests
pnpm test
```

### Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to ensure code quality. The hooks run automatically before each commit to:

- Detect secrets and sensitive data (Gitleaks)
- Detect private keys accidentally staged (detect-private-key)
- Validate YAML and JSON files
- Fix trailing whitespace, file endings, and mixed line endings
- Detect merge conflicts and large files

**Installation required:** Run `pre-commit install` after cloning the repository.

## Security

Security scanning runs in CI on every push and pull request:

- **Dependency audit** — `pnpm audit` (moderate and high severity)
- **Trivy** — vulnerability, misconfiguration, and secret scans (results uploaded to GitHub Security tab)
- **OSV Scanner** — cross-referenced against the Open Source Vulnerabilities database

See [SECURITY.md](SECURITY.md) for comprehensive security policies and scanning procedures.

## Documentation

- **[AGENTS.md](AGENTS.md)** - Instructions for AI coding assistants and comprehensive development guide
- **[SECURITY.md](SECURITY.md)** - Security policies, vulnerability reporting, and scanning procedures

## License

This website and its content are licensed under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/).

### What this means

- ✅ **You can**: Share and redistribute this content with proper attribution
- ❌ **You cannot**: Use this content for commercial purposes
- ❌ **You cannot**: Modify, remix, or build upon this content
- ⚠️ **You must**: Provide attribution and link back to the original

### Source Code

The website's source code (build scripts, configuration files, etc.) may be referenced for educational purposes, but the content and design remain under the above license.

For questions about usage rights, please contact [code@peterdemirdjian.com](mailto:code@peterdemirdjian.com).

## Site operations

Routine maintenance of this repository is orchestrated by kandev running on a home Mac mini. Agent-generated changes are never pushed directly — every change lands through a pull request and is reviewed by a human before merge.

---

© 2025 Peter Demirdjian. Licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).

![Creative Commons License](https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png)
