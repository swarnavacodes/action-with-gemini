# Using Gemini PR Reviewer in Non-Node.js Projects

This reviewer works with **any programming language** because it analyzes git diffs, not specific code syntax.

## Setup for Python/Java/Go/etc. Projects

1. **Copy these files to your repo:**
   ```
   package.json
   src/index.js
   .github/workflows/pr-review.yml
   .gitignore (merge with existing)
   ```

2. **Add to your existing .gitignore:**
   ```
   node_modules/
   .env
   ```

3. **Add repository secret:**
   - `GEMINI_API_KEY` in GitHub repo settings

4. **That's it!** The workflow will:
   - Install Node.js dependencies in CI
   - Run the reviewer on your Python/Java/Go code
   - Post reviews and auto-merge based on AI analysis

## Example: Python Project Structure
```
my-python-project/
├── src/
│   ├── main.py
│   └── utils.py
├── tests/
├── requirements.txt
├── package.json          # ← Added for PR reviewer
├── src/index.js          # ← Added for PR reviewer  
└── .github/
    └── workflows/
        └── pr-review.yml  # ← Added for PR reviewer
```

The reviewer analyzes the Python code changes in git diffs and provides intelligent feedback regardless of the project's primary language.