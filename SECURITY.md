# Security Policy

## Overview

ServiceTag takes security seriously. This document outlines our security practices, vulnerability reporting process, and security measures implemented in the application.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Measures Implemented

### 1. Automated Security Scanning

**Continuous Security Monitoring:**
- ✅ **Dependency Scanning** - Daily npm audit checks
- ✅ **CodeQL Analysis** - Static code analysis for vulnerabilities
- ✅ **Secret Scanning** - TruffleHog for exposed secrets
- ✅ **ESLint Security Rules** - Security-focused linting
- ✅ **Docker Image Scanning** - Trivy for container vulnerabilities
- ✅ **License Compliance** - Automated license checking

**Scan Frequency:**
- On every push to main/develop branches
- On every pull request
- Daily scheduled scans at 2 AM UTC
- Before every deployment

### 2. Authentication & Authorization

**AWS Cognito Integration:**
- ✅ Email/password authentication with verification
- ✅ JWT-based session management
- ✅ Secure token storage
- ✅ Automatic token refresh
- ✅ Multi-factor authentication support (configurable)

**Authorization:**
- ✅ Owner-based access control
- ✅ Authenticated read access
- ✅ Protected API routes
- ✅ Client-side route guards

### 3. Data Security

**Encryption:**
- ✅ Data encrypted at rest (DynamoDB encryption)
- ✅ Data encrypted in transit (HTTPS/TLS)
- ✅ Secure credential storage (AWS Secrets Manager)

**Data Protection:**
- ✅ Input validation on all forms
- ✅ Output encoding to prevent XSS
- ✅ CSRF protection
- ✅ SQL injection prevention (using DynamoDB)
- ✅ No sensitive data in logs

### 4. Infrastructure Security

**AWS Best Practices:**
- ✅ VPC isolation
- ✅ Security groups configured
- ✅ IAM least privilege principle
- ✅ CloudWatch monitoring
- ✅ AWS WAF (optional, configurable)

**Container Security:**
- ✅ Multi-stage Docker builds
- ✅ Non-root user in containers
- ✅ Minimal base images
- ✅ Regular image updates
- ✅ Vulnerability scanning

### 5. Code Security

**Secure Coding Practices:**
- ✅ No eval() or Function() constructors
- ✅ No dangerouslySetInnerHTML
- ✅ Parameterized queries
- ✅ Secure random number generation
- ✅ Content Security Policy headers

**Dependencies:**
- ✅ Regular dependency updates
- ✅ Automated vulnerability scanning
- ✅ License compliance checking
- ✅ Minimal dependency footprint

### 6. Frontend Security

**Browser Security:**
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options header
- ✅ X-Content-Type-Options header
- ✅ Strict-Transport-Security header
- ✅ XSS protection headers

**Client-Side:**
- ✅ Input sanitization
- ✅ Output encoding
- ✅ Secure cookie settings
- ✅ No sensitive data in localStorage
- ✅ CORS properly configured

## Reporting a Vulnerability

### How to Report

If you discover a security vulnerability, please report it by:

1. **Email**: security@servicetag.example.com (replace with actual email)
2. **GitHub Security Advisory**: Use the "Security" tab in this repository

**Please DO NOT:**
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

## Security Scanning Tools

### 1. NPM Audit

**Purpose**: Detect known vulnerabilities in dependencies

**Usage:**
```bash
npm run security:audit
```

**Automated**: Runs on every push and daily

### 2. ESLint Security Plugin

**Purpose**: Detect security anti-patterns in code

**Usage:**
```bash
npm run lint:security
```

**Rules Enforced:**
- No eval() or Function()
- No unsafe regex
- No hardcoded secrets
- No dangerous React patterns
- Timing attack prevention

### 3. CodeQL

**Purpose**: Advanced static code analysis

**Automated**: Runs on every push

**Detects:**
- SQL injection
- XSS vulnerabilities
- Path traversal
- Command injection
- Insecure randomness

### 4. TruffleHog

**Purpose**: Detect exposed secrets and credentials

**Automated**: Runs on every push

**Scans For:**
- API keys
- Passwords
- Private keys
- OAuth tokens
- AWS credentials

### 5. Trivy

**Purpose**: Container vulnerability scanning

**Automated**: Runs on Docker builds

**Scans:**
- OS packages
- Application dependencies
- Known CVEs
- Misconfigurations

### 6. Snyk

**Purpose**: Comprehensive vulnerability scanning

**Automated**: Runs on every push

**Features:**
- Dependency vulnerabilities
- License compliance
- Container scanning
- IaC scanning

## Security Checklist

### Before Deployment

- [ ] All security scans pass
- [ ] No high/critical vulnerabilities
- [ ] Dependencies up to date
- [ ] Secrets not in code
- [ ] Environment variables configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Input validation tested
- [ ] Error handling doesn't leak info
- [ ] Logging doesn't contain sensitive data

### Regular Maintenance

- [ ] Weekly dependency updates
- [ ] Monthly security scan review
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Review access logs
- [ ] Update security policies

## Security Headers

The following security headers are configured in `nginx.conf`:

```nginx
# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Enforce HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.amazonaws.com" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Environment Variables

### Required Security Configuration

```bash
# AWS Configuration (use AWS Secrets Manager)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from-secrets-manager>
AWS_SECRET_ACCESS_KEY=<from-secrets-manager>

# Amplify Configuration (auto-generated)
# amplify_outputs.json contains non-sensitive config

# Never commit:
# - API keys
# - Passwords
# - Private keys
# - OAuth secrets
```

### Secrets Management

**Development:**
- Use `.env.local` (gitignored)
- Never commit `.env` files

**Production:**
- Use AWS Secrets Manager
- Use AWS Systems Manager Parameter Store
- Environment variables in App Runner/Amplify

## Incident Response

### In Case of Security Breach

1. **Immediate Actions:**
   - Isolate affected systems
   - Revoke compromised credentials
   - Enable additional logging
   - Notify security team

2. **Investigation:**
   - Review access logs
   - Identify scope of breach
   - Determine attack vector
   - Document findings

3. **Remediation:**
   - Patch vulnerabilities
   - Update credentials
   - Deploy fixes
   - Verify security

4. **Communication:**
   - Notify affected users
   - Report to authorities (if required)
   - Update security policies
   - Document lessons learned

## Compliance

### Standards Followed

- ✅ OWASP Top 10
- ✅ AWS Well-Architected Framework (Security Pillar)
- ✅ CIS Benchmarks
- ✅ NIST Cybersecurity Framework

### Regular Audits

- Code security reviews
- Dependency audits
- Infrastructure reviews
- Access control audits
- Penetration testing

## Security Training

### For Developers

- Secure coding practices
- OWASP Top 10 awareness
- AWS security best practices
- Incident response procedures

### Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Contact

For security concerns, contact:
- **Security Team**: security@servicetag.example.com
- **Emergency**: Use GitHub Security Advisory

## Acknowledgments

We appreciate the security research community and will acknowledge researchers who responsibly disclose vulnerabilities (with permission).

---

**Last Updated**: February 2026
**Next Review**: May 2026
