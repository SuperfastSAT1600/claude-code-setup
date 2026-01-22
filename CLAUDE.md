# Team Claude Code Guidelines

Team knowledge base for Claude Code. Add mistakes here so they don't repeat.

---

## Quick Reference

**Agents (34)**: See `.claude/agents/` for full list and INDEX.md

**Resources**:
- Rules: `.claude/rules/` (essential-rules.md, agent-workflow.md)
- Skills: `.claude/skills/` (react-patterns, rest-api-design, etc.)
- Workflows: `.claude/workflows/`
- Checklists: `.claude/checklists/`
- Templates: `.claude/templates/`

---

## Intent Detection

Just describe what you want in plain English:

| You say | What happens |
|---------|--------------|
| "I want users to log in" | full-feature with auth-specialist |
| "The checkout is broken" | quick-fix workflow |
| "Is this code secure?" | security-review |
| "Make the page faster" | performance-optimizer |

---

## Tech Stack

**Frontend**: React 18+, Next.js 14+ (App Router), TypeScript 5+, Tailwind CSS, React Query, Zod

**Backend**: Node.js 20+, Express/Fastify, Prisma, PostgreSQL, Redis

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

**Last Updated**: 2025-01-22
