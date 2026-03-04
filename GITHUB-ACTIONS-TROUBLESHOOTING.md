# 🐛 GitHub Actions Troubleshooting Guide

## Quick Diagnosis

Run this command to check your setup:
```bash
node verify-github-actions.js
```

---

## Common Issues & Solutions

### 1. ❌ "Workflow file not found" - No automated runs

**Problem:** Workflow shows in GitHub but doesn't run automatically at 9 AM

**Causes:**
- Workflow file in wrong location
- Workflow file not committed to GitHub
- Typo in schedule syntax

**Fix:**
1. Check file location: Should be `.github/workflows/price-monitor.yml`
2. Check it's in your GitHub repository (not just local)
3. Edit file, verify schedule line: `- cron: '0 9 * * *'`
4. Commit and push: 
   ```bash
   git add .github/workflows/price-monitor.yml
   git commit -m "Fix workflow schedule"
   git push
   ```

---

### 2. ❌ "Secret not found" - Email not working in cloud

**Problem:** Workflow fails with "GMAIL_USER is not defined"

**Causes:**
- Secret not added to GitHub
- Wrong secret name (case-sensitive)
- Secret added to wrong place

**Fix:**
1. Go to: **Repository Settings** → **Secrets and variables** → **Actions**
2. Verify both secrets exist:
   - `GMAIL_USER` (exact spelling)
   - `GMAIL_PASSWORD` (exact spelling)
3. Add missing ones
4. Re-run workflow: Go to **Actions** → **Run workflow**

**Secret names are case-sensitive:**
- ✅ `GMAIL_USER` (all caps)
- ❌ `Gmail_User` (wrong)
- ❌ `gmail_user` (wrong)

---

### 3. ❌ "Module not found" - Missing dependencies

**Problem:** Error: "Cannot find module 'playwright'"

**Causes:**
- `package.json` missing dependencies
- Workflow trying to run before npm install
- Old cache

**Fix:**
1. Verify `package.json` has:
   ```json
   "dependencies": {
     "playwright": "*",
     "nodemailer": "*",
     "dotenv": "*"
   }
   ```
2. Commit and push:
   ```bash
   git add package.json
   git commit -m "Fix dependencies"
   git push
   ```
3. Clear cache (GitHub Actions):
   - Go: **Settings** → **Actions** → **General**
   - Click: **Clear all caches**
4. Re-run workflow

---

### 4. ⚠️ Workflow runs but email not sending

**Problem:** Workflow shows ✅ but no email received

**Causes:**
- Email credentials wrong
- App password incorrect or expired
- Gmail 2FA not enabled
- Email filtering spam folder

**Fix:**
1. **Test locally first:**
   ```bash
   node price-monitor.js
   ```
   Expected: Script runs and email sends to terminal output

