# Team Claude Code Guidelines

Team knowledge base for Claude Code. Add mistakes here so they don't repeat.

---

## Quick Reference

**Workflow**: Main agent codes standard tasks, delegates to 33 specialized agents for expertise
**Agents (33)**: See `.claude/agents/` for full list and INDEX.md

**Resources**:
- Skills: `.claude/skills/` (react-patterns, rest-api-design, etc.)
- Workflows: `.claude/workflows/`
- Checklists: `.claude/checklists/`
- Templates: `.claude/templates/`
- Scripts: `.claude/scripts/`

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

**Frontend**: React 18+, Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS, React Query, Zod

**Backend**: Node.js 20+, Supabase (includes PostgreSQL, Auth, Storage, Real-time, Broadcast), Supabase Edge Functions, Redis. Use Supabase client + generated types instead of Prisma.

**Testing**: Vitest, Playwright, React Testing Library

**DevOps**: Docker, GitHub Actions

---

## Project Structure

```
src/
├── app/           # Next.js pages
├── components/    # UI components
├── features/      # Feature modules
├── lib/           # Third-party integrations
├── hooks/         # Custom hooks
├── utils/         # Utilities
└── types/         # TypeScript types
```

---

## Dependencies

**Approved**: date-fns, zod, react-hook-form, @reduxjs/toolkit, vitest

**Forbidden**: moment.js, full lodash

---

## Error Log

- Never pass model parameter to Task unless explicitly requested

---

**Last Updated**: 2026-01-26
