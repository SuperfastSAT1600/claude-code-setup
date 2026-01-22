#!/usr/bin/env node

/**
 * Cross-Platform Project Setup Script
 *
 * This script configures the project for your operating system and preferences.
 * Run with: node setup.js
 *
 * Features:
 * - Platform detection (Windows/macOS/Linux)
 * - MCP server configuration with correct commands
 * - API key collection (securely stored in gitignored files)
 * - Prerequisites checking
 * - Environment file setup
 * - Optional dependency installation
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // Node.js requirements
  nodeMinVersion: 18,

  // Claude Code system requirements
  claudeCode: {
    // Minimum OS versions
    minOsVersions: {
      darwin: '13.0',      // macOS 13.0+
      linux: '20.04',      // Ubuntu 20.04+ (checked via lsb_release)
      win32: '10.0',       // Windows 10+
    },
    // Minimum RAM in GB
    minRamGB: 4,
  },

  // Required tools for this project
  requiredTools: ['git', 'npm'],

  // Claude Code dependencies
  claudeCodeDependencies: {
    // Required for all platforms
    common: ['git'],
    // Required for native installation on Unix
    unix: ['curl'],
    // Windows needs either WSL or Git Bash
    windows: {
      options: ['wsl', 'bash'],  // At least one required
      preferred: 'bash',         // Git Bash is simpler
    },
    // Recommended but not strictly required
    recommended: ['rg'],         // ripgrep - bundled but good to have
  },

  // Optional package managers
  optionalTools: ['pnpm', 'yarn', 'bun'],

  templateFiles: [
    { from: '.env.example', to: '.env' },
  ],
  directoriesToCreate: [
    'src',  // Required for TypeScript config
  ],
};

// Package.json template with all dependencies needed for Claude Code hooks and workflows
const PACKAGE_JSON_TEMPLATE = {
  name: 'claude-code-project',
  version: '1.0.0',
  description: 'Project configured with Claude Code development tools',
  type: 'module',
  scripts: {
    // Development
    'dev': 'echo "Add your dev server command here"',
    'build': 'tsc --build',
    'start': 'node dist/index.js',

    // Code Quality (used by hooks)
    'format': 'prettier --write "**/*.{ts,tsx,js,jsx,json,css,scss,md}"',
    'format:check': 'prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}"',
    'lint': 'eslint . --ext .ts,.tsx,.js,.jsx',
    'lint:fix': 'eslint . --ext .ts,.tsx,.js,.jsx --fix',
    'typecheck': 'tsc --noEmit',

    // Testing
    'test': 'vitest run',
    'test:watch': 'vitest',
    'test:coverage': 'vitest run --coverage',
    'test:e2e': 'playwright test',

    // Combined commands
    'check': 'npm run format:check && npm run lint && npm run typecheck',
    'fix': 'npm run format && npm run lint:fix',

    // Database (if using Prisma)
    'db:generate': 'prisma generate',
    'db:migrate': 'prisma migrate dev',
    'db:push': 'prisma db push',
    'db:studio': 'prisma studio',

    // Security & Analysis
    'audit': 'npm audit',
    'deps:check': 'depcheck',
    'deps:unused': 'ts-prune',
    'analyze': 'echo "Add bundle analyzer command here"',
  },
  devDependencies: {
    // TypeScript
    'typescript': '^5.3.0',
    '@types/node': '^20.10.0',

    // Code Formatting (required for hooks)
    'prettier': '^3.2.0',

    // Linting (required for hooks)
    'eslint': '^8.56.0',
    '@typescript-eslint/parser': '^6.21.0',
    '@typescript-eslint/eslint-plugin': '^6.21.0',
    'eslint-config-prettier': '^9.1.0',
    'eslint-plugin-prettier': '^5.1.0',

    // Testing
    'vitest': '^1.2.0',
    '@vitest/coverage-v8': '^1.2.0',
    '@playwright/test': '^1.41.0',

    // Code Analysis
    'depcheck': '^1.4.7',
    'ts-prune': '^0.10.3',

    // Security
    'license-checker': '^25.0.1',
  },
  dependencies: {
    // Add your runtime dependencies here
  },
  engines: {
    node: '>=18.0.0',
  },
};

// =============================================================================
// UTILITIES
// =============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const ICONS = {
  success: process.platform === 'win32' ? '[OK]' : '✓',
  error: process.platform === 'win32' ? '[X]' : '✗',
  warning: process.platform === 'win32' ? '[!]' : '⚠',
  info: process.platform === 'win32' ? '[i]' : 'ℹ',
  arrow: process.platform === 'win32' ? '->' : '→',
  bullet: process.platform === 'win32' ? '*' : '•',
};

function color(text, colorName) {
  return `${COLORS[colorName]}${text}${COLORS.reset}`;
}

function log(message, type = 'info') {
  const icons = {
    success: color(ICONS.success, 'green'),
    error: color(ICONS.error, 'red'),
    warning: color(ICONS.warning, 'yellow'),
    info: color(ICONS.info, 'blue'),
  };
  console.log(`${icons[type] || ''} ${message}`);
}

function header(text) {
  const line = '='.repeat(60);
  console.log(`\n${color(line, 'cyan')}`);
  console.log(color(`  ${text}`, 'bright'));
  console.log(`${color(line, 'cyan')}\n`);
}

function subheader(text) {
  console.log(`\n${color(`--- ${text} ---`, 'dim')}\n`);
}

// =============================================================================
// PLATFORM DETECTION
// =============================================================================

/**
 * Get OS version string
 */
function getOsVersion() {
  const platform = os.platform();

  try {
    if (platform === 'darwin') {
      // macOS: use sw_vers
      const version = execSync('sw_vers -productVersion', { stdio: 'pipe', encoding: 'utf8' }).trim();
      return version; // e.g., "14.2.1"
    } else if (platform === 'linux') {
      // Linux: try lsb_release first, then /etc/os-release
      try {
        const version = execSync('lsb_release -rs', { stdio: 'pipe', encoding: 'utf8' }).trim();
        return version; // e.g., "22.04"
      } catch {
        // Fallback to /etc/os-release
        if (fs.existsSync('/etc/os-release')) {
          const content = fs.readFileSync('/etc/os-release', 'utf8');
          const match = content.match(/VERSION_ID="?([^"\n]+)"?/);
          if (match) return match[1];
        }
        return 'unknown';
      }
    } else if (platform === 'win32') {
      // Windows: use wmic or ver
      try {
        const version = execSync('wmic os get Version /value', { stdio: 'pipe', encoding: 'utf8' });
        const match = version.match(/Version=(\d+\.\d+)/);
        if (match) return match[1]; // e.g., "10.0"
      } catch {
        // Fallback to os.release()
        return os.release().split('.').slice(0, 2).join('.');
      }
    }
  } catch {
    return 'unknown';
  }

  return 'unknown';
}

/**
 * Get Linux distribution name
 */
