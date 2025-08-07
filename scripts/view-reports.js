#!/usr/bin/env node
// Report Viewer Script
const fs = require('fs');
const path = require('path');

function viewReports() {
    console.log('📊 Gemini AI Code Review Reports\n');
    
    // Check for reports directory
    const reportsDir = 'reports';
    if (!fs.existsSync(reportsDir)) {
        console.log('📁 No reports directory found. Reports will be created when you run a PR review.\n');
        console.log('🧪 To generate test reports, run:');
        console.log('   node tests/test-rule-engine.js\n');
        return;
    }

    // List available reports
    const reportFiles = fs.readdirSync(reportsDir);
    if (reportFiles.length === 0) {
        console.log('📁 Reports directory is empty. No reports generated yet.\n');
        console.log('🧪 To generate test reports, run:');
        console.log('   node tests/test-rule-engine.js\n');
        return;
    }

    console.log('📋 Available Reports:');
    reportFiles.forEach(file => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file);
        
        let icon = '📄';
        let description = 'Report file';
        
        switch (ext) {
            case '.json':
                icon = '📊';
                description = 'JSON data (programmatic access)';
                break;
            case '.html':
                icon = '🌐';
                description = 'HTML report (open in browser)';
                break;
            case '.md':
                icon = '📝';
                description = 'Markdown report (GitHub-friendly)';
                break;
        }
        
        console.log(`   ${icon} ${file} - ${description}`);
        console.log(`      Size: ${(stats.size / 1024).toFixed(1)}KB, Modified: ${stats.mtime.toLocaleString()}`);
    });

    // Check for test reports in root
    console.log('\n🧪 Test Reports:');
    const testReports = ['test-report.json', 'test-report.md'];
    testReports.forEach(file => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            const ext = path.extname(file);
            const icon = ext === '.json' ? '📊' : '📝';
            console.log(`   ${icon} ${file} - Test report (${(stats.size / 1024).toFixed(1)}KB)`);
        }
    });

    console.log('\n📍 Report Locations:');
    console.log('   1. 📁 File System: reports/ directory');
    console.log('   2. 💬 GitHub PR Comments: Enhanced review comments');
    console.log('   3. 🔍 GitHub Actions Logs: Detailed analysis logs');

    console.log('\n🚀 To generate new reports:');
    console.log('   • Test reports: node tests/test-rule-engine.js');
    console.log('   • Live reports: Create a PR and watch the magic happen!');

    console.log('\n🌐 To view HTML reports:');
    console.log('   • Open view-reports.html in your browser');
    console.log('   • Or open any .html file in reports/ directory');
}

// Show sample report content
function showSampleReport() {
    console.log('\n📋 Sample Report Content:');
    
    if (fs.existsSync('test-report.json')) {
        try {
            const report = JSON.parse(fs.readFileSync('test-report.json', 'utf8'));
            console.log('\n📊 Summary:');
            console.log(`   Overall Score: ${report.summary.overall_score}/10`);
            console.log(`   Status: ${report.summary.status}`);
            console.log(`   Total Issues: ${report.summary.total_issues}`);
            console.log(`   Files Analyzed: ${report.summary.files_analyzed}`);
            console.log(`   Rules Applied: ${report.summary.rules_applied}`);
            
            console.log('\n🛡️ Security Analysis:');
            console.log(`   Security Score: ${report.security_analysis.security_score}/10`);
            console.log(`   Critical Vulnerabilities: ${report.security_analysis.critical_vulnerabilities.length}`);
            console.log(`   Compliance Status: ${report.security_analysis.compliance_status}`);
            
            console.log('\n📈 Issues by Severity:');
            Object.entries(report.rule_engine_analysis.issues_by_severity).forEach(([severity, count]) => {
                if (count > 0) {
                    const icon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '📝';
                    console.log(`   ${icon} ${severity.toUpperCase()}: ${count}`);
                }
            });
            
        } catch (error) {
            console.log('   ❌ Error reading test report:', error.message);
        }
    }
}

// Main execution
if (require.main === module) {
    viewReports();
    showSampleReport();
}

module.exports = viewReports;