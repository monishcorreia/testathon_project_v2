# 🚀 GitHub Actions Setup Guide

Run your price monitor automatically in the cloud using GitHub Actions!

## ✨ Benefits

- ✅ Runs **automatically every day** at 9:00 AM (no local machine needed)
- ✅ **Free** hosting - up to 2,000 minutes per month
- ✅ **Automatic logs** stored in GitHub
- ✅ **Easy to manage** - all in one dashboard
- ✅ **No local setup** - GitHub servers do the work

---

## 📋 Prerequisites

1. ✅ GitHub account (free)
2. ✅ This repository pushed to GitHub
3. ✅ Gmail App Password (same as local setup)

---

## 🔧 Setup Steps

### Step 1: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Add DiscoverCars price monitor"

# Add GitHub remote and push
git remote add origin https://github.com/YOUR-USERNAME/testathon_project_v2.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

### Step 2: Add GitHub Secrets

GitHub Secrets allow you to securely store your Gmail credentials.

1. **Go to GitHub Repository**
   - Open: `https://github.com/YOUR-USERNAME/testathon_project_v2`
   - Click: **Settings**

2. **Navigate to Secrets**
   - Left sidebar → **Secrets and variables** → **Actions**

3. **Add GMAIL_USER Secret**
   - Click: **New repository secret**
   - Name: `GMAIL_USER`
   - Value: `monish.correia@gmail.com`
   - Click: **Add secret**

4. **Add GMAIL_PASSWORD Secret**
   - Click: **New repository secret**
   - Name: `GMAIL_PASSWORD`
   - Value: (your 16-character Gmail App Password)
   - Click: **Add secret**

### Step 3: Verify GitHub Actions is Enabled

1. **Go to Actions tab**
   - Click: **Actions** tab in your repository
   - You should see: "DiscoverCars Price Monitor" workflow

2. **Check default permissions**
   - Settings → **Actions** → **General**
   - Under "Workflow permissions"
   - Ensure: **Read and write permissions** is selected
   - Click: **Save** (if changed)

### Step 4: Trigger First Run (Manual Test)

1. **Go to Actions**
   - Click: **Actions** tab
   - Click: **DiscoverCars Price Monitor** on the left

2. **Run Workflow Manually**
   - Click: **Run workflow**
   - Click: **Run workflow** (green button)
   - Wait 1-2 minutes for it to complete

3. **Check Results**
   - Click on the running workflow
   - Wait for completion (should show ✅ green checkmark)
   - Expand each step to see logs

---

## 📅 How It Works

### Daily Schedule
- **Time:** 9:00 AM UTC every day
- **Timezone:** UTC (you can adjust the cron schedule if needed)
- **Automatic:** No action required from you

### What Happens
1. GitHub's server checks out your code
2. Installs Node.js and dependencies
3. Runs the price monitor script
4. Sends email alert if price drops
5. Saves logs as artifacts
6. Deletes logs after 90 days (to save space)

### Adjust Daily Time

The workflow runs at 9:00 AM UTC. To change it:

**Edit:** `.github/workflows/price-monitor.yml`

Find this line:
```yaml
- cron: '0 9 * * *'
```

Change the numbers (minute hour day month day-of-week):
```yaml
- cron: '0 9 * * *'
         ↑ ↑
      minute hour
```

Examples:
- `0 9 * * *` = 9:00 AM UTC every day
- `0 10 * * *` = 10:00 AM UTC every day
- `30 8 * * *` = 8:30 AM UTC every day
- `0 14 * * *` = 2:00 PM UTC every day

**Time Zones:**
- UTC is what GitHub Actions uses
- Add/subtract hours for your timezone
- Example: For 2:00 PM IST (India), use `30 8` (8:30 AM UTC)

