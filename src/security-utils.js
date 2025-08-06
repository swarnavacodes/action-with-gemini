// Security utilities for the PR reviewer

class SecurityValidator {
  static validateEnvironment() {
    const requiredVars = ['GEMINI_API_KEY', 'GITHUB_TOKEN', 'GITHUB_REPOSITORY'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  static sanitizeErrorMessage(error) {
    // Remove potentially sensitive information from error messages
    const sensitivePatterns = [
      /api[_-]?key[s]?[:\s=]+[^\s]+/gi,
      /token[s]?[:\s=]+[^\s]+/gi,
      /password[s]?[:\s=]+[^\s]+/gi,
      /secret[s]?[:\s=]+[^\s]+/gi
    ];

    let sanitized = error.message || error.toString();
    
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  static validatePRSize(files) {
    const maxFiles = 50;
    const maxTotalChanges = 2000;
    
    if (files.length > maxFiles) {
      throw new Error(`PR too large: ${files.length} files (max: ${maxFiles})`);
    }

    const totalChanges = files.reduce((sum, file) => 
      sum + (file.additions || 0) + (file.deletions || 0), 0
    );

    if (totalChanges > maxTotalChanges) {
      throw new Error(`PR too large: ${totalChanges} changes (max: ${maxTotalChanges})`);
    }
  }

  static rateLimitDelay() {
    // Add delay to prevent API rate limiting
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

module.exports = SecurityValidator;