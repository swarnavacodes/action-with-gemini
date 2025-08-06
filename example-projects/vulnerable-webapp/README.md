# ⚠️ Vulnerable Web Application (Testing Only)

This directory contains **intentionally vulnerable code** designed to test the Gemini AI code reviewer's security analysis capabilities.

## 🚨 **WARNING: DO NOT USE IN PRODUCTION**

This code contains serious security vulnerabilities and should only be used for testing the AI reviewer system.

## 📁 File Structure

```
vulnerable-webapp/
├── express-api/              # Express.js API with vulnerabilities
│   ├── app.js               # Main API with injection flaws
│   ├── package.json         # Dependencies
│   └── users.json           # Sample data
├── auth-service.js          # Authentication with security flaws
├── payment-service.js       # Payment processing vulnerabilities
├── database-utils.js        # Database security issues
├── user-controller.js       # User management problems
└── data-processor.js        # Code quality issues
```

## 🔒 Security Vulnerabilities Included

### Critical Issues
- **Hardcoded API keys and secrets**
- **SQL injection vulnerabilities**
- **Plain text password storage**
- **Missing authentication/authorization**
- **Path traversal attacks**
- **Information disclosure**

### Performance Issues
- **N+1 query problems**
- **Inefficient algorithms (O(n²))**
- **Memory leaks**
- **Synchronous blocking operations**
- **Missing connection pooling**

### Code Quality Problems
- **Missing input validation**
- **Poor error handling**
- **Inconsistent naming**
- **Missing documentation**
- **Race conditions**

## 🧪 Testing the AI Reviewer

1. **Make changes** to any file in this directory
2. **Commit and push** to a new branch
3. **Create a PR** on GitHub
4. **Watch the AI** identify the security issues

## 📊 Expected AI Detection

The Gemini AI should identify:
- ✅ **20+ security vulnerabilities**
- ✅ **10+ performance issues**
- ✅ **15+ code quality problems**
- ✅ **Specific improvement suggestions**
- ✅ **Low approval score (2-4/10)**

## 🎯 Use Cases

- **Testing AI reviewer accuracy**
- **Demonstrating security analysis**
- **Training security awareness**
- **Benchmarking detection capabilities**
- **Validating workflow functionality**

---

**Remember: This is intentionally bad code for testing purposes only!** 🛡️