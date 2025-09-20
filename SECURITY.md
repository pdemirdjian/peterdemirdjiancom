# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this website, please report it by emailing <code@peterdemirdjian.com>.

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Measures

This website implements several security measures:

### 1. Dependency Management

- Automated dependency updates via Renovate bot
- Regular security audits
- Vulnerability alerts with automatic patching

### 2. Build Security

- Security audits in CI/CD pipeline
- Frozen lockfile installations
- Pinned action versions with SHA digests

### 3. Trivy Security Scanning

This repository uses [Trivy](https://trivy.dev/) for comprehensive security scanning. Trivy scans for:

- **Vulnerabilities** in OS packages and language-specific packages (npm, etc.)
- **Misconfigurations** in configuration files
- **Secrets** and sensitive information
- **License** compliance issues

#### Automated Scanning

The Trivy scanning is automated through GitHub Actions (`.github/workflows/trivy.yml`) and runs:

- **On every push** to the main branch
- **On every pull request** to the main branch  
- **Daily at 2:30 AM UTC** (scheduled scan)
- **Manually** via workflow dispatch

#### Scan Types

1. **Repository Scan**: Scans for vulnerabilities in dependencies and files
2. **Configuration Scan**: Checks for misconfigurations in config files
3. **Secret Scan**: Detects hardcoded secrets, API keys, tokens, etc.
4. **PR Comments**: Adds scan results as comments on pull requests

#### Local Usage

Install Trivy locally:

```bash
# macOS
brew install trivy

# Linux
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

Use the npm scripts provided:

```bash
# Run vulnerability scan
pnpm run security:trivy

# Run configuration scan
pnpm run security:trivy:config

# Run secret scan
pnpm run security:trivy:secrets
```

#### Configuration

- **Trivy Configuration** (`.trivy.yaml`): Sets severity levels, skip rules, and output formatting
- **Ignore File** (`.trivyignore`): Suppress specific vulnerabilities with documented reasons

Scan results are automatically uploaded to the **Security tab** → Code scanning alerts.

### 4. Runtime Security

- Security headers implemented
- Content Security Policy (CSP)
- X-Frame-Options to prevent clickjacking
- XSS protection headers

### 5. Infrastructure Security

- Static site generation (reduced attack surface)
- No server-side code execution
- Netlify hosting with built-in DDoS protection
- Automatic HTTPS/SSL enforcement
- Global CDN distribution
- Secure redirects and access controls

## Security Best Practices

1. Keep dependencies updated
2. Run `pnpm run security:audit` regularly
3. Run `pnpm run security:trivy` before committing changes
4. Monitor for security alerts in GitHub Security tab
5. Review security headers periodically
6. Follow secure coding practices
7. Monitor Netlify security logs and analytics
8. Keep domain and DNS settings secure
9. Review and document any ignored Trivy vulnerabilities in `.trivyignore`
10. Address Critical/High severity findings immediately

## Contact

For security-related questions: <code@peterdemirdjian.com>
