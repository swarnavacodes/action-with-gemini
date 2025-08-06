# 🎯 Custom Rule Engine Documentation

The Custom Rule Engine allows teams to define their own code quality, security, and performance rules that work alongside Gemini AI analysis.

## 🏗️ Architecture Overview

```
Custom Rule Engine
├── Rule Definitions (.kiro/rules/*.js)
├── Rule Engine (src/rule-engine.js)
├── Report Generator (src/report-generator.js)
└── Integration (src/index.js)
```

## 📁 Rule Configuration Structure

### Basic Rule File Structure
```javascript
// .kiro/rules/my-team-rules.js
module.exports = {
  team: 'my-team',
  description: 'Custom rules for my team',
  global_settings: {
    default_severity: 'medium',
    ignore_patterns: ['test/', 'spec/']
  },
  rules: {
    'rule-name': {
      category: 'security|performance|quality|style|compliance',
      severity: 'critical|high|medium|low|info',
      description: 'What this rule checks for',
      patterns: [/* regex patterns */],
      file_types: ['.js', '.ts'], // optional
      exceptions: ['test', 'demo'], // optional
      auto_fix: true, // optional
      fix_suggestion: 'How to fix this issue'
    }
  }
};
```

## 🔧 Rule Categories

### Security Rules
Focus on preventing vulnerabilities and security issues:
```javascript
'no-hardcoded-secrets': {
  category: 'security',
  severity: 'critical',
  description: 'Detects hardcoded secrets and API keys',
  patterns: [
    {
      pattern: '(api[_-]?key|password|secret)\\s*[=:]\\s*["\'][^"\'\\s]{8,}["\']',
      message: 'Hardcoded secret detected',
      fix_suggestion: 'Use environment variables instead'
    }
  ]
}
```

### Performance Rules
Identify performance bottlenecks and optimization opportunities:
```javascript
'no-inefficient-loops': {
  category: 'performance',
  severity: 'medium',
  description: 'Detects inefficient loop patterns',
  patterns: [
    {
      pattern: 'for\\s*\\([^)]*\\.length[^)]*\\)',
      message: 'Cache array length for better performance',
      fix_suggestion: 'for(let i = 0, len = arr.length; i < len; i++)'
    }
  ]
}
```

### Quality Rules
Ensure code maintainability and best practices:
```javascript
'require-error-handling': {
  category: 'quality',
  severity: 'high',
  description: 'Ensures async functions have error handling',
  patterns: [
    {
      pattern: 'async\\s+function[^{]*\\{(?![^}]*try)[^}]*await',
      message: 'Async function missing try-catch',
      fix_suggestion: 'Wrap async operations in try-catch blocks'
    }
  ]
}
```

## 🎨 Advanced Pattern Matching

### Complex Patterns
```javascript
'no-sql-injection': {
  patterns: [
    {
      pattern: '(query|execute)\\s*\\([^)]*\\$\\{[^}]+\\}',
      message: 'Potential SQL injection vulnerability',
      fix_suggestion: 'Use parameterized queries'
    }
  ],
  anti_patterns: [
    {
      pattern: 'sanitize\\s*\\(',
      message: 'Input appears to be sanitized'
    }
  ]
}
```

### File Type Restrictions
```javascript
'typescript-specific-rule': {
  file_types: ['.ts', '.tsx'],
  patterns: [/* TypeScript-specific patterns */]
}
```

### Exception Handling
```javascript
'no-console-logs': {
  patterns: [
    {
      pattern: 'console\\.log\\s*\\(',
      message: 'Console.log found'
    }
  ],
  exceptions: ['test', 'debug', 'development']
}
```

## 🔄 Custom Check Functions

For complex logic that can't be expressed with regex:

```javascript
'complex-validation-rule': {
  category: 'quality',
  severity: 'medium',
  description: 'Complex validation requiring custom logic',
  custom_check: async (code, filename, rule) => {
    const issues = [];
    
    // Custom analysis logic
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (/* custom condition */) {
        issues.push({
          line_number: index + 1,
          column: 1,
          message: 'Custom issue detected',
          matched_text: line.trim(),
          fix_suggestion: 'How to fix this'
        });
      }
    });
    
    return issues;
  }
}
```

## 📊 Severity Levels

| Severity | Description | Auto-Merge Impact |
|----------|-------------|-------------------|
| **critical** | Security vulnerabilities, data loss risks | ❌ Blocks merge |
| **high** | Performance issues, logic errors | ⚠️ Requires review |
| **medium** | Code quality, maintainability | ✅ Allows merge with warnings |
| **low** | Style issues, minor improvements | ✅ Allows merge |
| **info** | Suggestions, best practices | ✅ Informational only |

## 🎯 Team-Specific Configurations

### Backend Team Rules
```javascript
// .kiro/rules/backend-team.js
module.exports = {
  team: 'backend',
  rules: {
    'require-input-validation': {
      category: 'security',
      severity: 'high',
      patterns: [
        {
          pattern: 'app\\.(post|put)\\s*\\([^,]*,\\s*(?!.*validate)',
          message: 'API endpoint missing input validation'
        }
      ]
    },
    'no-synchronous-database': {
      category: 'performance',
      severity: 'high',
      patterns: [
        {
          pattern: '\\.(findSync|insertSync|updateSync)',
          message: 'Synchronous database operation'
        }
      ]
    }
  }
};
```

