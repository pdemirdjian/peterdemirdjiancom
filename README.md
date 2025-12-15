# Peter Demirdjian's Personal Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/2880dcbd-41ef-4bba-bbf5-bd7b51008b7e/deploy-status)](https://app.netlify.com/projects/willowy-peony-b2b133/deploys)

This is the source code for my personal website and portfolio.

## About

Personal website built with VuePress, showcasing my work and resume as a Principal DevOps Engineer.

## Development

```bash
# Install dependencies
pnpm install

# Install pre-commit hooks (required for development)
pre-commit install

# Start development server
pnpm run docs:dev

# Build for production
pnpm run docs:build
```

### Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to ensure code quality. The hooks will automatically run before each commit to:

- Check for secrets and sensitive data (Gitleaks)
- Validate YAML and JSON files
- Fix trailing whitespace and file endings
- Run ESLint on staged files
- Detect merge conflicts and large files

**Installation required:** Run `pre-commit install` after cloning the repository.

## Security

This project includes automated security auditing:

```bash
# Run dependency security audit
pnpm run security:audit

# Fix security issues
pnpm run security:fix

# Check for high-severity issues
pnpm run security:check

# Run Trivy security scans
pnpm run security:trivy           # Vulnerability scan
pnpm run security:trivy:config    # Configuration scan
pnpm run security:trivy:secrets   # Secret detection
```

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

---

© 2025 Peter Demirdjian. Licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/).

![Creative Commons License](https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png)
