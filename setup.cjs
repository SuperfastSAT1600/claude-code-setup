#!/usr/bin/env node

/**
 * Cross-Platform Project Setup Script
 *
 * This script configures the project for your operating system and preferences.
 * Run with: node setup.cjs
 *
 * Features:
 * - Platform detection (Windows/macOS/Linux)
 * - GitHub setup (REQUIRED): git identity, GitHub CLI, authentication, PAT
 * - Supabase setup (REQUIRED): CLI, authentication, project linking, API credentials
 * - Slack MCP setup (REQUIRED): Bot token, Team ID for PR notifications
 * - Vercel setup (OPTIONAL): CLI, authentication, project linking, API token
 * - Claude Code CLI installation
 * - MCP server configuration with correct commands
 * - API key collection (securely stored in gitignored files)
 * - Prerequisites checking
 * - Environment file setup
 * - Optional dependency installation
 */

// Import modules
const { color, log, header } = require('./lib/ui.cjs');
const { getPlatformInfo } = require('./lib/platform.cjs');
const { checkPrerequisites } = require('./lib/prerequisites.cjs');
const { ask, askYesNo } = require('./lib/input.cjs');
const { setupGitHub } = require('./lib/github.cjs');
const { setupSupabase } = require('./lib/supabase.cjs');
const { setupClaudeCode } = require('./lib/claude-code.cjs');
const { configureAutoOpenLocalhost } = require('./lib/localhost.cjs');
const { configureMcpServers } = require('./lib/mcp.cjs');
const { setupEnvironmentFiles } = require('./lib/env.cjs');
const { createDirectories, createConfigFiles, updateGitignore } = require('./lib/files.cjs');
const { setupPackageJson, installDependencies } = require('./lib/dependencies.cjs');
const { showSummary } = require('./lib/summary.cjs');
const { setupClaudeMd } = require('./lib/claude-md.cjs');

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function displayPrerequisiteIssues(prereqs, platformInfo) {
  console.log('');
  header('Prerequisites Not Met');
  console.log(color('The following issues must be resolved before continuing:', 'red'));
  console.log('');

  for (const issue of prereqs.issues) {
    if (typeof issue === 'string') {
      console.log(color(`  • ${issue}`, 'yellow'));
    } else {
      console.log(color(`  • ${issue.message}`, 'yellow'));
      if (issue.instructions) {
        console.log(color(`    ${issue.instructions}`, 'dim'));
      }
    }
  }
  console.log('');
}

async function attemptAutoInstall(prereqs, platformInfo) {
  console.log('');
  const tryAutoInstall = await askYesNo(
    null,
    'Would you like to attempt automatic installation of missing dependencies?',
    true
  );

  if (!tryAutoInstall) {
    return false;
  }

  let installedSomething = false;
  // Auto-install logic would go here
  // For now, return false
  return installedSomething;
}

async function continueSetup(platformInfo, prereqs, results) {
  // Step 1: Tech Stack Detection & CLAUDE.md Setup
  results.claudeMd = await setupClaudeMd(null);

  // Step 2: GitHub Setup (REQUIRED)
  results.github = await setupGitHub(null, platformInfo);

  // Step 3: Supabase Setup (REQUIRED)
  results.supabase = await setupSupabase(null, platformInfo);

  // Step 4: Claude Code Installation
  results.claudeCode = await setupClaudeCode(null, platformInfo);

  // Step 5: Auto-open localhost configuration
  results.localhost = await configureAutoOpenLocalhost(null);

  // Step 6: MCP Configuration
  results.mcp = await configureMcpServers(
    null,
    platformInfo,
    results.github || null,
    results.supabase || null,
    null  // No Vercel token - it can be configured in MCP step if needed
  );

  // Step 7: Environment Files
  const collectedEnvVars = {};
  if (results.github?.token) {
    collectedEnvVars.GITHUB_PERSONAL_ACCESS_TOKEN = results.github.token;
  }
  if (results.supabase?.credentials) {
    Object.assign(collectedEnvVars, results.supabase.credentials);
  }
  if (results.mcp?.collectedEnvVars) {
    Object.assign(collectedEnvVars, results.mcp.collectedEnvVars);
  }

  results.env = await setupEnvironmentFiles(null, collectedEnvVars);

  // Step 8: Create Directories
  results.directories = createDirectories();

  // Step 9: Create Config Files
  results.configFiles = createConfigFiles();

  // Step 10: Update .gitignore
  results.gitignore = updateGitignore();

  // Step 11: Package.json Setup
  results.packageJson = await setupPackageJson(null);

  // Step 12: Install Dependencies
  // Always offer to install, whether package.json was created, updated, or existed
  if (results.packageJson?.created || results.packageJson?.updated || results.packageJson?.exists) {
    results.dependencies = await installDependencies(null, prereqs.packageManagers);
  }

  // Show Summary
  showSummary(results);
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main() {
  console.log('\n');
  console.log(color('  ╔═══════════════════════════════════════════════════════╗', 'cyan'));
  console.log(color('  ║                                                       ║', 'cyan'));
  console.log(color('  ║', 'cyan') + color('         Claude Code Project Setup Wizard', 'bright') + color('            ║', 'cyan'));
  console.log(color('  ║                                                       ║', 'cyan'));
  console.log(color('  ╚═══════════════════════════════════════════════════════╝', 'cyan'));

  const platformInfo = getPlatformInfo();
  const results = {};

  // Check prerequisites (pass platformInfo)
  let prereqs = checkPrerequisites(platformInfo);

  // If prerequisites failed, show detailed instructions
  if (!prereqs.passed) {
    displayPrerequisiteIssues(prereqs, platformInfo);

    // Attempt auto-install of missing dependencies
    const installedSomething = await attemptAutoInstall(prereqs, platformInfo);

    if (installedSomething) {
      // Re-check prerequisites after installation
      console.log('\n');
      prereqs = checkPrerequisites(platformInfo);

      if (!prereqs.passed) {
        displayPrerequisiteIssues(prereqs, platformInfo);
        console.log(color('Please fix the remaining issues and run setup again.', 'red'));
        process.exit(1);
      }

      log('All prerequisites now satisfied!', 'success');
    } else {
      console.log(color('Please fix the above issues and run setup again.', 'red'));
      process.exit(1);
    }

    // Continue with setup
    await continueSetup(platformInfo, prereqs, results);
    return;
  }

  // Show warnings even if passed
  if (prereqs.warnings && prereqs.warnings.length > 0) {
    console.log('');
    for (const warning of prereqs.warnings) {
      if (typeof warning === 'string') {
        log(warning, 'warning');
      } else {
        log(warning.message, 'warning');
      }
    }
  }

  try {
    await continueSetup(platformInfo, prereqs, results);
  } catch (error) {
    console.error('\n' + color(`Setup failed: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error('\n' + color(`Fatal error: ${error.message}`, 'red'));
  console.error(error.stack);
  process.exit(1);
});
