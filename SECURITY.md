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

### 3. Runtime Security

- Security headers implemented
- Content Security Policy (CSP)
- X-Frame-Options to prevent clickjacking
- XSS protection headers

### 4. Infrastructure Security

- Static site generation (reduced attack surface)
- No server-side code execution
- Netlify hosting with built-in DDoS protection
- Automatic HTTPS/SSL enforcement
- Global CDN distribution
- Secure redirects and access controls

## Security Best Practices

1. Keep dependencies updated
2. Run `volta run pnpm run security:audit` regularly
3. Monitor for security alerts
4. Review security headers periodically
5. Follow secure coding practices
6. Monitor Netlify security logs and analytics
7. Keep domain and DNS settings secure

## Contact

For security-related questions: <code@peterdemirdjian.com>
