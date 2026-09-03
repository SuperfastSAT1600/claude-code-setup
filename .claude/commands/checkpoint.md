---
name: checkpoint
description: Run the unified verification gate — types, lint, format, tests, E2E, build, security — as one pipeline
allowed-tools: Bash(bash .claude/scripts/checkpoint.sh:*), Bash(npx tsc:*), Bash(npx eslint:*), Bash(npm run build:*), Read, Edit, Grep, Glob
---

# Checkpoint Command

Phase 5 of the task protocol: the single gate every change passes before it ships.

The work is done by `.claude/scripts/checkpoint.sh` — this command is the way to
reach it. Run it, then act on what it reports.

---

## What It Runs

```bash
bash .claude/scripts/checkpoint.sh
```

Ten steps, in order. Each prints `[n/10]` and its own pass / fail:

| # | Step | Gate |
|---|------|------|
| 1 | TypeScript | `tsc --noEmit` — zero errors |
| 2 | Lint | ESLint / Ruff / go vet / Clippy — zero warnings |
| 3 | Format | Prettier / Black / gofmt / rustfmt — check only |
| 4 | Tests | the project's test command |
| 5 | E2E | Playwright or Cypress, if configured |
| 6 | Build | production build |
| 7 | Security | secret scan / audit |
| 8 | Mutation testing | optional |
| 9 | Test pyramid | advisory only |
| 10 | REQ coverage | optional — spec REQs vs. tests |

Steps whose tooling is not present are **skipped**, not failed.

**Exit codes**: `0` all pass · `1` warnings only · `2` at least one failure.

### Options

Pass these through when a step is genuinely out of scope — not to get past a
red result:

```bash
bash .claude/scripts/checkpoint.sh --skip-build
bash .claude/scripts/checkpoint.sh --skip-security
bash .claude/scripts/checkpoint.sh --skip-req-coverage
```

---

## When to Use

- Phase 5 of `.claude/rules/task-protocol.md`, before `/commit-push-pr`
- Whenever another command tells you to checkpoint (`/verify`, `/review`,
  `/quick-fix`, `/build-fix`, `/e2e`, `/type-check`, `/test-coverage`,
  `/full-feature`, `/parallel-tdd`, `/serverlog`)
- Before any production release

---

## How to Act on the Result

**Do not report a red checkpoint and stop.** Find the root cause, fix it, and
run the gate again — repeat until it is green. That is the Phase 4 fix loop, and
it applies here.

Two honesty rules when you report the outcome:

1. **Say which steps were skipped and why.** A gate that skipped E2E and
   security is not "all green" — it is "6 of 10 ran, and here is what did not".
2. **Compare failures against the project's known baseline** before calling them
   regressions. Many repos carry documented pre-existing failures; a failure that
   was already there is not something your change broke, and saying so is part of
   the report.

---

## Notes

- The script is the source of truth for what runs. If a step looks wrong, read
  `.claude/scripts/checkpoint.sh` rather than trusting this summary.
- On a working tree shared with another session, a production build writes to the
  build output directory and can disturb a running dev server. Check for one
  first and use `--skip-build` if someone is holding it.
