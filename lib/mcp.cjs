/**
 * MCP server configuration
 * Handles loading template, server selection, and API key collection
 */

const fs = require('fs');
const path = require('path');
const { log, subheader, header, color, ICONS } = require('./ui.cjs');
const { askYesNo, askSecret, askChoice } = require('./input.cjs');

/**
 * Server categories for organized display
 */
const SERVER_CATEGORIES = {
  essential: {
    name: 'Essential',
    description: 'Core functionality (REQUIRED)',
    servers: ['filesystem', 'github', 'slack'],
  },
  database: {
    name: 'Database & Backend',
    description: 'Database and backend services',
    servers: ['supabase'],
  },
  deployment: {
    name: 'Deployment & Infrastructure',
    description: 'Deployment and cloud services',
    servers: ['render', 'cloudflare-docs', 'cloudflare-workers-builds', 'cloudflare-workers-bindings', 'cloudflare-observability'],
  },
  development: {
    name: 'Development Tools',
    description: 'Code assistance and documentation',
    servers: ['memory', 'context7', 'magic-ui'],
  },
};

/**
 * Environment variable mappings for auto-fill
 */
const ENV_VAR_MAPPINGS = {
  GITHUB_PERSONAL_ACCESS_TOKEN: ['github'],
  SUPABASE_URL: ['supabase'],
  SUPABASE_SERVICE_KEY: ['supabase'],
  RENDER_API_KEY: ['render'],
  CLOUDFLARE_API_TOKEN: ['cloudflare-workers-builds', 'cloudflare-workers-bindings', 'cloudflare-observability'],
  SLACK_BOT_TOKEN: ['slack'],
  SLACK_TEAM_ID: ['slack'],
};

/**
 * Servers that are always required
 */
const REQUIRED_SERVERS = ['filesystem', 'slack'];

/**
 * Load MCP template file
 */
function loadMcpTemplate() {
  const templatePath = path.join(process.cwd(), '.mcp.template.json');

  if (!fs.existsSync(templatePath)) {
    return { success: false, error: '.mcp.template.json not found' };
  }

  try {
    const content = fs.readFileSync(templatePath, 'utf8');
    const template = JSON.parse(content);
    return { success: true, template };
  } catch (error) {
    return { success: false, error: `Failed to parse template: ${error.message}` };
  }
}

/**
 * Get required environment variables for a server
 */
function getServerEnvVars(serverConfig) {
  if (!serverConfig.env) return [];

  return Object.entries(serverConfig.env)
    .filter(([_, value]) => value.includes('YOUR_') || value.includes('_HERE'))
    .map(([key, _]) => key);
}

/**
 * Check if a server has all required env vars filled
 */
function isServerConfigured(serverConfig, collectedEnvVars) {
  const requiredVars = getServerEnvVars(serverConfig);
  if (requiredVars.length === 0) return true;

  return requiredVars.every(varName => {
    const value = collectedEnvVars[varName];
    return value && !value.includes('YOUR_') && !value.includes('_HERE');
  });
}

/**
 * Check if a server is marked as recommended
 */
function isRecommendedServer(serverConfig) {
  return serverConfig.description && serverConfig.description.includes('⭐ RECOMMENDED');
}

/**
 * Display servers grouped by category
 */
function displayServers(template, enabledServers) {
  const allServers = Object.keys(template.mcpServers);

  console.log(color('Available MCP Servers:', 'bright'));
  console.log('');

  for (const [categoryKey, category] of Object.entries(SERVER_CATEGORIES)) {
    const categoryServers = category.servers.filter(s => allServers.includes(s));
    if (categoryServers.length === 0) continue;

    console.log(color(`${category.name}`, 'cyan') + color(` (${category.description})`, 'dim'));

    for (const serverName of categoryServers) {
      const isEnabled = enabledServers.includes(serverName);
      const serverConfig = template.mcpServers[serverName];
      const isRecommended = isRecommendedServer(serverConfig);

      const status = isEnabled ? color('[enabled]', 'green') : color('[disabled]', 'dim');
      const recommendedBadge = isRecommended ? color(' ⭐', 'yellow') : '';
      console.log(`  ${ICONS.bullet} ${serverName}${recommendedBadge} ${status}`);
    }
    console.log('');
  }

  // Show uncategorized servers
  const categorizedServers = Object.values(SERVER_CATEGORIES).flatMap(c => c.servers);
  const uncategorized = allServers.filter(s => !categorizedServers.includes(s));

  if (uncategorized.length > 0) {
    console.log(color('Other', 'cyan'));
    for (const serverName of uncategorized) {
      const isEnabled = enabledServers.includes(serverName);
      const serverConfig = template.mcpServers[serverName];
      const isRecommended = isRecommendedServer(serverConfig);

      const status = isEnabled ? color('[enabled]', 'green') : color('[disabled]', 'dim');
      const recommendedBadge = isRecommended ? color(' ⭐', 'yellow') : '';
      console.log(`  ${ICONS.bullet} ${serverName}${recommendedBadge} ${status}`);
    }
    console.log('');
  }
}

