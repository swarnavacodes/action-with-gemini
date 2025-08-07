# 🔍 Viewing Reports in GitHub Actions Pipeline

This guide shows you exactly where and how to view code review reports during and after pipeline execution.

## 📍 **Report Locations in Pipeline**

### **1. 🔍 Real-time Logs (Actions Tab)**

**Location:** GitHub Repository → Actions → Workflow Run → Job Logs

**What you'll see:**
```
📋 Loaded 41 custom rules
🔍 Running custom rule analysis...
📊 Rule engine found 12 issues
🤖 Running Gemini AI analysis...
📄 Generating comprehensive report...

================================================================================
🤖 GEMINI AI CODE REVIEW - PIPELINE SUMMARY
================================================================================

📊 OVERALL ASSESSMENT
----------------------------------------
Status: ❌ NEEDS CHANGES
Overall Score: 4/10
Review Duration: 2.3s
Files Analyzed: 3
Rules Applied: 41

🛡️ SECURITY ANALYSIS
----------------------------------------
Security Score: 3/10
Critical Vulnerabilities: 2
Compliance Status: NON_COMPLIANT

📈 ISSUE BREAKDOWN
----------------------------------------
By Severity:
  🚨 CRITICAL: 2
  ⚠️ HIGH: 3
  📝 MEDIUM: 5

🚨 CRITICAL ACTION ITEMS
----------------------------------------
Must Fix (Critical & High Priority):
  1. no-hardcoded-secrets in api-service.js:15
     Hardcoded API key detected
  2. sql-injection-risk in database.js:23
     SQL injection vulnerability detected

✅ Review completed in 2.3s
```

### **2. 📊 GitHub Actions Step Summary**

**Location:** Actions → Workflow Run → Summary Tab

**What you'll see:**
```markdown
## 🤖 Gemini AI Code Review Summary

### 📊 Overall Assessment
- **Status**: ❌ NEEDS CHANGES
- **Score**: 4/10
- **Duration**: 2.3s

### 🛡️ Security Analysis
- **Security Score**: 3/10
- **Critical Vulnerabilities**: 2
- **Compliance**: NON_COMPLIANT

### 📈 Issue Summary
| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Medium | 5 |
| Low | 1 |

### 📄 Reports Generated
- 📊 JSON Report: `reports/pr-123-report.json`
- 🌐 HTML Report: `reports/pr-123-report.html`
- 📝 Markdown Report: `reports/pr-123-report.md`
```

### **3. 📁 Downloadable Artifacts**

**Location:** Actions → Workflow Run → Artifacts Section

**Available Downloads:**
- `code-review-reports-pr-123.zip` containing:
  - `reports/pr-123-report.json` (structured data)
  - `reports/pr-123-report.html` (web report)
  - `reports/pr-123-report.md` (markdown report)
  - `test-report.json` (test data)

### **4. 💬 PR Comments**

**Location:** Pull Request → Conversation Tab

**Enhanced Review Comment:**
```markdown
## 🤖 Enhanced AI Code Review

**Status:** ❌ NEEDS CHANGES
**Overall Score:** 4/10
**Review Duration:** 2.3s

### 📊 Analysis Summary
- **Files Analyzed:** 3
- **Rules Applied:** 41
- **Total Issues Found:** 12

### 🛡️ Security Analysis
- **Security Score:** 3/10
- **Critical Vulnerabilities:** 2
- **Compliance Status:** NON_COMPLIANT

### 🚨 Must Fix (Critical & High Priority):
- **no-hardcoded-secrets** in `api-service.js` (Line 15): Hardcoded API key detected
- **sql-injection-risk** in `database.js` (Line 23): SQL injection vulnerability

### 📄 Detailed Reports
- 📊 **JSON Report:** `reports/pr-123-report.json`
- 🌐 **HTML Report:** `reports/pr-123-report.html`
- 📝 **Markdown Report:** `reports/pr-123-report.md`
```

## 🎯 **Step-by-Step: How to Access Reports**

### **During Pipeline Execution**

1. **Go to Actions Tab**
   - Navigate to your repository
   - Click "Actions" tab
   - Click on the running workflow

