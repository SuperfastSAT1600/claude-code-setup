/**
 * Supabase setup functions
 * Handles Supabase CLI installation, authentication, project linking, and credentials
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { log, subheader, header, color, ICONS } = require('./ui.cjs');
const { ask, askYesNo, askSecret, askChoice } = require('./input.cjs');

/**
 * Check if Supabase CLI is installed
 */
function checkSupabaseCLIInstalled() {
  try {
    const result = execSync('supabase --version', { stdio: 'pipe', encoding: 'utf8' });
    const match = result.match(/([\d.]+)/);
    return { installed: true, version: match ? match[1] : 'unknown' };
  } catch {
    return { installed: false, version: null };
  }
}

/**
 * Check if user is logged in to Supabase CLI
 */
function checkSupabaseLoggedIn() {
  try {
    execSync('supabase projects list', { stdio: 'pipe', encoding: 'utf8', timeout: 10000 });
    return { loggedIn: true };
  } catch {
    return { loggedIn: false };
  }
}

/**
 * Check if Supabase is initialized in current directory
 */
function checkSupabaseInitialized() {
  const configPath = path.join(process.cwd(), 'supabase', 'config.toml');
  return fs.existsSync(configPath);
}

/**
 * Check if project is linked to a Supabase project
 */
function checkSupabaseLinked() {
  try {
    const result = execSync('supabase status', { stdio: 'pipe', encoding: 'utf8', timeout: 10000 });
    return { linked: !result.includes('not linked'), status: result };
  } catch {
    return { linked: false, status: null };
  }
}

/**
 * Get Supabase CLI installation instructions
 */
function getSupabaseCLIInstallInstructions(platformInfo) {
  if (platformInfo.isWindows) {
    return `Install Supabase CLI:
    Option 1: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase
    Option 2: Download from https://github.com/supabase/cli/releases`;
  } else if (platformInfo.isMac) {
    return `Install Supabase CLI:
    brew install supabase/tap/supabase`;
  } else {
    return `Install Supabase CLI:
    brew install supabase/tap/supabase
    Or download from https://github.com/supabase/cli/releases`;
  }
}

/**
 * Install Supabase CLI
 */
