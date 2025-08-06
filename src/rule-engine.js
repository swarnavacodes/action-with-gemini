// Custom Rule Engine for Gemini AI Code Reviewer
const fs = require('fs');
const path = require('path');

class CustomRuleEngine {
  constructor() {
    this.rules = new Map();
    this.ruleCategories = {
      SECURITY: 'security',
      PERFORMANCE: 'performance',
      QUALITY: 'quality',
      STYLE: 'style',
      COMPLIANCE: 'compliance'
    };
    this.severityLevels = {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
      INFO: 'info'
    };
    this.loadDefaultRules();
  }

  // Load rules from configuration files
  async loadRulesFromConfig(configPath = '.kiro/rules') {
    try {
      const rulesDir = path.resolve(configPath);
      
      if (!fs.existsSync(rulesDir)) {
        console.log('📁 Creating default rules directory...');
        fs.mkdirSync(rulesDir, { recursive: true });
        await this.createDefaultRuleFiles(rulesDir);
      }

      const ruleFiles = fs.readdirSync(rulesDir).filter(file => 
        file.endsWith('.js') || file.endsWith('.json')
      );

      for (const file of ruleFiles) {
        const filePath = path.join(rulesDir, file);
        try {
          let ruleConfig;
          
          if (file.endsWith('.js')) {
            // Clear require cache to allow hot reloading
            delete require.cache[require.resolve(filePath)];
            ruleConfig = require(filePath);
          } else {
            const content = fs.readFileSync(filePath, 'utf8');
            ruleConfig = JSON.parse(content);
          }

          this.loadRuleSet(ruleConfig, file);
          console.log(`✅ Loaded rules from ${file}`);
        } catch (error) {
          console.error(`❌ Error loading rules from ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error loading rule configuration:', error.message);
      console.log('📋 Using default rules only');
    }
  }

  // Load a rule set into the engine
  loadRuleSet(ruleConfig, source = 'default') {
    const { team, rules, global_settings } = ruleConfig;
    
    if (global_settings) {
      this.applyGlobalSettings(global_settings);
    }

    Object.entries(rules || {}).forEach(([ruleName, ruleDefinition]) => {
      const rule = this.createRule(ruleName, ruleDefinition, team, source);
      this.rules.set(ruleName, rule);
    });
  }

  // Create a rule object from definition
  createRule(name, definition, team, source) {
    return {
      name,
      team,
      source,
      category: definition.category || this.ruleCategories.QUALITY,
      severity: definition.severity || this.severityLevels.MEDIUM,
      description: definition.description || `Custom rule: ${name}`,
      patterns: definition.patterns || [],
      anti_patterns: definition.anti_patterns || [],
      file_types: definition.file_types || ['*'],
      exceptions: definition.exceptions || [],
      auto_fix: definition.auto_fix || false,
      fix_suggestion: definition.fix_suggestion || '',
      enabled: definition.enabled !== false,
      custom_check: definition.custom_check || null,
      metadata: {
        created_by: team || 'system',
        created_at: new Date().toISOString(),
        tags: definition.tags || []
      }
    };
  }

  // Apply rules to code changes
  async analyzeCodeChanges(codeChanges, prData) {
    const results = {
      total_issues: 0,
      issues_by_severity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      issues_by_category: {
        security: 0,
        performance: 0,
        quality: 0,
        style: 0,
        compliance: 0
      },
      rule_violations: [],
      files_analyzed: 0,
      rules_applied: 0
    };

    for (const change of codeChanges) {
      if (change.status === 'removed') continue;
      
      results.files_analyzed++;
      const fileIssues = await this.analyzeFile(change);
      
      fileIssues.forEach(issue => {
        results.total_issues++;
        results.issues_by_severity[issue.severity]++;
        results.issues_by_category[issue.category]++;
        results.rule_violations.push({
          ...issue,
          file: change.filename,
          pr_number: prData.number,
          timestamp: new Date().toISOString()
        });
      });
    }

    results.rules_applied = this.rules.size;
    return results;
  }

  // Analyze a single file
  async analyzeFile(fileChange) {
    const issues = [];
    const { filename, patch } = fileChange;

    for (const [ruleName, rule] of this.rules) {
      if (!rule.enabled) continue;
      if (!this.shouldApplyRule(rule, filename)) continue;

      try {
        const ruleIssues = await this.applyRule(rule, patch, filename);
        issues.push(...ruleIssues);
      } catch (error) {
        console.error(`❌ Error applying rule ${ruleName}:`, error.message);
      }
    }

    return issues;
  }

  // Check if rule should apply to file
  shouldApplyRule(rule, filename) {
    // Check file type restrictions
    if (rule.file_types.length > 0 && !rule.file_types.includes('*')) {
      const fileExt = path.extname(filename);
      const matchesType = rule.file_types.some(type => 
        filename.endsWith(type) || fileExt === type
      );
      if (!matchesType) return false;
    }

    // Check exceptions
    if (rule.exceptions.length > 0) {
      const matchesException = rule.exceptions.some(exception => 
        filename.includes(exception)
      );
      if (matchesException) return false;
    }

    return true;
  }

  // Apply a single rule to code
  async applyRule(rule, code, filename) {
    const issues = [];

    // Apply pattern-based checks
    for (const pattern of rule.patterns) {
      const regex = new RegExp(pattern.pattern || pattern, pattern.flags || 'gi');
      let match;
      
      while ((match = regex.exec(code)) !== null) {
        // Check if this match should be ignored
        if (this.shouldIgnoreMatch(match, rule, code)) continue;

        issues.push({
          rule_name: rule.name,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          message: pattern.message || `Pattern violation: ${pattern.pattern || pattern}`,
          line_number: this.getLineNumber(code, match.index),
          column: this.getColumnNumber(code, match.index),
          matched_text: match[0],
          fix_suggestion: rule.fix_suggestion || pattern.fix_suggestion,
          auto_fix: rule.auto_fix && pattern.auto_fix,
          metadata: rule.metadata
        });
      }
    }

    // Apply custom check function if provided
    if (rule.custom_check && typeof rule.custom_check === 'function') {
      try {
        const customIssues = await rule.custom_check(code, filename, rule);
        if (Array.isArray(customIssues)) {
          issues.push(...customIssues.map(issue => ({
            ...issue,
            rule_name: rule.name,
            category: rule.category,
            severity: rule.severity,
            metadata: rule.metadata
          })));
        }
      } catch (error) {
        console.error(`❌ Custom check error for rule ${rule.name}:`, error.message);
      }
    }

    return issues;
  }

  // Check if a match should be ignored
  shouldIgnoreMatch(match, rule, code) {
    // Check anti-patterns
    for (const antiPattern of rule.anti_patterns) {
      const antiRegex = new RegExp(antiPattern.pattern || antiPattern, antiPattern.flags || 'gi');
      if (antiRegex.test(match[0])) {
        return true;
      }
    }

    // Check for inline ignore comments
    const lineStart = code.lastIndexOf('\n', match.index) + 1;
    const lineEnd = code.indexOf('\n', match.index);
    const line = code.substring(lineStart, lineEnd === -1 ? code.length : lineEnd);
    
    if (line.includes(`// kiro-ignore: ${rule.name}`) || 
        line.includes(`/* kiro-ignore: ${rule.name} */`)) {
      return true;
    }

    return false;
  }

  // Get line number from string index
  getLineNumber(text, index) {
    return text.substring(0, index).split('\n').length;
  }

  // Get column number from string index
  getColumnNumber(text, index) {
    const lineStart = text.lastIndexOf('\n', index) + 1;
    return index - lineStart + 1;
  }

  // Load default built-in rules
  loadDefaultRules() {
    const defaultRules = {
      team: 'system',
      rules: {
        'no-hardcoded-secrets': {
          category: this.ruleCategories.SECURITY,
          severity: this.severityLevels.CRITICAL,
          description: 'Detects hardcoded secrets, API keys, and passwords',
          patterns: [
            {
              pattern: '(api[_-]?key|password|secret|token)\\s*[=:]\\s*["\'][^"\'\\s]{8,}["\']',
              message: 'Hardcoded secret detected. Use environment variables instead.',
              fix_suggestion: 'Replace with process.env.YOUR_SECRET_NAME'
            }
          ],
          file_types: ['.js', '.ts', '.py', '.java', '.go'],
          exceptions: ['test', 'example', 'demo']
        },
        'sql-injection-risk': {
          category: this.ruleCategories.SECURITY,
          severity: this.severityLevels.CRITICAL,
          description: 'Detects potential SQL injection vulnerabilities',
          patterns: [
            {
              pattern: '(query|execute)\\s*\\([^)]*\\$\\{[^}]+\\}',
              message: 'Potential SQL injection. Use parameterized queries.',
              fix_suggestion: 'Use parameterized queries or prepared statements'
            }
          ]
        },
        'missing-error-handling': {
          category: this.ruleCategories.QUALITY,
          severity: this.severityLevels.HIGH,
          description: 'Detects async functions without proper error handling',
          patterns: [
            {
              pattern: 'async\\s+function[^{]*\\{[^}]*await[^}]*\\}',
              message: 'Async function missing try-catch block',
              fix_suggestion: 'Wrap async operations in try-catch blocks'
            }
          ]
        },
        'console-log-in-production': {
          category: this.ruleCategories.QUALITY,
          severity: this.severityLevels.MEDIUM,
          description: 'Detects console.log statements that should be removed',
          patterns: [
            {
              pattern: 'console\\.(log|debug|info)\\s*\\(',
              message: 'Console statement found. Use proper logging library.',
              fix_suggestion: 'Replace with logger.info() or remove for production'
            }
          ],
          exceptions: ['test', 'spec', 'debug']
        }
      }
    };

    this.loadRuleSet(defaultRules, 'built-in');
  }

  // Create default rule files
  async createDefaultRuleFiles(rulesDir) {
    const securityRules = {
      team: 'security',
      description: 'Security-focused rules for preventing vulnerabilities',
      rules: {
        'no-eval-usage': {
          category: 'security',
          severity: 'critical',
          description: 'Prevents use of eval() function which can lead to code injection',
          patterns: [
            {
              pattern: '\\beval\\s*\\(',
              message: 'eval() usage detected. This can lead to code injection vulnerabilities.',
              fix_suggestion: 'Use JSON.parse() for JSON data or find alternative approach'
            }
          ]
        },
        'require-https': {
          category: 'security',
          severity: 'high',
          description: 'Ensures HTTPS is used for external requests',
          patterns: [
            {
              pattern: 'http://(?!localhost|127\\.0\\.0\\.1)',
              message: 'HTTP URL detected. Use HTTPS for security.',
              fix_suggestion: 'Replace http:// with https://'
            }
          ]
        },
        'weak-crypto': {
          category: 'security',
          severity: 'high',
          description: 'Detects weak cryptographic algorithms',
          patterns: [
            {
              pattern: '(md5|sha1)\\s*\\(',
              message: 'Weak cryptographic algorithm detected.',
              fix_suggestion: 'Use SHA-256 or stronger algorithms'
            }
          ]
        }
      }
    };

    const performanceRules = {
      team: 'performance',
      description: 'Performance optimization rules',
      rules: {
        'inefficient-loop': {
          category: 'performance',
          severity: 'medium',
          description: 'Detects potentially inefficient loop patterns',
          patterns: [
            {
              pattern: 'for\\s*\\([^)]*\\.length[^)]*\\)',
              message: 'Loop with .length in condition. Cache length for better performance.',
              fix_suggestion: 'Cache array length: for(let i = 0, len = arr.length; i < len; i++)'
            }
          ]
        },
        'synchronous-file-operations': {
          category: 'performance',
          severity: 'high',
          description: 'Detects synchronous file operations that block event loop',
          patterns: [
            {
              pattern: 'fs\\.(readFileSync|writeFileSync|existsSync)',
              message: 'Synchronous file operation detected. Use async version.',
              fix_suggestion: 'Use fs.promises or async versions with await'
            }
          ]
        }
      }
    };

    // Write rule files
    fs.writeFileSync(
      path.join(rulesDir, 'security-rules.js'),
      `module.exports = ${JSON.stringify(securityRules, null, 2)};`
    );

    fs.writeFileSync(
      path.join(rulesDir, 'performance-rules.js'),
      `module.exports = ${JSON.stringify(performanceRules, null, 2)};`
    );

    console.log('📝 Created default rule files in .kiro/rules/');
  }

  // Apply global settings
  applyGlobalSettings(settings) {
    if (settings.default_severity) {
      this.defaultSeverity = settings.default_severity;
    }
    if (settings.ignore_patterns) {
      this.globalIgnorePatterns = settings.ignore_patterns;
    }
  }

  // Get rule statistics
  getRuleStats() {
    const stats = {
      total_rules: this.rules.size,
      by_category: {},
      by_severity: {},
      by_team: {},
      enabled_rules: 0
    };

    for (const rule of this.rules.values()) {
      // Count by category
      stats.by_category[rule.category] = (stats.by_category[rule.category] || 0) + 1;
      
      // Count by severity
      stats.by_severity[rule.severity] = (stats.by_severity[rule.severity] || 0) + 1;
      
      // Count by team
      stats.by_team[rule.team] = (stats.by_team[rule.team] || 0) + 1;
      
      // Count enabled rules
      if (rule.enabled) stats.enabled_rules++;
    }

    return stats;
  }
}

module.exports = CustomRuleEngine;