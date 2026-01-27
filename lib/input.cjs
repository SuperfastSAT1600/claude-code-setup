/**
 * User input utilities using readline
 */

// Try to require 'read' package for secure password input
let readFunction = null;
try {
  const readPackage = require('read');
  readFunction = readPackage.read || readPackage;
} catch (e) {
  // read package not installed, will use fallback
}

/**
 * Ask a question and wait for answer
 */
async function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(`${question}: `, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Ask a yes/no question
 */
async function askYesNo(rl, question, defaultYes = true) {
  const prompt = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await ask(rl, `${question} ${prompt}`);

  if (!answer) return defaultYes;

  const normalized = answer.toLowerCase();
  return normalized === 'y' || normalized === 'yes';
}

/**
 * Detect if running in Git Bash (MINGW) which has TTY issues
 */
function isGitBash() {
  return process.env.MSYSTEM !== undefined ||
         process.env.TERM_PROGRAM === 'mintty' ||
         process.platform === 'win32' && process.env.SHELL && process.env.SHELL.includes('bash');
}

/**
 * Track whether we've shown the Git Bash warning
 */
let gitBashWarningShown = false;

/**
 * Ask for secret input (password/token) - shows asterisks
 * Uses 'read' package if available, otherwise falls back to visible input
 */
async function askSecret(rl, question) {
  // Git Bash on Windows doesn't support hidden input properly
  if (isGitBash()) {
    // Only show the warning once per session
    if (!gitBashWarningShown) {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  GIT BASH LIMITATION: Hidden input not supported');
      console.log('='.repeat(60));
      console.log('Git Bash on Windows cannot hide password input.');
      console.log('Your input will be visible on screen.');
      console.log('');
      console.log('For hidden input, please run this script in:');
      console.log('  • Windows PowerShell');
      console.log('  • Windows CMD');
      console.log('  • Windows Terminal');
      console.log('='.repeat(60) + '\n');
      gitBashWarningShown = true;
    }

    return new Promise((resolve) => {
      rl.question(`${question} (visible): `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  // Use 'read' package if available (works on CMD, PowerShell, Linux, macOS)
  if (readFunction) {
    try {
      // read() uses callback: read(options, callback)
      const result = await new Promise((resolve, reject) => {
        readFunction({
          prompt: `${question}: `,
          silent: true,
          replace: '*',
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
      return result || '';
    } catch (error) {
      // Fall through to readline fallback
      console.error('\nWarning: Secure input failed:', error.message);
      console.error('Input will be visible.');
    }
  }

  // Fallback to readline (input will be visible)
  return new Promise((resolve) => {
    console.log('\nWARNING: Secure input not available. Your input will be visible.');
    console.log('Install the "read" package for hidden input: npm install read\n');
    rl.question(`${question}: `, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Ask user to choose from a list
 */
async function askChoice(rl, question, choices) {
  console.log(`\n${question}`);
  choices.forEach((choice, index) => {
    const label = choice.label || choice.value || choice;
    const description = choice.description ? ` (${choice.description})` : '';
    console.log(`  ${index + 1}. ${label}${description}`);
  });
  console.log('');

  const answer = await ask(rl, 'Enter your choice (number)');
  const choiceIndex = parseInt(answer, 10) - 1;

  if (choiceIndex >= 0 && choiceIndex < choices.length) {
    return choices[choiceIndex].value || choices[choiceIndex];
  }

  return null;
}

module.exports = {
  ask,
  askYesNo,
  askSecret,
  askChoice,
};
