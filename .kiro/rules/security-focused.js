// Security-Focused Rules
module.exports = {
  team: 'security',
  description: 'Comprehensive security rules for all teams',
  global_settings: {
    default_severity: 'high',
    strict_mode: true
  },
  rules: {
    'no-eval-or-function-constructor': {
      category: 'security',
      severity: 'critical',
      description: 'Prevents use of eval() and Function constructor',
      patterns: [
        {
          pattern: '\\beval\\s*\\(',
          message: 'eval() usage detected - major security risk',
          fix_suggestion: 'Use JSON.parse() for JSON data or find alternative approach'
        },
        {
          pattern: 'new\\s+Function\\s*\\(',
          message: 'Function constructor usage detected - security risk',
          fix_suggestion: 'Use predefined functions or safer alternatives'
        }
      ]
    },

    'no-insecure-protocols': {
      category: 'security',
      severity: 'high',
      description: 'Ensures secure protocols are used',
      patterns: [
        {
          pattern: 'http://(?!localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)',
          message: 'Insecure HTTP protocol detected',
          fix_suggestion: 'Use HTTPS for all external communications'
        },
        {
          pattern: 'ftp://',
          message: 'Insecure FTP protocol detected',
          fix_suggestion: 'Use SFTP or FTPS for secure file transfers'
        }
      ]
    },

    'no-weak-cryptography': {
      category: 'security',
      severity: 'critical',
      description: 'Prevents use of weak cryptographic algorithms',
      patterns: [
        {
          pattern: '(md5|sha1)\\s*\\(',
          message: 'Weak cryptographic algorithm detected',
          fix_suggestion: 'Use SHA-256, SHA-3, or bcrypt for hashing'
        },
        {
          pattern: 'crypto\\.createCipher\\s*\\(',
          message: 'Deprecated cipher method detected',
          fix_suggestion: 'Use crypto.createCipherGCM() or similar secure methods'
        }
      ]
    },

    'no-hardcoded-secrets-comprehensive': {
      category: 'security',
      severity: 'critical',
      description: 'Comprehensive detection of hardcoded secrets',
      patterns: [
        {
          pattern: '(api[_-]?key|password|secret|token|private[_-]?key)\\s*[=:]\\s*["\'][^"\'\\s]{8,}["\']',
          message: 'Hardcoded secret detected',
          fix_suggestion: 'Use environment variables or secure key management'
        },
        {
          pattern: '(aws[_-]?access[_-]?key|aws[_-]?secret)\\s*[=:]\\s*["\'][A-Z0-9]{20}["\']',
          message: 'AWS credentials hardcoded',
          fix_suggestion: 'Use AWS IAM roles or environment variables'
        },
        {
          pattern: 'sk-[a-zA-Z0-9]{48}',
          message: 'OpenAI API key detected',
          fix_suggestion: 'Move to environment variables'
        }
      ]
    },

    'no-path-traversal': {
      category: 'security',
      severity: 'critical',
      description: 'Prevents path traversal vulnerabilities',
      patterns: [
        {
          pattern: 'fs\\.(readFile|writeFile|unlink)\\s*\\([^,]*\\.\\./',
          message: 'Potential path traversal vulnerability',
          fix_suggestion: 'Validate and sanitize file paths'
        },
        {
          pattern: 'path\\.join\\s*\\([^)]*\\.\\./',
          message: 'Path traversal in path.join()',
          fix_suggestion: 'Use path.resolve() and validate paths'
        }
      ]
    },

    'no-command-injection': {
      category: 'security',
      severity: 'critical',
      description: 'Prevents command injection vulnerabilities',
      patterns: [
        {
          pattern: 'exec\\s*\\([^,]*\\$\\{[^}]+\\}',
          message: 'Potential command injection vulnerability',
          fix_suggestion: 'Use execFile() with array arguments or validate input'
        },
        {
          pattern: 'spawn\\s*\\([^,]*\\+[^,]*\\+',
          message: 'Command injection risk in spawn()',
          fix_suggestion: 'Use array arguments instead of string concatenation'
        }
      ]
    },

    'require-content-security-policy': {
      category: 'security',
      severity: 'high',
      description: 'Ensures Content Security Policy is configured',
      patterns: [
        {
          pattern: 'res\\.setHeader\\s*\\(["\']Content-Security-Policy["\']',
          message: 'CSP header found - verify it\'s restrictive enough'
        }
      ],
      anti_patterns: [
        {
          pattern: 'unsafe-inline|unsafe-eval|\\*',
          message: 'CSP contains unsafe directives'
        }
      ]
    },

    'no-sensitive-data-in-logs': {
      category: 'security',
      severity: 'high',
      description: 'Prevents logging of sensitive information',
      patterns: [
        {
          pattern: 'log[^(]*\\([^)]*(?:password|token|key|secret|ssn|credit)',
          message: 'Potential sensitive data in logs',
          fix_suggestion: 'Remove or mask sensitive data before logging'
        }
      ]
    },

    'require-input-sanitization': {
      category: 'security',
      severity: 'high',
      description: 'Ensures user input is sanitized',
      patterns: [
        {
          pattern: 'req\\.(body|query|params)\\.[^\\s]*(?!.*sanitize)(?!.*validate)(?!.*escape)',
          message: 'User input used without sanitization',
          fix_suggestion: 'Sanitize and validate all user inputs'
        }
      ]
    },

    'no-insecure-random': {
      category: 'security',
      severity: 'medium',
      description: 'Prevents use of insecure random number generation',
      patterns: [
        {
          pattern: 'Math\\.random\\s*\\(\\s*\\)',
          message: 'Math.random() is not cryptographically secure',
          fix_suggestion: 'Use crypto.randomBytes() for security-sensitive operations'
        }
      ]
    },

    'require-secure-session-config': {
      category: 'security',
      severity: 'high',
      description: 'Ensures secure session configuration',
      patterns: [
        {
          pattern: 'session\\s*\\(\\s*\\{[^}]*secure\\s*:\\s*false',
          message: 'Session configured without secure flag',
          fix_suggestion: 'Set secure: true for HTTPS environments'
        },
        {
          pattern: 'session\\s*\\(\\s*\\{[^}]*httpOnly\\s*:\\s*false',
          message: 'Session configured without httpOnly flag',
          fix_suggestion: 'Set httpOnly: true to prevent XSS attacks'
        }
      ]
    },

    'no-debug-code-in-production': {
      category: 'security',
      severity: 'medium',
      description: 'Prevents debug code in production',
      patterns: [
        {
          pattern: 'debugger\\s*;',
          message: 'Debugger statement found',
          fix_suggestion: 'Remove debugger statements before production'
        },
        {
          pattern: 'console\\.trace\\s*\\(',
          message: 'Console.trace() found - may expose stack traces',
          fix_suggestion: 'Remove or replace with proper logging'
        }
      ]
    }
  }
};