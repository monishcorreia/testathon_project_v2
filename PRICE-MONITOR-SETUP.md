# Car Rental Price Monitor - Setup Guide

This automated price monitor checks the discovercars.com website daily for zero deductible car rental prices and sends you an email alert when the price drops below ₹50,000.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Gmail account with App Password enabled

## Installation Steps

### 1. Install Dependencies

```bash
npm install playwright nodemailer dotenv
```

### 2. Set Up Gmail App Password

Since Gmail requires app-specific passwords for third-party applications:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to "App passwords" 
4. Select "Mail" and "Windows Computer" (or your device type)
5. Copy the generated 16-character password

### 3. Create Environment Configuration

Create a `.env` file in the project root with your Gmail credentials:

```bash
echo "GMAIL_USER=monish.correia@gmail.com" > .env
echo "GMAIL_PASSWORD=your-16-char-app-password" >> .env
```

Replace `your-16-char-app-password` with the password from step 2.

### 4. Test the Script

Run the script manually to verify it works:

```bash
node price-monitor.js
```

Expected output:
```
Starting price check at: [timestamp]
Navigating to discovercars.com...
Entering location details...
Setting dates...
Searching for cars...
Applying filters...
Sort by price
Extracting prices...
Current lowest zero deductible price: ₹54,750
Price is still above target of ₹50,000
Price check completed
```

## Scheduling Daily Runs

### Option A: Using Cron (macOS/Linux)

1. Open crontab editor:
```bash
crontab -e
```

2. Add this line to run the script daily at 9:00 AM:
```
0 9 * * * cd /Users/monish.a/testathon_project_v2 && node price-monitor.js >> price-monitor.log 2>&1
```

3. Save and exit (Ctrl+X, then Y, then Enter)

### Option B: Using LaunchAgent (macOS - Recommended)

1. Create a launch agent plist file:
```bash
nano ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist
```

2. Paste the following content:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.discovercars.pricemonitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/monish.a/testathon_project_v2/price-monitor.js</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>GMAIL_USER</key>
        <string>monish.correia@gmail.com</string>
        <key>GMAIL_PASSWORD</key>
        <string>your-16-char-app-password</string>
    </dict>
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
    </array>
    <key>StandardOutPath</key>
    <string>/Users/monish.a/testathon_project_v2/price-monitor.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/monish.a/testathon_project_v2/price-monitor.log</string>
</dict>
</plist>
```

3. Replace `your-16-char-app-password` with your actual app password

4. Save and exit (Ctrl+X, then Y, then Enter)

5. Load the agent:
```bash
launchctl load ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist
```

6. Verify it's loaded:
```bash
launchctl list | grep pricemonitor
```

### Option C: Using Windows Task Scheduler

1. Press `Win+R` and type `taskschd.msc`
2. Click "Create Basic Task"
3. Name: "DiscoverCars Price Monitor"
4. Set trigger: Daily at 9:00 AM
5. Set action: Start a program
   - Program: `node.exe` (full path like C:\Program Files\nodejs\node.exe)
   - Arguments: `C:\path\to\price-monitor.js`
   - Start in: `C:\path\to\project\directory`

## Features

✅ **Automated Daily Checks** - Runs at 9:00 AM every day  
✅ **Price Tracking** - Monitors zero deductible car rental prices  
✅ **Smart Alerts** - Only sends one alert per 24 hours  
✅ **Email Notifications** - HTML-formatted email with booking details  
✅ **Price Logging** - Keeps track of last checked price and alert time  
✅ **Error Handling** - Graceful error handling with logging  

## Monitoring

Check the logs to see the monitoring activity:

```bash
# View recent logs
tail -f price-monitor.log

# Or check the price log
cat price-log.json
```

## Alert Email

When the price drops below ₹50,000, you'll receive an email with:
- Current lowest price
- Booking details (location, dates, duration)
- Direct link to book on DiscoverCars
- Timestamp of the check

## Troubleshooting

### Script doesn't run on schedule
1. Verify Node.js path: `which node`
2. Check crontab is active: `crontab -l`
3. Review logs for errors: `tail -f price-monitor.log`

### No email received
1. Verify app password is correct (16 characters)
2. Check 2FA is enabled on Gmail
3. Check spam folder
4. Review script output for email errors

### Price extraction fails
1. DiscoverCars website structure may have changed
2. Run script manually to see error messages
3. Update selectors in the script if website layout changed

## Customization

### Change Alert Threshold
Edit the script and find this line:
```javascript
if (price < 50000) {
```

Change `50000` to your desired threshold.

### Change Check Time
For cron: Change `0 9` in the cron expression (hour minute)  
For LaunchAgent: Change `<integer>9</integer>` to your desired hour

### Change Email Recipient
Edit the email configuration in the script:
```javascript
to: 'monish.correia@gmail.com',
```

## Security Notes

⚠️ **Important:** Never commit `.env` file to version control!  
⚠️ **Never** share your app password or commit it to git  
✅ Use environment variables for sensitive data

## Uninstalling

### Remove Cron Job
```bash
crontab -e
# Delete the line, save and exit
```

### Remove LaunchAgent
```bash
launchctl unload ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist
rm ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist
```

## Support

For issues, check:
1. Script logs: `price-monitor.log`
2. Price history: `price-log.json`
3. Error messages in console output
