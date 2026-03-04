#!/usr/bin/env node

/**
 * Test Script for Car Rental Price Monitor
 * Verifies all components are working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 Car Rental Price Monitor - Verification Test\n');
console.log('='.repeat(50));

let allTestsPassed = true;

// Test 1: Check Node.js version
console.log('\n1️⃣  Checking Node.js version...');
try {
  const version = process.version;
  const majorVersion = parseInt(version.split('.')[0].substring(1));
  if (majorVersion >= 14) {
    console.log(`   ✅ Node.js ${version} (OK)`);
  } else {
    console.log(`   ❌ Node.js ${version} (Need v14+)`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log(`   ❌ Error checking Node.js: ${error.message}`);
  allTestsPassed = false;
}

// Test 2: Check .env file
console.log('\n2️⃣  Checking .env configuration...');
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('GMAIL_USER') && envContent.includes('GMAIL_PASSWORD')) {
      console.log(`   ✅ .env file found and configured`);
      
      // Parse env
      const lines = envContent.split('\n');
      let user = null;
      let hasPassword = false;
      
      for (const line of lines) {
        if (line.startsWith('GMAIL_USER=')) {
          user = line.split('=')[1].trim();
        }
        if (line.startsWith('GMAIL_PASSWORD=')) {
          const pass = line.split('=')[1].trim();
          hasPassword = pass && pass.length > 0;
        }
      }
      
      if (user && hasPassword) {
        console.log(`      Gmail User: ${user}`);
        console.log(`      Gmail Password: ${hasPassword ? '✅ Set' : '❌ Not set'}`);
      } else {
        console.log(`   ❌ .env file incomplete`);
        allTestsPassed = false;
      }
    } else {
      console.log(`   ❌ .env file missing required variables`);
      allTestsPassed = false;
    }
  } else {
    console.log(`   ❌ .env file not found at ${envPath}`);
    console.log(`      Create it with: echo "GMAIL_USER=your@email.com" > .env`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log(`   ❌ Error checking .env: ${error.message}`);
  allTestsPassed = false;
}

// Test 3: Check required packages
console.log('\n3️⃣  Checking npm dependencies...');
const requiredPackages = ['playwright', 'nodemailer', 'dotenv'];
let missingPackages = [];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
    console.log(`   ✅ ${pkg}`);
  } catch (error) {
    console.log(`   ❌ ${pkg} (not installed)`);
    missingPackages.push(pkg);
    allTestsPassed = false;
  }
}

if (missingPackages.length > 0) {
  console.log(`\n   Install missing packages with:`);
  console.log(`   npm install ${missingPackages.join(' ')}`);
}

// Test 4: Check price-monitor.js file
console.log('\n4️⃣  Checking price-monitor.js...');
try {
  const scriptPath = path.join(__dirname, 'price-monitor.js');
  if (fs.existsSync(scriptPath)) {
    console.log(`   ✅ price-monitor.js found`);
    
    const content = fs.readFileSync(scriptPath, 'utf8');
    const checks = [
      { name: 'chromium', found: content.includes('chromium') },
      { name: 'nodemailer', found: content.includes('nodemailer') },
      { name: 'Milan Airport Malpensa', found: content.includes('Milan') },
      { name: 'Zero deductible check', found: content.includes('Zero deductible') },
      { name: 'Email sending', found: content.includes('sendAlert') }
    ];
    
    for (const check of checks) {
      if (check.found) {
        console.log(`      ✅ ${check.name}`);
      } else {
        console.log(`      ❌ ${check.name}`);
        allTestsPassed = false;
      }
    }
  } else {
    console.log(`   ❌ price-monitor.js not found`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log(`   ❌ Error checking script: ${error.message}`);
  allTestsPassed = false;
}

// Test 5: Check price-log.json
console.log('\n5️⃣  Checking price history log...');
try {
  const logPath = path.join(__dirname, 'price-log.json');
  if (fs.existsSync(logPath)) {
    const logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    console.log(`   ✅ price-log.json exists`);
    console.log(`      Last price: ₹${logData.lastPrice || 'Not checked yet'}`);
    console.log(`      Last checked: ${logData.lastChecked || 'Never'}`);
    console.log(`      Last alert: ${logData.lastAlertTime || 'Not sent yet'}`);
  } else {
    console.log(`   ℹ️  price-log.json not created yet (will be created on first run)`);
  }
} catch (error) {
  console.log(`   ⚠️  Error reading price-log.json: ${error.message}`);
}

// Test 6: Check file permissions
console.log('\n6️⃣  Checking file permissions...');
try {
  const scriptPath = path.join(__dirname, 'price-monitor.js');
  const stats = fs.statSync(scriptPath);
  const canRead = (stats.mode & fs.constants.R_OK) !== 0;
  const canExecute = (stats.mode & fs.constants.X_OK) !== 0;
  
  console.log(`   ✅ price-monitor.js readable: ${canRead ? '✅' : '❌'}`);
  if (!canRead) {
    console.log(`      Fix with: chmod +r price-monitor.js`);
  }
} catch (error) {
  console.log(`   ⚠️  Error checking permissions: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('\n✅ All tests passed! Ready to run.\n');
  console.log('Run the monitor with:');
  console.log('   node price-monitor.js\n');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please fix the issues above.\n');
  console.log('Recommended next steps:');
  console.log('1. Create .env file with GMAIL_USER and GMAIL_PASSWORD');
  console.log('2. Run: npm install playwright nodemailer dotenv');
  console.log('3. Run this test again: node test-setup.js\n');
  process.exit(1);
}
