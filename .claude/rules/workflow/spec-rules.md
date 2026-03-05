# Spec-Driven Development

Canonical spec-first rules. Referenced by `task-protocol.md` and `orchestration/routing.md`.

---

## When to Write a Spec (Self-Assessment — MANDATORY)

This is Claude's own judgment, independent of whether the `.plan-active` hook is active.

**Write a spec when ANY of these are true:**
- New feature or user-facing behavior
- Bug fix or refactor touching 2+ files or >10 lines
- High-stakes domain: auth, payments, data schema, API contracts
- Parallel implementation planned (spec defines workstream boundaries + REQ ownership)
- Multiple acceptance criteria can be identified upfront

**Self-check**: "Would a future dev need this spec to understand what was built and why?" If yes → write it.

**Skip for**: typos, single-line fixes, config tweaks, doc-only changes, trivial single-function additions.

---

## How to Write a Spec

1. Load `Skill("spec-writing")`
2. Write to `.claude/plans/[feature].md` using `.claude/templates/spec.md.template`
3. Audit runs on save — coding tools unblock when it passes
4. Implement REQ-by-REQ (Red-Green-Refactor)

Each requirement: `REQ-XXX` ID + `(TEST)` / `(BROWSER)` / `(MANUAL)` tag + one-line acceptance criterion.

---

## Spec + Parallel Orchestration

Spec always precedes parallel implementation — it's the coordination contract (workstream boundaries, REQ ownership, verification criteria). Write spec → identify REQs → assign to agents → each agent verifies their REQs → lead runs `/checkpoint`.
