// Report Generator for Gemini AI Code Reviewer
const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.reportTypes = {
      SUMMARY: 'summary',
      DETAILED: 'detailed',
      SECURITY: 'security',
      PERFORMANCE: 'performance',
      TEAM: 'team',
      TREND: 'trend'
    };
    
    this.outputFormats = {
      JSON: 'json',
      HTML: 'html',
      MARKDOWN: 'md',
      CSV: 'csv'
    };
  }

  // Generate comprehensive PR review report
  async generatePRReport(reviewResult, ruleEngineResults, prData, options = {}) {
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        pr_number: prData.number,
        repository: prData.repository,
        author: prData.author,
        title: prData.title,
        branch: prData.head?.ref || 'unknown',
        base_branch: prData.base?.ref || 'main'
      },
      
      summary: {
        overall_score: reviewResult.score,
        status: reviewResult.approved ? 'APPROVED' : 'NEEDS_CHANGES',
        total_issues: ruleEngineResults.total_issues,
        files_analyzed: ruleEngineResults.files_analyzed,
        rules_applied: ruleEngineResults.rules_applied,
        review_duration: options.duration || 'N/A'
      },

      ai_analysis: {
        gemini_summary: reviewResult.summary,
        gemini_issues: reviewResult.issues,
        gemini_suggestions: reviewResult.suggestions,
        confidence_score: reviewResult.confidence || 0.85
      },

      rule_engine_analysis: {
        issues_by_severity: ruleEngineResults.issues_by_severity,
        issues_by_category: ruleEngineResults.issues_by_category,
        rule_violations: ruleEngineResults.rule_violations,
        top_issues: this.getTopIssues(ruleEngineResults.rule_violations)
      },

      security_analysis: {
        critical_vulnerabilities: this.filterIssuesBySeverity(ruleEngineResults.rule_violations, 'critical'),
        security_score: this.calculateSecurityScore(ruleEngineResults),
        compliance_status: this.checkCompliance(ruleEngineResults),
        recommendations: this.getSecurityRecommendations(ruleEngineResults)
      },

      performance_analysis: {
        performance_issues: this.filterIssuesByCategory(ruleEngineResults.rule_violations, 'performance'),
        performance_score: this.calculatePerformanceScore(ruleEngineResults),
        optimization_opportunities: this.getOptimizationOpportunities(ruleEngineResults)
      },

      quality_metrics: {
        code_quality_score: this.calculateQualityScore(reviewResult, ruleEngineResults),
        maintainability_index: this.calculateMaintainabilityIndex(ruleEngineResults),
        technical_debt_estimate: this.estimateTechnicalDebt(ruleEngineResults)
      },

      actionable_items: {
        must_fix: this.getMustFixItems(ruleEngineResults),
        should_fix: this.getShouldFixItems(ruleEngineResults),
        consider_fixing: this.getConsiderFixingItems(ruleEngineResults),
        auto_fixable: this.getAutoFixableItems(ruleEngineResults)
      },

      trends: {
        improvement_from_last_pr: options.improvement || 'N/A',
        team_average_comparison: options.teamAverage || 'N/A',
        repository_trend: options.repoTrend || 'N/A'
      }
    };

    return report;
  }

  // Generate team performance report
  async generateTeamReport(teamData, timeRange = '30d') {
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        team: teamData.team,
        time_range: timeRange,
        report_type: 'team_performance'
      },

      overview: {
        total_prs_reviewed: teamData.totalPRs,
        average_score: teamData.averageScore,
        total_issues_found: teamData.totalIssues,
        issues_resolved: teamData.issuesResolved,
        auto_merge_rate: teamData.autoMergeRate
      },

      quality_trends: {
        score_trend: teamData.scoreTrend,
        issue_trend: teamData.issueTrend,
        improvement_rate: teamData.improvementRate,
        regression_count: teamData.regressionCount
      },

      security_metrics: {
        vulnerabilities_prevented: teamData.vulnerabilitiesPrevented,
        security_score_average: teamData.securityScoreAverage,
        critical_issues_trend: teamData.criticalIssuesTrend,
        compliance_rate: teamData.complianceRate
      },

      performance_metrics: {
        performance_issues_found: teamData.performanceIssues,
        optimization_suggestions: teamData.optimizationSuggestions,
        performance_score_trend: teamData.performanceScoreTrend
      },

      developer_insights: {
        top_contributors: teamData.topContributors,
        most_improved_developer: teamData.mostImproved,
        areas_needing_attention: teamData.areasNeedingAttention,
        training_recommendations: teamData.trainingRecommendations
      },

      roi_analysis: {
        time_saved: teamData.timeSaved,
        cost_savings: teamData.costSavings,
        productivity_improvement: teamData.productivityImprovement,
        quality_improvement: teamData.qualityImprovement
      }
    };

    return report;
  }

  // Generate security-focused report
  async generateSecurityReport(securityData, timeRange = '30d') {
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        time_range: timeRange,
        report_type: 'security_analysis'
      },

      executive_summary: {
        total_vulnerabilities_prevented: securityData.vulnerabilitiesPrevented,
        critical_issues_blocked: securityData.criticalIssuesBlocked,
        security_score_improvement: securityData.securityScoreImprovement,
        compliance_status: securityData.complianceStatus
      },

      vulnerability_breakdown: {
        by_severity: securityData.vulnerabilitiesBySeverity,
        by_type: securityData.vulnerabilitiesByType,
        by_repository: securityData.vulnerabilitiesByRepo,
        trending_vulnerabilities: securityData.trendingVulnerabilities
      },

      threat_landscape: {
        emerging_threats: securityData.emergingThreats,
        attack_vectors_prevented: securityData.attackVectorsPrevented,
        zero_day_detections: securityData.zeroDayDetections
      },

      compliance_analysis: {
        sox_compliance: securityData.soxCompliance,
        gdpr_compliance: securityData.gdprCompliance,
        pci_compliance: securityData.pciCompliance,
        hipaa_compliance: securityData.hipaaCompliance
      },

      recommendations: {
        immediate_actions: securityData.immediateActions,
        strategic_improvements: securityData.strategicImprovements,
        training_needs: securityData.trainingNeeds,
        tool_recommendations: securityData.toolRecommendations
      }
    };

    return report;
  }

  // Export report in various formats
  async exportReport(report, format = 'json', outputPath = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultPath = `reports/report-${timestamp}`;

    switch (format.toLowerCase()) {
      case 'json':
        return this.exportJSON(report, outputPath || `${defaultPath}.json`);
      case 'html':
        return this.exportHTML(report, outputPath || `${defaultPath}.html`);
      case 'markdown':
      case 'md':
        return this.exportMarkdown(report, outputPath || `${defaultPath}.md`);
      case 'csv':
        return this.exportCSV(report, outputPath || `${defaultPath}.csv`);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // Export as JSON
  async exportJSON(report, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    return filePath;
  }

  // Export as HTML
  async exportHTML(report, filePath) {
    const html = this.generateHTMLReport(report);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, html);
    return filePath;
  }

  // Export as Markdown
  async exportMarkdown(report, filePath) {
    const markdown = this.generateMarkdownReport(report);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, markdown);
    return filePath;
  }

  // Generate HTML report
  generateHTMLReport(report) {
    const { metadata, summary, ai_analysis, rule_engine_analysis, security_analysis } = report;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Review Report - PR #${metadata.pr_number}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #6c757d; font-size: 0.9em; }
        .status-approved { color: #28a745; }
        .status-needs-changes { color: #dc3545; }
        .severity-critical { color: #dc3545; font-weight: bold; }
        .severity-high { color: #fd7e14; }
        .severity-medium { color: #ffc107; }
        .severity-low { color: #17a2b8; }
        .issue-list { list-style: none; padding: 0; }
        .issue-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; }
        .chart-container { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .progress-bar { background: #e9ecef; border-radius: 10px; overflow: hidden; height: 20px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Code Review Report</h1>
            <p><strong>PR #${metadata.pr_number}:</strong> ${metadata.title}</p>
            <p><strong>Repository:</strong> ${metadata.repository} | <strong>Author:</strong> ${metadata.author}</p>
            <p><strong>Generated:</strong> ${new Date(metadata.generated_at).toLocaleString()}</p>
        </div>
        
        <div class="content">
            <h2>📊 Summary</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value ${summary.status === 'APPROVED' ? 'status-approved' : 'status-needs-changes'}">
                        ${summary.overall_score}/10
                    </div>
                    <div class="metric-label">Overall Score</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.total_issues}</div>
                    <div class="metric-label">Total Issues</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.files_analyzed}</div>
                    <div class="metric-label">Files Analyzed</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.rules_applied}</div>
                    <div class="metric-label">Rules Applied</div>
                </div>
            </div>

            <h2>🔍 AI Analysis</h2>
            <div class="chart-container">
                <h3>Gemini AI Summary</h3>
                <p>${ai_analysis.gemini_summary}</p>
                
                <h4>Issues Found:</h4>
                <ul class="issue-list">
                    ${ai_analysis.gemini_issues.map(issue => `<li class="issue-item">${issue}</li>`).join('')}
                </ul>
                
                <h4>Suggestions:</h4>
                <ul class="issue-list">
                    ${ai_analysis.gemini_suggestions.map(suggestion => `<li class="issue-item" style="border-left-color: #28a745;">${suggestion}</li>`).join('')}
                </ul>
            </div>

            <h2>🛡️ Security Analysis</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value severity-critical">${security_analysis.critical_vulnerabilities.length}</div>
                    <div class="metric-label">Critical Vulnerabilities</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${security_analysis.security_score}/10</div>
                    <div class="metric-label">Security Score</div>
                </div>
            </div>

            <h2>📈 Issues by Severity</h2>
            <div class="chart-container">
                ${Object.entries(rule_engine_analysis.issues_by_severity).map(([severity, count]) => `
                    <div style="margin: 10px 0;">
                        <span class="severity-${severity}">${severity.toUpperCase()}: ${count}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(count / summary.total_issues) * 100}%;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h2>🎯 Action Items</h2>
            <div class="chart-container">
                <h3>Must Fix (Critical & High)</h3>
                <ul class="issue-list">
                    ${(report.actionable_items?.must_fix || []).map(item => `
                        <li class="issue-item severity-critical">${item.description} - ${item.file}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate Markdown report
  generateMarkdownReport(report) {
    const { metadata, summary, ai_analysis, rule_engine_analysis, security_analysis } = report;
    
    return `# 🤖 AI Code Review Report

## 📋 PR Information
- **PR Number:** #${metadata.pr_number}
- **Title:** ${metadata.title}
- **Repository:** ${metadata.repository}
- **Author:** ${metadata.author}
- **Generated:** ${new Date(metadata.generated_at).toLocaleString()}

## 📊 Summary
| Metric | Value |
|--------|-------|
| Overall Score | ${summary.overall_score}/10 |
| Status | ${summary.status === 'APPROVED' ? '✅ APPROVED' : '❌ NEEDS CHANGES'} |
| Total Issues | ${summary.total_issues} |
| Files Analyzed | ${summary.files_analyzed} |
| Rules Applied | ${summary.rules_applied} |

## 🔍 AI Analysis
### Gemini AI Summary
${ai_analysis.gemini_summary}

### Issues Found
${ai_analysis.gemini_issues.map(issue => `- ❌ ${issue}`).join('\n')}

### Suggestions
${ai_analysis.gemini_suggestions.map(suggestion => `- 💡 ${suggestion}`).join('\n')}

## 🛡️ Security Analysis
- **Critical Vulnerabilities:** ${security_analysis.critical_vulnerabilities.length}
- **Security Score:** ${security_analysis.security_score}/10
- **Compliance Status:** ${security_analysis.compliance_status}

## 📈 Issues Breakdown

### By Severity
${Object.entries(rule_engine_analysis.issues_by_severity).map(([severity, count]) => 
  `- **${severity.toUpperCase()}:** ${count}`
).join('\n')}

### By Category
${Object.entries(rule_engine_analysis.issues_by_category).map(([category, count]) => 
  `- **${category.toUpperCase()}:** ${count}`
).join('\n')}

## 🎯 Action Items
${(report.actionable_items?.must_fix || []).length > 0 ? `
### Must Fix (Critical & High Priority)
${(report.actionable_items.must_fix || []).map(item => 
  `- 🚨 **${item.rule_name}** in \`${item.file}\`: ${item.description}`
).join('\n')}
` : ''}

${(report.actionable_items?.should_fix || []).length > 0 ? `
### Should Fix (Medium Priority)
${(report.actionable_items.should_fix || []).map(item => 
  `- ⚠️ **${item.rule_name}** in \`${item.file}\`: ${item.description}`
).join('\n')}
` : ''}

---
*Report generated by Gemini AI Code Reviewer*`;
  }

  // Helper methods for calculations
  filterIssuesBySeverity(issues, severity) {
    return issues.filter(issue => issue.severity === severity);
  }

  filterIssuesByCategory(issues, category) {
    return issues.filter(issue => issue.category === category);
  }

  calculateSecurityScore(ruleResults) {
    const criticalIssues = ruleResults.issues_by_severity.critical || 0;
    const highIssues = ruleResults.issues_by_severity.high || 0;
    
    if (criticalIssues > 0) return Math.max(1, 5 - criticalIssues);
    if (highIssues > 0) return Math.max(3, 8 - highIssues);
    
    return 10;
  }

  calculatePerformanceScore(ruleResults) {
    const performanceIssues = ruleResults.issues_by_category.performance || 0;
    return Math.max(1, 10 - performanceIssues);
  }

  calculateQualityScore(reviewResult, ruleResults) {
    const aiScore = reviewResult.score || 5;
    const ruleScore = this.calculateRuleScore(ruleResults);
    return Math.round((aiScore + ruleScore) / 2);
  }

  calculateRuleScore(ruleResults) {
    const totalIssues = ruleResults.total_issues;
    if (totalIssues === 0) return 10;
    if (totalIssues <= 2) return 8;
    if (totalIssues <= 5) return 6;
    if (totalIssues <= 10) return 4;
    return 2;
  }

  calculateMaintainabilityIndex(ruleResults) {
    // Simplified maintainability calculation
    const qualityIssues = ruleResults.issues_by_category.quality || 0;
    const styleIssues = ruleResults.issues_by_category.style || 0;
    
    return Math.max(0, 100 - (qualityIssues * 5) - (styleIssues * 2));
  }

  estimateTechnicalDebt(ruleResults) {
    const weights = {
      critical: 8,
      high: 4,
      medium: 2,
      low: 1,
      info: 0.5
    };

    let totalDebt = 0;
    Object.entries(ruleResults.issues_by_severity).forEach(([severity, count]) => {
      totalDebt += count * (weights[severity] || 1);
    });

    return `${totalDebt} hours estimated`;
  }

  getTopIssues(violations, limit = 5) {
    const issueCount = {};
    
    violations.forEach(violation => {
      const key = violation.rule_name;
      issueCount[key] = (issueCount[key] || 0) + 1;
    });

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([rule, count]) => ({ rule, count }));
  }

  getMustFixItems(ruleResults) {
    return ruleResults.rule_violations.filter(issue => 
      issue.severity === 'critical' || issue.severity === 'high'
    );
  }

  getShouldFixItems(ruleResults) {
    return ruleResults.rule_violations.filter(issue => 
      issue.severity === 'medium'
    );
  }

  getConsiderFixingItems(ruleResults) {
    return ruleResults.rule_violations.filter(issue => 
      issue.severity === 'low' || issue.severity === 'info'
    );
  }

  getAutoFixableItems(ruleResults) {
    return ruleResults.rule_violations.filter(issue => issue.auto_fix);
  }

  checkCompliance(ruleResults) {
    const criticalIssues = ruleResults.issues_by_severity.critical || 0;
    const highIssues = ruleResults.issues_by_severity.high || 0;
    
    if (criticalIssues > 0) return 'NON_COMPLIANT';
    if (highIssues > 2) return 'NEEDS_ATTENTION';
    return 'COMPLIANT';
  }

  getSecurityRecommendations(ruleResults) {
    const recommendations = [];
    
    if (ruleResults.issues_by_severity.critical > 0) {
      recommendations.push('Address all critical security vulnerabilities immediately');
    }
    
    if (ruleResults.issues_by_category.security > 5) {
      recommendations.push('Consider security training for the development team');
    }
    
    return recommendations;
  }

  getOptimizationOpportunities(ruleResults) {
    const opportunities = [];
    
    if (ruleResults.issues_by_category.performance > 0) {
      opportunities.push('Review and optimize performance-critical code paths');
    }
    
    return opportunities;
  }
}

module.exports = ReportGenerator;