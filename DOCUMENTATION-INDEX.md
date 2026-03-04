# 📚 Complete Documentation Index

## Choose Your Path 🛤️

### 🚀 I want to start NOW! (5 minutes)
→ Read: **QUICK-START.md**

Just want to get running? This simplified guide covers all platforms in minimal steps.

---

### ☁️ I want to use GitHub Actions (recommended)
1. Read: **GITHUB-ACTIONS-SETUP.md** (15 minutes)
2. Follow: Step-by-step instructions to:
   - Push code to GitHub
   - Add email credentials as secrets
   - Enable GitHub Actions
   - Run first test

**Benefits:** No local machine needed, automatic daily runs, free hosting

---

### 💻 I want to run locally (macOS/Linux/Windows)
1. Read: **QUICK-START.md** (5 minutes) - Choose your OS
2. Advanced: **PRICE-MONITOR-SETUP.md** (if customization needed)

**MacOS:** Uses LaunchAgent for automated scheduling
**Linux:** Uses cron for automated scheduling
**Windows:** Uses Task Scheduler for automated scheduling

---

### 🔧 I need to setup everything manually
Read: **PRICE-MONITOR-SETUP.md** (Detailed, 200+ lines)

Covers:
- All scheduling options (LaunchAgent, cron, Task Scheduler)
- Configuration options
- Troubleshooting specific platforms
- Manual setup without scripts

---

### 🐛 Something isn't working!

**For GitHub Actions issues:**
→ Read: **GITHUB-ACTIONS-TROUBLESHOOTING.md**

Covers:
- 10 common issues with solutions
- Diagnostic steps
- Secret configuration problems
- Email sending issues
- Schedule/timezone problems

**For local setup issues:**
→ Read: **PRICE-MONITOR-SETUP.md** → "Troubleshooting" section

---

### ✅ I want to verify everything is setup correctly
Run: 
```bash
node verify-github-actions.js
```

Or for local setup:
```bash
node test-setup.js
```

---

## All Documentation Files

| File | Purpose | Time | Audience |
|------|---------|------|----------|
| **QUICK-START.md** | Fast setup guide | 5 min | All users |
| **GITHUB-ACTIONS-SETUP.md** | GitHub Actions guide | 15 min | Cloud users |
| **GITHUB-ACTIONS-TROUBLESHOOTING.md** | Fix common issues | 10-20 min | Debugging |
| **PRICE-MONITOR-SETUP.md** | Complete reference | 30 min | Advanced users |
| **README-PRICE-MONITOR.md** | Feature overview | 10 min | Understanding features |
| **test-setup.js** | Verify local setup | 1 min | Before running locally |
| **verify-github-actions.js** | Verify GitHub setup | 2 min | Before using GitHub Actions |
| **setup-price-monitor.sh** | MacOS/Linux setup | Auto | MacOS/Linux users |
| **run-price-monitor.bat** | Windows setup | Auto | Windows users |
| **SETUP-GUIDE.txt** | Visual checklist | Quick ref | All users |

---

## Feature Comparison

### GitHub Actions (Recommended ☁️)
```
✅ No local machine needed
✅ Automatic daily execution
✅ Free (up to 2,000 min/month)
✅ Cloud-hosted logs
✅ Manual trigger via GitHub UI
✅ Perfect for "set and forget"
❌ Needs GitHub repository
❌ Slower email delivery (depending on load)
```

### Local Scheduling (MacOS/Linux/Windows)
```
✅ Full control
✅ Faster execution
✅ No GitHub needed
✅ Customizable time
❌ Machine must stay on
❌ Requires setup per OS
❌ More manual configuration
```

---

## Quick Reference

### Setup Local (Choose OS)
```bash
# MacOS/Linux - Interactive setup
bash setup-price-monitor.sh

# Windows - Automated setup
run-price-monitor.bat

# Or manual setup
node price-monitor.js  # Run once
```

### Setup GitHub Actions
```bash
# 1. Verify everything
node verify-github-actions.js

# 2. Push to GitHub
git push

# 3. Add secrets in GitHub Settings
# GMAIL_USER: monish.correia@gmail.com
# GMAIL_PASSWORD: [16-char app password]

# 4. Test workflow
# Go to Actions → Run workflow
```

### Monitor/Debug
```bash
# Local: Check logs
tail -f price-monitor.log

# Local: View price history
cat price-log.json | jq

# GitHub: View workflow runs
# Go to: GitHub repo → Actions tab
```

---

## Decision Tree

```
START
  ↓
Do you have a GitHub repository?
  ├─ YES
  │   ↓
  │   Use GITHUB-ACTIONS? (Recommended)
  │   ├─ YES → GITHUB-ACTIONS-SETUP.md
  │   └─ NO  → QUICK-START.md + PRICE-MONITOR-SETUP.md
  │
  └─ NO
      ↓
      Use QUICK-START.md
      └─ Run locally (choose your OS)
```

---

## Getting Help

