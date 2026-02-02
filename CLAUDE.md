# Team Claude Code Guidelines

Team knowledge base for Claude Code. Add mistakes here so they don't repeat.

---

## Quick Reference

**Workflow**: Main agent codes standard tasks, delegates to 34 specialized agents for expertise
**Agents (34)**: See `.claude/agents/` for full list and INDEX.md

**Resources**:
- Skills: `.claude/skills/` (react-patterns, rest-api-design, etc.)
- Workflows: `.claude/workflows/`
- Checklists: `.claude/checklists/`
- Templates: `.claude/templates/`
- Scripts: `.claude/scripts/`

---

## Self-Aware System

This setup continuously improves itself. During every task, the system observes its own configuration and proposes fixes, evolutions, and simplifications after completing your work.

- **Execution Protocol**: `.claude/rules/task-execution-protocol.md` (MANDATORY for all agents)
- **Rules**: `.claude/rules/self-aware-system.md`
- **User Data**: `.claude/user/` (changelog, errors, custom content)
- **Health Check**: Run `/health-check` for a comprehensive audit
- **Agent count**: 34 (33 specialists + 1 system-health)

### Mandatory Checkpoints (Every Task)

1. **PRE-TASK**: Identify parallel work opportunities [enforced]
2. **DURING**: Observe `.claude/` issues [passive noting]
3. **POST-TASK**: Auto-heal recurring patterns, report observations [enforced]

This ensures maximum speed through parallelization and continuous system improvement through auto-healing.

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

### Main Agent Templates

When creating React code, the main agent uses:
- `variants/react/component.tsx.template` - React components with TypeScript
- `variants/react/form.tsx.template` - Form components with React Hook Form + Zod
- `variants/react/hook.ts.template` - Custom React hooks with proper cleanup
- `variants/react/context.tsx.template` - React Context providers with type safety
- `variants/react/hoc.tsx.template` - Higher-Order Components with ref forwarding

---

## Tech Stack

> ⚠️ **CUSTOMIZE THIS SECTION** - Replace with your project's actual tech stack

**Frontend**: {{FRONTEND_STACK}}
<!-- Example: React 18+, Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS -->
<!-- Example: Vue 3, Nuxt 3, TypeScript, UnoCSS -->
<!-- Example: Svelte 4, SvelteKit, TypeScript -->

**Backend**: {{BACKEND_STACK}}
<!-- Example: Node.js 20+, Supabase (PostgreSQL, Auth, Storage, Real-time) -->
<!-- Example: Node.js 20+, Express, PostgreSQL, Prisma -->
<!-- Example: Python 3.11+, FastAPI, SQLAlchemy -->

**Testing**: {{TESTING_STACK}}
<!-- Example: Vitest, Playwright, React Testing Library -->
<!-- Example: Jest, Cypress, Testing Library -->

**DevOps**: {{DEVOPS_STACK}}
<!-- Example: Docker, GitHub Actions, Vercel -->
<!-- Example: Docker, GitLab CI, AWS -->

---

## Project Structure

> ⚠️ **CUSTOMIZE THIS SECTION** - Update to match your project's actual structure

```
{{PROJECT_STRUCTURE}}
# Example for Next.js:
# src/
# ├── app/           # Next.js pages
# ├── components/    # UI components
# ├── features/      # Feature modules
# ├── lib/           # Third-party integrations
# ├── hooks/         # Custom hooks
# ├── utils/         # Utilities
# └── types/         # TypeScript types
```

---

## Dependencies

> ⚠️ **CUSTOMIZE THIS SECTION** - List approved and forbidden dependencies for your project

**Approved**: {{APPROVED_DEPS}}
<!-- Example: date-fns, zod, react-hook-form, @tanstack/react-query -->

**Forbidden**: {{FORBIDDEN_DEPS}}
<!-- Example: moment.js, full lodash (use lodash-es with specific imports) -->

---

## Updating This System

To safely update `.claude/` system files while preserving your data:

```bash
# Run the update script
./.claude/scripts/update-system.sh
```

**What's preserved:**
- `.claude/user/changelog.md` - Your self-healing history (50+ entries)
- `.claude/user/errors.md` - Your error log
- `.claude/user/custom/` - Your custom agents/skills/commands
- `.claude/settings.local.json` - Your local configuration

**What's updated:**
- System agents, skills, rules, commands, workflows, templates

The script creates a timestamped backup before updating. See `.claude/user/README.md` for details.

---

## Error Log

Error log is now maintained in `.claude/user/errors.md` to preserve it during system updates.

Main agent: append errors there when you make a mistake. Subagents: report errors in your response for the main agent to log.

---

**Last Updated**: 2026-01-30
