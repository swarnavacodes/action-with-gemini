// Backend Team Custom Rules
module.exports = {
  team: 'backend',
  description: 'Custom rules for backend development team',
  global_settings: {
    default_severity: 'medium',
    ignore_patterns: ['test/', 'spec/', '__tests__/']
  },
  rules: {
    'no-hardcoded-database-credentials': {
      category: 'security',
      severity: 'critical',
      description: 'Prevents hardcoded database credentials',
      patterns: [
        {
          pattern: '(mongodb://|mysql://|postgresql://)[^\\s]*:[^\\s]*@',
          message: 'Hardcoded database credentials detected. Use environment variables.',
          fix_suggestion: 'Use process.env.DATABASE_URL instead'
        }
      ],
      file_types: ['.js', '.ts', '.py'],
      exceptions: ['example', 'test', 'demo']
    },

    'require-async-error-handling': {
      category: 'quality',
      severity: 'high',
      description: 'Ensures async functions have proper error handling',
      patterns: [
        {
          pattern: 'async\\s+function[^{]*\\{(?![^}]*try)[^}]*await[^}]*\\}',
          message: 'Async function missing try-catch block',
          fix_suggestion: 'Wrap async operations in try-catch blocks'
        }
      ],
      auto_fix: false
    },

    'no-synchronous-database-operations': {
      category: 'performance',
      severity: 'high',
      description: 'Prevents synchronous database operations that block event loop',
      patterns: [
        {
          pattern: '\\.(findSync|insertSync|updateSync|deleteSync)\\s*\\(',
          message: 'Synchronous database operation detected',
          fix_suggestion: 'Use async version with await'
        }
      ]
    },

    'require-input-validation': {
      category: 'security',
      severity: 'high',
      description: 'Ensures API endpoints validate input parameters',
      patterns: [
        {
          pattern: 'app\\.(get|post|put|delete)\\s*\\([^,]*,\\s*(?!.*validate)[^{]*\\{',
          message: 'API endpoint missing input validation',
          fix_suggestion: 'Add validation middleware or input sanitization'
        }
      ],
      file_types: ['.js', '.ts']
    },

    'no-console-in-production': {
      category: 'quality',
      severity: 'medium',
      description: 'Prevents console statements in production code',
      patterns: [
        {
          pattern: 'console\\.(log|debug|info|warn)\\s*\\(',
          message: 'Console statement found. Use proper logging library.',
          fix_suggestion: 'Replace with logger.info() or remove for production'
        }
      ],
      exceptions: ['development', 'test', 'debug'],
      auto_fix: true
    },

    'require-rate-limiting': {
      category: 'security',
      severity: 'medium',
      description: 'Ensures API endpoints have rate limiting',
      patterns: [
        {
          pattern: 'app\\.(post|put|delete)\\s*\\([^,]*,\\s*(?!.*rateLimit)[^{]*\\{',
          message: 'API endpoint missing rate limiting',
          fix_suggestion: 'Add rate limiting middleware for write operations'
        }
      ]
    },

    'no-weak-jwt-secrets': {
      category: 'security',
      severity: 'critical',
      description: 'Prevents weak JWT secrets',
      patterns: [
        {
          pattern: 'jwt\\.sign\\s*\\([^,]*,\\s*["\'][^"\']{1,15}["\']',
          message: 'Weak JWT secret detected (less than 16 characters)',
          fix_suggestion: 'Use a strong secret (32+ characters) from environment variables'
        }
      ]
    },

    'require-cors-configuration': {
      category: 'security',
      severity: 'medium',
      description: 'Ensures CORS is properly configured',
      patterns: [
        {
          pattern: 'app\\.use\\s*\\(\\s*cors\\s*\\(\\s*\\)\\s*\\)',
          message: 'CORS configured without restrictions',
          fix_suggestion: 'Configure CORS with specific origins and methods'
        }
      ]
    },

    'no-sql-string-concatenation': {
      category: 'security',
      severity: 'critical',
      description: 'Prevents SQL injection through string concatenation',
      patterns: [
        {
          pattern: '(SELECT|INSERT|UPDATE|DELETE)[^"\']*\\+[^"\']*\\+',
          message: 'SQL query using string concatenation - potential injection risk',
          fix_suggestion: 'Use parameterized queries or prepared statements'
        }
      ]
    },

    'require-helmet-security-headers': {
      category: 'security',
      severity: 'medium',
      description: 'Ensures security headers are configured',
      patterns: [
        {
          pattern: 'express\\s*\\(\\s*\\)',
          message: 'Express app missing security headers',
          fix_suggestion: 'Add helmet() middleware for security headers'
        }
      ],
      anti_patterns: [
        {
          pattern: 'helmet\\s*\\(',
          message: 'Helmet already configured'
        }
      ]
    }
  }
};