# 🚗 DiscoverCars Price Monitor - Complete Setup

Automated daily price monitoring for your Milan Airport car rental with email alerts when the price drops below ₹50,000.

## 📚 Documentation Files Created

| File | Purpose |
|------|---------|
| `price-monitor.js` | Main monitoring script that checks prices daily |
| `test-setup.js` | Verification script to test your setup |
| `QUICK-START.md` | Fast setup guide (start here!) |
| `PRICE-MONITOR-SETUP.md` | Detailed setup and troubleshooting |
| `setup-price-monitor.sh` | Automated setup script (macOS/Linux) |
| `run-price-monitor.bat` | Windows task runner script |
| `.env` | Configuration file (create this yourself) |

## 🚀 Getting Started (Choose Your Path)

### 👍 Fastest Setup (Recommended)

**macOS/Linux Users:**
```bash
chmod +x setup-price-monitor.sh
./setup-price-monitor.sh
```

**Windows Users:**
1. Read `QUICK-START.md` and follow the Windows section

**All Users:**
1. Follow steps in `QUICK-START.md` (5 minutes)
2. Run `node test-setup.js` to verify
3. Manually run `node price-monitor.js` to test

---

## 📋 What You Need to Do (Step by Step)

### Step 1: Get Gmail App Password (5 min)
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not enabled
3. Go to **App passwords**
4. Generate a password for **Mail** → **Windows Computer**
5. **Copy** the 16-character password

### Step 2: Create `.env` File (1 min)
Create a file named `.env` in the project directory with:

```
GMAIL_USER=monish.correia@gmail.com
GMAIL_PASSWORD=your-16-char-password-here
```

**⚠️ IMPORTANT:** Never share or commit this file!

### Step 3: Install Dependencies (2 min)
```bash
npm install playwright nodemailer dotenv
```

### Step 4: Test the Setup
```bash
node test-setup.js
```

Expected output:
```
✅ Node.js vX.X.X (OK)
✅ .env file found and configured
✅ playwright
✅ nodemailer
✅ dotenv
✅ price-monitor.js found
...
✅ All tests passed! Ready to run.
```

### Step 5: Manual Test Run
```bash
node price-monitor.js
```

Expected console output:
```
Starting price check at: [timestamp]
Navigating to discovercars.com...
Entering location details...
Setting dates...
Searching for cars...
Applying filters...
Extracting prices...
Current lowest zero deductible price: ₹54,750
Price is still above target of ₹50,000
Price check completed
```

### Step 6: Schedule Daily Runs
Follow the appropriate section in `QUICK-START.md`:
- **macOS:** LaunchAgent setup
- **Linux:** Cron setup
- **Windows:** Task Scheduler setup

---

## 🎯 What Happens Next

### Daily Check (9:00 AM)
- Script automatically runs at 9:00 AM every day
- Checks current price on DiscoverCars
- Logs results to `price-monitor.log`
- Saves price history in `price-log.json`

### When Price Drops Below ₹50,000
- Email alert sent to `monish.correia@gmail.com`
- Includes current price and booking link
- Only one alert per 24 hours (prevents spam)

### Example Alert Email
```
🎉 Good News!

Current Price: ₹49,500 (below ₹50,000!)

Booking Details:
- Location: Milan Airport Malpensa (MXP)
- Pick-up: May 9, 2026 at 13:00
- Drop-off: May 23, 2026 at 13:00
- Duration: 14 days
- Transmission: Automatic
- Supplier: RentalPlus
- Feature: Zero Deductible

[Book Now Button]
```

---

## 📊 Monitoring & Logs

### View Current Status
```bash
# Real-time logs
tail -f price-monitor.log

# Price history
cat price-log.json

# Last check command
ls -la price-monitor.log
```

### Expected Log Output
```json
{
  "lastPrice": 54750,
  "lastChecked": "2026-03-04T09:15:32.000Z",
  "lastAlertTime": null
}
```

---

## 🔧 Configuration Options

### Change Alert Price Threshold
Edit `price-monitor.js` and find:
```javascript
if (price < 50000) {  // Change 50000 to your desired price
```

