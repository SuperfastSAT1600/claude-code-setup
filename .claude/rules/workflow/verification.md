# Verification Rules

**Done means confirmed working — not just implemented.** Always close the loop before reporting complete.

```
implement → verify → pass? → done
                   → fail? → fix → verify again
```

---

## When a Spec Is Active

REQ verification tags are authoritative — see `workflow/testing-rules.md` for tag definitions (`TEST` / `BROWSER` / `MANUAL`).

---

## Ad-Hoc Verification (No Spec)

| Work Type | Steps |
|-----------|-------|
| UI / frontend | Run tests → Playwright MCP spot-check → check console errors |
| Backend / API | Run tests → call endpoint (curl/fetch) → inspect real response |
| Database / migrations | Run migration → query table → confirm schema |
| DevOps / CI / config | Run pipeline/script → read actual output → check for errors |
| Auth | Run tests → exercise full login/logout flow in a real request |
| Any code change | At minimum: run the relevant test suite |

---

## Per-Route Responsibility

**Main agent**: Verify in same context. Fix and re-run if anything fails before calling done.

**Subagents**: Each verifies own workstream before returning. Main agent runs integration pass (tests, smoke check, or `/checkpoint`) after all subagents complete.

**Agent Teams**: Each teammate verifies own REQs before marking task done. Lead runs `/checkpoint` as final gate.
