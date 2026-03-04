#!/usr/bin/env node

/**
 * GitHub Actions Setup Verification Script
 * Checks if your repository is properly configured for GitHub Actions
 * 
 * Usage: node verify-github-actions.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const symbols = {
  pass: '✅',
  fail: '❌',
  warn: '⚠️ ',
  info: 'ℹ️ ',
  todo: '📋',
};

console.log(`\n${colors.cyan}🔍 GitHub Actions Setup Verification${colors.reset}\n`);

let allChecks = [];
let failureCount = 0;

// Test 1: Check if .github/workflows/price-monitor.yml exists
function checkWorkflowFile() {
  console.log(`${symbols.info} Checking workflow file...`);
  const workflowPath = path.join(__dirname, '.github/workflows/price-monitor.yml');
  if (fs.existsSync(workflowPath)) {
    console.log(`  ${symbols.pass} Workflow file exists: ${colors.green}.github/workflows/price-monitor.yml${colors.reset}`);
    allChecks.push(true);
    return true;
  } else {
    console.log(`  ${symbols.fail} Workflow file missing: ${colors.red}.github/workflows/price-monitor.yml${colors.reset}`);
    console.log(`     ${colors.yellow}Action: Create .github/workflows/price-monitor.yml${colors.reset}`);
    allChecks.push(false);
    failureCount++;
    return false;
  }
}

// Test 2: Check if price-monitor.js exists
function checkMainScript() {
  console.log(`${symbols.info} Checking main script...`);
  const scriptPath = path.join(__dirname, 'price-monitor.js');
  if (fs.existsSync(scriptPath)) {
    console.log(`  ${symbols.pass} Main script exists: ${colors.green}price-monitor.js${colors.reset}`);
    allChecks.push(true);
    return true;
  } else {
    console.log(`  ${symbols.fail} Main script missing: ${colors.red}price-monitor.js${colors.reset}`);
    console.log(`     ${colors.yellow}Action: Ensure price-monitor.js is in root directory${colors.reset}`);
    allChecks.push(false);
    failureCount++;
    return false;
  }
}

// Test 3: Check if package.json has required dependencies
function checkPackageJson() {
  console.log(`${symbols.info} Checking dependencies...`);
  const packagePath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log(`  ${symbols.fail} package.json not found: ${colors.red}package.json${colors.reset}`);
    console.log(`     ${colors.yellow}Action: Ensure package.json exists with playwright and nodemailer${colors.reset}`);
    allChecks.push(false);
    failureCount++;
    return false;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = pkg.dependencies || {};
    
    const required = ['playwright', 'nodemailer', 'dotenv'];
    const missing = required.filter(dep => !deps[dep]);
    
    if (missing.length === 0) {
      console.log(`  ${symbols.pass} All dependencies found:`);
      console.log(`     - ${colors.green}playwright${colors.reset}`);
      console.log(`     - ${colors.green}nodemailer${colors.reset}`);
      console.log(`     - ${colors.green}dotenv${colors.reset}`);
      allChecks.push(true);
      return true;
    } else {
      console.log(`  ${symbols.fail} Missing dependencies: ${colors.red}${missing.join(', ')}${colors.reset}`);
      console.log(`     ${colors.yellow}Action: Run: npm install ${missing.join(' ')}${colors.reset}`);
      allChecks.push(false);
      failureCount++;
      return false;
    }
  } catch (error) {
    console.log(`  ${symbols.fail} Error reading package.json: ${colors.red}${error.message}${colors.reset}`);
    allChecks.push(false);
    failureCount++;
    return false;
  }
}

// Test 4: Check if .git folder exists (for GitHub integration)
function checkGitRepository() {
  console.log(`${symbols.info} Checking Git repository...`);
  const gitPath = path.join(__dirname, '.git');
  
  if (fs.existsSync(gitPath)) {
    console.log(`  ${symbols.pass} Git repository initialized: ${colors.green}.git directory found${colors.reset}`);
    allChecks.push(true);
    return true;
  } else {
    console.log(`  ${symbols.warn} Git repository not initialized: ${colors.yellow}.git directory not found${colors.reset}`);
    console.log(`     ${colors.yellow}Action: Run: ${colors.cyan}git init${colors.reset}`);
    console.log(`           Then: ${colors.cyan}git remote add origin https://github.com/USERNAME/REPO.git${colors.reset}`);
    allChecks.push(false);
    return false;
  }
}

// Test 5: Check for .gitignore compliance
function checkGitignore() {
  console.log(`${symbols.info} Checking .env security...`);
  const gitignorePath = path.join(__dirname, '.gitignore');
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(gitignorePath)) {
    try {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignoreContent.includes('.env')) {
        console.log(`  ${symbols.pass} .env is protected in .gitignore: ${colors.green}.env properly ignored${colors.reset}`);
        allChecks.push(true);
        return true;
      } else {
        console.log(`  ${symbols.warn} .env not in .gitignore: ${colors.yellow}add .env to .gitignore${colors.reset}`);
        allChecks.push(false);
        return false;
      }
    } catch (error) {
      console.log(`  ${symbols.fail} Error reading .gitignore: ${colors.red}${error.message}${colors.reset}`);
      allChecks.push(false);
      failureCount++;
      return false;
    }
  } else {
    console.log(`  ${symbols.warn} .gitignore not found: ${colors.yellow}create .gitignore${colors.reset}`);
    console.log(`     Recommended content:\n       .env\n       node_modules/\n       price-log.json\n       *.log`);
    allChecks.push(false);
    return false;
  }
}

// Test 6: Check Node version if available
function checkNodeVersion() {
  console.log(`${symbols.info} Checking Node.js version...`);
  try {
    const { execSync } = require('child_process');
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
    
    if (majorVersion >= 14) {
      console.log(`  ${symbols.pass} Node.js version compatible: ${colors.green}${nodeVersion}${colors.reset}`);
      console.log(`     GitHub Actions uses Node.js 18, which is compatible`);
      allChecks.push(true);
      return true;
    } else {
      console.log(`  ${symbols.warn} Node.js version outdated: ${colors.yellow}${nodeVersion}${colors.reset}`);
      console.log(`     Recommended: v14 or higher (GitHub Actions uses v18)`);
      allChecks.push(false);
      return false;
    }
  } catch (error) {
    console.log(`  ${symbols.fail} Cannot check Node.js: ${colors.red}${error.message}${colors.reset}`);
    allChecks.push(false);
    failureCount++;
    return false;
  }
}

// Test 7: Validate workflow file syntax
function validateWorkflowSyntax() {
  console.log(`${symbols.info} Validating workflow file syntax...`);
  const workflowPath = path.join(__dirname, '.github/workflows/price-monitor.yml');
  
  if (!fs.existsSync(workflowPath)) {
    console.log(`  ${symbols.warn} Cannot validate: workflow file not found`);
    allChecks.push(false);
    return false;
  }

  try {
    const yaml = require('js-yaml');
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    try {
      yaml.load(workflowContent);
      console.log(`  ${symbols.pass} Workflow YAML syntax valid: ${colors.green}No syntax errors${colors.reset}`);
      allChecks.push(true);
      return true;
    } catch (yamlError) {
      console.log(`  ${symbols.fail} YAML syntax error: ${colors.red}${yamlError.message}${colors.reset}`);
      allChecks.push(false);
      failureCount++;
      return false;
    }
  } catch (error) {
    console.log(`  ${symbols.warn} YAML parser not available, skipping validation`);
    console.log(`     ${colors.yellow}Run: npm install js-yaml${colors.reset} for full validation`);
    allChecks.push(false);
    return false;
  }
}

// Run all checks
console.log(`${colors.blue}Running checks...${colors.reset}\n`);

checkWorkflowFile();
console.log();
checkMainScript();
console.log();
checkPackageJson();
console.log();
checkGitRepository();
console.log();
checkGitignore();
console.log();
checkNodeVersion();
console.log();
validateWorkflowSyntax();

// Summary
console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

const passCount = allChecks.filter(Boolean).length;
const totalCount = allChecks.length;

if (failureCount === 0) {
  console.log(`${symbols.pass} ${colors.green}All checks passed!${colors.reset}\n`);
  console.log(`${colors.green}Next steps:${colors.reset}`);
  console.log(`  1. Push to GitHub: ${colors.cyan}git push -u origin main${colors.reset}`);
  console.log(`  2. Add GitHub Secrets:`);
  console.log(`     - Go to: https://github.com/YOUR-USERNAME/REPO/settings/secrets/actions`);
  console.log(`     - Add: GMAIL_USER = monish.correia@gmail.com`);
  console.log(`     - Add: GMAIL_PASSWORD = (16-character Gmail app password)`);
  console.log(`  3. Test workflow: Go to Actions tab → Click "Run workflow"`);
} else {
  console.log(`${symbols.fail} ${colors.red}${failureCount} issue(s) found${colors.reset}\n`);
  console.log(`${colors.yellow}Please fix the issues above before pushing to GitHub.${colors.reset}\n`);
  console.log(`${colors.yellow}See: GITHUB-ACTIONS-SETUP.md for detailed instructions${colors.reset}`);
}

console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
