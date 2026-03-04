#!/bin/bash

# Car Rental Price Monitor - Quick Setup Script
# Run this script to set up the price monitor

set -e

echo "🚀 Car Rental Price Monitor Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install playwright nodemailer dotenv

echo ""
echo "🔐 Gmail Setup Required"
echo "======================="
echo "Before continuing, you need to:"
echo "1. Enable 2-Step Verification on your Gmail account"
echo "2. Generate an App Password"
echo ""
echo "Steps:"
echo "1. Go to https://myaccount.google.com/security"
echo "2. Click 'App passwords' (under 2-Step Verification)"
echo "3. Select 'Mail' and 'Windows Computer'"
echo "4. Copy the 16-character password"
echo ""
read -p "Enter your Gmail address (e.g., monish.correia@gmail.com): " gmail_user
read -sp "Enter your 16-character App Password (hidden): " app_password
echo ""

# Create .env file
cat > .env << EOF
GMAIL_USER=$gmail_user
GMAIL_PASSWORD=$app_password
EOF

echo "✅ .env file created"
echo ""

# Test the script
echo "🧪 Testing the script..."
echo ""
if node price-monitor.js; then
    echo ""
    echo "✅ Script executed successfully!"
else
    echo ""
    echo "⚠️  Script had some issues. Check the output above."
fi

echo ""
echo "📅 Setting up Daily Schedule"
echo "============================"
echo ""

read -p "Do you want to schedule this to run daily at 9:00 AM? (yes/no): " schedule_choice

if [[ "$schedule_choice" == "yes" ]] || [[ "$schedule_choice" == "y" ]]; then
    echo ""
    echo "Creating LaunchAgent for daily execution..."
    
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    node_path=$(which node)
    
    mkdir -p ~/Library/LaunchAgents
    
    cat > ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.discovercars.pricemonitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>$node_path</string>
        <string>$script_dir/price-monitor.js</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>GMAIL_USER</key>
        <string>$gmail_user</string>
        <key>GMAIL_PASSWORD</key>
        <string>$app_password</string>
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
    <string>$script_dir/price-monitor.log</string>
    <key>StandardErrorPath</key>
    <string>$script_dir/price-monitor.log</string>
</dict>
</plist>
EOF

    launchctl load ~/Library/LaunchAgents/com.discovercars.pricemonitor.plist
    echo "✅ LaunchAgent installed and loaded"
    echo "   The monitor will run daily at 9:00 AM"
else
    echo "⏭️  Setup complete. You can still run the script manually:"
    echo "   node price-monitor.js"
fi

echo ""
echo "📋 Setup Summary"
echo "================"
echo "✅ Dependencies installed"
echo "✅ Email configured"
echo "✅ Script tested"
if [[ "$schedule_choice" == "yes" ]] || [[ "$schedule_choice" == "y" ]]; then
    echo "✅ Daily schedule activated"
fi

echo ""
echo "📖 For more information, see: PRICE-MONITOR-SETUP.md"
echo ""
echo "🎉 Setup complete! You'll receive an email when the price drops below ₹50,000"
echo ""