2. **Check Gmail app password:**
   - Go: [Google Account Security](https://myaccount.google.com/security)
   - Check: **2-Step Verification** is ON
   - Find: **App passwords** (if not visible, enable 2FA first)
   - Select: Mail + Windows Computer
   - Generate new password (exactly 16 characters)
   - Copy it: `xxxx xxxx xxxx xxxx` (spaces are cosmetic, use without)

3. **Update GitHub Secret:**
   - Settings → Secrets → Edit `GMAIL_PASSWORD`
   - Paste new 16-character password
   - Save

4. **Re-test:**
   - Go to Actions → Run workflow manually
   - Wait 2 minutes
   - Check email (and spam folder!)

---

### 5. ⚠️ Workflow job fails with "Authentication failed"

**Problem:** Error in logs: "Error: Invalid login" or "535 5.7.8 Username and Password not accepted"

**Causes:**
- Gmail password is wrong
- Using regular Gmail password instead of app password
- Account needs recovery
- 2FA not enabled

**Fix:**
1. Verify 2-Step Verification enabled:
   - Go: [Google Account Security](https://myaccount.google.com/security)
   - Left sidebar: **2-Step Verification**
   - Status should show: "On"

2. If 2FA off, enable it:
   - Click: **2-Step Verification**
   - Follow Google's setup steps
   - Select phone verification
   - Complete setup

3. Generate new app password:
   - Settings & Accounts (left sidebar)
   - **App passwords**
   - Select: **Mail** and **Windows Computer**
   - Click: **Generate**
   - Copy: Exactly as shown (4 groups of 4 characters)

4. Update in GitHub:
   - Settings → Secrets → GMAIL_PASSWORD
   - Paste new password
   - Save

---

### 6. ⚠️ "Permission denied" running script

**Problem:** Error: "Cannot execute price-monitor.js: Permission denied"

**Causes:**
- File permissions wrong (usually not an issue in GitHub Actions)
- Script has Windows line endings on Linux

**Fix:**
```bash
# Fix file permissions
chmod +x price-monitor.js

# Fix line endings (if using Windows)
dos2unix price-monitor.js
# Or:
sed -i 's/\r$//' price-monitor.js

# Commit and push
git add price-monitor.js
git commit -m "Fix file permissions"
git push
```

---

### 7. 📭 Workflow scheduled but no runs showing

**Problem:** Actions tab shows workflow but "No workflow runs yet"

**Causes:**
- Schedule hasn't reached yet (runs tomorrow)
- Workflow file has error (hidden)
- Workflow disable set to "Disabled"

**Fix:**
1. **Check if disabled:**
   - Settings → Workflows → Permissions
   - Should be: "All actions and reusable workflows"
   - Click: **Save** if changed

2. **Manual test:**
   - Go to: Actions tab
   - Click: "🚗 DiscoverCars Price Monitor"
   - Click: **Run workflow** (green button)
   - Workflow starts immediately

3. **Check schedule validity:**
   - Use: [crontab.guru](https://crontab.guru/)
   - Paste: `0 9 * * *`
   - Should show: "At 9:00 AM, every day"

---

### 8. 📊 Want to see workflow logs?

**View workflow execution logs:**

1. Go to: **Actions** tab
2. Click: **🚗 DiscoverCars Price Monitor**
3. Click: Any workflow run
4. Expand: **check-price** → **Check car rental price**
5. Look for 👇:
   ```
   ✅ Price check completed successfully
   Lowest zero deductible price: ₹54750
   ```

**Download artifacts:**
1. Scroll down to: **Artifacts** section
2. Download: `price-logs` folder
3. Contains:
   - `price-monitor.log` - Execution log
   - `price-log.json` - Current price and history

---

### 9. ⏰ Workflow runs but at wrong time?

**Problem:** Workflow runs at 2 PM instead of 9 AM

**Causes:**
- Schedule uses UTC timezone
- You want different local time

**Fix:**
Edit `.github/workflows/price-monitor.yml`:

```yaml
on:
  schedule:
    - cron: '0 9 * * *'  # Current: 9 AM UTC
```

**Change to your timezone:**

| Your Timezone | Adjustment | Cron |
|---|---|---|
| IST (UTC+5:30) | UTC - 5.5 hours | `30 3 * * *` |
| PST (UTC-8) | UTC + 8 hours | `0 17 * * *` |
| EST (UTC-5) | UTC + 5 hours | `0 14 * * *` |
| GMT (UTC+0) | Same | `0 9 * * *` |
| CET (UTC+1) | UTC - 1 hour | `0 8 * * *` |

**Example:** Change to 2 PM UTC (instead of 9 AM)
```yaml
- cron: '0 14 * * *'
```

Use [crontab.guru](https://crontab.guru/) to verify!

---

### 10. 🧹 Cleanup: Remove GitHub Actions

**To disable/remove workflow:**

**Option 1: Disable temporarily**
- Settings → Actions → General
- Select: "Disable all"

**Option 2: Delete workflow**
```bash
rm .github/workflows/price-monitor.yml
git add -A
git commit -m "Remove GitHub Actions workflow"
git push
```

---

## 🆘 Still Not Working?

### Get diagnostic info:

1. **Check Node version:**
   ```bash
   node --version  # Should be v14+
   ```

2. **Test locally:**
   ```bash
   npm install playwright nodemailer dotenv
   node price-monitor.js
   ```

3. **View raw logs from GitHub:**
   - Actions → Workflow run → Expand each step
   - Copy full error text
   - Search [GitHub Actions forum](https://github.com/orgs/community/discussions/categories/actions)

4. **Verify files exist:**
   ```bash
   ls -la .github/workflows/price-monitor.yml
   ls -la price-monitor.js
   ls -la package.json
   ```

---

## 📋 Pre-Run Checklist

Before running workflow on GitHub:

- [ ] Workflow file in: `.github/workflows/price-monitor.yml`
- [ ] GitHub Secrets added: `GMAIL_USER` and `GMAIL_PASSWORD`
- [ ] `package.json` has: playwright, nodemailer, dotenv
- [ ] `price-monitor.js` exists in root
- [ ] Code committed and pushed to GitHub
- [ ] GitHub Actions enabled in Settings
- [ ] `.env` in `.gitignore` (don't commit secrets!)
- [ ] Manual test successful: "Run workflow" works
- [ ] Check logs show: "Price check completed successfully"

---

## 💬 Support Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Cron Schedule Helper](https://crontab.guru/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Playwright Docs](https://playwright.dev/)

---

## 📞 Can't find your issue?

1. Check: `price-monitor.log` in artifacts for error messages
2. Search: [GitHub Community Discussions](https://github.com/orgs/community/discussions)
3. Look at: GitHub Action runner logs in Actions tab
4. Run locally: `node price-monitor.js` to compare behavior
