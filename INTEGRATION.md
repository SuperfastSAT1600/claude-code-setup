# Integration Guide

How to integrate this Claude Code template into an **existing codebase**.

---

## Overview

This guide is for projects that **already have code** and want to add Claude Code workflow automation. You'll selectively copy template files without disrupting your existing setup.

**Estimated Time**: 20-40 minutes

---

## Before You Start

### Prerequisites

- [x] Existing codebase with git initialized
- [x] Claude Code CLI installed (`npm install -g @anthropic-ai/claude-code`)
- [x] Basic understanding of your project's tech stack

### Backup First

```bash
# Create a feature branch for integration
git checkout -b feature/claude-code-setup

# Or create a backup
git stash
```

---

## Integration Steps

### Step 1: Copy Core Configuration

Start with the essential `.claude/` directory structure:

```bash
# From template directory
cp -r .claude/ /path/to/your/project/

# This copies:
# - .claude/agents/        (33 specialized agents)
# - .claude/commands/      (20 workflow commands)
# - .claude/workflows/     (5 orchestrated workflows)
# - .claude/checklists/    (13 review checklists)
# - .claude/rules/         (Core rules)
# - .claude/settings.json  (Team settings)
```

**Result**: Your project now has the full agent/command/workflow infrastructure.

---

### Step 2: Detect Your Tech Stack

Let Claude analyze your existing codebase to understand your stack:

```bash
# Start Claude Code
claude

# Ask Claude to analyze
"Analyze this codebase and tell me:
1. What framework is used (React, Vue, Svelte, etc.)
2. What backend technology (Node.js, Python, Go, etc.)
3. What database and ORM
4. What testing framework
5. Project structure and key directories"
```

Claude will scan your codebase and identify:
- Package.json / requirements.txt / go.mod
- Config files (next.config.js, vite.config.ts, etc.)
- Directory structure

**Take notes** - you'll use this in Step 3.

---

### Step 3: Customize CLAUDE.md

Copy the template and fill in your actual stack:

```bash
cp /path/to/template/CLAUDE.md ./CLAUDE.md
```

Edit `CLAUDE.md` with info from Step 2:

```markdown
## Tech Stack

**Frontend**: [YOUR DETECTED FRONTEND]
**Backend**: [YOUR DETECTED BACKEND]
**Testing**: [YOUR DETECTED TESTING]
**DevOps**: [YOUR DETECTED DEVOPS]

## Project Structure

\```
[YOUR ACTUAL DIRECTORY STRUCTURE]
\```

## Dependencies

**Approved**: [YOUR COMMONLY USED DEPS]
**Forbidden**: [YOUR BANNED DEPS]
```

---

### Step 4: Selective Skill & Template Copy

Only copy skills/templates that match your stack.

#### Detect Framework & Copy Skills

**Using React?**
```bash
cp /path/to/template/.claude/skills/react-patterns.md .claude/skills/
```

**Using Next.js?**
```bash
cp /path/to/template/.claude/skills/nextjs-patterns.md .claude/skills/
```

**Using Node.js backend?**
```bash
cp /path/to/template/.claude/skills/nodejs-patterns.md .claude/skills/
```

**Using Vue/Svelte/Angular?**
- Skip React/Next.js skills
- Create custom `vue-patterns.md` or `svelte-patterns.md` if desired

#### Copy Relevant Templates

```bash
# Using React components?
cp /path/to/template/.claude/templates/component.tsx.template .claude/templates/

# Using Next.js API routes?
cp /path/to/template/.claude/templates/api-route.ts.template .claude/templates/

# Using forms?
cp /path/to/template/.claude/templates/form.tsx.template .claude/templates/
```

#### Always Copy (Framework-Agnostic)

```bash
# Universal patterns
cp /path/to/template/.claude/skills/coding-standards.md .claude/skills/
cp /path/to/template/.claude/skills/tdd-workflow.md .claude/skills/
cp /path/to/template/.claude/skills/backend-patterns.md .claude/skills/
cp /path/to/template/.claude/skills/rest-api-design.md .claude/skills/
cp /path/to/template/.claude/skills/database-patterns.md .claude/skills/

# Universal templates
cp /path/to/template/.claude/templates/test.spec.ts.template .claude/templates/
cp /path/to/template/.claude/templates/pr-description.md.template .claude/templates/
cp /path/to/template/.claude/templates/migration.sql.template .claude/templates/
```

