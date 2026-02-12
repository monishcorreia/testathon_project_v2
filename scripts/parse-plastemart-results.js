#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Parse Playwright test output and extract Plastemart price extraction results
 * Outputs markdown formatted table for GitHub Actions summary
 */

function parseTestResults(logFile) {
  let testOutput = '';
  
  // Read the test output log file
  if (logFile && fs.existsSync(logFile)) {
    try {
      testOutput = fs.readFileSync(logFile, 'utf-8');
    } catch (e) {
      console.error(`Error reading log file ${logFile}:`, e.message);
    }
  }
  
  // If no log file provided or found, try alternative locations
  if (!testOutput) {
    const possiblePaths = [
      'test-output.log',
      'test-results/output.log',
      'test-results/stdout.log'
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          testOutput = fs.readFileSync(p, 'utf-8');
          console.log(`✓ Found output at ${p}`);
          break;
        } catch (e) {
          // Continue to next path
        }
      }
    }
  }
  
  if (!testOutput) {
    console.error('Warning: Could not find test output');
  }
  
  // Extract JSON results from output
  let resultsData = [];
  const jsonMatch = testOutput.match(/=== JSON OUTPUT ===\s*\n([\s\S]*?)(?:=== SUMMARY ===|$)/);
  
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1].trim();
      resultsData = JSON.parse(jsonStr);
      console.log(`✓ Parsed ${resultsData.length} results from test output`);
    } catch (e) {
      console.error('Failed to parse JSON results:', e.message);
    }
  } else {
    console.log('No JSON output section found in test log');
  }
  
  // Generate markdown table
  let markdown = '## Plastemart Price Extraction Results\n\n';
  markdown += `**Test completed on ${new Date().toISOString()}**\n\n`;
  
  if (resultsData.length === 0) {
    markdown += '⚠️ No results found in test output.\n';
  } else {
    markdown += '### Price Extraction Results\n\n';
    markdown += '| Sr. | Grade | Description | Pricing Section | Column | Row | Price |\n';
    markdown += '|-----|-------|-------------|-----------------|--------|-----|-------|\n';
    
    resultsData.forEach(result => {
      const priceDisplay = result.price === 'N/A' || result.price === 'ERROR' 
        ? `❌ ${result.price}` 
        : `✅ ${result.price}`;
      markdown += `| ${result.sr} | ${result.grade} | ${result.description} | ${result.pricingSection} | ${result.column} | ${result.row} | ${priceDisplay} |\n`;
    });
    
    // Add summary
    const successCount = resultsData.filter(r => r.price !== 'N/A' && r.price !== 'ERROR').length;
    const failCount = resultsData.length - successCount;
    
    markdown += `\n### Summary\n`;
    markdown += `- ✅ Successfully retrieved: **${successCount}/${resultsData.length}** prices\n`;
    if (failCount > 0) {
      markdown += `- ❌ Failed to retrieve: **${failCount}** prices\n`;
    }
    markdown += `- 📊 Success Rate: **${Math.round((successCount / resultsData.length) * 100)}%**\n`;
  }
  
  // Add downloads section
  markdown += `\n### Downloaded Files\n\n`;
  if (fs.existsSync('downloads')) {
    const files = fs.readdirSync('downloads');
    if (files.length > 0) {
      files.forEach(file => {
        const filePath = path.join('downloads', file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        markdown += `- 📄 \`${file}\` (${sizeMB} MB)\n`;
      });
    } else {
      markdown += '- No files downloaded\n';
    }
  } else {
    markdown += '- No downloads directory\n';
  }
  
  return markdown;
}

// Main execution
try {
  const logFile = process.argv[2];
  const markdown = parseTestResults(logFile);
  
  // Write to GitHub Step Summary
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    let existingContent = '';
    if (fs.existsSync(summaryFile)) {
      existingContent = fs.readFileSync(summaryFile, 'utf-8');
    }
    
    const newContent = existingContent + '\n' + markdown + '\n';
    fs.writeFileSync(summaryFile, newContent);
    console.log('✓ Results added to GitHub Actions summary');
  } else {
    console.log('GITHUB_STEP_SUMMARY not set, printing to stdout:');
    console.log(markdown);
  }
} catch (error) {
  console.error('Error parsing results:', error.message);
  process.exit(1);
}
