/**
 * MCP server configuration
 * TODO: Extract full implementation from setup.js lines 2603-2845
 */

const { log } = require('./ui.cjs');

/**
 * Configure MCP servers
 */
async function configureMcpServers(rl, platformInfo, githubToken = null, supabaseCredentials = null, vercelToken = null) {
  // TODO: Implement full MCP configuration
  // This should include:
  // - Template loading
  // - Platform-specific command transformation
  // - Server selection
  // - API key collection
  // - Auto-configuration of GitHub, Supabase, Vercel tokens

  log('MCP configuration not yet implemented in modular version', 'warning');

  return {
    configured: false,
    collectedEnvVars: {},
  };
}

module.exports = {
  configureMcpServers,
};
