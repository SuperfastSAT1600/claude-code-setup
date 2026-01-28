// CLAUDE.md Generation Module
const fs = require('fs');
const path = require('path');
const { color, log, header } = require('./ui.cjs');
const { ask, askYesNo } = require('./input.cjs');
const { detectTechStack, generateClaudeMdContent } = require('./techstack.cjs');

/**
 * Setup CLAUDE.md with detected or user-provided tech stack
 */
async function setupClaudeMd(rl) {
  header('Tech Stack Detection');

  log('Analyzing your codebase...', 'info');

  const detections = detectTechStack();

  console.log('');
  if (detections.hasExistingCode) {
    log('Existing codebase detected!', 'success');
    console.log('');

    const { framework, backend, database, testing, packageManager } = detections;

    console.log('Detected tech stack:');
    if (framework.detected) {
      console.log(color(`  Frontend: ${framework.name}${framework.version ? ' ' + framework.version : ''}`, 'cyan'));
    }
    if (backend.detected) {
      console.log(color(`  Backend: ${backend.name}`, 'cyan'));
    }
    if (database.detected) {
      console.log(color(`  Database: ${database.name}`, 'cyan'));
    }
    if (testing.detected) {
      console.log(color(`  Testing: ${testing.name}`, 'cyan'));
    }
    if (packageManager.detected) {
      console.log(color(`  Package Manager: ${packageManager.name}`, 'cyan'));
    }

    console.log('');
  } else {
    log('No existing codebase detected (new project)', 'info');
    console.log('');
  }

  const shouldGenerate = await askYesNo(
    rl,
    'Would you like to generate/update CLAUDE.md with your tech stack?',
    true
  );

  if (!shouldGenerate) {
    log('Skipping CLAUDE.md generation. You can edit it manually later.', 'info');
    return { generated: false };
  }

  console.log('');

  // Get tech stack info (use detected or ask user)
  const stackInfo = await gatherTechStackInfo(rl, detections);

  // Generate CLAUDE.md content
  const claudeMdContent = generateClaudeMdFile(stackInfo);

  // Check if CLAUDE.md exists
  const claudeMdExists = fs.existsSync('CLAUDE.md');

  if (claudeMdExists) {
    console.log('');
    log('CLAUDE.md already exists', 'warning');
    const shouldOverwrite = await askYesNo(
      rl,
      'Do you want to overwrite it with the generated version?',
      false
    );

    if (!shouldOverwrite) {
      log('Skipping CLAUDE.md generation. Keeping existing file.', 'info');
      return { generated: false, exists: true };
    }

    // Backup existing CLAUDE.md
    fs.copyFileSync('CLAUDE.md', 'CLAUDE.md.backup');
    log('Backed up existing CLAUDE.md to CLAUDE.md.backup', 'info');
  }

  // Write CLAUDE.md
  fs.writeFileSync('CLAUDE.md', claudeMdContent, 'utf8');
  log('Generated CLAUDE.md with your tech stack', 'success');

  return { generated: true, exists: claudeMdExists };
}

/**
 * Gather tech stack info from user
 */
