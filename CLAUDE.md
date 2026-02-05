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

When creating React code, the main agent uses:
- `variants/react/component.tsx.template` - React components with TypeScript
- `variants/react/form.tsx.template` - Form components with React Hook Form + Zod
- `variants/react/hook.ts.template` - Custom React hooks with proper cleanup
- `variants/react/context.tsx.template` - React Context providers with type safety
- `variants/react/hoc.tsx.template` - Higher-Order Components with ref forwarding

---

## Tech Stack

**Frontend**: {{FRONTEND_STACK}}

**Backend**: {{BACKEND_STACK}}

**Database**: Supabase (PostgreSQL)

**Testing**: {{TESTING_STACK}}

**DevOps**: Docker, GitHub Actions

---

## Project Structure

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

**Approved**: date-fns, zod
<!-- Add your approved dependencies here -->

**Forbidden**: moment.js, full lodash
<!-- Add your forbidden dependencies here -->

---

## Error Log

Main agent: append here when you make a mistake so it never repeats. Subagents: report errors in your response for the main agent to log to `.claude/health/changelog.md`.

<!-- Add recurring errors here -->

---

**Last Updated**: 2026-01-31