2. **View Real-time Logs**
   - Click on the "review" job
   - Expand "Run Gemini PR Review" step
   - See detailed analysis logs in real-time

3. **Check Step Summary**
   - Scroll to top of job page
   - Look for "Summary" section
   - See formatted report summary

### **After Pipeline Completion**

1. **Download Artifacts**
   - Go to completed workflow run
   - Scroll to "Artifacts" section
   - Download `code-review-reports-pr-{number}.zip`
   - Extract and open HTML report in browser

2. **View PR Comments**
   - Go to the Pull Request
   - Scroll to see the enhanced AI review comment
   - Click on report links for detailed analysis

3. **Access Logs Anytime**
   - Actions → Workflow Run → Job → Logs
   - All analysis details are preserved

## 📊 **Report Format Examples**

### **Pipeline Log Format**
```
================================================================================
🤖 GEMINI AI CODE REVIEW - PIPELINE SUMMARY
================================================================================

📊 OVERALL ASSESSMENT
Status: ❌ NEEDS CHANGES
Overall Score: 4/10

🛡️ SECURITY ANALYSIS
Security Score: 3/10
Critical Vulnerabilities: 2

🚨 CRITICAL ACTION ITEMS
1. no-hardcoded-secrets in api-service.js:15
2. sql-injection-risk in database.js:23
================================================================================
```

### **Step Summary Format**
```markdown
## 🤖 Gemini AI Code Review Summary

### 📊 Overall Assessment
- **Status**: ❌ NEEDS CHANGES
- **Score**: 4/10

### 📈 Issue Summary
| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
```

### **Artifact Contents**
```
code-review-reports-pr-123.zip
├── reports/
│   ├── pr-123-report.json     # 📊 API data
│   ├── pr-123-report.html     # 🌐 Web report
│   └── pr-123-report.md       # 📝 GitHub format
└── test-report.json           # 🧪 Test data
```

## 🔧 **Customizing Pipeline Reports**

### **Enhanced Logging**
Add to your workflow:
```yaml
- name: Custom Report Display
  run: |
    echo "🎯 Custom Analysis Results:"
    node scripts/pipeline-reporter.js summary
```

### **Slack/Teams Integration**
```yaml
- name: Send Report to Slack
  if: always()
  run: |
    REPORT_SUMMARY=$(node scripts/pipeline-reporter.js step-summary)
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -H 'Content-type: application/json' \
      --data "{\"text\":\"$REPORT_SUMMARY\"}"
```

### **Email Reports**
```yaml
- name: Email Report Summary
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.MAIL_USERNAME }}
    password: ${{ secrets.MAIL_PASSWORD }}
    subject: "Code Review Failed - PR #${{ github.event.number }}"
    body: file://reports/pr-${{ github.event.number }}-report.md
```

## 🚀 **Quick Access Commands**

### **Local Testing**
```bash
# Generate test reports
npm run generate-report

# View pipeline-style summary
node scripts/pipeline-reporter.js summary

# Generate step summary
node scripts/pipeline-reporter.js step-summary
```

### **Pipeline Debugging**
```bash
# In GitHub Actions, add this step:
- name: Debug Reports
  run: |
    ls -la reports/
    cat reports/pr-${{ github.event.number }}-report.json | jq '.summary'
```

## 📈 **Report Retention**

### **Artifact Retention**
- **Default**: 30 days
- **Configurable** in workflow
- **Downloadable** anytime during retention period

### **Log Retention**
- **Default**: 90 days for public repos, 400 days for private
- **Always accessible** during retention period
- **Searchable** within GitHub interface

## 🎯 **Best Practices**

### **For Developers**
1. **Check Step Summary first** - Quick overview
2. **Read PR comments** - Detailed analysis
3. **Download artifacts** - Offline analysis
4. **Review logs** - Debugging issues

### **For Teams**
1. **Set up notifications** - Slack/Teams integration
2. **Archive important reports** - Download before expiry
3. **Create dashboards** - Aggregate report data
4. **Monitor trends** - Track improvement over time

---

**Your reports are now visible at every stage of the pipeline!** 🎉

The enhanced pipeline reporting provides comprehensive visibility into code quality analysis, making it easy to track issues, monitor improvements, and ensure code standards are met. 📊🚀