async function gatherTechStackInfo(rl, detections) {
  const { framework, backend, database, testing } = detections;

  console.log('');
  log('Please provide your tech stack details (press Enter to use detected value):', 'info');
  console.log('');

  // Frontend
  const frontendDefault = framework.detected
    ? `${framework.name}${framework.version ? ' ' + framework.version : ''}, TypeScript`
    : '';
  const frontend = await ask(
    rl,
    `Frontend stack${frontendDefault ? ' [' + frontendDefault + ']' : ''}:`,
    frontendDefault
  );

  // Backend
  const backendDefault = backend.detected ? backend.name : '';
  const backendInput = await ask(
    rl,
    `Backend stack${backendDefault ? ' [' + backendDefault + ']' : ''}:`,
    backendDefault
  );

  // Database
  const databaseDefault = database.detected ? database.name : '';
  const databaseInput = await ask(
    rl,
    `Database${databaseDefault ? ' [' + databaseDefault + ']' : ''}:`,
    databaseDefault
  );

  // Testing
  const testingDefault = testing.detected ? testing.name : '';
  const testingInput = await ask(
    rl,
    `Testing framework${testingDefault ? ' [' + testingDefault + ']' : ''}:`,
    testingDefault
  );

  // DevOps (not auto-detected)
  const devops = await ask(rl, 'DevOps tools (Docker, GitHub Actions, etc.):', 'Docker, GitHub Actions');

  // Project structure (optional)
  const shouldCustomizeStructure = await askYesNo(
    rl,
    'Would you like to customize the project structure section?',
    false
  );

  let projectStructure = null;
  if (shouldCustomizeStructure) {
    console.log('');
    log('Enter your project structure (type "done" on a new line when finished):', 'info');
    const lines = [];
    while (true) {
      const line = await ask(rl, '', '');
      if (line.toLowerCase() === 'done') break;
      lines.push(line);
    }
    projectStructure = lines.join('\n');
  }

  return {
    frontend: frontend || '{{FRONTEND_STACK}}',
    backend: backendInput || '{{BACKEND_STACK}}',
    database: databaseInput || 'Unknown',
    testing: testingInput || '{{TESTING_STACK}}',
    devops: devops || '{{DEVOPS_STACK}}',
    projectStructure,
  };
}

/**
 * Generate CLAUDE.md file content
 */
function generateClaudeMdFile(stackInfo) {
  const { frontend, backend, database, testing, devops, projectStructure } = stackInfo;

  const structure = projectStructure || `src/
├── app/           # Application pages/routes
├── components/    # Reusable components
├── features/      # Feature modules
├── lib/           # Third-party integrations
├── hooks/         # Custom hooks (if applicable)
├── utils/         # Utility functions
└── types/         # TypeScript types`;

  return `# Team Claude Code Guidelines

Team knowledge base for Claude Code. Add mistakes here so they don't repeat.

---

## Quick Reference

**Workflow**: Main agent codes standard tasks, delegates to 34 specialized agents for expertise
**Agents (34)**: See \`.claude/agents/\` for full list and INDEX.md

**Resources**:
- Skills: \`.claude/skills/\` (react-patterns, rest-api-design, etc.)
- Workflows: \`.claude/workflows/\`
- Checklists: \`.claude/checklists/\`
- Templates: \`.claude/templates/\`
- Scripts: \`.claude/scripts/\`

---

## Self-Aware System

This setup continuously improves itself. During every task, the system observes its own configuration and proposes fixes, evolutions, and simplifications after completing your work.

- **Rules**: \`.claude/rules/self-aware-system.md\`
- **Changelog**: \`.claude/health/changelog.md\`
- **Health Check**: Run \`/health-check\` for a comprehensive audit
- **Agent count**: 34 (33 specialists + 1 system-health)

---

## How It Works

**Main agent codes directly** for standard tasks (CRUD, simple features, bug fixes).
**Specialists handle** complex domains (auth, databases, performance, security).

Just describe what you want in plain English:

| You say | What happens |
|---------|--------------|
| "Add a user profile page" | Main agent implements directly |
| "I want users to log in with OAuth" | Delegates to auth-specialist |
| "The checkout is broken" | Main agent fixes via quick-fix workflow |
| "Is this code secure?" | Delegates to security-reviewer |
| "Make the page faster" | Delegates to performance-optimizer |

---

## Tech Stack

**Frontend**: ${frontend}

**Backend**: ${backend}${database !== 'Unknown' ? `\n\n**Database**: ${database}` : ''}

**Testing**: ${testing}

**DevOps**: ${devops}

---

## Project Structure

\`\`\`
${structure}
\`\`\`

---

## Dependencies

**Approved**: date-fns, zod
<!-- Add your approved dependencies here -->

**Forbidden**: moment.js, full lodash
<!-- Add your forbidden dependencies here -->

---

## Error Log

Main agent: append here when you make a mistake so it never repeats. Subagents: report errors in your response for the main agent to log to \`.claude/health/changelog.md\`.

<!-- Add recurring errors here -->

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}
`;
}

module.exports = {
  setupClaudeMd,
};