function getLinuxDistro() {
  try {
    if (fs.existsSync('/etc/os-release')) {
      const content = fs.readFileSync('/etc/os-release', 'utf8');
      const match = content.match(/^ID=["']?(\w+)["']?/m);
      if (match) return match[1].toLowerCase(); // e.g., "ubuntu", "debian", "alpine"
    }
    // Fallback to lsb_release
    const distro = execSync('lsb_release -is', { stdio: 'pipe', encoding: 'utf8' }).trim();
    return distro.toLowerCase();
  } catch {
    return 'unknown';
  }
}

/**
 * Get system RAM in GB
 */
function getSystemRamGB() {
  const totalBytes = os.totalmem();
  return Math.round(totalBytes / (1024 * 1024 * 1024));
}

/**
 * Check if running in WSL
 */
function isRunningInWSL() {
  if (process.platform !== 'linux') return false;

  try {
    // Check for WSL-specific markers
    if (fs.existsSync('/proc/version')) {
      const version = fs.readFileSync('/proc/version', 'utf8');
      return version.toLowerCase().includes('microsoft') || version.toLowerCase().includes('wsl');
    }
    // Alternative: check for WSL environment variable
    return !!process.env.WSL_DISTRO_NAME;
  } catch {
    return false;
  }
}

/**
 * Get comprehensive platform information
 */
function getPlatformInfo() {
  const platform = os.platform();
  const arch = os.arch();
  const osVersion = getOsVersion();
  const ramGB = getSystemRamGB();

  const info = {
    platform,
    arch,
    osVersion,
    ramGB,
    isWindows: platform === 'win32',
    isMac: platform === 'darwin',
    isLinux: platform === 'linux',
    isWSL: isRunningInWSL(),
    displayName: platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : 'Linux',
  };

  // Add Linux distro info
  if (info.isLinux) {
    info.linuxDistro = getLinuxDistro();
    info.isAlpine = info.linuxDistro === 'alpine';
    info.isDebian = ['debian', 'ubuntu', 'linuxmint', 'pop'].includes(info.linuxDistro);
    info.isRHEL = ['rhel', 'centos', 'fedora', 'rocky', 'almalinux'].includes(info.linuxDistro);
  }

  return info;
}

// =============================================================================
// PREREQUISITES CHECK
// =============================================================================

/**
 * Check if a command exists
 */
function checkCommand(cmd) {
  try {
    const checkCmd = process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`;
    execSync(checkCmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get command version
 */
function getCommandVersion(cmd, versionFlag = '--version') {
  try {
    const result = execSync(`${cmd} ${versionFlag}`, { stdio: 'pipe', encoding: 'utf8' });
    // Extract version number from output
    const match = result.match(/(\d+\.\d+(\.\d+)?)/);
    return match ? match[1] : 'unknown';
  } catch {
    return null;
  }
}

/**
 * Get Node.js version
 */
function getNodeVersion() {
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0], 10);
    return { version, major };
  } catch {
    return { version: 'unknown', major: 0 };
  }
}

/**
 * Compare version strings (e.g., "14.2.1" >= "13.0")
 */
function compareVersions(current, minimum) {
  if (current === 'unknown') return false;

  const currentParts = current.split('.').map(Number);
  const minimumParts = minimum.split('.').map(Number);

  for (let i = 0; i < minimumParts.length; i++) {
    const curr = currentParts[i] || 0;
    const min = minimumParts[i] || 0;

    if (curr > min) return true;
    if (curr < min) return false;
  }
  return true; // Equal
}

/**
 * Get installation instructions for a tool
 */
function getInstallInstructions(tool, platformInfo) {
  const instructions = {
    git: {
      darwin: 'Install Xcode Command Line Tools: xcode-select --install\n    Or install via Homebrew: brew install git',
      linux: platformInfo.isDebian
        ? 'sudo apt-get update && sudo apt-get install -y git'
        : platformInfo.isRHEL
          ? 'sudo dnf install -y git'
          : 'Install git using your package manager',
      win32: 'Download from https://git-scm.com/downloads/win\n    Or use: winget install Git.Git',
    },
    curl: {
      darwin: 'curl is included with macOS',
      linux: platformInfo.isDebian
        ? 'sudo apt-get update && sudo apt-get install -y curl'
        : platformInfo.isRHEL
          ? 'sudo dnf install -y curl'
          : 'Install curl using your package manager',
      win32: 'curl is included with Windows 10+',
    },
    rg: {
      darwin: 'brew install ripgrep',
      linux: platformInfo.isDebian
        ? 'sudo apt-get update && sudo apt-get install -y ripgrep'
        : platformInfo.isRHEL
          ? 'sudo dnf install -y ripgrep'
          : platformInfo.isAlpine
            ? 'apk add ripgrep'
            : 'Install ripgrep from https://github.com/BurntSushi/ripgrep',
      win32: 'winget install BurntSushi.ripgrep.MSVC\n    Or: choco install ripgrep',
    },
    node: {
      darwin: 'brew install node\n    Or download from https://nodejs.org/',
      linux: 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\n    sudo apt-get install -y nodejs',
      win32: 'Download from https://nodejs.org/\n    Or: winget install OpenJS.NodeJS.LTS',
    },
    npm: {
      darwin: 'npm is included with Node.js',
      linux: 'npm is included with Node.js',
      win32: 'npm is included with Node.js',
    },
    wsl: {
      win32: 'wsl --install\n    Then restart your computer',
    },
    bash: {
      win32: 'Install Git for Windows: https://git-scm.com/downloads/win\n    Git Bash is included',
    },
  };

  const toolInstructions = instructions[tool];
  if (!toolInstructions) return `Install ${tool} from its official website`;

  return toolInstructions[platformInfo.platform] || `Install ${tool} from its official website`;
}

/**
 * Check Claude Code specific dependencies
 */
function checkClaudeCodeDependencies(platformInfo) {
  const results = {
    passed: true,
    issues: [],
    warnings: [],
    dependencies: {},
  };

  // Check common dependencies
  for (const tool of CONFIG.claudeCodeDependencies.common) {
    const installed = checkCommand(tool);
    const version = installed ? getCommandVersion(tool) : null;
    results.dependencies[tool] = { installed, version, required: true };

    if (!installed) {
      results.passed = false;
      results.issues.push({
        tool,
        message: `${tool} is not installed (required for Claude Code)`,
        instructions: getInstallInstructions(tool, platformInfo),
      });
    }
  }

  // Check Unix-specific dependencies
  if (!platformInfo.isWindows) {
    for (const tool of CONFIG.claudeCodeDependencies.unix) {
      const installed = checkCommand(tool);
      results.dependencies[tool] = { installed, required: true };

      if (!installed) {
        results.passed = false;
        results.issues.push({
          tool,
          message: `${tool} is not installed (required for native Claude Code installation)`,
          instructions: getInstallInstructions(tool, platformInfo),
        });
      }
    }
  }

  // Check Windows-specific dependencies
  if (platformInfo.isWindows) {
    const { options, preferred } = CONFIG.claudeCodeDependencies.windows;
    const hasAny = options.some(opt => checkCommand(opt));

    for (const opt of options) {
      const installed = checkCommand(opt);
      results.dependencies[opt] = { installed, required: false };
    }

    if (!hasAny) {
      results.passed = false;
      results.issues.push({
        tool: 'shell',
        message: 'Claude Code on Windows requires either WSL or Git Bash',
        instructions: `Option 1 (Recommended): Install Git for Windows\n    ${getInstallInstructions('bash', platformInfo)}\n\n    Option 2: Install WSL\n    ${getInstallInstructions('wsl', platformInfo)}`,
      });
    }
  }

  // Check recommended dependencies
  for (const tool of CONFIG.claudeCodeDependencies.recommended) {
    const installed = checkCommand(tool);
    const version = installed ? getCommandVersion(tool) : null;
    results.dependencies[tool] = { installed, version, required: false };

    if (!installed) {
      results.warnings.push({
        tool,
        message: `${tool} (ripgrep) is not installed - search functionality may be limited`,
        instructions: getInstallInstructions(tool, platformInfo),
      });
    }
  }

  // Check Alpine Linux specific requirements
  if (platformInfo.isAlpine) {
    const alpineDeps = ['libgcc', 'libstdc++'];
    results.warnings.push({
      tool: 'alpine-deps',
      message: 'Alpine Linux requires additional dependencies for Claude Code',
      instructions: `apk add libgcc libstdc++ ripgrep\nSET USE_BUILTIN_RIPGREP=0`,
    });
  }

  return results;
}

/**
 * Check OS version meets requirements
 */
function checkOsVersion(platformInfo) {
  const minVersions = CONFIG.claudeCode.minOsVersions;
  const minVersion = minVersions[platformInfo.platform];

  if (!minVersion) {
    return { passed: true, message: 'OS version check not applicable' };
  }

  const currentVersion = platformInfo.osVersion;
  const meetsRequirement = compareVersions(currentVersion, minVersion);

  return {
    passed: meetsRequirement,
    currentVersion,
    minVersion,
    message: meetsRequirement
      ? `${platformInfo.displayName} ${currentVersion} meets minimum requirement (${minVersion}+)`
      : `${platformInfo.displayName} ${currentVersion} does not meet minimum requirement (${minVersion}+)`,
  };
}

/**
 * Check system RAM
 */
function checkSystemRam(platformInfo) {
  const minRamGB = CONFIG.claudeCode.minRamGB;
  const currentRamGB = platformInfo.ramGB;
  const meetsRequirement = currentRamGB >= minRamGB;

  return {
    passed: meetsRequirement,
    currentRamGB,
    minRamGB,
    message: meetsRequirement
      ? `${currentRamGB}GB RAM meets minimum requirement (${minRamGB}GB+)`
      : `${currentRamGB}GB RAM does not meet minimum requirement (${minRamGB}GB+)`,
  };
}

/**
 * Main prerequisites check function
 */
function checkPrerequisites(platformInfo) {
  header('Checking Prerequisites');

  const results = {
    passed: true,
    issues: [],
    warnings: [],
    packageManagers: ['npm'],
  };

  // --- System Requirements ---
  subheader('System Requirements');

  // Check OS version
  const osCheck = checkOsVersion(platformInfo);
  if (osCheck.passed) {
    log(osCheck.message, 'success');
  } else {
    log(osCheck.message, 'error');
    results.passed = false;
    results.issues.push(`Upgrade to ${platformInfo.displayName} ${osCheck.minVersion} or higher`);
  }

  // Check RAM
  const ramCheck = checkSystemRam(platformInfo);
  if (ramCheck.passed) {
    log(ramCheck.message, 'success');
  } else {
    log(ramCheck.message, 'warning');
    results.warnings.push(`Low RAM may cause performance issues (${ramCheck.currentRamGB}GB < ${ramCheck.minRamGB}GB)`);
  }

  // WSL info for Windows
  if (platformInfo.isWindows) {
    const hasWSL = checkCommand('wsl');
    const hasBash = checkCommand('bash');
    if (hasWSL) {
      log('WSL is available', 'success');
    }
    if (hasBash) {
      log('Git Bash is available', 'success');
    }
  }

  // WSL detection for Linux
  if (platformInfo.isWSL) {
    log('Running in WSL environment', 'info');
  }

  // --- Node.js & npm ---
  subheader('Node.js & npm');

  // Check Node.js version
  const nodeInfo = getNodeVersion();
  if (nodeInfo.major >= CONFIG.nodeMinVersion) {
    log(`Node.js ${nodeInfo.version} ${color(`(>= ${CONFIG.nodeMinVersion} required)`, 'dim')}`, 'success');
  } else {
    log(`Node.js ${nodeInfo.version} - version ${CONFIG.nodeMinVersion}+ required`, 'error');
    results.passed = false;
    results.issues.push(`Upgrade Node.js to version ${CONFIG.nodeMinVersion} or higher`);
  }

  // Check npm
  if (checkCommand('npm')) {
    const npmVersion = getCommandVersion('npm');
    log(`npm ${npmVersion || ''} is installed`, 'success');
  } else {
    log('npm is not installed', 'error');
    results.passed = false;
    results.issues.push('Install npm (included with Node.js)');
  }

  // --- Claude Code Dependencies ---
  subheader('Claude Code Dependencies');

  const claudeDepCheck = checkClaudeCodeDependencies(platformInfo);

  // Report on dependencies
  for (const [tool, info] of Object.entries(claudeDepCheck.dependencies)) {
    if (info.installed) {
      const versionStr = info.version ? ` ${info.version}` : '';
      const requiredStr = info.required ? '' : color(' (recommended)', 'dim');
      log(`${tool}${versionStr} is installed${requiredStr}`, 'success');
    } else if (info.required) {
      log(`${tool} is not installed ${color('(required)', 'red')}`, 'error');
    } else {
      log(`${tool} is not installed ${color('(recommended)', 'dim')}`, 'warning');
    }
  }

  // Add issues from Claude Code dependency check
  if (!claudeDepCheck.passed) {
    results.passed = false;
    for (const issue of claudeDepCheck.issues) {
      results.issues.push({
        message: issue.message,
        instructions: issue.instructions,
      });
    }
  }

  // Add warnings
  for (const warning of claudeDepCheck.warnings) {
    results.warnings.push({
      message: warning.message,
      instructions: warning.instructions,
    });
  }

  // --- Optional Package Managers ---
  subheader('Package Managers');

  log('npm is available (default)', 'success');

  for (const tool of CONFIG.optionalTools) {
    if (checkCommand(tool)) {
      const version = getCommandVersion(tool);
      log(`${tool} ${version || ''} is available ${color('(optional)', 'dim')}`, 'success');
      results.packageManagers.push(tool);
    }
  }

  return results;
}

// =============================================================================
// CLAUDE CODE INSTALLATION
// =============================================================================

/**
 * Check if Claude Code CLI is installed
 */
async function checkClaudeCodeInstalled() {
  try {
    const result = execSync('claude --version', { stdio: 'pipe', encoding: 'utf8' });
    return { installed: true, version: result.trim() };
  } catch {
    return { installed: false, version: null };
  }
}

/**
 * Check if a package manager is available
 */
function checkPackageManagerAvailable(pm) {
  try {
    const checkCmd = process.platform === 'win32' ? `where ${pm}` : `which ${pm}`;
    execSync(checkCmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Install Claude Code on Windows
 */
async function installClaudeCodeWindows(rl, method) {
  const commands = {
    winget: 'winget install Anthropic.ClaudeCode',
    powershell: 'powershell -Command "irm https://claude.ai/install.ps1 | iex"',
    npm: 'npm install -g @anthropic-ai/claude-code',
  };

  const command = commands[method];
  if (!command) {
    log(`Unknown installation method: ${method}`, 'error');
    return false;
  }

  log(`Installing Claude Code via ${method}...`, 'info');
  console.log(color(`  Running: ${command}`, 'dim'));
  console.log(color('  (This may take a minute)', 'dim'));

  try {
    execSync(command, {
      stdio: 'inherit',
      shell: true,
    });
    return true;
  } catch (error) {
    log(`Installation failed: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Install Claude Code on macOS/Linux
 */
async function installClaudeCodeUnix(rl, method) {
  const commands = {
    native: 'curl -fsSL https://claude.ai/install.sh | bash',
    homebrew: 'brew install claude-code',
    npm: 'npm install -g @anthropic-ai/claude-code',
  };

  const command = commands[method];
  if (!command) {
    log(`Unknown installation method: ${method}`, 'error');
    return false;
  }

  log(`Installing Claude Code via ${method}...`, 'info');
  console.log(color(`  Running: ${command}`, 'dim'));
  console.log(color('  (This may take a minute)', 'dim'));

  try {
    execSync(command, {
      stdio: 'inherit',
      shell: true,
    });
    return true;
  } catch (error) {
    log(`Installation failed: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Verify Claude Code installation
 */
async function verifyClaudeCodeInstallation() {
  log('Verifying Claude Code installation...', 'info');

  // Give the system a moment to update PATH
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const result = execSync('claude --version', { stdio: 'pipe', encoding: 'utf8' });
    log(`Claude Code installed successfully! (${result.trim()})`, 'success');
    return true;
  } catch {
    log('Installation verification failed', 'error');
    console.log(color('  You may need to:', 'yellow'));
    console.log(color('  1. Restart your terminal', 'yellow'));
    console.log(color('  2. Check that Claude Code is in your PATH', 'yellow'));
    console.log(color('  3. Try running "claude --version" manually', 'yellow'));
    return false;
  }
}

/**
 * Print authentication guidance after installation
 */
function printAuthGuidance() {
  console.log('');
  console.log(color('--- Claude Code Authentication ---', 'cyan'));
  console.log('');
  console.log('To use Claude Code, you need to authenticate:');
  console.log('');
  console.log(color('Option 1: Claude Pro/Max (Recommended)', 'green'));
  console.log('  ' + ICONS.bullet + ' Subscribe at https://claude.ai/pricing');
  console.log('  ' + ICONS.bullet + ' Run "claude" and follow the login prompts');
  console.log('');
  console.log(color('Option 2: Anthropic Console (API Credits)', 'yellow'));
  console.log('  ' + ICONS.bullet + ' Sign up at https://console.anthropic.com');
  console.log('  ' + ICONS.bullet + ' Add API credits to your account');
  console.log('  ' + ICONS.bullet + ' Run "claude" and select Console login');
  console.log('');
  console.log(color('Run "claude" in this project directory to get started!', 'cyan'));
  console.log('');
}

/**
 * Get installation troubleshooting message
 */
function getTroubleshootingMessage(errorMsg) {
  const troubleshooting = {
    'command not found': 'Restart your terminal or add Claude Code to your PATH',
    'permission denied': 'Try running with administrator/sudo privileges',
    'network': 'Check your internet connection',
    'winget': 'Install WinGet from Microsoft Store or use PowerShell method',
    'ENOENT': 'The installation command was not found',
    'EACCES': 'Permission denied - try running with elevated privileges',
  };

  for (const [key, msg] of Object.entries(troubleshooting)) {
    if (errorMsg.toLowerCase().includes(key.toLowerCase())) {
      return msg;
    }
  }
  return 'Check the error message above and try again';
}

/**
 * Main Claude Code installation orchestrator
 */
async function installClaudeCode(rl, platformInfo) {
  header('Claude Code Installation');

  console.log('Claude Code is the official CLI for Claude.');
  console.log('');
  console.log(color('Requirements:', 'bright'));
  console.log('  ' + ICONS.bullet + ' macOS 13.0+, Ubuntu 20.04+/Debian 10+, or Windows 10+');
  console.log('  ' + ICONS.bullet + ' 4GB+ RAM');
  console.log('  ' + ICONS.bullet + ' Internet connection');
  console.log('  ' + ICONS.bullet + ' Claude Pro/Max subscription OR Anthropic Console account');
  console.log('');

  // Determine available installation methods based on platform
  let methods = [];

  if (platformInfo.isWindows) {
    // Windows installation methods
    const hasWinget = checkPackageManagerAvailable('winget');

    if (hasWinget) {
      methods.push({
        value: 'winget',
        label: 'WinGet (Recommended)',
        description: 'Windows Package Manager - manual updates',
      });
    }

    methods.push({
      value: 'powershell',
      label: 'PowerShell Script',
      description: 'Native installation - auto-updates',
    });

    methods.push({
      value: 'npm',
      label: 'NPM (Deprecated)',
      description: 'Legacy method - requires Node.js',
    });
  } else {
    // macOS/Linux installation methods
    methods.push({
      value: 'native',
      label: 'Native Script (Recommended)',
      description: 'Auto-updates, no dependencies',
    });

    const hasHomebrew = checkPackageManagerAvailable('brew');
    if (hasHomebrew) {
      methods.push({
        value: 'homebrew',
        label: 'Homebrew',
        description: 'Manual updates via brew upgrade',
      });
    }

    methods.push({
      value: 'npm',
      label: 'NPM (Deprecated)',
      description: 'Legacy method - requires Node.js',
    });
  }

  // Ask user to select installation method
  const method = await askChoice(rl, 'Select installation method:', methods);

  // Perform installation
  let success = false;

  if (platformInfo.isWindows) {
    success = await installClaudeCodeWindows(rl, method);
  } else {
    success = await installClaudeCodeUnix(rl, method);
  }

  if (!success) {
    console.log('');
    log('Installation was not successful', 'warning');
    console.log(color('You can try:', 'yellow'));
    console.log('  1. Running this setup again with a different method');
    console.log('  2. Installing manually from https://claude.ai/code');
    console.log('');

    const retry = await askYesNo(rl, 'Would you like to try a different installation method?', false);
    if (retry) {
      return installClaudeCode(rl, platformInfo);
    }
    return false;
  }

  // Verify installation
  const verified = await verifyClaudeCodeInstallation();

  if (verified) {
    printAuthGuidance();
  }

  return verified;
}

/**
 * Check and optionally install Claude Code
 */
async function setupClaudeCode(rl, platformInfo) {
  header('Claude Code CLI');

  const status = await checkClaudeCodeInstalled();

  if (status.installed) {
    log(`Claude Code is already installed (${status.version})`, 'success');
    return { installed: true, version: status.version, wasInstalled: false };
  }

  log('Claude Code CLI is not installed', 'warning');
  console.log('');
  console.log('Claude Code is the official CLI for developing with Claude.');
  console.log('It enables AI-assisted coding, code review, and more.');
  console.log('');

  const installNow = await askYesNo(rl, 'Would you like to install Claude Code now?', true);

  if (!installNow) {
    log('Skipping Claude Code installation', 'info');
    console.log(color('You can install it later from https://claude.ai/code', 'dim'));
    return { installed: false, version: null, wasInstalled: false };
  }

  const success = await installClaudeCode(rl, platformInfo);

  if (success) {
    const newStatus = await checkClaudeCodeInstalled();
    return { installed: true, version: newStatus.version, wasInstalled: true };
  }

  return { installed: false, version: null, wasInstalled: false };
}

// =============================================================================
// READLINE INTERFACE
// =============================================================================

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function ask(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    const defaultHint = defaultValue ? color(` (${defaultValue})`, 'dim') : '';
    rl.question(`${question}${defaultHint}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function askYesNo(rl, question, defaultYes = true) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await ask(rl, `${question} ${color(hint, 'dim')}`, defaultYes ? 'y' : 'n');
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

async function askSecret(rl, question) {
  return new Promise((resolve) => {
    // Note: This doesn't hide input in basic readline
    // For production, consider using a library like 'readline-sync' with hideEchoBack
    rl.question(`${question}: `, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function askChoice(rl, question, choices) {
  console.log(`\n${question}`);
  choices.forEach((choice, index) => {
    console.log(`  ${color(`${index + 1}.`, 'cyan')} ${choice.label}${choice.description ? color(` - ${choice.description}`, 'dim') : ''}`);
  });

  const answer = await ask(rl, `Enter choice (1-${choices.length})`, '1');
  const index = parseInt(answer, 10) - 1;

  if (index >= 0 && index < choices.length) {
    return choices[index].value;
  }
  return choices[0].value;
}

async function askMultipleChoice(rl, question, choices) {
  console.log(`\n${question}`);
  console.log(color('  (Enter comma-separated numbers, or "all" for all, or "none" for none)', 'dim'));
  choices.forEach((choice, index) => {
    const enabledHint = choice.enabled ? color(' [currently enabled]', 'green') : '';
    console.log(`  ${color(`${index + 1}.`, 'cyan')} ${choice.label}${enabledHint}${choice.description ? color(` - ${choice.description}`, 'dim') : ''}`);
  });

  const answer = await ask(rl, `Enter choices`, 'none');

  if (answer.toLowerCase() === 'all') {
    return choices.map(c => c.value);
  }
  if (answer.toLowerCase() === 'none') {
    return [];
  }

  const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1);
  return indices
    .filter(i => i >= 0 && i < choices.length)
    .map(i => choices[i].value);
}

// =============================================================================
// MCP CONFIGURATION
// =============================================================================

function loadMcpTemplate() {
  const templatePath = path.join(process.cwd(), '.mcp.template.json');
  const directPath = path.join(process.cwd(), '.mcp.json');

  // Try template first, then direct path
  let configPath = templatePath;
  if (!fs.existsSync(templatePath)) {
    if (fs.existsSync(directPath)) {
      configPath = directPath;
    } else {
      return null;
    }
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Failed to parse MCP config: ${error.message}`, 'error');
    return null;
  }
}

function getMcpServerInfo(name, config) {
  const descriptions = {
    'filesystem': 'Local file system access',
    'github': 'GitHub repository operations',
    'postgres': 'PostgreSQL database queries',
    'sqlite': 'SQLite database operations',
    'brave-search': 'Web search via Brave',
    'google-maps': 'Google Maps integration',
    'slack': 'Slack workspace integration',
    'memory': 'Persistent memory/knowledge graph',
    'sequential-thinking': 'Step-by-step reasoning',
    'vercel': 'Vercel deployment management',
    'railway': 'Railway deployment management',
    'firecrawl': 'Web scraping and crawling',
    'cloudflare-docs': 'Cloudflare documentation',
    'cloudflare-workers-builds': 'Cloudflare Workers builds',
    'cloudflare-workers-bindings': 'Cloudflare Workers bindings',
    'cloudflare-observability': 'Cloudflare observability',
    'clickhouse': 'ClickHouse database',
    'context7': 'Context7 integration',
    'magic': 'Magic MCP server',
  };

  const requiredEnvVars = {
    'github': ['GITHUB_PERSONAL_ACCESS_TOKEN'],
    'postgres': [],
    'brave-search': ['BRAVE_API_KEY'],
    'google-maps': ['GOOGLE_MAPS_API_KEY'],
    'slack': ['SLACK_BOT_TOKEN', 'SLACK_TEAM_ID'],
    'vercel': ['VERCEL_API_TOKEN'],
    'railway': ['RAILWAY_API_TOKEN'],
    'firecrawl': ['FIRECRAWL_API_KEY'],
    'cloudflare-workers-builds': ['CLOUDFLARE_API_TOKEN'],
    'cloudflare-workers-bindings': ['CLOUDFLARE_API_TOKEN'],
    'cloudflare-observability': ['CLOUDFLARE_API_TOKEN'],
    'clickhouse': ['CLICKHOUSE_URL', 'CLICKHOUSE_PASSWORD'],
  };

  return {
    description: descriptions[name] || 'MCP server',
    requiredEnvVars: requiredEnvVars[name] || [],
    isHttpType: config.type === 'http',
  };
}

function transformMcpConfigForPlatform(config, platformInfo) {
  const transformed = { mcpServers: {} };

  for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
    // HTTP type servers don't need transformation
    if (serverConfig.type === 'http') {
      transformed.mcpServers[name] = { ...serverConfig };
      continue;
    }

    // Transform npx commands for Windows
    if (platformInfo.isWindows && serverConfig.command === 'npx') {
      transformed.mcpServers[name] = {
        ...serverConfig,
        command: 'cmd',
        args: ['/c', 'npx', ...serverConfig.args],
      };
    } else {
      transformed.mcpServers[name] = { ...serverConfig };
    }
  }

  return transformed;
}

async function configureMcpServers(rl, platformInfo) {
  header('MCP Server Configuration');

  const template = loadMcpTemplate();
  if (!template) {
    log('No MCP template found. Skipping MCP configuration.', 'warning');
    return null;
  }

  log(`Detected platform: ${color(platformInfo.displayName, 'cyan')}`);
  if (platformInfo.isWindows) {
    log('Will configure commands with Windows-compatible syntax (cmd /c npx)', 'info');
  }

  // Ask which servers to enable
  const serverChoices = Object.entries(template.mcpServers).map(([name, config]) => {
    const info = getMcpServerInfo(name, config);
    return {
      value: name,
      label: name,
      description: info.description,
      enabled: !config.disabled,
      info,
      config,
    };
  });

  console.log('\n' + color('Which MCP servers do you want to enable?', 'bright'));
  const enabledServers = await askMultipleChoice(rl, '', serverChoices);

  // Transform config for platform
  let finalConfig = transformMcpConfigForPlatform(template, platformInfo);

  // Update enabled/disabled status
  for (const name of Object.keys(finalConfig.mcpServers)) {
    finalConfig.mcpServers[name].disabled = !enabledServers.includes(name);
  }

  // Collect API keys for enabled servers
  const collectedEnvVars = {};

  for (const serverName of enabledServers) {
    const choice = serverChoices.find(c => c.value === serverName);
    if (!choice) continue;

    const { info, config } = choice;

    if (info.requiredEnvVars.length > 0) {
      subheader(`Configure ${serverName}`);

      for (const envVar of info.requiredEnvVars) {
        const currentValue = config.env?.[envVar] || '';
        const isPlaceholder = currentValue.includes('YOUR_') || currentValue === '';

        if (isPlaceholder) {
          const value = await askSecret(rl, `  Enter ${color(envVar, 'cyan')} (or press Enter to skip)`);
          if (value) {
            collectedEnvVars[envVar] = value;
            // Update in config
            if (!finalConfig.mcpServers[serverName].env) {
              finalConfig.mcpServers[serverName].env = {};
            }
            finalConfig.mcpServers[serverName].env[envVar] = value;
          }
        }
      }
    }
  }

  // Write the final config
  const outputPath = path.join(process.cwd(), '.mcp.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalConfig, null, 2) + '\n');
  log(`Created ${color('.mcp.json', 'cyan')} with platform-specific configuration`, 'success');

  return { config: finalConfig, envVars: collectedEnvVars };
}

// =============================================================================
// ENVIRONMENT FILE SETUP
// =============================================================================

async function setupEnvironmentFiles(rl, collectedEnvVars = {}) {
  header('Environment Configuration');

  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envPath = path.join(process.cwd(), '.env');

  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    log('No .env.example found. Skipping environment file setup.', 'info');
    return;
  }

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await askYesNo(rl, '.env file already exists. Overwrite?', false);
    if (!overwrite) {
      log('Keeping existing .env file', 'info');
      return;
    }
  }

  // Read template
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Replace any collected env vars
  for (const [key, value] of Object.entries(collectedEnvVars)) {
    const regex = new RegExp(`^${key}=.*$`, 'gm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  // Ask if user wants to configure other env vars
  const configureMore = await askYesNo(rl, 'Do you want to configure other environment variables now?', false);

  if (configureMore) {
    // Parse existing env vars from template
    const lines = envContent.split('\n');
    const updatedLines = [];

    for (const line of lines) {
      if (line.startsWith('#') || !line.includes('=')) {
        updatedLines.push(line);
        continue;
      }

      const [key, ...valueParts] = line.split('=');
      const currentValue = valueParts.join('=');

      // Skip if already set from MCP config
      if (collectedEnvVars[key]) {
        updatedLines.push(line);
        continue;
      }

      // Check if it's a placeholder
      const isPlaceholder = currentValue.includes('YOUR_') || currentValue === '' || currentValue.includes('your_');

      if (isPlaceholder) {
        const newValue = await ask(rl, `  ${color(key, 'cyan')}`, currentValue);
        updatedLines.push(`${key}=${newValue}`);
      } else {
        updatedLines.push(line);
      }
    }

    envContent = updatedLines.join('\n');
  }

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  log(`Created ${color('.env', 'cyan')} file`, 'success');
}

// =============================================================================
// DIRECTORY SETUP
// =============================================================================

function createDirectories() {
  if (CONFIG.directoriesToCreate.length === 0) {
    return;
  }

  header('Creating Directories');

  for (const dir of CONFIG.directoriesToCreate) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`Created ${color(dir, 'cyan')} directory`, 'success');

      // Create a placeholder index.ts for src directory
      if (dir === 'src') {
        const indexPath = path.join(dirPath, 'index.ts');
        if (!fs.existsSync(indexPath)) {
          fs.writeFileSync(indexPath, `// Entry point for your application
export {};
`);
          log(`Created ${color('src/index.ts', 'cyan')} placeholder`, 'success');
        }
      }
    } else {
      log(`${color(dir, 'cyan')} already exists`, 'info');
    }
  }
}

// =============================================================================
// ESLINT & PRETTIER CONFIG SETUP
// =============================================================================

function createConfigFiles() {
  // ESLint config
  const eslintConfigPath = path.join(process.cwd(), '.eslintrc.json');
  if (!fs.existsSync(eslintConfigPath)) {
    const eslintConfig = {
      root: true,
      env: {
        browser: true,
        es2022: true,
        node: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        // Customize rules as needed
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': 'warn',
      },
      ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.config.js'],
    };
    fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2) + '\n');
    log(`Created ${color('.eslintrc.json', 'cyan')}`, 'success');
  }

  // Prettier config
  const prettierConfigPath = path.join(process.cwd(), '.prettierrc');
  if (!fs.existsSync(prettierConfigPath)) {
    const prettierConfig = {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      bracketSpacing: true,
      arrowParens: 'avoid',
    };
    fs.writeFileSync(prettierConfigPath, JSON.stringify(prettierConfig, null, 2) + '\n');
    log(`Created ${color('.prettierrc', 'cyan')}`, 'success');
  }

  // Prettier ignore
  const prettierIgnorePath = path.join(process.cwd(), '.prettierignore');
  if (!fs.existsSync(prettierIgnorePath)) {
    const prettierIgnore = `# Dependencies
node_modules/

# Build outputs
dist/
build/
coverage/

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Generated files
*.min.js
*.min.css
`;
    fs.writeFileSync(prettierIgnorePath, prettierIgnore);
    log(`Created ${color('.prettierignore', 'cyan')}`, 'success');
  }

  // TypeScript config (basic)
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        lib: ['ES2022'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'coverage'],
    };
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2) + '\n');
    log(`Created ${color('tsconfig.json', 'cyan')}`, 'success');
  }
}

// =============================================================================
// GITIGNORE UPDATE
// =============================================================================

function updateGitignore() {
  header('Updating .gitignore');

  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const entriesToAdd = [
    '',
    '# Generated by setup script - contains secrets',
    '.env',
    '.env.local',
    '.mcp.json',
    '',
    '# Local settings',
    '.claude/settings.local.json',
    '',
    '# Build outputs',
    'dist/',
    'build/',
    'coverage/',
    '',
    '# Dependencies',
    'node_modules/',
  ];

  let content = '';
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf8');
  }

  let updated = false;
  for (const entry of entriesToAdd) {
    if (entry === '' || entry.startsWith('#')) continue;
    if (!content.includes(entry)) {
      updated = true;
    }
  }

  if (updated) {
    // Check if entries need to be added
    const lines = content.split('\n');
    const newEntries = entriesToAdd.filter(e => {
      if (e === '' || e.startsWith('#')) return true;
      return !lines.some(line => line.trim() === e.trim());
    });

    if (newEntries.some(e => e && !e.startsWith('#'))) {
      content = content.trimEnd() + '\n' + newEntries.join('\n') + '\n';
      fs.writeFileSync(gitignorePath, content);
      log('Added secret files to .gitignore', 'success');
    } else {
      log('.gitignore already configured correctly', 'success');
    }
  } else {
    log('.gitignore already configured correctly', 'success');
  }
}

// =============================================================================
// PACKAGE.JSON SETUP
// =============================================================================

async function setupPackageJson(rl) {
  header('Package.json Setup');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const existingPackageJson = fs.existsSync(packageJsonPath);

  if (existingPackageJson) {
    log('Existing package.json found', 'info');

    const choice = await askChoice(rl, 'How would you like to handle dependencies?', [
      { value: 'merge', label: 'Merge', description: 'Add missing Claude Code dependencies to existing package.json' },
      { value: 'skip', label: 'Skip', description: 'Keep existing package.json unchanged' },
      { value: 'replace', label: 'Replace', description: 'Replace with Claude Code template (backup created)' },
    ]);

    if (choice === 'skip') {
      log('Keeping existing package.json unchanged', 'info');
      return { created: false, merged: false };
    }

    if (choice === 'replace') {
      // Backup existing
      const backupPath = path.join(process.cwd(), 'package.json.backup');
      fs.copyFileSync(packageJsonPath, backupPath);
      log(`Backed up existing package.json to ${color('package.json.backup', 'cyan')}`, 'info');

      // Get project name from existing or use directory name
      const existing = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const newPackageJson = {
        ...PACKAGE_JSON_TEMPLATE,
        name: existing.name || path.basename(process.cwd()),
        description: existing.description || PACKAGE_JSON_TEMPLATE.description,
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2) + '\n');
      log(`Created new ${color('package.json', 'cyan')} with Claude Code dependencies`, 'success');
      return { created: true, merged: false };
    }

    if (choice === 'merge') {
      const existing = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Merge devDependencies
      existing.devDependencies = {
        ...PACKAGE_JSON_TEMPLATE.devDependencies,
        ...existing.devDependencies, // Existing versions take precedence
      };

      // Merge scripts (only add missing ones)
      existing.scripts = existing.scripts || {};
      for (const [name, cmd] of Object.entries(PACKAGE_JSON_TEMPLATE.scripts)) {
        if (!existing.scripts[name]) {
          existing.scripts[name] = cmd;
        }
      }

      // Add engines if not present
      if (!existing.engines) {
        existing.engines = PACKAGE_JSON_TEMPLATE.engines;
      }

      fs.writeFileSync(packageJsonPath, JSON.stringify(existing, null, 2) + '\n');
      log(`Merged Claude Code dependencies into ${color('package.json', 'cyan')}`, 'success');

      // Show what was added
      const addedDeps = Object.keys(PACKAGE_JSON_TEMPLATE.devDependencies).filter(
        dep => !existing.devDependencies?.[dep]
      );
      if (addedDeps.length > 0) {
        console.log(color('\n  Added devDependencies:', 'dim'));
        addedDeps.slice(0, 5).forEach(dep => console.log(`    ${ICONS.bullet} ${dep}`));
        if (addedDeps.length > 5) {
          console.log(`    ${color(`... and ${addedDeps.length - 5} more`, 'dim')}`);
        }
      }

      return { created: false, merged: true };
    }
  } else {
    // No existing package.json - create new one
    const createNew = await askYesNo(
      rl,
      'No package.json found. Create one with Claude Code dependencies?',
      true
    );

    if (!createNew) {
      log('Skipping package.json creation', 'info');
      log(color('Warning: Hooks requiring npm packages will not work!', 'yellow'), 'warning');
      return { created: false, merged: false };
    }

    // Get project name
    const defaultName = path.basename(process.cwd()).toLowerCase().replace(/\s+/g, '-');
    const projectName = await ask(rl, `Project name`, defaultName);

    const newPackageJson = {
      ...PACKAGE_JSON_TEMPLATE,
      name: projectName,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2) + '\n');
    log(`Created ${color('package.json', 'cyan')} with Claude Code dependencies`, 'success');

    // Show included tools
    console.log(color('\n  Included tools:', 'dim'));
    console.log(`    ${ICONS.bullet} prettier - Code formatting (for hooks)`);
    console.log(`    ${ICONS.bullet} eslint - Linting (for hooks)`);
    console.log(`    ${ICONS.bullet} typescript - Type checking`);
    console.log(`    ${ICONS.bullet} vitest - Unit testing`);
    console.log(`    ${ICONS.bullet} playwright - E2E testing`);
    console.log(`    ${ICONS.bullet} depcheck, ts-prune - Code analysis`);

    return { created: true, merged: false };
  }
}

// =============================================================================
// DEPENDENCY INSTALLATION
// =============================================================================

async function installDependencies(rl, packageManagers) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  header('Installing Dependencies');

  const install = await askYesNo(rl, 'Install npm dependencies now?', true);
  if (!install) {
    log('Skipping dependency installation', 'info');
    log(color('Run "npm install" later to enable hooks', 'yellow'), 'warning');
    return;
  }

  // Choose package manager
  let pm = 'npm';
  if (packageManagers.length > 1) {
    pm = await askChoice(rl, 'Which package manager do you want to use?',
      packageManagers.map(p => ({ value: p, label: p }))
    );
  }

  log(`Installing dependencies with ${pm}...`, 'info');
  console.log(color('  (This may take a minute)', 'dim'));

  try {
    const installCmd = pm === 'npm' ? 'npm install' : `${pm} install`;
    execSync(installCmd, {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true,
    });
    log('Dependencies installed successfully', 'success');
    log(color('Hooks are now fully functional!', 'green'), 'success');
  } catch (error) {
    log(`Failed to install dependencies: ${error.message}`, 'error');
    log('Run "npm install" manually to complete setup', 'warning');
  }
}

// =============================================================================
// SUMMARY
// =============================================================================

function showSummary(results) {
  header('Setup Complete!');

  console.log('What was configured:\n');

  // Claude Code status
  if (results.claudeCode?.installed) {
    if (results.claudeCode.wasInstalled) {
      console.log(`  ${ICONS.bullet} Claude Code: ${color(`installed (${results.claudeCode.version})`, 'green')}`);
    } else {
      console.log(`  ${ICONS.bullet} Claude Code: ${color(`ready (${results.claudeCode.version})`, 'green')}`);
    }
  } else {
    console.log(`  ${ICONS.bullet} Claude Code: ${color('not installed - install from https://claude.ai/code', 'yellow')}`);
  }

  if (results.mcp) {
    const enabledCount = Object.values(results.mcp.config.mcpServers)
      .filter(s => !s.disabled).length;
    console.log(`  ${ICONS.bullet} MCP servers: ${color(`${enabledCount} enabled`, 'green')}`);
  }

  if (results.envCreated) {
    console.log(`  ${ICONS.bullet} Environment: ${color('.env file created', 'green')}`);
  }

  if (results.packageJson?.created) {
    console.log(`  ${ICONS.bullet} Package.json: ${color('created with all dependencies', 'green')}`);
  } else if (results.packageJson?.merged) {
    console.log(`  ${ICONS.bullet} Package.json: ${color('merged Claude Code dependencies', 'green')}`);
  }

  console.log(`  ${ICONS.bullet} Gitignore: ${color('secrets excluded', 'green')}`);

  // Check if hooks will work
  const nodeModulesExist = fs.existsSync(path.join(process.cwd(), 'node_modules'));
  if (nodeModulesExist) {
    console.log(`  ${ICONS.bullet} Hooks: ${color('ready (prettier, eslint installed)', 'green')}`);
  } else {
    console.log(`  ${ICONS.bullet} Hooks: ${color('run "npm install" to enable', 'yellow')}`);
  }

  console.log('\n' + color('Next steps:', 'bright'));

  let stepNum = 1;

  // If Claude Code not installed, that's the first step
  if (!results.claudeCode?.installed) {
    console.log(`  ${stepNum++}. Install Claude Code from ${color('https://claude.ai/code', 'cyan')}`);
  }

  console.log(`  ${stepNum++}. Review ${color('.mcp.json', 'cyan')} and ${color('.env', 'cyan')} files`);
  console.log(`  ${stepNum++}. Add any missing API keys`);

  if (!nodeModulesExist) {
    console.log(`  ${stepNum++}. Run ${color('npm install', 'cyan')} to enable auto-formatting hooks`);
  }

  if (results.claudeCode?.installed) {
    console.log(`  ${stepNum++}. Start Claude Code: ${color('claude', 'cyan')}`);
  }

  console.log('\n' + color('Useful commands:', 'bright'));
  console.log(`  ${color('claude', 'cyan')}              ${ICONS.arrow} Start Claude Code`);
  console.log(`  ${color('npm run fix', 'cyan')}         ${ICONS.arrow} Format + lint all files`);
  console.log(`  ${color('npm run check', 'cyan')}       ${ICONS.arrow} Verify code quality`);
  console.log(`  ${color('npm test', 'cyan')}            ${ICONS.arrow} Run tests`);
  console.log(`  ${color('node setup.js', 'cyan')}       ${ICONS.arrow} Run this setup again`);

  console.log('');
}

// =============================================================================
// DEPENDENCY INSTALLATION HELPERS
// =============================================================================

/**
 * Attempt to install a missing dependency
 */
async function tryInstallDependency(tool, platformInfo) {
  const installCommands = {
    git: {
      darwin: 'xcode-select --install',
      linux: platformInfo.isDebian
        ? 'sudo apt-get update && sudo apt-get install -y git'
        : platformInfo.isRHEL
          ? 'sudo dnf install -y git'
          : null,
      win32: 'winget install Git.Git',
    },
    curl: {
      darwin: null, // Pre-installed
      linux: platformInfo.isDebian
        ? 'sudo apt-get update && sudo apt-get install -y curl'
        : platformInfo.isRHEL
          ? 'sudo dnf install -y curl'
          : null,
      win32: null, // Pre-installed on Windows 10+
    },
    rg: {
      darwin: 'brew install ripgrep',
      linux: platformInfo.isDebian
        ? 'sudo apt-get update && sudo apt-get install -y ripgrep'
        : platformInfo.isRHEL
          ? 'sudo dnf install -y ripgrep'
          : platformInfo.isAlpine
            ? 'apk add ripgrep'
            : null,
      win32: 'winget install BurntSushi.ripgrep.MSVC',
    },
  };

  const commands = installCommands[tool];
  if (!commands) return { success: false, message: `No auto-install available for ${tool}` };

  const command = commands[platformInfo.platform];
  if (!command) return { success: false, message: `No auto-install available for ${tool} on ${platformInfo.displayName}` };

  log(`Attempting to install ${tool}...`, 'info');
  console.log(color(`  Running: ${command}`, 'dim'));

  try {
    execSync(command, { stdio: 'inherit', shell: true });
    // Verify installation
    if (checkCommand(tool)) {
      log(`${tool} installed successfully!`, 'success');
      return { success: true };
    } else {
      return { success: false, message: `Installation completed but ${tool} not found in PATH` };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Display prerequisite issues with installation instructions
 */
function displayPrerequisiteIssues(prereqs, platformInfo) {
  console.log('\n' + color('═══ Missing Requirements ═══', 'red'));
  console.log('');

  for (const issue of prereqs.issues) {
    if (typeof issue === 'string') {
      console.log(`${color(ICONS.error, 'red')} ${issue}`);
    } else {
      console.log(`${color(ICONS.error, 'red')} ${issue.message}`);
      if (issue.instructions) {
        console.log(color('  How to fix:', 'yellow'));
        issue.instructions.split('\n').forEach(line => {
          console.log(color(`    ${line}`, 'dim'));
        });
      }
    }
    console.log('');
  }

  if (prereqs.warnings && prereqs.warnings.length > 0) {
    console.log(color('═══ Warnings ═══', 'yellow'));
    console.log('');
    for (const warning of prereqs.warnings) {
      if (typeof warning === 'string') {
        console.log(`${color(ICONS.warning, 'yellow')} ${warning}`);
      } else {
        console.log(`${color(ICONS.warning, 'yellow')} ${warning.message}`);
        if (warning.instructions) {
          console.log(color('  Recommendation:', 'dim'));
          warning.instructions.split('\n').forEach(line => {
            console.log(color(`    ${line}`, 'dim'));
          });
        }
      }
      console.log('');
    }
  }
}

/**
 * Attempt to auto-install missing dependencies
 */
async function attemptAutoInstall(rl, prereqs, platformInfo) {
  // Find installable dependencies
  const installable = [];

  for (const issue of prereqs.issues) {
    if (typeof issue === 'object' && issue.tool) {
      // Check if we have auto-install capability for this tool
      if (['git', 'curl', 'rg'].includes(issue.tool)) {
        installable.push(issue.tool);
      }
    }
  }

  if (installable.length === 0) {
    return false;
  }

  console.log('');
  log(`Some dependencies can be installed automatically: ${installable.join(', ')}`, 'info');

  const autoInstall = await askYesNo(rl, 'Would you like to try installing them now?', true);

  if (!autoInstall) {
    return false;
  }

  let anySuccess = false;

  for (const tool of installable) {
    const result = await tryInstallDependency(tool, platformInfo);
    if (result.success) {
      anySuccess = true;
    } else {
      log(`Failed to install ${tool}: ${result.message}`, 'warning');
    }
  }

  return anySuccess;
}

/**
 * Continue setup after prerequisites are satisfied
 */
async function continueSetup(rl, platformInfo, prereqs, results) {
  // Check and optionally install Claude Code CLI
  results.claudeCode = await setupClaudeCode(rl, platformInfo);

  // Configure MCP servers
  results.mcp = await configureMcpServers(rl, platformInfo);

  // Update gitignore (before creating files with secrets)
  updateGitignore();

  // Setup environment files
  await setupEnvironmentFiles(rl, results.mcp?.envVars || {});
  results.envCreated = fs.existsSync(path.join(process.cwd(), '.env'));

  // Create directories
  createDirectories();

  // Setup package.json (required for hooks to work)
  results.packageJson = await setupPackageJson(rl);

  // Create config files for ESLint, Prettier, TypeScript
  if (results.packageJson?.created || results.packageJson?.merged) {
    subheader('Creating Config Files');
    createConfigFiles();
  }

  // Install dependencies
  await installDependencies(rl, prereqs.packageManagers);

  // Show summary
  showSummary(results);
}

// =============================================================================
// MAIN
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

    // Create readline early to potentially offer auto-install
    const rl = createReadlineInterface();

    try {
      // Attempt auto-install of missing dependencies
      const installedSomething = await attemptAutoInstall(rl, prereqs, platformInfo);

      if (installedSomething) {
        // Re-check prerequisites after installation
        console.log('\n');
        prereqs = checkPrerequisites(platformInfo);

        if (!prereqs.passed) {
          displayPrerequisiteIssues(prereqs, platformInfo);
          console.log(color('Please fix the remaining issues and run setup again.', 'red'));
          rl.close();
          process.exit(1);
        }

        log('All prerequisites now satisfied!', 'success');
      } else {
        console.log(color('Please fix the above issues and run setup again.', 'red'));
        rl.close();
        process.exit(1);
      }
    } catch (error) {
      rl.close();
      throw error;
    }

    // Continue with this readline interface
    try {
      await continueSetup(rl, platformInfo, prereqs, results);
    } finally {
      rl.close();
    }
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

  const rl = createReadlineInterface();

  try {
    await continueSetup(rl, platformInfo, prereqs, results);
  } catch (error) {
    console.error('\n' + color(`Setup failed: ${error.message}`, 'red'));
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run
main().catch(console.error);