---

### Step 5: Configure MCP Servers (Optional)

MCP servers provide external integrations (GitHub, Supabase, etc.).

#### Option A: Use Setup Wizard

```bash
# Copy setup script to your project
cp /path/to/template/setup.cjs ./
cp /path/to/template/.mcp.template.json ./
cp -r /path/to/template/lib/ ./

# Run wizard
node setup.cjs
```

#### Option B: Manual Setup

```bash
# Copy MCP template
cp /path/to/template/.mcp.template.json ./.mcp.json

# Edit with your API keys
# vim .mcp.json or code .mcp.json

# Add to .gitignore
echo ".mcp.json" >> .gitignore
```

Example `.mcp.json` (minimal):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

---

### Step 6: Update .gitignore

Ensure sensitive files are ignored:

```bash
# Add to .gitignore
cat >> .gitignore <<EOF

# Claude Code
.mcp.json
.claude/settings.local.json
.claude/health/
EOF
```

---

### Step 7: Test Integration

#### Test 1: Tech Stack Recognition

```bash
claude
```

Ask Claude:
```
What's our tech stack?
```

Claude should describe YOUR stack (from `CLAUDE.md`), not template defaults.

#### Test 2: Command Execution

```
/review-changes
```

Claude should analyze your codebase using your tech stack patterns.

#### Test 3: Agent Delegation

```
"Review this codebase for security issues"
```

Claude should delegate to `security-reviewer` agent.

---

## Common Integration Scenarios

### Scenario 1: Existing Next.js + Supabase Project

```bash
# 1. Copy full .claude/ structure
cp -r template/.claude/ ./

# 2. Create CLAUDE.md
echo "## Tech Stack
**Frontend**: Next.js 14, React 18, TypeScript, Tailwind
**Backend**: Supabase (PostgreSQL, Auth, Storage)
**Testing**: Jest, Playwright
" > CLAUDE.md

# 3. Copy Next.js skills
cp template/.claude/skills/nextjs-patterns.md .claude/skills/
cp template/.claude/skills/react-patterns.md .claude/skills/

# 4. Copy relevant templates
cp template/.claude/templates/component.tsx.template .claude/templates/
cp template/.claude/templates/api-route.ts.template .claude/templates/
cp template/.claude/templates/form.tsx.template .claude/templates/

# 5. Run setup
node setup.cjs

# 6. Done!
claude
```

### Scenario 2: Existing Vue + FastAPI Project

```bash
# 1. Copy .claude/ structure
cp -r template/.claude/ ./

# 2. Create CLAUDE.md
cat > CLAUDE.md <<EOF
## Tech Stack
**Frontend**: Vue 3, Vite, TypeScript, Pinia
**Backend**: Python 3.11, FastAPI, PostgreSQL
**Testing**: Pytest, Vitest
EOF

# 3. Skip React/Next.js skills (don't copy them)

# 4. Copy universal skills
cp template/.claude/skills/coding-standards.md .claude/skills/
cp template/.claude/skills/tdd-workflow.md .claude/skills/
cp template/.claude/skills/backend-patterns.md .claude/skills/
cp template/.claude/skills/rest-api-design.md .claude/skills/

# 5. Copy universal templates
cp template/.claude/templates/test.spec.ts.template .claude/templates/
cp template/.claude/templates/pr-description.md.template .claude/templates/

# 6. Done!
claude
```

### Scenario 3: Existing Python/Django Monolith

