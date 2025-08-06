# Gemini PR Reviewer

Automated Pull Request review system using Google's Gemini AI and GitHub Actions.

## Features

- 🤖 Automated code review using Gemini AI
- 📝 Detailed feedback on code quality, security, and best practices
- ✅ Auto-merge approved PRs
- 💬 Comprehensive review comments
- 🔄 Triggers on PR open, update, and reopen

## Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for later use

### 2. Configure GitHub Repository

1. Go to your repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add the following repository secrets:
   - `GEMINI_API_KEY`: Your Gemini API key

### 3. Repository Permissions

The workflow uses the default `GITHUB_TOKEN` with these permissions:
- `contents: write` - To merge PRs
- `pull-requests: write` - To comment on PRs
- `issues: write` - To create comments

### 4. Install Dependencies

```bash
npm install
```

### 5. Test Locally (Optional)

Create a `.env` file:
```bash
cp .env.example .env
# Edit .env with your actual values
```

## How It Works

1. **Trigger**: When a PR is opened, updated, or reopened
2. **Analysis**: Fetches PR changes and analyzes code with Gemini
3. **Review**: Posts detailed review comment with:
   - Approval status
   - Quality score (1-10)
   - Issues found
   - Improvement suggestions
4. **Auto-merge**: If approved and mergeable, automatically merges the PR

## Review Criteria

The AI reviews code for:
- Code quality and best practices
- Security vulnerabilities
- Performance issues
- Logic errors
- Code style and maintainability

## Customization

### Merge Strategy
Edit the `merge_method` in `src/index.js`:
- `squash` - Squash and merge (default)
- `merge` - Create merge commit
- `rebase` - Rebase and merge

### Review Strictness
Modify the Gemini prompt in `performGeminiReview()` to adjust review criteria.

### Auto-merge Behavior
To disable auto-merge, comment out the auto-merge section in `reviewPR()`.

## Workflow File

The GitHub Action is defined in `.github/workflows/pr-review.yml` and runs on:
- `pull_request.opened`
- `pull_request.synchronize`
- `pull_request.reopened`

## Security Notes

- The `GITHUB_TOKEN` is automatically provided by GitHub Actions
- Never commit your `.env` file or expose API keys
- The workflow only has access to the specific repository
- Auto-merge only occurs after successful AI approval

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure repository has correct permissions set
2. **API Rate Limits**: Gemini has usage limits - monitor your usage
3. **Merge Conflicts**: Auto-merge will fail if there are conflicts
4. **Large PRs**: Very large PRs might hit token limits

### Logs

Check the Actions tab in your repository for detailed execution logs.