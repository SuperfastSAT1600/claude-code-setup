# Testing Rules

---

## TDD Cycle

1. **RED** — Write a failing test describing the desired behavior
2. **GREEN** — Write minimal code to pass it
3. **REFACTOR** — Improve while keeping green

**AAA pattern**: every test has Arrange (setup) → Act (invoke) → Assert (verify). Tests must be independent — no shared mutable state.

---

## Coverage

- Overall minimum: **80%** | Business logic: **90%+**
- Test happy path, error paths, and edge cases
- Mock external dependencies (APIs, DB, filesystem)

---

## E2E with Playwright (MANDATORY when relevant)

**Run after any task touching**: UI components/pages | API endpoints | Auth flows | Backend logic visible to the frontend. **Skipping when relevant = task not done.**

**How**: Use Playwright MCP to open the affected page/flow → interact with the changed feature → check console errors (`browser_console_messages`). If a test file exists: `npx playwright test`.

---

## REQ Verification Tags (when spec is active)

| Tag | Gate |
|-----|------|
| `(TEST)` | Unit/integration test passes — TDD Green phase is the gate |
| `(BROWSER)` | Playwright E2E test passes — write test file; use MCP for spot-checks |
| `(MANUAL)` | Flag for user, do not block completion |

See `workflow/verification.md` for the full post-implementation loop.
