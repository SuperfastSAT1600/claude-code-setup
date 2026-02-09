# Project Configuration

Project-specific configuration for Claude Code. For mandatory protocols, see `.claude/rules/`.

---

## Quick Reference

**Agents**: 34 specialists in `.claude/agents/` (see INDEX.md)
**Commands**: `/health-check`, `/commit`, `/review-changes`, etc.
**Skills**: `.claude/skills/` (react-patterns, rest-api-design, etc.)

**Data Locations**:
- Error log: `.claude/user/errors.md`
- Agent errors: `.claude/user/agent-errors/{agent-name}.md`
- Changelog: `.claude/user/changelog.md` (self-initiated changes only)
- Custom content: `.claude/user/custom/`

---

## Domain Knowledge

> **Must-read before working on core features.**

- **PRD**: `docs/PRD.md` — product scope, architecture, agent/skill inventory, workflow patterns, and success metrics

---

## Tech Stack

**Runtime**: Node.js (CommonJS modules via `.cjs`)
**Language**: JavaScript (with TypeScript tooling for downstream projects)
**CLI Framework**: enquirer (interactive prompts)
**AI Services**: Claude Code CLI, MCP servers (Slack, GitHub, Filesystem, Render, Cloudflare, Context7, Magic UI, Memory, Supabase)
**Linting/Formatting**: ESLint, Prettier, TypeScript
**Platform**: Cross-platform (Windows/MINGW64, macOS, Linux)

---

## Project Structure

```
setup.cjs              # Interactive setup wizard (entry point)
lib/                   # Setup modules (platform, mcp, config, env, etc.)
docs/                  # Product documentation (PRD.md)
supabase/              # Supabase project config
.claude/
├── agents/            # 34 specialist agent definitions + INDEX.md
├── commands/          # User-invocable slash commands
├── skills/            # Domain pattern references (20+ skills)
├── rules/             # Mandatory protocols (coding-standards, task-protocol, etc.)
├── templates/         # Code scaffolding templates (React, Next.js, generic)
├── workflows/         # Multi-step orchestrated processes
├── checklists/        # Quality review checklists (13)
├── scripts/           # Hook scripts (pre-commit, auto-format, etc.)
├── docs/              # Internal system documentation
├── user/              # Per-user data (errors, changelog, custom) [gitignored]
├── settings.json      # Shared Claude Code settings
└── settings.local.json # Local overrides [gitignored]
```

---

## Dependencies

> ⚠️ **CUSTOMIZE THIS SECTION** - List approved and forbidden dependencies

**Approved**: {{APPROVED_DEPS}}
<!-- Example: date-fns, zod, react-hook-form, @tanstack/react-query -->

**Forbidden**: {{FORBIDDEN_DEPS}}
<!-- Example: moment.js, full lodash (use lodash-es with specific imports) -->

---

## Main Agent Templates

When creating React code:
- `variants/react/component.tsx.template` - Components with TypeScript
- `variants/react/form.tsx.template` - Forms with React Hook Form + Zod
- `variants/react/hook.ts.template` - Custom hooks with proper cleanup
- `variants/react/context.tsx.template` - Context providers with type safety
- `variants/react/hoc.tsx.template` - HOCs with ref forwarding

---

## Updating This System

```bash
# 1. Clone/update claude-code-setup in parent directory
cd ..
git clone https://github.com/YOUR_REPO/claude-code-setup.git  # or git pull

# 2. Run update script from your project
cd your-project
./.claude/scripts/update-system.sh
```

**Preserved during updates:**
- `.claude/user/` - Your error logs, changelog, custom content
- `.claude/settings.local.json` - Your local configuration
- `CLAUDE.md` - This file (your project config)

**Updated (from `../claude-code-setup/.claude/`):**
- System agents, skills, rules, commands, workflows, templates

---

**Last Updated**: 2026-02-09
