#!/usr/bin/env node
// Merge Status Checker - Determines if PR should be blocked based on AI review

const fs = require('fs');

class MergeStatusChecker {
  constructor(prNumber) {
    this.prNumber = prNumber || process.env.GITHUB_PR_NUMBER || 'test';
    this.reportPath = `reports/pr-${this.prNumber}-report.json`;
  }

  checkMergeStatus() {
    console.log('🔍 Checking merge status based on AI review results...\n');

    if (!fs.existsSync(this.reportPath)) {
      console.log('⚠️ No AI review report found');
      console.log('📋 Recommendation: Allow merge but require manual review');
      return { shouldBlock: false, reason: 'No report found' };
    }

    try {
      const report = JSON.parse(fs.readFileSync(this.reportPath, 'utf8'));
      return this.analyzeMergeEligibility(report);
    } catch (error) {
      console.log('❌ Error reading report:', error.message);
      return { shouldBlock: true, reason: 'Report parsing error' };
    }
  }

  analyzeMergeEligibility(report) {
    const { summary, rule_engine_analysis, security_analysis } = report;
    
    console.log('📊 AI Review Results:');
    console.log(`   Overall Score: ${summary.overall_score}/10`);
    console.log(`   Status: ${summary.status}`);
    console.log(`   Critical Issues: ${rule_engine_analysis.issues_by_severity.critical}`);
    console.log(`   High Issues: ${rule_engine_analysis.issues_by_severity.high}`);
    console.log(`   Security Score: ${security_analysis.security_score}/10`);
    console.log(`   Compliance: ${security_analysis.compliance_status}\n`);

    // Check for critical security issues
    if (rule_engine_analysis.issues_by_severity.critical > 0) {
      console.log('🚫 MERGE BLOCKED: Critical security vulnerabilities found!');
      console.log(`❌ Found ${rule_engine_analysis.issues_by_severity.critical} critical issues`);
      console.log('🛡️ Security vulnerabilities must be fixed before merging\n');
      
      this.displayCriticalIssues(report);
      
      return {
        shouldBlock: true,
        reason: 'Critical security vulnerabilities',
        details: {
          criticalIssues: rule_engine_analysis.issues_by_severity.critical,
          securityScore: security_analysis.security_score
        }
      };
    }

    // Check for very low overall score
    if (summary.overall_score < 4) {
      console.log('🚫 MERGE BLOCKED: Code quality score too low!');
      console.log(`📊 Score: ${summary.overall_score}/10 (minimum required: 4/10)`);
      console.log('📝 Multiple high-priority issues need to be addressed\n');
      
      return {
        shouldBlock: true,
        reason: 'Code quality score too low',
        details: {
          score: summary.overall_score,
          minimumRequired: 4
        }
      };
    }

    // Check for non-compliant security status
    if (security_analysis.compliance_status === 'NON_COMPLIANT') {
      console.log('🚫 MERGE BLOCKED: Security compliance failure!');
      console.log('🛡️ Code does not meet security compliance requirements');
      console.log(`📊 Security Score: ${security_analysis.security_score}/10\n`);
      
      return {
        shouldBlock: true,
        reason: 'Security compliance failure',
        details: {
          complianceStatus: security_analysis.compliance_status,
          securityScore: security_analysis.security_score
        }
      };
    }

    // Check for too many high-priority issues
    if (rule_engine_analysis.issues_by_severity.high > 5) {
      console.log('🚫 MERGE BLOCKED: Too many high-priority issues!');
      console.log(`⚠️ Found ${rule_engine_analysis.issues_by_severity.high} high-priority issues`);
      console.log('📝 Please address critical issues before merging\n');
      
      return {
        shouldBlock: true,
        reason: 'Too many high-priority issues',
        details: {
          highIssues: rule_engine_analysis.issues_by_severity.high,
          threshold: 5
        }
      };
    }

    // All checks passed
    console.log('✅ MERGE APPROVED: All quality gates passed!');
    console.log(`📊 Score: ${summary.overall_score}/10`);
    console.log(`🛡️ Security: ${security_analysis.security_score}/10`);
    console.log(`📋 Compliance: ${security_analysis.compliance_status}`);
    console.log('🎉 This PR is safe to merge\n');

    return {
      shouldBlock: false,
      reason: 'All quality gates passed',
      details: {
        score: summary.overall_score,
        securityScore: security_analysis.security_score,
        complianceStatus: security_analysis.compliance_status
      }
    };
  }

  displayCriticalIssues(report) {
    const criticalIssues = report.rule_engine_analysis.rule_violations.filter(
      issue => issue.severity === 'critical'
    );

    if (criticalIssues.length > 0) {
      console.log('🚨 Critical Issues Found:');
      criticalIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.rule_name} in ${issue.file}:${issue.line_number}`);
        console.log(`      ${issue.message}`);
        if (issue.fix_suggestion) {
          console.log(`      💡 Fix: ${issue.fix_suggestion}`);
        }
      });
      
      if (criticalIssues.length > 5) {
        console.log(`   ... and ${criticalIssues.length - 5} more critical issues`);
      }
      console.log('');
    }
  }

  displayNextSteps(result) {
    if (result.shouldBlock) {
      console.log('📋 Next Steps to Unblock Merge:');
      console.log('   1. Review the detailed AI feedback in the PR comment');
      console.log('   2. Fix the identified issues in your code');
      console.log('   3. Push your fixes to update the PR');
      console.log('   4. Wait for the AI to re-analyze your changes');
      console.log('   5. Merge will be automatically unblocked when issues are resolved\n');
    } else {
      console.log('🎯 Merge Status: Ready to merge!');
      console.log('   The code meets all quality and security requirements.\n');
    }
  }
}

// CLI interface
if (require.main === module) {
  const prNumber = process.argv[2] || process.env.GITHUB_PR_NUMBER;
  const checker = new MergeStatusChecker(prNumber);
  
  const result = checker.checkMergeStatus();
  checker.displayNextSteps(result);
  
  // Exit with appropriate code for CI/CD
  if (result.shouldBlock) {
    console.log('❌ Exiting with error code to block merge');
    process.exit(1);
  } else {
    console.log('✅ Exiting with success code to allow merge');
    process.exit(0);
  }
}

module.exports = MergeStatusChecker;