/**
 * Get human-readable description for an env var
 */
function getEnvVarDescription(varName) {
  const descriptions = {
    GITHUB_PERSONAL_ACCESS_TOKEN: 'GitHub PAT (https://github.com/settings/tokens)',
    SLACK_BOT_TOKEN: 'Slack Bot Token (https://api.slack.com/apps)',
    SLACK_TEAM_ID: 'Slack Team ID (starts with T)',
    VERCEL_API_TOKEN: 'Vercel API Token (https://vercel.com/account/tokens)',
    RENDER_API_KEY: 'Render API Key (https://dashboard.render.com/account/settings)',
    FIRECRAWL_API_KEY: 'Firecrawl API key (https://firecrawl.dev/)',
    CLOUDFLARE_API_TOKEN: 'Cloudflare API Token (https://dash.cloudflare.com/profile/api-tokens)',
    SUPABASE_URL: 'Supabase Project URL',
    SUPABASE_SERVICE_KEY: 'Supabase Service Role Key',
  };

  return descriptions[varName] || varName;
}

/**
 * Collect API key from user
 */
async function collectApiKey(rl, varName, currentValue) {
  const description = getEnvVarDescription(varName);

  // Check if we already have a value that's not a placeholder
  if (currentValue && !currentValue.includes('YOUR_') && !currentValue.includes('_HERE')) {
    console.log(color(`  ${varName}: already configured`, 'green'));
    return currentValue;
  }

  const value = await askSecret(rl, `Enter ${description} (or press Enter to skip)`);
  return value || null;
}

/**
 * Configure MCP servers
 */