### 1. Something not working?
- Run diagnostic: `node verify-github-actions.js` or `node test-setup.js`
- Check troubleshooting guide (GitHub or PRICE-MONITOR-SETUP.md)
- Review logs: `price-monitor.log` or GitHub Actions logs

### 2. Need detailed reference?
- GitHub Actions: GITHUB-ACTIONS-SETUP.md
- Local setup: PRICE-MONITOR-SETUP.md
- Features: README-PRICE-MONITOR.md

### 3. Want quick commands?
- See: SETUP-GUIDE.txt (visual checklist)
- Or: Scroll to "Quick Reference" above

---

## File Descriptions

### 📖 Documentation

**QUICK-START.md**
- Purpose: Get running in 5 minutes
- Covers: Both GitHub Actions and local setup
- Best for: Impatient developers

**GITHUB-ACTIONS-SETUP.md**
- Purpose: Complete GitHub Actions guide
- Covers: Step-by-step setup, schedule changes, security
- Best for: GitHub Actions users

**GITHUB-ACTIONS-TROUBLESHOOTING.md**
- Purpose: Fix common GitHub Actions issues
- Covers: 10 issues with solutions
- Best for: Debugging

**PRICE-MONITOR-SETUP.md**
- Purpose: Deep dive into all configurations
- Covers: Local scheduling (all OS), advanced settings
- Best for: Advanced users, customization

**README-PRICE-MONITOR.md**
- Purpose: Understand the price monitor
- Covers: Features, how it works, examples
- Best for: Learning how it works

**SETUP-GUIDE.txt**
- Purpose: Visual checklist
- Covers: Quick reference with ASCII art
- Best for: Quick lookup

### 🛠️ Setup Scripts

**setup-price-monitor.sh** (MacOS/Linux)
- Interactive bash script
- Automatically sets up LaunchAgent (MacOS) or cron (Linux)
- Usage: `bash setup-price-monitor.sh`

**run-price-monitor.bat** (Windows)
- Batch script for Task Scheduler
- Automated Windows setup
- Usage: `run-price-monitor.bat`

### 🔍 Verification Scripts

**test-setup.js**
- Checks local setup completeness
- Verifies: Node version, .env file, dependencies, permissions
- Usage: `node test-setup.js`

**verify-github-actions.js**
- Checks GitHub Actions setup
- Verifies: Workflow file, secrets, git repo, syntax
- Usage: `node verify-github-actions.js`

---

## Common Tasks

### "I want to run it once"
```bash
npm install
node price-monitor.js
# Check email in 30 seconds
```

### "I want it to run daily automatically"
**Option A - GitHub Actions (Recommended):**
1. Read: GITHUB-ACTIONS-SETUP.md
2. Run: `node verify-github-actions.js`
3. Push to GitHub and add secrets

**Option B - Local Schedule:**
1. Read: QUICK-START.md
2. Run: `bash setup-price-monitor.sh` (MacOS/Linux)
3. Or: `run-price-monitor.bat` (Windows)

### "I want to change the alert threshold"
Edit: `price-monitor.js`
Find: `const PRICE_THRESHOLD = 50000;`
Change to: `const PRICE_THRESHOLD = 45000;` (or your value)

### "I want to change the daily time"
**GitHub Actions:**
Edit: `.github/workflows/price-monitor.yml`
Find: `- cron: '0 9 * * *'`
Change: `- cron: '0 14 * * *'` (for 2 PM UTC)
See: GITHUB-ACTIONS-SETUP.md for timezone conversion

**Local (MacOS/Linux):**
Edit: `LaunchAgent` plist or cron job
See: PRICE-MONITOR-SETUP.md for details

**Local (Windows):**
Edit: Task Scheduler
See: PRICE-MONITOR-SETUP.md for details

### "I want to change the email address"
Edit: `price-monitor.js`
Find: `const EMAIL_RECIPIENT = 'monish.correia@gmail.com';`
Change to: Your email address

---

## Recommended Setup

### For Most Users: GitHub Actions
1. ✅ No maintenance needed
2. ✅ Automatic daily execution
3. ✅ Free hosting
4. ✅ Cloud logs for debugging

**Follow:** GITHUB-ACTIONS-SETUP.md

### For Advanced Users: Local Scheduling
1. ✅ Full control
2. ✅ Customizable behavior
3. ✅ No dependency on GitHub
4. ❌ Machine must stay on

**Follow:** QUICK-START.md → PRICE-MONITOR-SETUP.md

---

## Next Steps

1. **Choose your deployment:**
   - Cloud (GitHub Actions) → GITHUB-ACTIONS-SETUP.md
   - Local → QUICK-START.md

2. **Verify setup:**
   - Run: `node verify-github-actions.js` or `node test-setup.js`

3. **Test it:**
   - Local: `node price-monitor.js`
   - GitHub: Click "Run workflow" button

4. **Check it works:**
   - Look for email within 1-2 minutes (or next scheduled run)
   - Review logs for confirmation

5. **Relax:** ✨
   - Daily monitoring is now automatic! 🎉

---

**Questions?** See the troubleshooting guides or re-read the appropriate setup guide for your platform.

**Good luck!** 🚀
