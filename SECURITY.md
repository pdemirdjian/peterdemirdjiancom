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

The Trivy scanning is automated through GitHub Actions (`.github/workflows/security.yml`) and runs:

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

Install Trivy locally for ad-hoc scanning:

```bash
# macOS
brew install trivy

# Linux
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

Run scans directly:

```bash
# Vulnerability scan
trivy fs .

# Misconfiguration scan
trivy config .

# Secret scan
trivy fs --scanners secret .
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
2. Monitor GitHub Security tab for CI scan results (Trivy, OSV, pnpm audit)
3. Run `trivy fs .` locally before committing changes that touch dependencies or config
4. Review security headers periodically
5. Follow secure coding practices
6. Monitor Netlify security logs and analytics
7. Keep domain and DNS settings secure
8. Review and document any ignored Trivy vulnerabilities in `.trivyignore`
9. Address Critical/High severity findings immediately

## Contact

For security-related questions: <code@peterdemirdjian.com>