[Cron Time Editor](https://crontab.guru/) - helpful tool to understand cron syntax

---

## 📊 Monitoring Runs

### View Execution History

1. **Go to Actions**
   - Click: **Actions** tab on your repository

2. **Select Workflow**
   - Click: **DiscoverCars Price Monitor**

3. **View Runs**
   - See all past runs with status (✅ or ❌)
   - Click any run to see detailed logs

4. **Check Logs**
   - Expand: **check-price** job
   - Expand: **Check car rental price** step
   - View all output and prices checked

### Download Artifacts

After each run, logs are saved:

1. **Click on a workflow run**
2. Scroll down to **Artifacts** section
3. Download `price-logs` (contains `price-log.json` and logs)

---

## ✉️ Email Configuration

The same Gmail setup applies:
- **Email sends to:** monish.correia@gmail.com
- **Trigger:** Price drops below ₹50,000
- **Frequency:** Max once per 24 hours

The script runs on **GitHub's servers**, so your local machine doesn't need to be on.

---

## 🔒 Security

GitHub Secrets are:
- ✅ Encrypted in transit and at rest
- ✅ Never exposed in logs
- ✅ Only available to GitHub Actions
- ✅ Masked in workflow output

**Never:**
- ❌ Commit `.env` file to GitHub
- ❌ Hardcode passwords in workflow files
- ❌ Share your GitHub Secrets

---

## 🚨 Troubleshooting

### Workflow doesn't run automatically
1. Check: **Settings** → **Actions** → **General**
2. Ensure: Workflow permissions are set to "Read and write"
3. Ensure: Workflow file is in `.github/workflows/` directory

### "Secret not found" error
1. Go to: **Settings** → **Secrets and variables** → **Actions**
2. Verify: `GMAIL_USER` and `GMAIL_PASSWORD` exist
3. Check: Names match exactly (case-sensitive)

### Email not sending
1. Verify: Gmail credentials are correct
2. Check: 2-Step Verification is enabled on Gmail
3. Check: App Password is 16 characters
4. Manually test: `node price-monitor.js` locally

### Workflow runs but shows error
1. Click on the failed workflow
2. Expand: **check-price** job
3. Look for red text showing the error
4. Check: `price-monitor.log` in artifacts

### Logs show "Cannot find module 'playwright'"
Usually fixes itself on next run. If persistent:
1. Delete: `node_modules` folder (locally)
2. Delete: `package-lock.json` (if exists)
3. Commit and push changes
4. Re-trigger workflow

---

## 📈 Viewing Results

### Check Price History

1. **Go to Actions** tab
2. Click: **DiscoverCars Price Monitor**
3. Click: Any completed workflow run
4. Scroll to: **Artifacts** section
5. Download: `price-logs` folder
6. Open: `price-log.json`

Expected format:
```json
{
  "lastPrice": 54750,
  "lastChecked": "2026-03-04T09:15:00.000Z",
  "lastAlertTime": "2026-03-01T09:10:00.000Z"
}
```

---

## ⚙️ Advanced Configuration

### Change Check Frequency

Instead of daily, run multiple times per day:

Edit `.github/workflows/price-monitor.yml`:

```yaml
on:
  schedule:
    # Run every 12 hours (2x per day)
    - cron: '0 */12 * * *'
    # Or run every 6 hours (4x per day)
    # - cron: '0 */6 * * *'
```

### Run on Specific Days

```yaml
on:
  schedule:
    # Run every weekday (Monday-Friday)
    - cron: '0 9 * * 1-5'
    # Run only on weekends
    # - cron: '0 9 * * 0,6'
```

### Disable GitHub Actions (Temporarily)

1. Go to: **Settings** → **Actions** → **General**
2. Select: **Disable all**
3. To re-enable: Select **All actions and reusable workflows**

---

## 💡 Pro Tips

1. **Test Schedule:** Manually trigger workflows to test before relying on automated schedule
   - Click: **Run workflow** button

2. **Monitor Costs:** GitHub Actions gives 2,000 free minutes/month (more than enough)
   - Settings → **Billing and plans** → **Usage this month**

3. **View Real-Time Logs:** Watch the workflow run in real-time
   - Go to Actions → Click workflow → Refresh browser

4. **Keep Logs:**
   - Currently set to 90 days retention
   - Change in workflow file: `retention-days: 90`

5. **Verify Email:** Send a test email manually
   - Run: `node price-monitor.js` locally
   - Check: Email delivery

---

## 📚 Useful Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Guide](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Cron Syntax Helper](https://crontab.guru/)
- [Workflow Status Badges](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge)

---

## ✅ Completion Checklist

- [ ] Code pushed to GitHub
- [ ] Added `GMAIL_USER` secret
- [ ] Added `GMAIL_PASSWORD` secret  
- [ ] GitHub Actions enabled in settings
- [ ] Manually triggered first workflow run
- [ ] Verified workflow completed successfully
- [ ] Checked logs in artifacts
- [ ] Received test email (wait 24h for scheduled run)

---

## 🎉 You're All Set!

Your price monitor is now running in the cloud:
- ✅ Automatic daily checks
- ✅ Email alerts ✉️
- ✅ No local machine needed
- ✅ Free hosting

**Next:** Wait for the first automated run or manually trigger a test run!

---

*For local setup instructions, see: QUICK-START.md*