async function configureMcpServers(rl, platformInfo, githubConfig = null, supabaseConfig = null, vercelToken = null) {
  header('MCP Server Configuration');

  console.log('MCP (Model Context Protocol) servers extend Claude Code\'s capabilities.');
  console.log('This step will help you configure which servers to enable and collect API keys.');
  console.log('');

  const results = {
    configured: false,
    enabledServers: [],
    collectedEnvVars: {},
    errors: [],
  };

  // Load template
  const templateResult = loadMcpTemplate();
  if (!templateResult.success) {
    log(templateResult.error, 'error');
    results.errors.push(templateResult.error);
    return results;
  }

  const template = templateResult.template;

  // Pre-fill collected env vars from earlier setup steps
  // GitHub MCP (configured in GitHub setup step)
  const githubMcpEnabled = githubConfig?.mcpEnabled || false;
  if (githubConfig?.token) {
    results.collectedEnvVars.GITHUB_PERSONAL_ACCESS_TOKEN = githubConfig.token;
  }

  // Supabase MCP (configured in Supabase setup step)
  const supabaseMcpEnabled = supabaseConfig?.mcpEnabled || false;
  if (supabaseConfig?.credentials) {
    if (supabaseConfig.credentials.SUPABASE_URL) {
      results.collectedEnvVars.SUPABASE_URL = supabaseConfig.credentials.SUPABASE_URL;
    }
    if (supabaseConfig.credentials.SUPABASE_SERVICE_ROLE_KEY) {
      results.collectedEnvVars.SUPABASE_SERVICE_KEY = supabaseConfig.credentials.SUPABASE_SERVICE_ROLE_KEY;
    }
  }

  // Vercel token (if provided from earlier steps)
  if (vercelToken) {
    results.collectedEnvVars.VERCEL_API_TOKEN = vercelToken;
  }

  // Show current configuration
  subheader('Current Server Configuration');

  // Determine which servers to enable by default
  const defaultEnabled = ['filesystem', 'slack']; // Always enable filesystem and slack (REQUIRED)

  // Auto-enable GitHub and Supabase if configured in their respective setup steps
  if (githubMcpEnabled) {
    defaultEnabled.push('github');
    log('GitHub MCP server enabled (configured in GitHub setup)', 'info');
  }
  if (supabaseMcpEnabled) {
    defaultEnabled.push('supabase');
    log('Supabase MCP server enabled (configured in Supabase setup)', 'info');
  }

  log('Slack MCP server is REQUIRED for PR notifications', 'info');

  console.log('');
  displayServers(template, defaultEnabled);

  // Ask about enabling servers
  const configureServers = await askYesNo(rl, 'Would you like to configure which servers to enable?', true);

  let enabledServers = [...defaultEnabled];

  if (configureServers) {
    subheader('Server Selection');

    // Group servers by category for selection
    for (const [categoryKey, category] of Object.entries(SERVER_CATEGORIES)) {
      const categoryServers = category.servers.filter(s => template.mcpServers[s]);
      if (categoryServers.length === 0) continue;

      console.log('');
      console.log(color(`${category.name}:`, 'bright'));

      for (const serverName of categoryServers) {
        // Skip servers that are always enabled or configured in their own setup steps
        if (REQUIRED_SERVERS.includes(serverName)) {
          console.log(color(`  ${serverName}: REQUIRED (always enabled)`, 'dim'));
          continue;
        }

        if (serverName === 'github') {
          console.log(color(`  ${serverName}: ${githubMcpEnabled ? 'enabled (configured in GitHub setup)' : 'disabled (configure in GitHub setup)'}`, 'dim'));
          continue;
        }

        if (serverName === 'supabase') {
          console.log(color(`  ${serverName}: ${supabaseMcpEnabled ? 'enabled (configured in Supabase setup)' : 'disabled (configure in Supabase setup)'}`, 'dim'));
          continue;
        }

        const isCurrentlyEnabled = enabledServers.includes(serverName);
        const serverConfig = template.mcpServers[serverName];
        const requiredVars = getServerEnvVars(serverConfig);
        const hasCredentials = requiredVars.length === 0 || requiredVars.some(v => results.collectedEnvVars[v]);
        const isRecommended = isRecommendedServer(serverConfig);

        let defaultEnable = isCurrentlyEnabled || isRecommended;
        let hint = '';

        if (isRecommended) {
          hint = ' (⭐ recommended)';
        } else if (hasCredentials && requiredVars.length > 0) {
          hint = ' (credentials available)';
        } else if (requiredVars.length > 0) {
          hint = ` (requires: ${requiredVars.join(', ')})`;
        }

        const enable = await askYesNo(rl, `  Enable ${serverName}?${hint}`, defaultEnable);

        if (enable && !enabledServers.includes(serverName)) {
          enabledServers.push(serverName);
        } else if (!enable && enabledServers.includes(serverName)) {
          enabledServers = enabledServers.filter(s => s !== serverName);
        }
      }
    }
  }

  results.enabledServers = enabledServers;

  // Collect API keys for enabled servers
  subheader('API Key Collection');

  const neededEnvVars = new Set();

  for (const serverName of enabledServers) {
    const serverConfig = template.mcpServers[serverName];
    const requiredVars = getServerEnvVars(serverConfig);

    for (const varName of requiredVars) {
      neededEnvVars.add(varName);
    }
  }

  if (neededEnvVars.size > 0) {
    console.log('The enabled servers require the following API keys:');
    console.log('');

    for (const varName of neededEnvVars) {
      const currentValue = results.collectedEnvVars[varName];

      if (currentValue && !currentValue.includes('YOUR_') && !currentValue.includes('_HERE')) {
        console.log(color(`  ${ICONS.success} ${varName}: configured from earlier step`, 'green'));
      } else {
        const value = await collectApiKey(rl, varName, currentValue);
        if (value) {
          results.collectedEnvVars[varName] = value;
          console.log(color(`  ${ICONS.success} ${varName}: saved`, 'green'));
        } else {
          console.log(color(`  ${ICONS.warning} ${varName}: skipped (server may not work)`, 'yellow'));
        }
      }
    }
  } else {
    log('No API keys required for enabled servers', 'info');
  }

  // Generate .mcp.json
  subheader('Generating Configuration');

  const mcpConfig = { mcpServers: {} };

  for (const [serverName, serverConfig] of Object.entries(template.mcpServers)) {
    const isEnabled = enabledServers.includes(serverName);

    // Clone the server config
    const config = JSON.parse(JSON.stringify(serverConfig));

    // Fix npx commands for Windows
    if (platformInfo.isWindows && config.command === 'npx') {
      config.command = 'cmd';
      config.args = ['/c', 'npx', ...config.args];
    }

    // Fill in environment variables
    if (config.env) {
      for (const [varName, placeholder] of Object.entries(config.env)) {
        if (results.collectedEnvVars[varName]) {
          config.env[varName] = results.collectedEnvVars[varName];
        }
      }
    }

    // Set disabled status
    config.disabled = !isEnabled;

    mcpConfig.mcpServers[serverName] = config;
  }

  // Write .mcp.json
  const mcpJsonPath = path.join(process.cwd(), '.mcp.json');

  try {
    fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2) + '\n', 'utf8');
    log('Created .mcp.json', 'success');
    results.configured = true;
  } catch (error) {
    log(`Failed to write .mcp.json: ${error.message}`, 'error');
    results.errors.push(error.message);
  }

  // Summary
  console.log('');
  console.log(color('─── MCP Configuration Summary ───', 'cyan'));
  console.log(`  Enabled servers: ${results.enabledServers.length}`);

  for (const server of results.enabledServers) {
    const configured = isServerConfigured(template.mcpServers[server], results.collectedEnvVars);
    const status = configured ? color('ready', 'green') : color('needs API key', 'yellow');
    console.log(`    ${ICONS.bullet} ${server} (${status})`);
  }

  console.log('');
  console.log(color('Note: .mcp.json contains your API keys and is gitignored.', 'dim'));
  console.log(color('Use .mcp.template.json as the source template.', 'dim'));
  console.log('');

  return results;
}

module.exports = {
  configureMcpServers,
  loadMcpTemplate,
};
