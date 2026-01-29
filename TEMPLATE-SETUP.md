# Template Setup Guide

Complete guide for customizing this Claude Code template for your project.

---

## Overview

This template is **framework-agnostic** and designed to be customized for any tech stack. Before using it, you need to:

1. **Update tech stack references** in `CLAUDE.md`
2. **Remove irrelevant skills/templates**
3. **Customize project-specific settings**
4. **Run the setup wizard**

**Estimated Time**: 15-30 minutes

---

## Step 1: Update CLAUDE.md (Required)

`CLAUDE.md` is the primary configuration file that Claude reads to understand your project.

### What to Customize

Open `CLAUDE.md` and replace these placeholder sections:

#### Tech Stack (Lines ~49-75)

Replace `{{FRONTEND_STACK}}`, `{{BACKEND_STACK}}`, etc. with your actual stack:

```markdown
**Frontend**: React 18+, Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS
**Backend**: Node.js 20+, Supabase (PostgreSQL, Auth, Storage, Real-time)
**Testing**: Vitest, Playwright, React Testing Library
**DevOps**: Docker, GitHub Actions, Vercel
```

Or for a different stack:

```markdown
**Frontend**: Vue 3, Nuxt 3, TypeScript, UnoCSS
**Backend**: Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy
**Testing**: Pytest, Playwright
**DevOps**: Docker, GitHub Actions, Railway
```

#### Project Structure (Lines ~61-72)

Update the directory structure to match your project:

```markdown
## Project Structure

\```
backend/
├── src/
│   ├── api/           # FastAPI routes
│   ├── models/        # SQLAlchemy models
│   ├── services/      # Business logic
│   └── utils/         # Utilities
frontend/
├── src/
│   ├── pages/         # Vue pages
│   ├── components/    # Vue components
│   └── composables/   # Vue composables
\```
```

#### Dependencies (Lines ~77-81)

List your approved and forbidden dependencies:

```markdown
**Approved**: pydantic, sqlalchemy, alembic, pytest, httpx

**Forbidden**: django-rest-framework (using FastAPI), flask (using FastAPI)
```

---

## Step 2: Clean Up Irrelevant Files (Recommended)

Delete skills, templates, and agents you won't use.

### Framework-Specific Skills

Located in `.claude/skills/`:

| Skill File | Delete If... |
|------------|--------------|
| `react-patterns.md` | Not using React |
| `nextjs-patterns.md` | Not using Next.js |
| `nodejs-patterns.md` | Not using Node.js backend |

### Framework-Specific Templates

Located in `.claude/templates/`:

| Template File | Delete If... |
|---------------|--------------|
| `component.tsx.template` | Not using React/TSX |
| `form.tsx.template` | Not using React forms |
| `api-route.ts.template` | Not using Next.js App Router |

### Keep These (Framework-Agnostic)

**Skills**:
- `coding-standards.md` - Universal best practices
- `tdd-workflow.md` - Testing methodology
- `backend-patterns.md` - General backend patterns
- `rest-api-design.md` - REST API standards
- `database-patterns.md` - Database design patterns

**Templates**:
- `test.spec.ts.template` - Generic test template
- `migration.sql.template` - Database migrations
- `pr-description.md.template` - Pull request template
- `error-handler.ts.template` - Error handling
- `Dockerfile.template` - Containerization

**Agents**: All 33 agents are framework-agnostic - they adapt to your stack based on `CLAUDE.md`

---

## Step 3: Update Settings and Hooks (Optional)

### `.claude/settings.json`

Located at `.claude/settings.json` - review and customize:

#### Allowed Prompts (Lines 4-220)

These pre-approve common bash operations. Add project-specific commands:

```json
{
  "tool": "Bash",
  "prompt": "run supabase commands"
},
{
  "tool": "Bash",
  "prompt": "run your-custom-cli commands"
}
```

#### Hooks (Lines 221-354)

Auto-triggered actions. Review and customize:

**Pre-commit hook** (Line 261):
```json
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git commit\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\nif [ -f \".claude/scripts/pre-commit-checks.sh\" ]; then\n  ./.claude/scripts/pre-commit-checks.sh\nfi || true"
  }]
}
```

**Auto-format hook** (Line 318):
```json
{
  "matcher": "tool in [\"Edit\", \"Write\"] && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx|json|css|scss|md)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\nnpx prettier --write \"$file_path\" 2>/dev/null || true"
  }]
}
```

---

## Step 4: Run Setup Wizard

The setup wizard configures platform-specific settings and collects API keys.

```bash
node setup.cjs
```

The wizard will:

