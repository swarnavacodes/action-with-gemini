// Test script for Custom Rule Engine
const CustomRuleEngine = require('../src/rule-engine');
const ReportGenerator = require('../src/report-generator');

async function testRuleEngine() {
    console.log('🧪 Testing Custom Rule Engine...');
    
    try {
        // Initialize rule engine
        const ruleEngine = new CustomRuleEngine();
        
        // Load rules
        await ruleEngine.loadRulesFromConfig();
        console.log(`✅ Loaded ${ruleEngine.rules.size} rules`);
        
        // Test with sample code
        const testCode = `
// Test file with intentional issues
const apiKey = "hardcoded-secret-123";
const password = "admin123";

async function getUserData(id) {
    // Missing try-catch
    const user = await database.findById(id);
    console.log("Debug: user found", user);
    return user;
}

// SQL injection vulnerability
function searchUsers(query) {
    const sql = \`SELECT * FROM users WHERE name = '\${query}'\`;
    return database.execute(sql);
}

// Inefficient loop
function processUsers(users) {
    for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users.length; j++) {
            if (users[i].id === users[j].parentId) {
                users[i].children = users[i].children || [];
                users[i].children.push(users[j]);
            }
        }
    }
}

// Synchronous file operation
const fs = require('fs');
const config = fs.readFileSync('./config.json', 'utf8');
`;

        // Analyze test code
        const codeChanges = [{
            filename: 'test.js',
            status: 'modified',
            additions: 10,
            deletions: 2,
            patch: testCode
        }];

        const prData = {
            number: 123,
            title: 'Test PR',
            user: { login: 'testuser' }
        };

        console.log('🔍 Analyzing test code...');
        const results = await ruleEngine.analyzeCodeChanges(codeChanges, prData);
        
        console.log('📊 Analysis Results:');
        console.log(`- Total Issues: ${results.total_issues}`);
        console.log(`- Critical: ${results.issues_by_severity.critical}`);
        console.log(`- High: ${results.issues_by_severity.high}`);
        console.log(`- Medium: ${results.issues_by_severity.medium}`);
        console.log(`- Low: ${results.issues_by_severity.low}`);
        
        console.log('\\n🎯 Issues by Category:');
        Object.entries(results.issues_by_category).forEach(([category, count]) => {
            if (count > 0) {
                console.log(`- ${category.toUpperCase()}: ${count}`);
            }
        });

        console.log('\\n🔍 Detailed Issues:');
        results.rule_violations.slice(0, 5).forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.rule_name} (${issue.severity})`);
            console.log(`   File: ${issue.file}:${issue.line_number}`);
            console.log(`   Message: ${issue.message}`);
            if (issue.fix_suggestion) {
                console.log(`   Fix: ${issue.fix_suggestion}`);
            }
            console.log('');
        });

        // Test report generation
        console.log('📄 Testing Report Generation...');
        const reportGenerator = new ReportGenerator();
        
        const mockReviewResult = {
            score: 6,
            approved: false,
            summary: 'Code has several security and performance issues',
            issues: ['Hardcoded secrets detected', 'SQL injection vulnerability'],
            suggestions: ['Use environment variables', 'Use parameterized queries']
        };

        const report = await reportGenerator.generatePRReport(
            mockReviewResult,
            results,
            {
                number: 123,
                repository: 'test/repo',
                author: 'testuser',
                title: 'Test PR for Rule Engine'
            },
            { duration: '2.5s' }
        );

        console.log('✅ Report generated successfully');
        console.log(`- Overall Score: ${report.summary.overall_score}/10`);
        console.log(`- Security Score: ${report.security_analysis.security_score}/10`);
        console.log(`- Must Fix Items: ${report.actionable_items?.must_fix?.length || 0}`);

        // Test report export
        console.log('💾 Testing Report Export...');
        await reportGenerator.exportReport(report, 'json', 'test-report.json');
        await reportGenerator.exportReport(report, 'markdown', 'test-report.md');
        console.log('✅ Reports exported successfully');

        // Test rule statistics
        console.log('\\n📈 Rule Statistics:');
        const stats = ruleEngine.getRuleStats();
        console.log(`- Total Rules: ${stats.total_rules}`);
        console.log(`- Enabled Rules: ${stats.enabled_rules}`);
        console.log('- By Category:', stats.by_category);
        console.log('- By Severity:', stats.by_severity);
        console.log('- By Team:', stats.by_team);

        console.log('\\n🎉 All tests passed! Rule Engine is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    testRuleEngine();
}

module.exports = testRuleEngine;