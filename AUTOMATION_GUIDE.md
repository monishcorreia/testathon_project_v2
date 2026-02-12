# Plastemart Daily Price Extraction - Automation Guide

This guide explains how to set up automated daily execution of the Plastemart price extraction test.

## **Option 1: GitHub Actions (Recommended)**

### Setup Instructions:

1. **Already configured** - The workflow file `.github/workflows/plastemart-daily.yml` is ready to use

2. **Push to GitHub:**
   ```bash
   git add .github/workflows/plastemart-daily.yml
   git commit -m "Add daily Plastemart price extraction workflow"
   git push origin main
   ```

3. **Enable Actions:**
   - Go to your GitHub repository
   - Click on "Actions" tab
   - Click "Enable GitHub Actions" if needed

4. **Configure Schedule (Optional):**
   - Edit `.github/workflows/plastemart-daily.yml`
   - Change the cron schedule in this line:
     ```yaml
     - cron: '0 9 * * *'  # Change the time here
     ```
   - Cron format: `minute hour day month day-of-week`
   - Examples:
     - `0 9 * * *` = 9:00 AM daily
     - `0 12 * * *` = 12:00 PM daily
     - `0 */6 * * *` = Every 6 hours
     - `0 9 * * 1` = 9:00 AM every Monday

5. **Manual Trigger:**
   - Go to Actions tab → Daily Plastemart Price Extraction
   - Click "Run workflow"

### View Results:

- **GitHub Actions:** Go to Actions tab → see execution logs
- **Artifacts:** Download test results and price reports
- **Issues:** Check GitHub Issues for daily reports (if using advanced workflow)

---

## **Option 2: GitHub Actions with Advanced Features**

Use `.github/workflows/plastemart-daily-advanced.yml` for:
- Automatic GitHub Issues with price reports
- Saved reports in the repository
- Email notifications (requires configuration)

**Advantages:**
- Results stored in repository
- Issue history for tracking
- Easy to search past reports

---

## **Option 3: Local Node.js Scheduler**

Run the test on your local machine on a schedule.

### Setup:

1. **Start the scheduler:**
   ```bash
   node scheduler.js
   ```

2. **Configure Schedule (Optional):**
   - Edit `scheduler.js`
   - Change this line to set the time:
     ```javascript
     const task = cron.schedule('0 9 * * *', () => {
     ```

3. **Run as Background Service (macOS/Linux):**

   **Using PM2 (recommended):**
   ```bash
   npm install -g pm2
   pm2 start scheduler.js --name "plastemart-scheduler"
   pm2 startup
   pm2 save
   ```

4. **Run as Background Service (Windows):**

   **Using Windows Task Scheduler:**
   ```batch
   # Create batch file: run-scheduler.bat
   @echo off
   cd /d "C:\path\to\testathon_project_v2"
   node scheduler.js
   ```
   - Open Task Scheduler
   - Create Basic Task
   - Set trigger to daily at 9:00 AM
   - Set action to run `run-scheduler.bat`

### View Local Results:

Logs are saved in:
```
scheduler-logs/
├── plastemart-2026-02-12.log
├── plastemart-2026-02-13.log
└── ...
```

---

## **Option 4: Cloud Services**

### AWS EventBridge + Lambda:
1. Create Lambda function with Playwright
2. Set EventBridge schedule trigger
3. Lambda executes test and stores results in S3

### Google Cloud Scheduler:
1. Create Cloud Run service with test
2. Set up Cloud Scheduler to trigger daily
3. Results saved to Cloud Storage

### Azure Logic Apps:
1. Create Logic App with scheduled trigger
2. Call Azure DevOps pipeline
3. Store results in Azure Storage

---

## **Email Notifications Setup**

### GitHub Actions with Email:

Add to your workflow file:
```yaml
- name: Send Email Report
  if: always()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Daily Plastemart Prices - ${{ github.run_id }}
    to: your-email@example.com
    from: actions@github.com
    body: |
      Daily Plastemart Price Extraction Report
      Test Results: ${{ job.status }}
      View: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

---

## **Slack Notifications**

### For GitHub Actions:

1. Create Slack webhook
2. Add to workflow:
   ```yaml
   - name: Notify Slack
     uses: slackapi/slack-github-action@v1
     with:
       webhook-url: ${{ secrets.SLACK_WEBHOOK }}
       payload: |
         {
           "text": "Daily Plastemart prices extracted",
           "attachments": [{
             "title": "Test Results",
             "text": "Check prices: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
           }]
         }
   ```

---

## **Recommended Setup Summary**

| Requirement | Best Option |
|---|---|
| **Easy Setup** | GitHub Actions (Option 1) |
| **Full Control** | Local Scheduler (Option 3) |
| **Cloud Deployment** | AWS Lambda / Google Cloud Run |
| **Team Notifications** | GitHub Issues + Slack |
| **High Availability** | AWS / Google Cloud / Azure |

---

## **Troubleshooting**

### GitHub Actions Won't Run:
- ✓ Check Actions are enabled in repo settings
- ✓ Verify cron syntax is correct
- ✓ Check GitHub Actions logs for errors

### Local Scheduler Not Starting:
- ✓ Ensure Node.js is installed: `node --version`
- ✓ Install dependencies: `npm install`
- ✓ Check logs in `scheduler-logs/` directory

### Time Zone Issues:
- GitHub Actions uses UTC
- Convert your timezone to UTC for cron schedule
- Local scheduler uses system time

---

## **Testing**

Test your setup without waiting:

**GitHub Actions:**
```bash
# Manual trigger
gh workflow run plastemart-daily.yml
```

**Local Scheduler:**
```bash
# Run test immediately
npx playwright test tests/plastemart-excel-download.spec.ts
```

---

## **Questions?**

- GitHub Actions Docs: https://docs.github.com/en/actions
- Node-Cron Docs: https://github.com/kelektiv/node-cron
- Playwright Docs: https://playwright.dev
