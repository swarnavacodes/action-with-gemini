# 🧪 Testing the Gemini PR Reviewer

This guide will help you test the Gemini PR reviewer with the example project.

## Prerequisites

1. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **GitHub Repository**: Create a new repo or use an existing one
3. **GitHub Token**: The workflow uses the built-in `GITHUB_TOKEN` automatically

## Step-by-Step Testing

### 1. Setup Repository

```bash
# Create a new repository on GitHub (or use existing)
# Clone this project to your repository
git clone <your-repo-url>
cd <your-repo>

# Copy all files from this project
# Make sure you have:
# - package.json
# - src/index.js  
# - .github/workflows/pr-review.yml
# - example-app/ (for testing)
```

### 2. Configure Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add: `GEMINI_API_KEY` with your actual API key

### 3. Install Dependencies

```bash
npm install
```

### 4. Test the Setup

#### Option A: Create a Test PR

1. **Create a new branch:**
   ```bash
   git checkout -b test-pr-review
   ```

2. **Make some changes to the example app:**
   ```bash
   # Edit example-app/app.js - add some code with issues
   # For example, add this function with problems:
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add test changes for PR review"
   git push origin test-pr-review
   ```

4. **Create PR on GitHub:**
   - Go to your repository on GitHub
   - Click "Compare & pull request"
   - Create the PR

5. **Watch the Magic:**
   - Go to **Actions** tab
   - See the "Gemini PR Review" workflow running
   - Check the PR for the AI review comment

#### Option B: Test Locally (Optional)

Create a `.env` file for local testing:
```bash
cp .env.example .env
# Edit .env with your actual values
```

## Example Test Changes

Here are some intentional issues in `example-app/` that Gemini should catch:

### Security Issues
- SQL injection vulnerability in `app.js`
- Missing input validation
- No authentication/authorization

### Performance Issues  
- Synchronous file operations
- O(n²) algorithm in `utils.js`
- Memory leak potential

### Code Quality Issues
- Inconsistent naming conventions
- Missing error handling
- No JSDoc documentation
- Hardcoded values

## Expected Review Results

The AI should identify:
- ❌ **Security vulnerabilities** (SQL injection, missing validation)
- ⚠️ **Performance issues** (sync operations, inefficient algorithms)  
- 📝 **Code quality** (naming, error handling, documentation)
- 🔧 **Suggestions** for improvements

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Ensure you added the secret in repository settings
   - Check the secret name matches exactly

2. **"Permission denied"**
   - The workflow should have automatic permissions
   - Check if your repository allows Actions

3. **"No changes detected"**
   - Make sure you're creating actual file changes
   - Check that the PR has modified files

4. **Workflow not triggering**
   - Ensure `.github/workflows/pr-review.yml` is in the main branch
   - Check the workflow syntax is correct

### Debug Steps

1. **Check Actions logs:**
   - Go to repository → Actions tab
   - Click on the failed workflow
   - Expand the logs to see errors

2. **Verify file structure:**
   ```
   your-repo/
   ├── package.json
   ├── src/index.js
   ├── .github/workflows/pr-review.yml
   └── example-app/
   ```

3. **Test API key locally:**
   ```bash
   # Create .env file and test
   npm start
   ```

## Success Indicators

✅ **Workflow runs successfully**  
✅ **AI posts detailed review comment**  
✅ **Review includes score, issues, and suggestions**  
✅ **Auto-merge works (if approved)**  

## Next Steps

Once testing works:
1. Remove the `example-app/` folder
2. Use the reviewer on real code changes
3. Customize the review criteria in `src/index.js`
4. Adjust auto-merge settings as needed

Happy testing! 🚀