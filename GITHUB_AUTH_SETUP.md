# GitHub Authentication & Push Instructions

## Step 1: Authenticate with GitHub

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh

# Authenticate
gh auth login

# Follow the prompts:
# - Select "GitHub.com"
# - Select "HTTPS"
# - Select "Paste an authentication token"
# - Create token at: https://github.com/settings/tokens/new
#   (Select: repo, write:packages scopes)
```

### Option B: Using Personal Access Token (PAT)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens/new
   - Select scopes: `repo` (all), `workflow`
   - Copy the token

2. **Store the token securely:**
   ```bash
   # On macOS, use Keychain
   git credential approve
   # Enter:
   # host=github.com
   # username=monishcorreia
   # password=<your-token>
   # (Press Ctrl+D when done)
   ```

3. **Configure Git to use credential helper:**
   ```bash
   git config --global credential.helper osxkeychain
   ```

### Option C: Using SSH Keys (Most Secure)

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub
# 1. Copy public key: cat ~/.ssh/id_ed25519.pub
# 2. Go to: https://github.com/settings/keys
# 3. Click "New SSH key" and paste

# Update remote to use SSH
git remote set-url origin git@github.com:monishcorreia/testathon_project_v2.git

# Test connection
ssh -T git@github.com
```

## Step 2: Push Your Code

```bash
# Push all commits
git push origin main

# You should see output like:
# Enumerating objects: X, done.
# Counting objects: X% (X/X), done.
# ... (upload process)
# To https://github.com/monishcorreia/testathon_project_v2
#  * [new branch]      main -> main
```

## Step 3: Enable GitHub Actions

1. **Go to your repository:**
   - https://github.com/monishcorreia/testathon_project_v2

2. **Click the "Actions" tab**

3. **Click "I understand my workflows, go ahead and enable them"**
   - (If you see this message, enable Actions)

4. **Grant Permissions:**
   - Go to Settings → Actions → General
   - Under "Permissions", select:
     - ✓ "Allow all actions and reusable workflows"
   - Click "Save"

5. **Configure Workflow Permissions:**
   - Settings → Actions → General
   - Under "Workflow permissions", select:
     - ✓ "Read and write permissions"
     - ✓ "Allow GitHub Actions to create and approve pull requests"

## Step 4: Verify GitHub Actions Setup

1. **Go to Actions tab**
2. **Select "Daily Plastemart Price Extraction"**
3. **You should see:**
   - ✓ Workflow file found
   - ✓ "Run workflow" button available
4. **Click "Run workflow" to test manually**
5. **Check the workflow run to verify it passes**

## Troubleshooting

### "remote: Invalid username or token"
- ✓ Ensure your Personal Access Token is valid
- ✓ Token hasn't expired
- ✓ Token has `repo` and `workflow` scopes

### "fatal: Could not read from remote repository"
- ✓ Check your internet connection
- ✓ Verify repository URL is correct
- ✓ SSH key is added to GitHub (if using SSH)

### GitHub Actions Not Visible
- ✓ Actions must be enabled in Settings
- ✓ Workflow files must be in `.github/workflows/`
- ✓ Workflow file syntax must be valid YAML

### Workflow Runs But Fails
- ✓ Check logs in Actions tab
- ✓ Ensure Node.js version is compatible
- ✓ Verify all dependencies are installed

## Next Steps

Once authentication is complete:

```bash
# Push your code
git push origin main

# Verify push succeeded
git log --oneline -5  # Should show your commits
```

Then enable GitHub Actions in the web UI as described above.

## Questions?

- GitHub Docs: https://docs.github.com/
- Git Docs: https://git-scm.com/doc
- SSH Setup: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
