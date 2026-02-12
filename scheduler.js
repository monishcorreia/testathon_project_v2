const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'scheduler-logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Schedule the test to run daily at 9:00 AM
// Format: '0 9 * * *' = 9:00 AM every day
const task = cron.schedule('0 9 * * *', () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting scheduled Plastemart price extraction...`);
  
  const logFile = path.join(logsDir, `plastemart-${new Date().toISOString().split('T')[0]}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  logStream.write(`\n\n=== Scheduled Execution: ${timestamp} ===\n`);
  
  // Run the Playwright test
  const process = exec('npx playwright test tests/plastemart-excel-download.spec.ts', {
    cwd: __dirname
  });
  
  process.stdout.on('data', (data) => {
    console.log(data);
    logStream.write(data);
  });
  
  process.stderr.on('data', (data) => {
    console.error(data);
    logStream.write(`ERROR: ${data}`);
  });
  
  process.on('close', (code) => {
    const endTime = new Date().toISOString();
    const status = code === 0 ? 'SUCCESS' : 'FAILED';
    const message = `\n=== Execution completed at ${endTime} - Status: ${status} ===\n`;
    
    console.log(message);
    logStream.write(message);
    logStream.end();
    
    // Optional: Send notification
    if (code === 0) {
      console.log('✓ Prices extracted successfully!');
    } else {
      console.error('✗ Test execution failed!');
    }
  });
});

console.log('✓ Plastemart price extraction scheduler started');
console.log('📅 Scheduled to run daily at 9:00 AM');
console.log('📝 Logs will be saved to:', logsDir);
console.log('\nPress Ctrl+C to stop the scheduler');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nScheduler stopped by user');
  task.stop();
  process.exit(0);
});
