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

## Tech Stack

**Frontend**: {{FRONTEND_STACK}}
<!-- Example: React 18+, Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS -->

**Backend**: {{BACKEND_STACK}}
<!-- Example: Node.js 20+, Supabase (PostgreSQL, Auth, Storage, Real-time) -->

**Testing**: {{TESTING_STACK}}
<!-- Example: Vitest, Playwright, React Testing Library -->

**DevOps**: {{DEVOPS_STACK}}
<!-- Example: Docker, GitHub Actions, Vercel -->

---

## Project Structure

> ⚠️ **CUSTOMIZE THIS SECTION** - Update to match your project

```
src/
├── app/           # Application pages/routes
├── components/    # Reusable components
├── features/      # Feature modules
├── lib/           # Third-party integrations
├── hooks/         # Custom hooks (if applicable)
├── utils/         # Utility functions
└── types/         # TypeScript types
```

---

## Dependencies

> ⚠️ **CUSTOMIZE THIS SECTION** - List approved and forbidden dependencies

**Forbidden**: moment.js, full lodash
<!-- Add your forbidden dependencies here -->

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

**Last Updated**: 2026-02-03