async function installSupabaseCLI(platformInfo) {
  const commands = {
    darwin: 'brew install supabase/tap/supabase',
    linux: 'brew install supabase/tap/supabase',
    win32: null,
  };

  const command = commands[platformInfo.platform];
  if (!command) {
    if (platformInfo.isWindows) {
      log('Attempting npm installation...', 'info');
      try {
        execSync('npm install -g supabase', { stdio: 'inherit', shell: true });
        if (checkSupabaseCLIInstalled().installed) {
          return { success: true };
        }
      } catch {
        // Fall through
      }
    }
    return { success: false, message: 'Auto-install not available. Please install manually.' };
  }

  log('Installing Supabase CLI...', 'info');
  console.log(color(`  Running: ${command}`, 'dim'));

  try {
    execSync(command, { stdio: 'inherit', shell: true });
    if (checkSupabaseCLIInstalled().installed) {
      return { success: true };
    }
    return { success: false, message: 'Installation completed but supabase not found in PATH' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Login to Supabase CLI
 */
async function loginSupabase(rl) {
  log('Starting Supabase login...', 'info');
  console.log('');
  console.log(color('This will open a browser to authenticate with Supabase.', 'dim'));
  console.log(color('Follow the prompts to complete authentication.', 'dim'));
  console.log('');

  try {
    return new Promise((resolve) => {
      const child = spawn('supabase', ['login'], {
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, message: `Login exited with code ${code}` });
        }
      });

      child.on('error', (error) => {
        resolve({ success: false, message: error.message });
      });
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Initialize Supabase in current directory
 */
async function initSupabase() {
  log('Initializing Supabase in current directory...', 'info');

  try {
    execSync('supabase init', { stdio: 'inherit', shell: true });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * List Supabase projects
 */
function listSupabaseProjects() {
  try {
    const result = execSync('supabase projects list', { stdio: 'pipe', encoding: 'utf8', timeout: 30000 });
    const lines = result.trim().split('\n').filter(line => line.trim());
    const projects = [];
    let headerFound = false;

    for (const line of lines) {
      if (line.includes('──') || line.includes('LINKED')) {
        headerFound = true;
        continue;
      }
      if (headerFound && line.trim()) {
        const parts = line.split('│').map(p => p.trim()).filter(p => p);
        if (parts.length >= 2) {
          projects.push({
            name: parts[0],
            id: parts[1],
            org: parts[2] || '',
            region: parts[3] || '',
          });
        }
      }
    }

    return { success: true, projects };
  } catch (error) {
    return { success: false, projects: [], message: error.message };
  }
}

/**
 * Link to a Supabase project
 */
async function linkSupabaseProject(projectRef) {
  log(`Linking to project: ${projectRef}...`, 'info');

  try {
    return new Promise((resolve) => {
      const child = spawn('supabase', ['link', '--project-ref', projectRef], {
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, message: `Link exited with code ${code}` });
        }
      });

      child.on('error', (error) => {
        resolve({ success: false, message: error.message });
      });
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Get Supabase project credentials from dashboard or CLI
 */
async function getSupabaseCredentials(rl, projectRef) {
  subheader('Supabase Project Credentials');

  console.log('Your Supabase project needs the following credentials:');
  console.log('');
  console.log(color('To find these values:', 'bright'));
  console.log(`  1. Go to: ${color('https://supabase.com/dashboard/project/' + (projectRef || '[your-project]') + '/settings/api', 'cyan')}`);
  console.log('  2. Copy the values from the API Settings page');
  console.log('');

  const credentials = {};

  console.log(color('Project URL:', 'bright'));
  console.log(color('  Found under "Project URL" in API Settings', 'dim'));
  const url = await ask(rl, `  ${color('SUPABASE_URL', 'cyan')} (e.g., https://xxxxx.supabase.co)`);
  if (url) {
    credentials.SUPABASE_URL = url;
    credentials.NEXT_PUBLIC_SUPABASE_URL = url;
  }

  console.log('');
  console.log(color('Anon/Public Key:', 'bright'));
  console.log(color('  Found under "Project API keys" → "anon public"', 'dim'));
  const anonKey = await askSecret(rl, `  ${color('SUPABASE_ANON_KEY', 'cyan')}`);
  if (anonKey) {
    credentials.SUPABASE_ANON_KEY = anonKey;
    credentials.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
  }

  console.log('');
  console.log(color('Service Role Key (SECRET - server-side only):', 'bright'));
  console.log(color('  Found under "Project API keys" → "service_role secret"', 'dim'));
  console.log(color('  ⚠️  This key bypasses RLS - never expose to client!', 'yellow'));
  const serviceKey = await askSecret(rl, `  ${color('SUPABASE_SERVICE_ROLE_KEY', 'cyan')} (or Enter to skip)`);
  if (serviceKey) {
    credentials.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
  }

  console.log('');
  console.log(color('Database Connection String (optional):', 'bright'));
  console.log(color('  Found under "Database Settings" → "Connection string"', 'dim'));
  const dbUrl = await askSecret(rl, `  ${color('DATABASE_URL', 'cyan')} (or Enter to skip)`);
  if (dbUrl) {
    credentials.DATABASE_URL = dbUrl;
  }

  return credentials;
}

/**
 * Validate Supabase credentials
 */
async function validateSupabaseCredentials(credentials) {
  if (!credentials.SUPABASE_URL || !credentials.SUPABASE_ANON_KEY) {
    return { valid: false, message: 'URL and Anon Key are required' };
  }

  if (!credentials.SUPABASE_URL.includes('supabase.co') && !credentials.SUPABASE_URL.includes('supabase.in')) {
    return { valid: false, message: 'URL does not appear to be a valid Supabase URL' };
  }

  try {
    const url = `${credentials.SUPABASE_URL}/rest/v1/`;
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" -H "apikey: ${credentials.SUPABASE_ANON_KEY}" "${url}"`, {
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 10000,
    });
    const statusCode = parseInt(result.trim(), 10);

    if (statusCode === 200 || statusCode === 404) {
      return { valid: true };
    } else if (statusCode === 401) {
      return { valid: false, message: 'Invalid API key' };
    } else {
      return { valid: false, message: `Unexpected status code: ${statusCode}` };
    }
  } catch (error) {
    log('Could not validate credentials (network issue) - assuming valid', 'warning');
    return { valid: true };
  }
}

/**
 * Main Supabase setup function (REQUIRED STEP)
 */
async function setupSupabase(rl, platformInfo) {
  header('Supabase Setup (Required)');

  console.log('Supabase is required for this project\'s database and authentication.');
  console.log('This step will configure:');
  console.log(`  ${ICONS.bullet} Supabase CLI installation`);
  console.log(`  ${ICONS.bullet} Supabase authentication`);
  console.log(`  ${ICONS.bullet} Project linking`);
  console.log(`  ${ICONS.bullet} API credentials`);
  console.log('');

  const results = {
    cliInstalled: false,
    loggedIn: false,
    initialized: false,
    linked: false,
    credentials: {},
    projectRef: null,
  };

  // Step 1: CLI
  subheader('Step 1: Supabase CLI');
  let cliStatus = checkSupabaseCLIInstalled();

  if (cliStatus.installed) {
    log(`Supabase CLI installed (v${cliStatus.version})`, 'success');
    results.cliInstalled = true;
  } else {
    log('Supabase CLI is not installed', 'warning');
    console.log('');
    console.log(color('Supabase CLI is required for:', 'dim'));
    console.log(color('  - Local development', 'dim'));
    console.log(color('  - Database migrations', 'dim'));
    console.log(color('  - Type generation', 'dim'));
    console.log('');

    const installCli = await askYesNo(rl, 'Would you like to install Supabase CLI now?', true);

    if (installCli) {
      const installResult = await installSupabaseCLI(platformInfo);
      if (installResult.success) {
        results.cliInstalled = true;
        cliStatus = checkSupabaseCLIInstalled();
        log(`Supabase CLI installed successfully (v${cliStatus.version})`, 'success');
      } else {
        log(`Failed to install: ${installResult.message}`, 'error');
        console.log('');
        console.log(color('Manual installation instructions:', 'yellow'));
        console.log(getSupabaseCLIInstallInstructions(platformInfo));
        console.log('');

        const continueWithoutCli = await askYesNo(rl, 'Continue without Supabase CLI? (you can install it later)', true);
        if (!continueWithoutCli) {
          throw new Error('Supabase CLI is required. Please install it and run setup again.');
        }
      }
    } else {
      log('Skipping Supabase CLI installation', 'info');
      console.log(color('You can install it later from https://supabase.com/docs/guides/cli', 'dim'));
    }
  }

  // Step 2: Login
  if (results.cliInstalled) {
    subheader('Step 2: Supabase Authentication');
    const loginStatus = checkSupabaseLoggedIn();

    if (loginStatus.loggedIn) {
      log('Already logged in to Supabase', 'success');
      results.loggedIn = true;
    } else {
      log('Not logged in to Supabase', 'warning');
      const login = await askYesNo(rl, 'Would you like to login now?', true);

      if (login) {
        const loginResult = await loginSupabase(rl);
        if (loginResult.success) {
          log('Successfully logged in to Supabase', 'success');
          results.loggedIn = true;
        } else {
          log(`Login failed: ${loginResult.message}`, 'error');
        }
      }
    }
  }

  // Step 3: Initialize
  if (results.cliInstalled) {
    subheader('Step 3: Project Initialization');
    const isInitialized = checkSupabaseInitialized();

    if (isInitialized) {
      log('Supabase already initialized in this directory', 'success');
      results.initialized = true;
    } else {
      log('Supabase not initialized in this directory', 'warning');
      const initialize = await askYesNo(rl, 'Would you like to initialize Supabase here?', true);

      if (initialize) {
        const initResult = await initSupabase();
        if (initResult.success) {
          log('Supabase initialized successfully', 'success');
          results.initialized = true;
        } else {
          log(`Initialization failed: ${initResult.message}`, 'error');
        }
      }
    }
  }

  // Step 4: Link
  if (results.cliInstalled && results.loggedIn) {
    subheader('Step 4: Project Linking');
    const linkStatus = checkSupabaseLinked();

    if (linkStatus.linked) {
      log('Project is already linked', 'success');
      results.linked = true;
    } else {
      log('Project is not linked to a Supabase project', 'warning');
      const link = await askYesNo(rl, 'Would you like to link to a Supabase project?', true);

      if (link) {
        console.log('');
        log('Fetching your Supabase projects...', 'info');
        const projectsResult = listSupabaseProjects();

        if (projectsResult.success && projectsResult.projects.length > 0) {
          console.log('');
          const projectChoices = projectsResult.projects.map(p => ({
            value: p.id,
            label: p.name,
            description: `${p.region} (${p.id})`,
          }));
          projectChoices.push({
            value: 'manual',
            label: 'Enter project ref manually',
            description: '',
          });

          const selectedProject = await askChoice(rl, 'Select a project to link:', projectChoices);

          let projectRef = selectedProject;
          if (selectedProject === 'manual') {
            projectRef = await ask(rl, '  Enter project reference ID');
          }

          if (projectRef && projectRef !== 'manual') {
            results.projectRef = projectRef;
            const linkResult = await linkSupabaseProject(projectRef);
            if (linkResult.success) {
              log('Project linked successfully', 'success');
              results.linked = true;
            } else {
              log(`Link failed: ${linkResult.message}`, 'error');
            }
          }
        } else {
          console.log('');
          console.log(color('No projects found or could not fetch projects.', 'yellow'));
          console.log('');
          const manualRef = await ask(rl, '  Enter project reference ID (or press Enter to skip)');
          if (manualRef) {
            results.projectRef = manualRef;
            const linkResult = await linkSupabaseProject(manualRef);
            if (linkResult.success) {
              log('Project linked successfully', 'success');
              results.linked = true;
            } else {
              log(`Link failed: ${linkResult.message}`, 'error');
            }
          }
        }
      }
    }
  }

  // Step 5: Credentials
  subheader('Step 5: Project Credentials (Required)');
  console.log(color('API credentials are required for the application to connect to Supabase.', 'bright'));
  console.log('');

  const credentials = await getSupabaseCredentials(rl, results.projectRef);

  if (credentials.SUPABASE_URL && credentials.SUPABASE_ANON_KEY) {
    log('Validating credentials...', 'info');
    const validation = await validateSupabaseCredentials(credentials);

    if (validation.valid) {
      log('Credentials validated successfully', 'success');
      results.credentials = credentials;
    } else {
      log(`Validation failed: ${validation.message}`, 'error');
      const retry = await askYesNo(rl, 'Would you like to re-enter credentials?', true);
      if (retry) {
        const retryCredentials = await getSupabaseCredentials(rl, results.projectRef);
        results.credentials = retryCredentials;
      } else {
        results.credentials = credentials;
        log('Using credentials without validation', 'warning');
      }
    }
  } else {
    log('Supabase credentials are required to continue', 'error');
    const retry = await askYesNo(rl, 'Would you like to enter credentials now?', true);
    if (retry) {
      const retryCredentials = await getSupabaseCredentials(rl, results.projectRef);
      if (!retryCredentials.SUPABASE_URL || !retryCredentials.SUPABASE_ANON_KEY) {
        throw new Error('Supabase URL and Anon Key are required to continue setup.');
      }
      results.credentials = retryCredentials;
    } else {
      throw new Error('Supabase credentials are required to continue setup.');
    }
  }

  // Summary
  console.log('');
  console.log(color('─── Supabase Setup Summary ───', 'cyan'));
  console.log(`  CLI installed: ${results.cliInstalled ? color('yes', 'green') : color('no', 'yellow')}`);
  console.log(`  Logged in: ${results.loggedIn ? color('yes', 'green') : color('no', 'yellow')}`);
  console.log(`  Initialized: ${results.initialized ? color('yes', 'green') : color('no', 'yellow')}`);
  console.log(`  Project linked: ${results.linked ? color('yes', 'green') : color('no', 'yellow')}`);
  console.log(`  Credentials: ${Object.keys(results.credentials).length > 0 ? color('configured', 'green') : color('not configured', 'red')}`);
  console.log('');

  return results;
}

module.exports = {
  setupSupabase,
};