```bash
# 1. Copy .claude/ structure
cp -r template/.claude/ ./

# 2. Create CLAUDE.md
cat > CLAUDE.md <<EOF
## Tech Stack
**Frontend**: Django Templates, HTMX, Alpine.js
**Backend**: Python 3.10, Django 4.2, PostgreSQL
**Testing**: Pytest, Playwright
EOF

# 3. Skip all frontend framework skills

# 4. Copy backend skills
cp template/.claude/skills/backend-patterns.md .claude/skills/
cp template/.claude/skills/coding-standards.md .claude/skills/
cp template/.claude/skills/tdd-workflow.md .claude/skills/
cp template/.claude/skills/rest-api-design.md .claude/skills/

# 5. Copy templates (mostly generic)
cp template/.claude/templates/test.spec.ts.template .claude/templates/
cp template/.claude/templates/migration.sql.template .claude/templates/
cp template/.claude/templates/pr-description.md.template .claude/templates/

# 6. Done!
claude
```

---

## Post-Integration Checklist

After integration, verify these work:

- [ ] `claude` command starts successfully
- [ ] `/full-feature` command uses your tech stack
- [ ] Claude correctly identifies your framework
- [ ] `/review-changes` analyzes your existing code
- [ ] Agents delegate correctly (e.g., `security-reviewer`)
- [ ] MCP servers connect (if configured)

---

## Customization After Integration

### Add Project-Specific Rules

Edit `CLAUDE.md` to add project conventions:

```markdown
## Project-Specific Rules

- **API Versioning**: All APIs must include `/v1/` in path
- **Component Naming**: Use PascalCase for components, kebab-case for files
- **Testing**: All features require E2E tests in `tests/e2e/`
- **Environment**: Never commit to `.env`, always use `.env.example`
```

### Create Custom Skills

Create `.claude/skills/our-patterns.md` for company-specific patterns:

```markdown
# Our Company Patterns

## API Response Format

\```json
{
  "success": true,
  "data": {...},
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
\```

## Error Codes

- `AUTH_001`: Expired token
- `AUTH_002`: Invalid credentials
...
```

### Create Custom Commands

Create `.claude/commands/our-deploy.md`:

```markdown
---
command: our-deploy
description: Deploy to our staging environment
---

# Our Deploy Command

1. Run all tests
2. Build production bundle
3. Deploy to Kubernetes staging
4. Run smoke tests
5. Notify team in Slack
```

---

## Troubleshooting

### "Claude uses wrong framework patterns"

**Cause**: `CLAUDE.md` not customized or wrong skills copied

**Fix**:
1. Check `CLAUDE.md` - ensure it describes YOUR stack
2. Remove `.claude/skills/react-patterns.md` if not using React
3. Restart Claude

### "Commands fail with 'module not found'"

**Cause**: Template references tools you don't have

**Fix**: Edit `.claude/settings.json` hooks, replace with your tools

### "Agents suggest wrong database patterns"

**Cause**: `database-patterns.md` mentions Prisma/Supabase but you use different ORM

**Fix**: Edit `.claude/skills/database-patterns.md`, replace examples with YOUR ORM

### "MCP servers don't work"

**Cause**: `.mcp.json` not configured or wrong API keys

**Fix**:
1. Ensure `.mcp.json` exists (not `.mcp.template.json`)
2. Check API keys are valid
3. Restart Claude

---

## Rollback (If Something Goes Wrong)

If integration causes issues:

```bash
# Remove everything
rm -rf .claude/
rm CLAUDE.md
rm setup.cjs
rm .mcp.json

# Restore from git
git checkout .

# Or restore from stash
git stash pop
```

---

## Next Steps

1. **Test thoroughly** - Try all commands (`/full-feature`, `/review-changes`, etc.)
2. **Train your team** - Share `CLAUDE.md` and `WORKFLOW.md`
3. **Iterate** - Add project-specific rules as you discover patterns
4. **Commit** - Once stable, commit `.claude/` and `CLAUDE.md` to git

```bash
git add .claude/ CLAUDE.md
git commit -m "Add Claude Code workflow automation"
git push origin feature/claude-code-setup
```

---

## Getting Help

- **Template Setup**: [TEMPLATE-SETUP.md](TEMPLATE-SETUP.md)
- **Complete Workflow**: [WORKFLOW.md](WORKFLOW.md)
- **Quick Reference**: [QUICKSTART.md](QUICKSTART.md)
- **Issues**: https://github.com/anthropics/claude-code/issues
