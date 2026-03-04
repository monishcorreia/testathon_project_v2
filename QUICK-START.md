# Car Rental Price Monitor - Quick Start Guide

## 🎯 What This Does

Checks DiscoverCars daily for zero deductible car rental prices and sends you an email alert when the price drops below **₹50,000**.

**Current Price:** ₹54,750 (May 9-23, 2026 from RentalPlus)

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Enable Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords**
4. Select **Mail** → **Windows Computer** (or your device)
5. **Copy** the 16-character password shown

### Step 2: Create Environment File

In the project directory, create a `.env` file with:

```
GMAIL_USER=monish.correia@gmail.com
GMAIL_PASSWORD=your-16-char-app-password
```

Replace the password with the one from Step 1.

### Step 3: Install & Test

```bash
# Install dependencies
npm install playwright nodemailer dotenv

# Test the script
node price-monitor.js
```

You should see:
```
Starting price check at: [timestamp]
...
Current lowest zero deductible price: ₹54,750
Price is still above target of ₹50,000
Price check completed
```

### Step 4: Schedule Daily Runs

**Choose one option based on your OS:**

#### macOS (Recommended)

```bash
# Make setup script executable
chmod +x setup-price-monitor.sh

# Run setup script (automated)
./setup-price-monitor.sh
```

Or manually:

```bash
# Find Node.js path
which node

# Create LaunchAgent file
nano ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist

# Paste this (update node path and password):
```

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

```bash
# Load the agent
launchctl load ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist

# Verify it's running
launchctl list | grep pricemonitor
```

#### Linux (Cron)

```bash
# Open crontab editor
crontab -e

# Add this line (9 AM every day):
0 9 * * * cd /Users/monish.a/testathon_project_v2 && /usr/local/bin/node price-monitor.js >> price-monitor.log 2>&1

# Save and exit (Ctrl+X, Y, Enter)
```

#### Windows (Task Scheduler)

1. Press `Win+R` → Type **taskschd.msc**
2. Click **Create Basic Task**
3. Name: **DiscoverCars Price Monitor**
4. Trigger: **Daily** → **9:00 AM**
5. Action: **Start a program**
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `C:\path\to\price-monitor.js`
   - Start in: `C:\path\to\project`

---

## ✉️ What the Alert Email Looks Like

When price drops below ₹50,000, you'll get an email with:
- ✅ Current price
- ✅ Booking details (location, dates, duration)
- ✅ Supplier info (RentalPlus, 8.6 rating)
- ✅ Direct link to book

**Note:** Only one alert per 24 hours to avoid spam

---

## 📊 Monitor the Process

Check logs:
```bash
# View real-time logs
tail -f price-monitor.log

# View price history
cat price-log.json
```

Expected log:
```json
{
  "lastPrice": 54750,
  "lastChecked": "2026-03-04T09:15:00.000Z",
  "lastAlertTime": null
}
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| No email received | Check spam folder, verify 2FA & app password |
| Script doesn't run | Check Node.js path: `which node` |
| Email auth fails | Regenerate app password from Google Account |
| Website changed | Update selectors in price-monitor.js |

---

## 🎯 Next Steps

1. ✅ Create `.env` file
2. ✅ Test with `node price-monitor.js`
3. ✅ Set up daily scheduling
4. ✅ Monitor logs for first run

---

## 📌 Important Notes

- 🔐 **Keep `.env` private** - Never commit to Git
- 📧 **App password** - Different from Gmail password
- ⏰ **Default time** - 9:00 AM daily (customize in setup)
- 💰 **Price threshold** - ₹50,000 (change in script if needed)

---

## 📞 Feedback

Once set up, you'll get notified immediately when prices drop! 

Current booking details:
- **Location:** Milan Airport Malpensa (MXP)
- **Dates:** May 9-23, 2026
- **Duration:** 14 days
- **Transmission:** Automatic
- **Supplier:** RentalPlus
- **Feature:** Zero Deductible
- **Current Price:** ₹54,750

Happy travels! 🚗✈️