### Change Daily Check Time
- **macOS:** Edit `~/Library/LaunchAgents/com.discovercars.pricemonitor.plist`
  ```xml
  <key>Hour</key>
  <integer>9</integer>  <!-- Change to your preferred hour (0-23) -->
  ```
- **Linux:** Edit crontab
  ```
  0 9 * * *  <!-- Change 9 to your preferred hour -->
  ```
- **Windows:** Edit Task Scheduler trigger time

### Change Email Recipient
Edit `price-monitor.js`:
```javascript
to: 'your-email@example.com',  // Change this
```

---

## ⚠️ Troubleshooting

### "No module named 'playwright'"
```bash
npm install playwright
```

### "Cannot find .env file"
Create `.env` with your Gmail credentials (see Step 2)

### "Authentication failed for Email"
1. Verify Gmail 2FA is enabled
2. Regenerate App Password
3. Update `.env` file

### "Script doesn't run on schedule"
1. **macOS:** Check if LaunchAgent is loaded
   ```bash
   launchctl list | grep discovercars
   ```
2. **Linux:** Check crontab
   ```bash
   crontab -l
   ```
3. **Windows:** Open Task Scheduler and verify task status

### "Website structure changed"
Contact support if price extraction fails - selectors may need updating

---

## 🎯 Current Booking Details

- **Location:** Milan Airport Malpensa (MXP)
- **Pick-up Date:** May 9, 2026 at 13:00
- **Drop-off Date:** May 23, 2026 at 13:00
- **Duration:** 14 days
- **Car Type:** Compact (Automatic)
- **Features:** Air Conditioning, Free Shuttle, Instant Confirmation
- **Supplier:** RentalPlus (8.6 rating)
- **Special:** Zero Deductible
- **Current Price:** ₹54,750
- **Alert Threshold:** ₹50,000

---

## 💡 Pro Tips

1. **Test first:** Always run `node price-monitor.js` manually before setting up scheduling
2. **Check logs:** Review `price-monitor.log` daily for a few days to ensure it's working
3. **Email whitelist:** Add task email to contacts to prevent alerts going to spam
4. **Security:** Keep `.env` file private and never commit to Git
5. **Backup:** Save your app password in a secure location

---

## 📞 Quick Reference

```bash
# Test setup
node test-setup.js

# Run manually
node price-monitor.js

# View logs
tail -f price-monitor.log

# View price history
cat price-log.json

# macOS: Check if scheduled task is running
launchctl list | grep discovercars

# Linux: Check cron job
crontab -l

# Unload macOS scheduler (if needed)
launchctl unload ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist
```

---

## 📖 Documentation Structure

```
.
├── price-monitor.js              # 🔴 Main script
├── test-setup.js                 # 🟡 Verification tool
├── QUICK-START.md                # 🟢 Read this first!
├── PRICE-MONITOR-SETUP.md        # 📘 Detailed guide
├── setup-price-monitor.sh        # 🔧 Auto setup (macOS/Linux)
├── run-price-monitor.bat         # 🔧 Auto setup (Windows)
├── .env                          # 🔐 Your credentials (create this)
├── price-monitor.log             # 📊 Execution logs (auto-created)
├── price-log.json                # 📈 Price history (auto-created)
└── README-PRICE-MONITOR.md       # 📚 This file
```

---

## ✅ Completion Checklist

- [ ] Read `QUICK-START.md`
- [ ] Generated Gmail App Password
- [ ] Created `.env` file
- [ ] Ran `npm install`
- [ ] Ran `node test-setup.js` successfully
- [ ] Ran `node price-monitor.js` successfully
- [ ] Set up daily scheduling
- [ ] Verified `price-monitor.log` exists
- [ ] Received test email (optional)

---

## 🎉 You're All Set!

Once everything is working:
- ✅ Monitor runs automatically every day at 9:00 AM
- ✅ Price history is logged
- ✅ Email alert when price drops below ₹50,000
- ✅ No manual action needed

**Enjoy your future car rental!** 🚗✈️

---

*Last Updated: March 4, 2026*  
*Script Version: 1.0*  
*Compatible with: macOS, Linux, Windows*
