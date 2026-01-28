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

- **Rules**: `.claude/rules/self-aware-system.md`
- **Changelog**: `.claude/health/changelog.md`
- **Health Check**: Run `/health-check` for a comprehensive audit
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

### Main Agent Templates

When creating components, the main agent uses:
- `variants/react/component.tsx.template` - React components with TypeScript
- `variants/react/form.tsx.template` - Form components with React Hook Form + Zod

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

## Error Log

Main agent: append here when you make a mistake so it never repeats. Subagents: report errors in your response for the main agent to log to `.claude/health/changelog.md`.

- Never pass model parameter to Task unless explicitly requested

---

**Last Updated**: 2026-01-26