### Frontend Team Rules
```javascript
// .kiro/rules/frontend-team.js
module.exports = {
  team: 'frontend',
  rules: {
    'no-inline-styles': {
      category: 'style',
      severity: 'medium',
      patterns: [
        {
          pattern: 'style\\s*=\\s*["\'][^"\']*["\']',
          message: 'Inline styles detected'
        }
      ]
    },
    'require-accessibility': {
      category: 'quality',
      severity: 'high',
      patterns: [
        {
          pattern: '<(?:img|input|button)(?![^>]*(?:alt|aria-label|title))',
          message: 'Missing accessibility attributes'
        }
      ]
    }
  }
};
```

## 📈 Report Generation

### Available Report Types

#### PR Report
```javascript
const report = await reportGenerator.generatePRReport(
  reviewResult,
  ruleEngineResults,
  prData,
  options
);
```

#### Team Performance Report
```javascript
const teamReport = await reportGenerator.generateTeamReport(
  teamData,
  timeRange
);
```

#### Security Analysis Report
```javascript
const securityReport = await reportGenerator.generateSecurityReport(
  securityData,
  timeRange
);
```

### Export Formats

#### JSON Export
```javascript
await reportGenerator.exportReport(report, 'json', 'reports/pr-123.json');
```

#### HTML Export
```javascript
await reportGenerator.exportReport(report, 'html', 'reports/pr-123.html');
```

#### Markdown Export
```javascript
await reportGenerator.exportReport(report, 'markdown', 'reports/pr-123.md');
```

## 🔧 Configuration Examples

### Global Settings
```javascript
global_settings: {
  default_severity: 'medium',
  ignore_patterns: ['node_modules/', 'dist/', 'build/'],
  strict_mode: true,
  auto_fix_enabled: false
}
```

### Rule Inheritance
```javascript
// Base rules
const baseRules = require('./base-rules');

module.exports = {
  ...baseRules,
  team: 'specialized-team',
  rules: {
    ...baseRules.rules,
    'team-specific-rule': {
      // Team-specific rule definition
    }
  }
};
```

## 🚀 Best Practices

### 1. Start Simple
Begin with a few high-impact rules:
```javascript
module.exports = {
  team: 'starter',
  rules: {
    'no-hardcoded-secrets': { /* critical security */ },
    'require-error-handling': { /* high quality */ },
    'no-console-logs': { /* medium quality */ }
  }
};
```

### 2. Use Descriptive Names
```javascript
// ❌ Bad
'rule1': { /* unclear purpose */ }

// ✅ Good
'no-hardcoded-database-credentials': { /* clear purpose */ }
```

### 3. Provide Clear Fix Suggestions
```javascript
{
  pattern: 'Math\\.random\\s*\\(\\s*\\)',
  message: 'Math.random() is not cryptographically secure',
  fix_suggestion: 'Use crypto.randomBytes() for security-sensitive operations'
}
```

### 4. Test Your Rules
```javascript
// Test with sample code
const testCode = `
const apiKey = "hardcoded-secret-123";
console.log("Debug info");
`;

// Verify rule catches issues correctly
```

### 5. Use Appropriate Severity
- **Critical**: Security vulnerabilities, data corruption
- **High**: Performance issues, logic errors
- **Medium**: Code quality, maintainability
- **Low**: Style preferences, minor improvements

## 🔍 Debugging Rules

### Enable Debug Mode
```javascript
// In rule definition
debug: true,
verbose_logging: true
```

### Test Individual Rules
```javascript
const ruleEngine = new CustomRuleEngine();
await ruleEngine.loadRulesFromConfig();

const testResult = await ruleEngine.analyzeFile({
  filename: 'test.js',
  patch: 'your test code here'
});

console.log('Issues found:', testResult);
```

## 📚 Rule Library

### Pre-built Rule Sets
- **Security Rules**: `security-focused.js`
- **Performance Rules**: `performance-optimization.js`
- **Node.js Rules**: `nodejs-best-practices.js`
- **React Rules**: `react-patterns.js`
- **TypeScript Rules**: `typescript-quality.js`

### Community Rules
Share and discover rules:
- GitHub repository: `awesome-kiro-rules`
- Rule marketplace: `rules.kiro.dev`
- Team templates: `templates.kiro.dev`

## 🎯 Integration with CI/CD

### GitHub Actions Integration
The rule engine automatically integrates with your existing workflow:

```yaml
- name: Run Enhanced Code Review
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: npm start
```

### Custom Workflow Triggers
```yaml
on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'src/**'
      - '.kiro/rules/**'
```

## 📊 Metrics and Analytics

### Rule Effectiveness Tracking
- Issues caught per rule
- False positive rates
- Developer feedback scores
- Time to resolution

### Team Performance Metrics
- Code quality trends
- Security vulnerability prevention
- Performance optimization impact
- Compliance adherence

---

**Ready to create custom rules that fit your team's needs?** Start with the example configurations and gradually build your comprehensive rule set! 🎯