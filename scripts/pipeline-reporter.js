#!/usr/bin/env node
// Pipeline Reporter - Enhanced reporting for GitHub Actions
const fs = require('fs');
const path = require('path');

class PipelineReporter {
  constructor() {
    this.prNumber = process.env.GITHUB_EVENT_PATH ? 
      JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).pull_request?.number : 
      'test';
  }

  // Display comprehensive report summary in pipeline logs
  displayPipelineSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 GEMINI AI CODE REVIEW - PIPELINE SUMMARY');
    console.log('='.repeat(80));

    const reportPath = `reports/pr-${this.prNumber}-report.json`;
    
    if (!fs.existsSync(reportPath)) {
      console.log('❌ Report file not found:', reportPath);
      this.displayFallbackSummary();
      return;
    }

    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      this.displayDetailedSummary(report);
    } catch (error) {
      console.log('❌ Error reading report:', error.message);
      this.displayFallbackSummary();
    }
  }

  displayDetailedSummary(report) {
    const { summary, security_analysis, rule_engine_analysis, actionable_items } = report;

    // Overall Status
    console.log('\n📊 OVERALL ASSESSMENT');
    console.log('-'.repeat(40));
    console.log(`Status: ${summary.status === 'APPROVED' ? '✅ APPROVED' : '❌ NEEDS CHANGES'}`);
    console.log(`Overall Score: ${summary.overall_score}/10`);
    console.log(`Review Duration: ${summary.review_duration}`);
    console.log(`Files Analyzed: ${summary.files_analyzed}`);
    console.log(`Rules Applied: ${summary.rules_applied}`);

    // Security Analysis
    console.log('\n🛡️ SECURITY ANALYSIS');
    console.log('-'.repeat(40));
    console.log(`Security Score: ${security_analysis.security_score}/10`);
    console.log(`Critical Vulnerabilities: ${security_analysis.critical_vulnerabilities.length}`);
    console.log(`Compliance Status: ${security_analysis.compliance_status}`);

    // Issue Breakdown
    console.log('\n📈 ISSUE BREAKDOWN');
    console.log('-'.repeat(40));
    console.log('By Severity:');
    Object.entries(rule_engine_analysis.issues_by_severity).forEach(([severity, count]) => {
      if (count > 0) {
        const icon = this.getSeverityIcon(severity);
        console.log(`  ${icon} ${severity.toUpperCase()}: ${count}`);
      }
    });

    console.log('\nBy Category:');
    Object.entries(rule_engine_analysis.issues_by_category).forEach(([category, count]) => {
      if (count > 0) {
        const icon = this.getCategoryIcon(category);
        console.log(`  ${icon} ${category.toUpperCase()}: ${count}`);
      }
    });

    // Top Issues
    if (rule_engine_analysis.top_issues && rule_engine_analysis.top_issues.length > 0) {
      console.log('\n🎯 TOP ISSUES');
      console.log('-'.repeat(40));
      rule_engine_analysis.top_issues.slice(0, 5).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.rule}: ${issue.count} occurrences`);
      });
    }

    // Action Items
    if (actionable_items) {
      console.log('\n🚨 CRITICAL ACTION ITEMS');
      console.log('-'.repeat(40));
      
      if (actionable_items.must_fix && actionable_items.must_fix.length > 0) {
        console.log('Must Fix (Critical & High Priority):');
        actionable_items.must_fix.slice(0, 5).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.rule_name} in ${item.file}:${item.line_number}`);
          console.log(`     ${item.message}`);
        });
        
        if (actionable_items.must_fix.length > 5) {
          console.log(`     ... and ${actionable_items.must_fix.length - 5} more critical issues`);
        }
      } else {
        console.log('✅ No critical issues found!');
      }

      if (actionable_items.auto_fixable && actionable_items.auto_fixable.length > 0) {
        console.log('\n🔧 AUTO-FIXABLE ISSUES:');
        actionable_items.auto_fixable.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.rule_name}: ${item.fix_suggestion}`);
        });
      }
    }

    // Report Locations
    console.log('\n📄 REPORT LOCATIONS');
    console.log('-'.repeat(40));
    console.log('1. 💬 PR Comment: Enhanced review posted to PR');
    console.log('2. 📁 Artifacts: Available in Actions > Artifacts');
    console.log('3. 📊 JSON Report: reports/pr-' + this.prNumber + '-report.json');
    console.log('4. 🌐 HTML Report: reports/pr-' + this.prNumber + '-report.html');
    console.log('5. 📝 MD Report: reports/pr-' + this.prNumber + '-report.md');

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(40));
    if (summary.overall_score < 5) {
      console.log('🚨 URGENT: Address critical and high-priority issues before merging');
    } else if (summary.overall_score < 7) {
      console.log('⚠️ RECOMMENDED: Fix high-priority issues and consider medium-priority ones');
    } else {
      console.log('✅ GOOD: Code quality is acceptable, consider minor improvements');
    }

    console.log('\n' + '='.repeat(80));
  }

  displayFallbackSummary() {
    console.log('\n📋 BASIC SUMMARY (Report file not available)');
    console.log('-'.repeat(40));
    console.log('✅ Gemini AI analysis completed');
    console.log('📊 Check PR comments for detailed review');
    console.log('📁 Reports will be available in artifacts');
    console.log('\n' + '='.repeat(80));
  }

  getSeverityIcon(severity) {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      medium: '📝',
      low: '💡',
      info: 'ℹ️'
    };
    return icons[severity] || '📄';
  }

  getCategoryIcon(category) {
    const icons = {
      security: '🛡️',
      performance: '⚡',
      quality: '📝',
      style: '🎨',
      compliance: '📋'
    };
    return icons[category] || '📄';
  }

  // Generate GitHub Actions step summary
  generateStepSummary() {
    const reportPath = `reports/pr-${this.prNumber}-report.json`;
    
    if (!fs.existsSync(reportPath)) {
      return this.generateFallbackStepSummary();
    }

    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return this.generateDetailedStepSummary(report);
    } catch (error) {
      return this.generateFallbackStepSummary();
    }
  }

  generateDetailedStepSummary(report) {
    const { summary, security_analysis, rule_engine_analysis } = report;
    
    return `
