const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');
const SecurityValidator = require('./security-utils');
require('dotenv').config();

class GeminiPRReviewer {
    constructor() {
        // Validate environment and security requirements
        SecurityValidator.validateEnvironment();

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        });
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async reviewPR() {
        const { GITHUB_REPOSITORY, GITHUB_EVENT_PATH } = process.env;
        const [owner, repo] = GITHUB_REPOSITORY.split('/');

        // Read the GitHub event payload
        const fs = require('fs');
        const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'));
        const prNumber = event.pull_request.number;

        console.log(`Reviewing PR #${prNumber} in ${owner}/${repo}`);

        try {
            // Get PR files and changes
            const { data: files } = await this.octokit.pulls.listFiles({
                owner,
                repo,
                pull_number: prNumber,
            });

            // Get PR details
            const { data: pr } = await this.octokit.pulls.get({
                owner,
                repo,
                pull_number: prNumber,
            });

            // Validate PR size for security
            SecurityValidator.validatePRSize(files);

            // Prepare code changes for review
            const codeChanges = await this.prepareCodeChanges(files);

            // Add rate limiting delay
            await SecurityValidator.rateLimitDelay();

            // Review with Gemini
            const reviewResult = await this.performGeminiReview(codeChanges, pr);

            // Post review comment
            await this.postReviewComment(owner, repo, prNumber, reviewResult);

            // Auto-merge if review is successful
            if (reviewResult.approved) {
                await this.autoMergePR(owner, repo, prNumber);
            }

        } catch (error) {
            const sanitizedError = SecurityValidator.sanitizeErrorMessage(error);
            console.error('Error during PR review:', sanitizedError);
            process.exit(1);
        }
    }

    async prepareCodeChanges(files) {
        const changes = [];

        for (const file of files) {
            if (file.status === 'removed') continue;

            changes.push({
                filename: file.filename,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                patch: file.patch || 'Binary file or no changes'
            });
        }

        return changes;
    }

    async performGeminiReview(codeChanges, pr) {
        // Limit the amount of code to review to stay within quota
        const limitedChanges = codeChanges.slice(0, 5); // Only review first 5 files
        const maxPatchLength = 500; // Limit diff size per file

        const truncatedChanges = limitedChanges.map(change => ({
            ...change,
            patch: change.patch ? change.patch.substring(0, maxPatchLength) +
                (change.patch.length > maxPatchLength ? '\n[... truncated for quota limits]' : '') : 'No changes'
        }));

        const prompt = `Review this PR:

Title: ${pr.title}
Files: ${truncatedChanges.map(c => c.filename).join(', ')}

Changes:
${truncatedChanges.map(change => `
${change.filename}: +${change.additions} -${change.deletions}
${change.patch}
`).join('\n').substring(0, 2000)}

Find security, performance, and quality issues. Respond in JSON:
{
  "approved": true/false,
  "summary": "Brief review summary",
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1"],
  "score": 1-10
}
`;

        // Try multiple models and retry logic
        const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro'];
        let lastError = null;

        for (const modelName of modelsToTry) {
            console.log(`Trying model: ${modelName}`);

            try {
                // Create model instance for this attempt
                const model = this.genAI.getGenerativeModel({ model: modelName });

                // Add retry logic with exponential backoff
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        console.log(`Attempt ${attempt} with ${modelName}`);

                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text();

                        console.log(`✅ Success with ${modelName} on attempt ${attempt}`);

                        // Parse JSON response
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            return JSON.parse(jsonMatch[0]);
                        }

                        // Fallback if JSON parsing fails but API call succeeded
                        return {
                            approved: false,
                            summary: "Review completed but response format was invalid",
                            issues: ["Could not parse Gemini response"],
                            suggestions: ["Response: " + text.substring(0, 200) + "..."],
                            score: 5
                        };

                    } catch (attemptError) {
                        lastError = attemptError;
                        console.log(`❌ Attempt ${attempt} failed: ${attemptError.message}`);

                        if (attemptError.message.includes('503') || attemptError.message.includes('overloaded')) {
                            // Wait before retry for overloaded service
                            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                            console.log(`⏳ Waiting ${delay}ms before retry...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        } else if (attemptError.message.includes('429')) {
                            // Rate limited - wait longer
                            console.log('⏳ Rate limited, waiting 10 seconds...');
                            await new Promise(resolve => setTimeout(resolve, 10000));
                        } else {
                            // Other errors - don't retry this model
                            break;
                        }
                    }
                }
            } catch (modelError) {
                lastError = modelError;
                console.log(`❌ Model ${modelName} failed: ${modelError.message}`);
            }
        }

        // All models and retries failed
        console.error('All Gemini models failed:', lastError?.message);

        return {
            approved: false,
            summary: "Review failed due to Gemini API issues",
            issues: [
                "Gemini API is currently unavailable",
                lastError?.message?.includes('503') ? "Service overloaded - try again later" : "API error occurred",
                "This may be temporary - please retry the workflow"
            ],
            suggestions: [
                "Wait a few minutes and re-run the workflow",
                "Check Gemini API status at https://status.google.com/",
                "Verify your API key is valid and has quota remaining"
            ],
            score: 0
        };
    }

    async postReviewComment(owner, repo, prNumber, reviewResult) {
        const comment = `## 🤖 Gemini AI Code Review

**Status:** ${reviewResult.approved ? '✅ APPROVED' : '❌ NEEDS CHANGES'}
**Score:** ${reviewResult.score}/10

### Summary
${reviewResult.summary}

${reviewResult.issues.length > 0 ? `
### Issues Found
${reviewResult.issues.map(issue => `- ${issue}`).join('\n')}
` : ''}

${reviewResult.suggestions.length > 0 ? `
### Suggestions
${reviewResult.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
` : ''}

---
*This review was automatically generated by Gemini AI*
`;

        await this.octokit.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body: comment,
        });

        console.log(`Posted review comment for PR #${prNumber}`);
    }

    async autoMergePR(owner, repo, prNumber) {
        try {
            // Check if PR is mergeable
            const { data: pr } = await this.octokit.pulls.get({
                owner,
                repo,
                pull_number: prNumber,
            });

            if (!pr.mergeable) {
                console.log(`PR #${prNumber} is not mergeable (conflicts or checks pending)`);
                return;
            }

            // Merge the PR
            const mergeMethod = process.env.MERGE_METHOD || 'squash';
            await this.octokit.pulls.merge({
                owner,
                repo,
                pull_number: prNumber,
                commit_title: `Auto-merge: ${pr.title}`,
                commit_message: 'Automatically merged after successful Gemini AI review',
                merge_method: mergeMethod, // configurable: 'squash', 'merge', or 'rebase'
            });

            console.log(`Successfully auto-merged PR #${prNumber}`);

            // Post merge confirmation comment
            await this.octokit.issues.createComment({
                owner,
                repo,
                issue_number: prNumber,
                body: '🎉 **Auto-merged!** This PR has been automatically merged after passing the Gemini AI review.',
            });

        } catch (error) {
            console.error(`Failed to auto-merge PR #${prNumber}:`, error.message);

            // Post error comment
            await this.octokit.issues.createComment({
                owner,
                repo,
                issue_number: prNumber,
                body: `⚠️ **Auto-merge failed:** ${error.message}\n\nPlease merge manually after resolving any issues.`,
            });
        }
    }
}

// Run the reviewer
if (require.main === module) {
    const reviewer = new GeminiPRReviewer();
    reviewer.reviewPR().catch(console.error);
}

module.exports = GeminiPRReviewer;