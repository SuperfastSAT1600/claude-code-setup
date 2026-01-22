# Intent Routing Rules

Auto-classify user intent → route to appropriate command/agent/workflow.

---

## Core Principle

When users describe what they want in plain language:
1. Classify intent from natural language
2. Select appropriate command/agent
3. Execute (confirm for major operations)

**Never** ask users to use specific commands or agent names.

---

## Intent Classification

| Intent | Triggers | Route To |
|--------|----------|----------|
| **Feature** | "I want...", "Add...", "Build...", "Create...", "Enable..." | `/full-feature` |
| **Bug fix** | "Fix...", "Broken...", "Error...", "Bug...", "Not working..." | `/quick-fix` |
| **Review** | "Review...", "Check...", "Is this okay?", "Look at..." | `/review-changes` |
| **Security** | "Secure?", "Safe?", "Vulnerable?", "Audit..." | `/security-review` |
| **Performance** | "Slow...", "Fast...", "Optimize...", "Speed up..." | `performance-optimizer` |
| **Testing** | "Test...", "Coverage...", "TDD...", "Verify..." | `/test-coverage` or `tdd-guide` |
| **Docs** | "Document...", "README...", "API docs..." | `/update-docs` |
| **Refactor** | "Clean up...", "Simplify...", "Dead code...", "Modernize..." | `/refactor-clean` |
| **Quality** | "Lint...", "Format...", "Type errors...", "TypeScript..." | `/lint-fix` or `/type-check` |
| **Deploy** | "Deploy...", "Release...", "Ship...", "Go live..." | `release` workflow |
| **Component** | "New component...", "Add a button/form/modal..." | `/new-component` |
| **Database** | "Migration...", "Schema...", "Add field..." | `/create-migration` |

---

## Auto-Delegate by Context

| Detected Need | Delegate To |
|---------------|-------------|
| Authentication/login | `auth-specialist` |
| Database design | `database-architect` |
| API endpoints | `api-designer` |
| Performance issues | `performance-optimizer` |
| Accessibility | `accessibility-auditor` |
| Security audit | `security-reviewer` |
| CI/CD setup | `ci-cd-specialist` |
| Docker/containers | `docker-specialist` |
| Complex testing | `tdd-guide` |
| Over-engineered code | `code-simplifier` |

---

## Context Clues

### File Types → Work Type
| File Pattern | Indicates |
|-------------|-----------|
| `.tsx`, `.jsx`, React | Frontend/component |
| `.ts` in `/api` | Backend/API |
| `.sql`, `.prisma` | Database |
| `.yml` in `.github` | CI/CD |
| `.test.ts`, `.spec.ts` | Testing |

### Modifiers
- "simple", "quick", "just" → Less ceremony
- "robust", "production" → More thorough
- "urgent", "asap" → Skip optional steps
- "carefully", "thoroughly" → Comprehensive approach

---

## Disambiguation

When intent is unclear, ask ONE question:

```
What would you like to do?
1. Build something new (feature)
2. Fix something broken (bug)
3. Improve existing code (refactor)
4. Check code quality (review)
```

**Vague patterns:**
- "Help with X" → Ask: add functionality / fix issue / improve / review?
- "Change X" → Ask: add features / fix bug / refactor / change appearance?
- "Update X" → Ask: add functionality / fix / modernize / update docs?

---

## Confirmation Rules

### Confirm Before:
- Creating >3 new files
- Modifying >5 files
- Database migrations
- Deployment
- Deleting files/code

### Skip Confirmation:
- Code reviews (read-only)
- Linting/formatting
- Single file edits
- Running tests

### Format:
```
I'll [action]. This will:
- [Change 1]
- [Change 2]
Proceed? (y/n)
```

---

## Delegation Phrasing

**Don't say**: "I'll delegate to the performance-optimizer agent"

**Do say**:
- "I'll analyze the performance..."
- "Let me check for bottlenecks..."
- "I'll design a solution for..."

---

## Fallback

When intent cannot be determined:
1. Ask clarifying question (disambiguation)
2. Default to exploration (read relevant files)
3. **Never guess** for destructive operations

---

## Goal

**Zero friction**: Users describe what they want → get results.

✅ "I want users to log in" → builds auth → "Done! Here's the PR."
❌ "I want users to log in" → "Use /full-feature or auth-specialist?"

---

## External Resources

**For comprehensive intent classification, reference:**

| Resource | Location | Description |
|----------|----------|-------------|
| Intent Patterns | `.claude/skills/user-intent-patterns.md` | 600+ lines of detailed intent patterns |
| Non-Technical Mode | `.claude/rules/non-technical-mode.md` | Plain English translation rules |
| Orchestrator Rules | `.claude/rules/orchestrator.md` | Delegation decision rules |
