const { chromium } = require('playwright');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_PASSWORD || 'your-app-password'
  }
});

// Store last price to avoid duplicate emails
const priceLogPath = path.join(__dirname, 'price-log.json');

function loadPriceLog() {
  try {
    if (fs.existsSync(priceLogPath)) {
      return JSON.parse(fs.readFileSync(priceLogPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading price log:', error);
  }
  return { lastPrice: null, lastAlertTime: null };
}

function savePriceLog(data) {
  fs.writeFileSync(priceLogPath, JSON.stringify(data, null, 2));
}

async function checkPrice() {
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    console.log('Navigating to discovercars.com...');
    await page.goto('https://www.discovercars.com/');
    await page.waitForLoadState('networkidle');

    // Enter pickup location
    console.log('Entering location details...');
    const input = await page.getByRole('textbox', { name: 'Enter airport or city' });
    await input.click();
    await input.fill('Milan');
    await page.waitForTimeout(500);

    // Select Milan Airport Malpensa
    const malpensaOption = await page.locator('text=Milan Airport Malpensa (MXP)').first();
    await malpensaOption.click();
    await page.waitForTimeout(500);

    // Set pickup date - May 9, 2026
    console.log('Setting dates...');
    const pickupDate = await page.locator('[role="application"]').first();
    await page.locator('button[name="Navigation arrow"]').nth(1).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '9' }).nth(1).click();
    await page.waitForTimeout(500);

    // Set drop-off date - May 23, 2026
    await page.getByRole('button', { name: '23' }).first().click();
    await page.waitForTimeout(500);

    // Set pickup time to 13:00
    const pickupTimeBtn = await page.locator('div').filter({ hasText: /^11:00$/ }).first();
    await pickupTimeBtn.click();
    await page.waitForTimeout(300);
    await page.getByRole('listitem').filter({ hasText: '13:00' }).first().click();
    await page.waitForTimeout(300);

    // Set drop-off time to 13:00
    const dropoffTimeBtn = await page.locator('div').filter({ hasText: /^11:00$/ }).last();
    await dropoffTimeBtn.click();
    await page.waitForTimeout(300);
    await page.getByRole('listitem').filter({ hasText: '13:00' }).last().click();
    await page.waitForTimeout(300);

    // Click search
    console.log('Searching for cars...');
    await page.getByRole('button', { name: 'Search now' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Apply filters - Automatic Transmission
    console.log('Applying filters...');
    const autoTransmission = await page.locator('text=Automatic Transmission').first().locator('xpath=..');
    await autoTransmission.click();
    await page.waitForTimeout(500);

    // Apply RentalPlus filter
    const rentalPlus = await page.locator('text=RentalPlus').first().locator('xpath=..');
    await rentalPlus.click();
    await page.waitForTimeout(500);

    // Sort by price
    await page.selectOption('[aria-label="Sort by"]', 'Price');
    await page.waitForTimeout(2000);

    // Extract zero deductible prices
    console.log('Extracting prices...');
    const pageSource = await page.content();
    
    // Find all zero deductible prices
    const pattern = /Zero deductible[\s\S]{0,2000}?Total for 14 days[\s\S]*?₹([\d,]+)/g;
    const matches = [...pageSource.matchAll(pattern)];
    
    let lowestPrice = null;
    if (matches.length > 0) {
      const prices = matches.map(m => parseFloat(m[1].replace(/,/g, '')));
      lowestPrice = Math.min(...prices);
    }

    await context.close();
    await browser.close();

    return lowestPrice;
  } catch (error) {
    console.error('Error checking price:', error);
    if (browser) {
      await browser.close();
    }
    return null;
  }
}

async function sendAlert(price) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com',
      to: 'monish.correia@gmail.com',
      subject: `🚨 Car Rental Price Alert: Price Dropped Below ₹50,000!`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
              <h2 style="color: #c41e3a;">Good News! 🎉</h2>
              <p>The zero deductible car rental price has dropped below your target of ₹50,000!</p>
              
              <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Current Price: <strong>₹${price.toLocaleString('en-IN')}</strong></h3>
              </div>

              <h3>Booking Details:</h3>
              <ul style="list-style-type: none; padding: 0;">
                <li><strong>Location:</strong> Milan Airport Malpensa (MXP)</li>
                <li><strong>Pick-up Date:</strong> May 9, 2026 at 13:00</li>
                <li><strong>Drop-off Date:</strong> May 23, 2026 at 13:00</li>
                <li><strong>Duration:</strong> 14 days</li>
                <li><strong>Transmission:</strong> Automatic</li>
                <li><strong>Supplier:</strong> RentalPlus</li>
                <li><strong>Special Feature:</strong> Zero Deductible</li>
              </ul>

              <p style="margin-top: 20px;">
                <a href="https://www.discovercars.com/" style="background-color: #c41e3a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Book Now on DiscoverCars
                </a>
              </p>

              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Checked on: ${new Date().toLocaleString()}<br/>
                This is an automated price monitoring alert.
              </p>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Alert email sent to monish.correia@gmail.com');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

async function main() {
  console.log('Starting price check at:', new Date().toLocaleString());
  
  const price = await checkPrice();
  
  if (price !== null) {
    console.log(`Current lowest zero deductible price: ₹${price.toLocaleString('en-IN')}`);
    
    const priceLog = loadPriceLog();
    
    // Send alert if price is below 50,000
    if (price < 50000) {
      console.log('Price is below target! Sending alert...');
      
      // Avoid sending multiple alerts on the same day
      const lastAlertTime = priceLog.lastAlertTime ? new Date(priceLog.lastAlertTime) : null;
      const hoursSinceLastAlert = lastAlertTime ? (new Date() - lastAlertTime) / (1000 * 60 * 60) : 25;
      
      if (hoursSinceLastAlert >= 24) {
        await sendAlert(price);
        priceLog.lastAlertTime = new Date().toISOString();
      } else {
        console.log(`Alert already sent in the last 24 hours. Next alert eligible in ${Math.round(24 - hoursSinceLastAlert)} hours.`);
      }
    } else {
      console.log(`Price (₹${price.toLocaleString('en-IN')}) is still above target of ₹50,000`);
    }
    
    priceLog.lastPrice = price;
    priceLog.lastChecked = new Date().toISOString();
    savePriceLog(priceLog);
  } else {
    console.error('Failed to fetch price');
  }
  
  console.log('Price check completed\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkPrice, sendAlert };
