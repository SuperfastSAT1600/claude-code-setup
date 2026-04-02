# Claude Code Workflow Template

**Setup**: `node setup.cjs` → Follow prompts → Start using

---

## Workflow: Spec-Driven TDD

All tasks follow `.claude/rules/task-protocol.md`. Hooks enforce each phase.

**Phases**: INIT → SPEC → ORCHESTRATION → IMPLEMENT (TDD) → VERIFY → GATE → SHIP

**Spec template**: `.claude/templates/spec.md.template`
**Agent Team** (large features): `/parallel-tdd` — 6-role pipeline

---

## Key Files

- `docs/PRD.md` — architecture, scope
- `.claude/user/errors.md` — read before every task

---

## Tech Stack

**Frontend**: {{FRONTEND_STACK}} | **Backend**: {{BACKEND_STACK}}
**Database**: Supabase (PostgreSQL) | **Testing**: {{TESTING_STACK}}
**DevOps**: Docker, GitHub Actions

---

## Dependencies

**Approved**: date-fns, zod | **Forbidden**: moment.js, full lodash

---

## Updating

```bash
./.claude/scripts/update-system.sh
```

**Preserved**: `.claude/user/`, `settings.local.json`, `CLAUDE.md`

---

**Last Updated**: 2026-04-02
