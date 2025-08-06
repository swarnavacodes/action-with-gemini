// Performance Optimization Rules
module.exports = {
  team: 'performance',
  description: 'Performance optimization rules for all teams',
  rules: {
    'no-inefficient-loops': {
      category: 'performance',
      severity: 'medium',
      description: 'Detects inefficient loop patterns',
      patterns: [
        {
          pattern: 'for\\s*\\([^)]*\\.length[^)]*\\)',
          message: 'Loop with .length in condition - cache length for better performance',
          fix_suggestion: 'Cache array length: for(let i = 0, len = arr.length; i < len; i++)',
          auto_fix: true
        },
        {
          pattern: 'for\\s*\\([^)]*in\\s+[^)]*\\)\\s*\\{[^}]*hasOwnProperty',
          message: 'Inefficient for...in loop with hasOwnProperty check',
          fix_suggestion: 'Use Object.keys() or Object.entries() instead'
        }
      ]
    },

    'no-nested-loops-over-large-arrays': {
      category: 'performance',
      severity: 'high',
      description: 'Detects potentially expensive nested loops',
      patterns: [
        {
          pattern: 'for\\s*\\([^)]*\\)\\s*\\{[^}]*for\\s*\\([^)]*\\)',
          message: 'Nested loops detected - potential O(n²) complexity',
          fix_suggestion: 'Consider using Map, Set, or more efficient algorithms'
        }
      ]
    },

    'no-synchronous-file-operations': {
      category: 'performance',
      severity: 'high',
      description: 'Prevents synchronous file operations that block event loop',
      patterns: [
        {
          pattern: 'fs\\.(readFileSync|writeFileSync|existsSync|statSync|readdirSync)',
          message: 'Synchronous file operation blocks event loop',
          fix_suggestion: 'Use async versions with await or promises'
        }
      ]
    },

    'no-blocking-operations-in-loops': {
      category: 'performance',
      severity: 'high',
      description: 'Detects blocking operations inside loops',
      patterns: [
        {
          pattern: 'for\\s*\\([^)]*\\)\\s*\\{[^}]*(?:readFileSync|writeFileSync|execSync)',
          message: 'Blocking operation inside loop',
          fix_suggestion: 'Move blocking operations outside loop or use async versions'
        }
      ]
    },

    'require-database-connection-pooling': {
      category: 'performance',
      severity: 'medium',
      description: 'Ensures database connections use pooling',
      patterns: [
        {
          pattern: 'new\\s+(?:mysql|pg|mongodb)\\.(?:Connection|Client)\\s*\\(',
          message: 'Direct database connection without pooling',
          fix_suggestion: 'Use connection pooling for better performance'
        }
      ]
    },

    'no-inefficient-string-concatenation': {
      category: 'performance',
      severity: 'medium',
      description: 'Detects inefficient string concatenation in loops',
      patterns: [
        {
          pattern: 'for\\s*\\([^)]*\\)\\s*\\{[^}]*\\+=\\s*["\'][^"\']*["\']',
          message: 'String concatenation in loop - use array.join() instead',
          fix_suggestion: 'Use array.push() in loop, then array.join() after'
        }
      ]
    },

    'require-pagination-for-large-datasets': {
      category: 'performance',
      severity: 'medium',
      description: 'Ensures large dataset queries use pagination',
      patterns: [
        {
          pattern: '\\.find\\s*\\(\\s*\\)(?!.*limit)(?!.*skip)',
          message: 'Database query without pagination',
          fix_suggestion: 'Add .limit() and .skip() for pagination'
        },
        {
          pattern: 'SELECT\\s+\\*\\s+FROM[^;]*(?!LIMIT)',
          message: 'SQL query without LIMIT clause',
          fix_suggestion: 'Add LIMIT clause to prevent large result sets'
        }
      ]
    },

    'no-memory-leaks-in-event-listeners': {
      category: 'performance',
      severity: 'high',
      description: 'Detects potential memory leaks from event listeners',
      patterns: [
        {
          pattern: '\\.addEventListener\\s*\\([^)]*\\)(?![^}]*removeEventListener)',
          message: 'Event listener added without cleanup',
          fix_suggestion: 'Add removeEventListener in cleanup or use AbortController'
        },
        {
          pattern: '\\.on\\s*\\([^)]*\\)(?![^}]*off)(?![^}]*removeListener)',
          message: 'Event listener added without cleanup',
          fix_suggestion: 'Add .off() or .removeListener() in cleanup'
        }
      ]
    },

    'require-caching-for-expensive-operations': {
      category: 'performance',
      severity: 'medium',
      description: 'Suggests caching for expensive operations',
      patterns: [
        {
          pattern: '(?:crypto\\.pbkdf2|bcrypt\\.hash|jwt\\.sign)\\s*\\(',
          message: 'Expensive cryptographic operation - consider caching results',
          fix_suggestion: 'Cache results when appropriate to avoid repeated computation'
        }
      ]
    },

    'no-inefficient-array-methods': {
      category: 'performance',
      severity: 'medium',
      description: 'Detects inefficient array method usage',
      patterns: [
        {
          pattern: '\\.filter\\s*\\([^)]*\\)\\.length\\s*>\\s*0',
          message: 'Use .some() instead of .filter().length > 0',
          fix_suggestion: 'Replace with .some() for better performance'
        },
        {
          pattern: '\\.find\\s*\\([^)]*\\)\\s*!==\\s*undefined',
          message: 'Use .some() instead of .find() !== undefined',
          fix_suggestion: 'Replace with .some() for better performance'
        }
      ]
    },

    'require-lazy-loading': {
      category: 'performance',
      severity: 'low',
      description: 'Suggests lazy loading for large modules',
      patterns: [
        {
          pattern: 'require\\s*\\(["\'](?:lodash|moment|axios)["\']\\)',
          message: 'Large module imported at top level',
          fix_suggestion: 'Consider lazy loading or importing only needed functions'
        }
      ]
    },

    'no-inefficient-dom-operations': {
      category: 'performance',
      severity: 'medium',
      description: 'Detects inefficient DOM operations',
      patterns: [
        {
          pattern: 'for\\s*\\([^)]*\\)\\s*\\{[^}]*(?:appendChild|innerHTML)',
          message: 'DOM manipulation in loop - use DocumentFragment',
          fix_suggestion: 'Use DocumentFragment to batch DOM operations'
        }
      ],
      file_types: ['.js', '.ts']
    },

    'require-compression-middleware': {
      category: 'performance',
      severity: 'low',
      description: 'Suggests compression middleware for Express apps',
      patterns: [
        {
          pattern: 'express\\s*\\(\\s*\\)',
          message: 'Express app without compression middleware',
          fix_suggestion: 'Add compression middleware: app.use(compression())'
        }
      ],
      anti_patterns: [
        {
          pattern: 'compression\\s*\\(',
          message: 'Compression already configured'
        }
      ]
    },

    'no-inefficient-json-operations': {
      category: 'performance',
      severity: 'medium',
      description: 'Detects inefficient JSON operations',
      patterns: [
        {
          pattern: 'JSON\\.parse\\s*\\(\\s*JSON\\.stringify',
          message: 'Inefficient deep clone using JSON methods',
          fix_suggestion: 'Use structuredClone() or a proper deep clone library'
        }
      ]
    },

    'require-streaming-for-large-files': {
      category: 'performance',
      severity: 'medium',
      description: 'Suggests streaming for large file operations',
      patterns: [
        {
          pattern: 'fs\\.readFile\\s*\\([^,]*\\.(?:zip|tar|gz|mp4|avi|mkv)',
          message: 'Reading large file without streaming',
          fix_suggestion: 'Use fs.createReadStream() for large files'
        }
      ]
    }
  }
};