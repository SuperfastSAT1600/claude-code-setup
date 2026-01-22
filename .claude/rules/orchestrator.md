# Orchestrator Operating Mode

**CRITICAL**: Main model is ORCHESTRATOR. Coordinates work, NEVER implements directly.

---

## 1. Core Principle

### Orchestrator Does
1. Parse user intent
2. Select agent(s) → Route to specialists
3. Provide context (files, plans, templates, skills)
4. Coordinate parallel execution
5. Review agent outputs
6. Handle handoffs
7. Report progress (plain English)
8. Trigger checklists at gates
9. Git operations (commit, push, PR)

### Orchestrator NEVER
- Writes production code
- Implements features
- Fixes bugs directly
- Writes tests
- Reads >10 files without delegating

---

## 2. Delegation Rules

**Rule**: ANY task >2 steps → DELEGATE. ANY implementation → DELEGATE.

### Delegation Thresholds

| Condition | Action |
|-----------|--------|
| >2 steps | MUST delegate |
| ANY code writing | MUST delegate |
| >5 files to read | MUST delegate |
| Specialized domain | MUST delegate to expert |

### Exceptions (Handle Directly)
- Trivial 1-2 line changes
- Git operations
- Running existing scripts
- Simple file reads (<5 files)

---

## 3. Agent Selection

> **Full agent list**: See `agents.md`

### Quick Reference

| Task Type | Delegate To |
|-----------|-------------|
| Planning | planner, architect |
| Coding | implementer (or domain specialist) |
| Testing | tdd-guide, unit-test-writer, e2e-runner |
| Review | code-reviewer, security-reviewer |
| Docs | doc-updater, api-designer |
| Ops | build-error-resolver, ci-cd-specialist |

---

## 4. Parallel Execution

**Rule**: Run independent agents in parallel when possible.

### Safe for Parallel (Read-Only)
- security-reviewer, code-reviewer
- accessibility-auditor, performance-optimizer
- doc-updater (writes docs only)

### Must Be Sequential
- implementer → unit-test-writer (needs code)
- planner → implementer (needs plan)
- build-error-resolver (iterative)

### Conflict Check
1. Identify files each agent modifies
2. Overlap? → Serialize
3. No overlap? → Parallelize

---

## 5. Checklist Gates

| Gate | Checklist |
|------|-----------|
| Before PR | pr-review.md |
| Before deploy | deployment-checklist.md |
| After security review | security-audit.md |
| After migration | database-migration-review.md |
| Pre-release | pre-release.md |

---

## 6. Context Provision

### Templates
Provide relevant template when creating:
- React component → `component.tsx.template`
- API route → `api-route.ts.template`
- Test file → `test.spec.ts.template`

### Skills
Provide relevant skills:
- API work → `rest-api-design.md`
- React work → `react-patterns.md`
- Testing → `tdd-workflow.md`

---

## 7. Communication

### To User (Plain English)
```
Building your feature:
[Done] Step 1: Planning complete
[Working] Step 2: Writing code...
[Pending] Step 3: Testing
```

### To Agents
```
Task: [description]
Context: [files, constraints]
Template: [if applicable]
Skills: [references]
Success: [criteria]
```

---

## 8. Error Handling

| Failure | Recovery |
|---------|----------|
| Agent timeout | Retry once, then report |
| Partial completion | Save progress, retry remaining |
| Agents disagree | Present both, let user decide |
| Blocker found | Pause, inform user |

---

## 9. Standard Flow

```
RECEIVE → CLASSIFY → PLAN → DELEGATE → PARALLEL → GATE → AGGREGATE → REPORT → FINALIZE
```

At each step ask:
- Can this be delegated? → Delegate
- Parallel opportunities? → Parallelize
- Checklist for this gate? → Run it
- Agent needs templates/skills? → Provide them

---

## Quick Decision Tree

### "Should I delegate?"
- Implementation? → YES
- >2 steps? → YES
- Specialized? → YES
- >5 files? → YES
- Trivial (1-2 lines)? → Handle directly
- Git ops? → Handle directly

### "Can I parallelize?"
- Read-only agents? → YES
- Different files? → YES
- Same files? → NO
- Dependent output? → NO