1. **Detect your platform** (Windows/macOS/Linux)
2. **Configure MCP servers** with correct paths
3. **Require Slack MCP setup** (REQUIRED for PR notifications to 개발 channel)
4. **Collect API keys** securely (stored in gitignored `.mcp.json`)
5. **Create `.env` file** from template
6. **Optionally install dependencies**

**Important**: The wizard will prompt for Slack MCP credentials (REQUIRED):
- Slack Bot Token (from https://api.slack.com/apps)
- Slack Team ID (starts with T, workspace ID)

This is needed to auto-send PR notifications to the 개발 channel when using `/commit-push-pr`.

### What Gets Created

- `.mcp.json` - MCP server config with API keys (**gitignored**)
- `.env` - Environment variables (**gitignored**)
- `package.json` - If you opt to create one

### Manual Setup (Alternative)

If you prefer manual setup:

```bash
# 1. Copy templates
cp .mcp.template.json .mcp.json
cp .env.example .env

# 2. Edit with your API keys
# Edit .mcp.json - add GitHub token, Supabase keys, etc.
# Edit .env - add project-specific secrets

# 3. Install dependencies (if applicable)
npm install  # or yarn, pnpm, bun
```

---

## Step 5: Verify Setup

### Test Claude Code

```bash
claude
```

Then ask:

```
What's our tech stack?
```

Claude should describe YOUR stack (from `CLAUDE.md`), not the template defaults.

### Test a Command

```bash
# In Claude
/full-feature
```

Claude should plan a feature using your tech stack.

### Check MCP Servers

```bash
# In Claude
Can you access GitHub?
Can you access Supabase?
```

If configured correctly, Claude will confirm access.

---

## Quick Reference: What to Customize

### Must Customize

- [x] `CLAUDE.md` - Tech stack, project structure, dependencies
- [x] Run `setup.cjs` - Platform config and API keys

### Should Customize

- [ ] `.claude/skills/` - Delete irrelevant framework skills
- [ ] `.claude/templates/` - Delete irrelevant framework templates

### Optional Customization

- [ ] `.claude/settings.json` - Hooks and allowed prompts
- [ ] `.claude/scripts/` - Custom automation scripts
- [ ] `.gitignore` - Project-specific ignore patterns

---

## Troubleshooting

### "Claude doesn't know my tech stack"

**Cause**: `CLAUDE.md` still has placeholder text

**Fix**: Edit `CLAUDE.md` and replace all `{{...}}` placeholders

### "MCP servers not working"

**Cause**: API keys not configured or wrong paths

**Fix**: Re-run `node setup.cjs` or manually edit `.mcp.json`

### "Skills reference wrong framework"

**Cause**: Framework-specific skills still present

**Fix**: Delete `.claude/skills/react-patterns.md`, `nextjs-patterns.md`, etc.

### "Pre-commit hooks failing"

**Cause**: Scripts reference tools you don't have (e.g., `prettier`, `eslint`)

**Fix**: Edit `.claude/settings.json` hooks section, remove or update commands

---

## Example: Setting Up for FastAPI + Vue

### 1. Update CLAUDE.md

```markdown
## Tech Stack

**Frontend**: Vue 3, Vite, TypeScript, Pinia, VueUse
**Backend**: Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy, Alembic
**Testing**: Pytest, Playwright, Vitest
**DevOps**: Docker, GitHub Actions

## Project Structure

\```
backend/
├── app/
│   ├── api/
│   ├── models/
│   └── services/
frontend/
├── src/
│   ├── views/
│   ├── components/
│   └── stores/
\```

## Dependencies

**Approved**: pydantic, httpx, pytest, vue-router, pinia

**Forbidden**: django (using FastAPI), axios (using httpx)
```

### 2. Delete React/Next.js Files

```bash
rm .claude/skills/react-patterns.md
rm .claude/skills/nextjs-patterns.md
rm .claude/skills/nodejs-patterns.md
rm .claude/templates/component.tsx.template
rm .claude/templates/form.tsx.template
rm .claude/templates/api-route.ts.template
```

### 3. Run Setup

```bash
node setup.cjs
```

### 4. Start Using

```bash
claude
```

```
Build a user profile page with Vue
```

Claude will use Vue 3 patterns, FastAPI backend, and your configured stack.

---

## Next Steps

1. **Read** [WORKFLOW.md](WORKFLOW.md) - Complete workflow guide
2. **Explore** `.claude/commands/` - Learn available commands
3. **Try** `/full-feature` - Build your first feature
4. **Customize** `CLAUDE.md` as you discover patterns

---

**Need Help?**

- Open an issue: https://github.com/anthropics/claude-code/issues
- Claude Code docs: https://claude.com/claude-code
- Template docs: [README.md](README.md), [WORKFLOW.md](WORKFLOW.md)
