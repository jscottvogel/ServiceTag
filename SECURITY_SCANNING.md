# Security Scanning Guide

## Overview

This guide explains how to run security scans locally and understand the automated security pipeline for ServiceTag.

## Table of Contents

1. [Local Security Scans](#local-security-scans)
2. [Automated Security Pipeline](#automated-security-pipeline)
3. [Understanding Scan Results](#understanding-scan-results)
4. [Fixing Vulnerabilities](#fixing-vulnerabilities)
5. [Security Best Practices](#security-best-practices)

---

## Local Security Scans

### Quick Security Check

Run all security scans locally:

```bash
npm run security:scan
```

This runs:
1. NPM audit for dependency vulnerabilities
2. ESLint security rules
3. Better NPM audit for detailed analysis

### Individual Scans

#### 1. NPM Audit

**Check for dependency vulnerabilities:**

```bash
npm run security:audit
```

**Fix automatically (when possible):**

```bash
npm run security:fix
```

**Generate detailed report:**

```bash
npm audit --json > security-audit.json
```

#### 2. ESLint Security Rules

**Run security-focused linting:**

```bash
npm run lint:security
```

**Fix auto-fixable issues:**

```bash
npm run lint:security -- --fix
```

#### 3. Dependency Analysis

**Detailed vulnerability analysis:**

```bash
npm run security:deps
```

**Check for outdated packages:**

```bash
npm outdated
```

#### 4. License Compliance

**Check dependency licenses:**

```bash
npx license-checker --summary
```

**Detailed license report:**

```bash
npx license-checker --json > licenses.json
```

#### 5. Secret Scanning (Local)

**Install TruffleHog:**

```bash
# Using Docker
docker run --rm -v $(pwd):/repo trufflesecurity/trufflehog:latest filesystem /repo
```

**Scan git history:**

```bash
docker run --rm -v $(pwd):/repo trufflesecurity/trufflehog:latest git file:///repo --since-commit HEAD~10
```

---

## Automated Security Pipeline

### Triggers

Security scans run automatically:

1. **On every push** to main/develop
2. **On every pull request**
3. **Daily at 2 AM UTC** (scheduled)
4. **Before deployment** (pre-deploy hook)

### Pipeline Jobs

#### 1. Dependency Scan

**What it does:**
- Runs `npm audit`
- Checks for known vulnerabilities
- Generates audit report

**Severity Levels:**
- Critical (blocks deployment)
- High (blocks deployment)
- Moderate (warning)
- Low (info)

#### 2. Snyk Scan

**What it does:**
- Comprehensive vulnerability scanning
- License compliance checking
- Remediation suggestions

**Configuration:**
- Requires `SNYK_TOKEN` secret
- Threshold: High severity
- Generates JSON report

#### 3. CodeQL Analysis

**What it does:**
- Static code analysis
- Detects security vulnerabilities
- Finds code quality issues

**Languages Scanned:**
- JavaScript
- TypeScript

**Query Suites:**
- security-extended
- security-and-quality

#### 4. Secret Scanning

**What it does:**
- Scans for exposed secrets
- Checks git history
- Detects API keys, tokens, passwords

**Tool:** TruffleHog

**Scope:**
- All files in repository
- Git commit history
- Only verified secrets reported

#### 5. ESLint Security

**What it does:**
- Detects security anti-patterns
- Finds potential XSS vulnerabilities
- Identifies unsafe code patterns

**Rules Checked:**
- No eval()
- No unsafe regex
- No hardcoded secrets
- Timing attack prevention

#### 6. Docker Image Scan

**What it does:**
- Scans Docker images for vulnerabilities
- Checks OS packages
- Analyzes application dependencies

**Tool:** Trivy

**Severity:** Critical and High

#### 7. License Compliance

**What it does:**
- Verifies dependency licenses
- Ensures compliance with allowed licenses

**Allowed Licenses:**
- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC
- 0BSD

---

## Understanding Scan Results

### NPM Audit Output

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ High          │ Prototype Pollution                                          │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ lodash                                                       │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=4.17.21                                                    │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > lodash                                       │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1523                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

**Understanding:**
- **Severity**: Critical, High, Moderate, Low
- **Package**: Vulnerable package name
- **Patched in**: Version that fixes the issue
- **Path**: Dependency chain
- **More info**: Link to advisory

### CodeQL Results

**Viewing Results:**
1. Go to GitHub repository
2. Click "Security" tab
3. Click "Code scanning alerts"
4. Review each alert

**Alert Information:**
- Severity (Critical, High, Medium, Low)
- CWE classification
- Affected file and line
- Remediation advice

### ESLint Security Output

```
/src/components/Component.tsx
  45:10  error  Unexpected eval()  no-eval
  67:15  error  Unsafe regex detected  security/detect-unsafe-regex
```

**Understanding:**
- File path
- Line:Column number
- Severity (error/warning)
- Rule violated

---

## Fixing Vulnerabilities

### Dependency Vulnerabilities

#### Step 1: Identify the Issue

```bash
npm audit
```

#### Step 2: Try Automatic Fix

```bash
npm audit fix
```

#### Step 3: Manual Update (if needed)

```bash
# Update specific package
npm update package-name

# Update to specific version
npm install package-name@version
```

#### Step 4: Breaking Changes

If automatic fix causes breaking changes:

```bash
# Check what will be updated
npm audit fix --dry-run

# Update with force (may cause breaking changes)
npm audit fix --force
```

#### Step 5: No Fix Available

If no fix is available:

1. Check if you actually use the vulnerable code path
2. Consider alternative packages
3. Wait for maintainer to release fix
4. Fork and patch yourself (last resort)

### Code Vulnerabilities

#### XSS Prevention

**Bad:**
```typescript
<div dangerouslySetInnerHTML={{__html: userInput}} />
```

**Good:**
```typescript
<div>{userInput}</div>  // React auto-escapes
```

#### SQL Injection Prevention

**Bad:**
```typescript
const query = `SELECT * FROM users WHERE id = ${userId}`
```

**Good:**
```typescript
// Using DynamoDB (parameterized by default)
await client.models.User.get({ id: userId })
```

#### Timing Attacks

**Bad:**
```typescript
if (password === storedPassword) {
  // Vulnerable to timing attacks
}
```

**Good:**
```typescript
import { timingSafeEqual } from 'crypto'

if (timingSafeEqual(Buffer.from(password), Buffer.from(storedPassword))) {
  // Safe from timing attacks
}
```

### Exposed Secrets

#### If Secret is Committed

1. **Immediately revoke the secret**
   - Rotate API keys
   - Change passwords
   - Regenerate tokens

2. **Remove from git history**
```bash
# Use BFG Repo-Cleaner
bfg --delete-files secret-file.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

3. **Force push** (coordinate with team)
```bash
git push --force
```

4. **Update secret management**
   - Use environment variables
   - Use AWS Secrets Manager
   - Never commit secrets again

---

## Security Best Practices

### 1. Dependency Management

**Do:**
- ✅ Regularly update dependencies
- ✅ Review dependency changes
- ✅ Use exact versions in production
- ✅ Audit new dependencies

**Don't:**
- ❌ Use outdated packages
- ❌ Install unnecessary dependencies
- ❌ Ignore security warnings
- ❌ Use `npm audit fix --force` blindly

### 2. Secret Management

**Do:**
- ✅ Use environment variables
- ✅ Use AWS Secrets Manager
- ✅ Rotate secrets regularly
- ✅ Use different secrets per environment

**Don't:**
- ❌ Commit secrets to git
- ❌ Hardcode API keys
- ❌ Share secrets in chat/email
- ❌ Use same secrets everywhere

### 3. Input Validation

**Do:**
- ✅ Validate all user input
- ✅ Sanitize before use
- ✅ Use allowlists over denylists
- ✅ Validate on both client and server

**Don't:**
- ❌ Trust user input
- ❌ Use eval() with user data
- ❌ Construct SQL from user input
- ❌ Skip server-side validation

### 4. Authentication & Authorization

**Do:**
- ✅ Use AWS Cognito
- ✅ Implement MFA
- ✅ Use secure session management
- ✅ Enforce least privilege

**Don't:**
- ❌ Roll your own auth
- ❌ Store passwords in plaintext
- ❌ Use weak password policies
- ❌ Skip authorization checks

### 5. Error Handling

**Do:**
- ✅ Log errors securely
- ✅ Show user-friendly messages
- ✅ Monitor error rates
- ✅ Handle errors gracefully

**Don't:**
- ❌ Expose stack traces to users
- ❌ Log sensitive data
- ❌ Ignore errors silently
- ❌ Leak system information

---

## Security Scan Schedule

### Daily
- Automated dependency scan
- Secret scanning
- License compliance check

### On Code Changes
- ESLint security rules
- CodeQL analysis
- NPM audit

### Before Deployment
- Full security scan
- All tests must pass
- No high/critical vulnerabilities

### Monthly
- Manual security review
- Dependency updates
- Security policy review

### Quarterly
- Penetration testing
- Security audit
- Incident response drill

---

## Troubleshooting

### NPM Audit Issues

**Problem**: False positives

**Solution**:
```bash
# Generate audit report
npm audit --json > audit.json

# Review manually
# Add exceptions to .npmauditignore if needed
```

**Problem**: No fix available

**Solution**:
1. Check if vulnerability affects your code
2. Wait for upstream fix
3. Consider alternative package

### CodeQL Issues

**Problem**: Too many false positives

**Solution**:
- Review each alert carefully
- Add suppressions for false positives
- Improve code to fix real issues

### ESLint Security Issues

**Problem**: Rule too strict

**Solution**:
```javascript
// .eslintrc.security.cjs
rules: {
  'security/detect-object-injection': 'warn', // Downgrade to warning
}
```

---

## Resources

- [NPM Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk Documentation](https://docs.snyk.io/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)

---

**Remember**: Security is an ongoing process, not a one-time task. Run scans regularly and stay informed about new vulnerabilities.