## 🤖 Gemini AI Code Review Summary

### 📊 Overall Assessment
- **Status**: ${summary.status === 'APPROVED' ? '✅ APPROVED' : '❌ NEEDS CHANGES'}
- **Score**: ${summary.overall_score}/10
- **Duration**: ${summary.review_duration}

### 🛡️ Security Analysis
- **Security Score**: ${security_analysis.security_score}/10
- **Critical Vulnerabilities**: ${security_analysis.critical_vulnerabilities.length}
- **Compliance**: ${security_analysis.compliance_status}

### 📈 Issue Summary
| Severity | Count |
|----------|-------|
| Critical | ${rule_engine_analysis.issues_by_severity.critical} |
| High | ${rule_engine_analysis.issues_by_severity.high} |
| Medium | ${rule_engine_analysis.issues_by_severity.medium} |
| Low | ${rule_engine_analysis.issues_by_severity.low} |

### 📄 Reports Generated
- 📊 JSON Report: \`reports/pr-${this.prNumber}-report.json\`
- 🌐 HTML Report: \`reports/pr-${this.prNumber}-report.html\`
- 📝 Markdown Report: \`reports/pr-${this.prNumber}-report.md\`

> 💬 **Detailed review posted to PR comments**
`;
  }

  generateFallbackStepSummary() {
    return `
## 🤖 Gemini AI Code Review

✅ Analysis completed successfully
📊 Check PR comments for detailed review
📁 Reports available in workflow artifacts
`;
  }

  // Write step summary for GitHub Actions
  writeStepSummary() {
    const summary = this.generateStepSummary();
    
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
      console.log('📝 Step summary written to GitHub Actions');
    } else {
      console.log('📝 Step Summary:');
      console.log(summary);
    }
  }
}

// CLI interface
if (require.main === module) {
  const reporter = new PipelineReporter();
  
  const command = process.argv[2] || 'summary';
  
  switch (command) {
    case 'summary':
      reporter.displayPipelineSummary();
      break;
    case 'step-summary':
      reporter.writeStepSummary();
      break;
    case 'both':
      reporter.displayPipelineSummary();
      reporter.writeStepSummary();
      break;
    default:
      console.log('Usage: node pipeline-reporter.js [summary|step-summary|both]');
  }
}

module.exports = PipelineReporter;