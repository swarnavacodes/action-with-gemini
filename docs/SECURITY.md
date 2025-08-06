# 🔒 Security Best Practices for Gemini API Key

## Current Security Measures

### ✅ GitHub Repository Secrets
- API key stored in encrypted GitHub secrets
- Only accessible during workflow execution
- Automatically masked in logs
- Not visible to repository collaborators

### ✅ Environment Variable Usage
- Key loaded via `process.env.GEMINI_API_KEY`
- Never hardcoded in source code
- Not committed to version control

## 🛡️ Enhanced Security Recommendations

### 1. API Key Restrictions (Google Cloud Console)

**Restrict by IP Address:**
```
- Go to Google Cloud Console → APIs & Services → Credentials
- Edit your API key
- Add IP restrictions to GitHub Actions IP ranges
```

**Restrict by API:**
```
- Limit to only "Generative Language API"
- Remove unnecessary API access
```

### 2. Key Rotation Policy

**Monthly Rotation:**
```bash
# Set calendar reminder to rotate key monthly
# Generate new key → Update GitHub secret → Delete old key
```

### 3. Monitoring and Alerts

**Usage Monitoring:**
- Monitor API usage in Google Cloud Console
- Set up billing alerts for unusual usage
- Review API logs regularly

### 4. Repository Access Control

**Limit Repository Access:**
- Only trusted collaborators should have admin access
- Use branch protection rules
- Require PR reviews for workflow changes

### 5. Audit Trail

**Regular Security Audits:**
- Review repository access logs
- Monitor secret access patterns
- Check for unauthorized workflow modifications

## 🚨 Security Incident Response

### If Key is Compromised:

1. **Immediate Actions:**
   ```bash
   # 1. Revoke the API key in Google Cloud Console
   # 2. Generate new API key
   # 3. Update GitHub repository secret
   # 4. Review recent API usage logs
   ```

2. **Investigation:**
   - Check repository access logs
   - Review recent commits and PRs
   - Audit workflow execution history

3. **Prevention:**
   - Rotate all related credentials
   - Review and tighten access controls
   - Update security policies

## 🔍 Security Checklist

- [ ] API key stored only in GitHub secrets
- [ ] Key restrictions enabled in Google Cloud
- [ ] Regular key rotation scheduled
- [ ] Usage monitoring configured
- [ ] Repository access properly controlled
- [ ] Incident response plan documented
- [ ] Team trained on security practices

## 🚫 What NOT to Do

❌ **Never:**
- Hardcode API keys in source code
- Commit `.env` files with real keys
- Share keys via chat/email
- Use the same key across multiple projects
- Grant unnecessary API permissions
- Skip key rotation

✅ **Always:**
- Use GitHub secrets for sensitive data
- Implement principle of least privilege
- Monitor API usage regularly
- Rotate keys periodically
- Keep security practices updated