---
description: Verify the latest task's code changes are complete, consistent, and clean
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git show:*), Bash(grep:*), Bash(find:*), Bash(npm test:*), Bash(npm run test:*), Bash(npx tsc:*), Bash(npx vitest:*), Read, Edit
---

# Verify Command

After completing a task, verify that all code changes landed fully — nothing dangling, nothing accidentally broken by ripple, no cleanup left behind.

This is a completeness check on the latest task, not a full codebase health check. For the latter, use `/health-check`.

---

## Usage

```
/verify
```

No arguments. Scopes automatically to the current uncommitted diff.

---

## Scope Detection

Run `git diff HEAD` to identify all files changed since the last commit. This is the task boundary — deterministic, no guessing.

If everything is already committed, run `git diff HEAD~1 HEAD` to inspect the most recent commit.

For each changed file, also identify its **impact radius**: all other files that import or reference it. These are candidates for cascade gaps.

---

## Checks

Run all 6 checks in sequence. Each produces a status line and details if anything needs attention.

---

### Check 1 — Cascade Completeness

> Did the change fully ripple to everything that depends on it?

Grep for references to each changed symbol (renamed functions, changed types, moved exports, altered API shapes) across the codebase. Flag any file in the impact radius that references the old name/shape and wasn't updated.

**Signals to look for:**
- Function/method renamed → old name still called somewhere
- Type or interface changed → implementation files not updated
- Export removed → import still exists in another file
- API response shape changed → consumer still destructures old fields
- Constant/enum value changed → usages not updated

**Status**: ❌ if gaps found, ✅ if impact radius fully covered

---

### Check 2 — Orphan Detection

> Did the change accidentally create dead code?

For each symbol deleted or renamed in the diff, check whether its replacement is used. Flag anything the task left unreachable.

**What to look for:**
- Functions no longer called anywhere
- Exports no longer imported anywhere
- Types no longer referenced anywhere
- Variables assigned but never read in changed files

**Status**: ⚠️ if orphans found (warn, not fail — some may be intentional), ✅ if none

---

### Check 3 — Test Alignment

> Do the tests still test what they claim to test?

Find all test files that import or cover the changed files. Run them. Then inspect whether test descriptions and assertions still match the current behavior.

**Signals to look for:**
- Test descriptions reference old function names or old behavior
- Assertions check for values that the change made impossible or different
- New functions/behavior added with no corresponding test
- Tests passing but clearly testing deleted code paths (always-true assertions)

**Status**: ❌ if tests fail, ⚠️ if tests pass but alignment looks wrong, ✅ if all good

---

### Check 4 — Asymmetric Changes

> Is the change structurally complete on both sides of a contract?

Look for half-finished changes where one side of a pair was updated but not the other.

**Pairs to check:**
- DB schema column added → zod/type schema updated?
- Type field added → API serializer includes it?
- Frontend form field added → API accepts it?
- Create function added → delete/cleanup function exists?
- Feature enabled → feature disabled / teardown path exists?
- Error case handled → success case handled too?

**Status**: ❌ if asymmetry found, ✅ if both sides match

---

### Check 5 — Type Check (scoped)

> Do the changed files and their dependents still compile?

Run TypeScript on the changed files and their direct dependents only — not the full project. Faster than a full `tsc`, scoped to what actually changed.

```bash
npx tsc --noEmit
```

**Status**: ❌ if type errors in changed files or their dependents, ✅ if clean

---

### Check 6 — Cleanup

> Was anything left behind that shouldn't ship?

Scan changed files only.

**Auto-fix immediately (no confirmation needed):**
- `console.log(...)` statements
- `console.error(...)` / `console.warn(...)` used for debugging (not intentional error handling)
- `debugger` statements
- Unused imports (where safe to remove without breaking types)

**Report only (don't auto-fix):**
- `TODO` / `FIXME` comments planted during this task
- Hardcoded values that look like they should be env vars (URLs, keys, magic numbers)
- Commented-out blocks of old code

**Status**: ✅ after auto-fixes applied, ⚠️ if reportable items remain

---

## Report Format

After all checks, print a single consolidated report:

```
── Verify Report ──────────────────────────────────────────

Files changed: 4  |  Impact radius: 7 files checked

✅  Cascade        All call sites of renamed processPayment() updated (3 files)
⚠️   Orphans        UserHelper.formatName() no longer called anywhere
❌  Test alignment  2 tests reference old function name `handleCheckout`
✅  Asymmetry       No structural gaps found
✅  Types           No errors in changed files or dependents
✅  Cleanup         Removed 2 console.log statements (src/services/payment.ts:34, :67)
                   ⚠️  TODO left at src/services/payment.ts:91

───────────────────────────────────────────────────────────
1 failure · 2 warnings · 2 auto-fixes applied

Next: address ❌ items before shipping. Proceed with ⚠️ items? (y / fix / ignore)
```

---

## After the Report

**Auto-fixes already applied**: listed in the Cleanup line. No confirmation needed.

**For each ❌ (failure)**: describe exactly what needs fixing and where. Ask: "Fix this now? (y / skip)"

**For each ⚠️ (warning)**: describe what was found. Ask once at the end: "Proceed with warnings? (y / fix each / ignore all)"

Do not proceed to reporting success until all ❌ items are resolved.

---

## When to Use

- Immediately after completing any non-trivial task
- Before `/commit-push-pr` if you want confidence the change is complete
- When a task touched multiple files and you want to confirm the ripple landed

## When NOT to Use

- For full pre-ship validation → use `/checkpoint`
- For a bug investigation before fixing → use `/fixroot`
- For codebase-wide health → use `/health-check`

---

## Related Commands

- `/fixroot <symptom>` — trace a bug to its origin before fixing
- `/commit-push-pr` — commit, push, and open PR
- `/health-check` — full `.claude/` system audit
