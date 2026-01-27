/**
 * Setup summary display
 */

const { log, header, subheader, color, ICONS } = require('./ui.cjs');

/**
 * Show setup summary
 */
function showSummary(results) {
  console.log('');
  console.log(color('═'.repeat(60), 'cyan'));
  console.log(color('  Setup Complete!', 'bright'));
  console.log(color('═'.repeat(60), 'cyan'));
  console.log('');

  // GitHub
  if (results.github) {
    subheader('GitHub');
    console.log(`  ${ICONS.success} Git configured: ${results.github.gitConfigured ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} GitHub CLI: ${results.github.ghInstalled ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} Authenticated: ${results.github.ghAuthenticated ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} PAT configured: ${results.github.token ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log('');
  }

  // Supabase
  if (results.supabase) {
    subheader('Supabase');
    console.log(`  ${ICONS.success} CLI installed: ${results.supabase.cliInstalled ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} Logged in: ${results.supabase.loggedIn ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} Initialized: ${results.supabase.initialized ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} Project linked: ${results.supabase.linked ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} Credentials: ${Object.keys(results.supabase.credentials || {}).length > 0 ? color('Configured', 'green') : color('Not configured', 'yellow')}`);
    console.log('');
  }

  // Vercel
  if (results.vercel) {
    subheader('Vercel');
    console.log(`  ${ICONS.success} CLI installed: ${results.vercel.cliInstalled ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} Logged in: ${results.vercel.loggedIn ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} Project linked: ${results.vercel.linked ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log(`  ${ICONS.success} API token: ${results.vercel.token ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log('');
  }

  // Claude Code
  if (results.claudeCode) {
    subheader('Claude Code CLI');
    console.log(`  ${ICONS.success} Installed: ${results.claudeCode.installed ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log('');
  }

  // Environment
  if (results.env) {
    subheader('Environment');
    console.log(`  ${ICONS.success} .env files: ${results.env.created ? color('Created', 'green') : color('Not created', 'yellow')}`);
    if (results.env.variables) {
      console.log(`  ${ICONS.success} Variables configured: ${color(results.env.variables.length, 'cyan')}`);
    }
    console.log('');
  }

  // MCP Servers
  if (results.mcp) {
    subheader('MCP Servers');
    console.log(`  ${ICONS.success} Configured: ${results.mcp.configured ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log('');
  }

  // Dependencies
  if (results.dependencies) {
    subheader('Dependencies');
    console.log(`  ${ICONS.success} Installed: ${results.dependencies.installed ? color('Yes', 'green') : color('No', 'yellow')}`);
    console.log('');
  }

  // Next Steps
  console.log(color('─'.repeat(60), 'cyan'));
  subheader('Next Steps');
  console.log('');
  console.log(color('  1. Start development:', 'bright'));
  console.log('     npm run dev');
  console.log('');
  console.log(color('  2. Start Supabase locally (if CLI installed):', 'bright'));
  console.log('     supabase start');
  console.log('');
  console.log(color('  3. Generate Supabase types:', 'bright'));
  console.log('     npm run supabase:types');
  console.log('');
  console.log(color('  4. Run tests:', 'bright'));
  console.log('     npm test');
  console.log('');

  // Helpful Resources
  console.log(color('─'.repeat(60), 'cyan'));
  subheader('Helpful Resources');
  console.log('');
  console.log(`  ${ICONS.bullet} Project docs: ${color('./README.md', 'cyan')}`);
  console.log(`  ${ICONS.bullet} Claude Code: ${color('./.claude/', 'cyan')}`);
  console.log(`  ${ICONS.bullet} Supabase docs: ${color('https://supabase.com/docs', 'cyan')}`);
  console.log(`  ${ICONS.bullet} Next.js docs: ${color('https://nextjs.org/docs', 'cyan')}`);
  console.log('');

  // Warnings
  const warnings = [];
  if (results.github && !results.github.token) {
    warnings.push('GitHub PAT not configured - some features may be limited');
  }
  if (results.supabase && !results.supabase.cliInstalled) {
    warnings.push('Supabase CLI not installed - local development may be limited');
  }
  if (results.dependencies && !results.dependencies.installed) {
    warnings.push('Dependencies not installed - run npm install to continue');
  }

  if (warnings.length > 0) {
    console.log(color('─'.repeat(60), 'yellow'));
    console.log(color('  ⚠️  Warnings:', 'yellow'));
    console.log('');
    warnings.forEach(warning => {
      console.log(color(`  ${ICONS.bullet} ${warning}`, 'yellow'));
    });
    console.log('');
  }

  console.log(color('═'.repeat(60), 'cyan'));
  console.log('');
  log('Setup completed successfully! Happy coding! 🚀', 'success');
  console.log('');
}

module.exports = {
  showSummary,
};
