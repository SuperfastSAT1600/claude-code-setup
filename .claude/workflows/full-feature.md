# Full Feature Development Workflow

Complete feature development from planning through deployment-ready PR.

---

## Prerequisites

- [ ] Feature requirements documented
- [ ] Acceptance criteria defined
- [ ] Related issues/tickets identified
- [ ] Branch created from main

---

## Workflow Steps

### Step 1: Planning (Spec-Driven)
**Agent**: `architect`
**Duration**: 15-30 minutes

**Actions**:
1. Analyze feature requirements
2. Create structured spec with REQ-XXX IDs (using `.claude/templates/spec.md.template`)
3. Tag each requirement with verification method: `(TEST)`, `(BROWSER)`, `(MANUAL)`
4. Build traceability matrix (REQ → test/check location)
5. Identify dependencies, risks, and implementation steps
6. Save plan to `.claude/plans/[feature-name].md`

**Output**: Structured spec with:
- Requirements with IDs and verification tags
- Traceability matrix
- Implementation steps referencing REQ IDs
- Testing strategy mapped to REQ IDs
- Risk assessment

**Gate**: ⏸️ **User approval required**
> Review the plan before proceeding to implementation.

---

### Step 1.5: Spec Audit
**Script**: `.claude/scripts/audit-spec.sh`

Validates that the plan from Step 1 has:
- Requirement IDs on all requirements
- Verification method tags on all requirements
- At least one `(TEST)` verification
- A traceability matrix

**Gate**: ⏸️ **Spec must pass audit before implementation begins**

---

### Step 2: Test Specification
**Agent**: `test-writer`
**Duration**: 20-40 minutes

**Actions**:
1. Write tests that map to REQ-XXX IDs from the spec
2. Test names should include the REQ ID: `test('REQ-001: user can register with email', ...)`
3. Create unit test skeletons for `(TEST)` tagged requirements
4. Create E2E test skeletons for `(BROWSER)` tagged requirements
5. Define edge cases to test
6. Set up test fixtures

**Output**:
- Test file(s) with failing tests mapped to REQ IDs
- Test data fixtures
- Mocked dependencies

**Quality Check**:
- [ ] Every `(TEST)` requirement has a corresponding test
- [ ] Every `(BROWSER)` requirement has an E2E test skeleton
- [ ] Test names include REQ IDs
- [ ] Edge cases identified
- [ ] Test names describe behavior

---

### Step 3: Implementation
**Agent**: Main agent OR specialist (if complex domain)
**Duration**: Variable
**Parallel with**: Can run parallel with `backend-specialist` (API design docs) if API feature

**Decision**:
- **Standard feature**: Main agent implements directly
- **Complex domain**: Delegate to specialist (auth-specialist, backend-specialist, etc.)

**Actions**:
1. Implement code to pass tests (TDD green phase)
2. Follow existing patterns and conventions
3. Use templates from `.claude/templates/` for new files
4. Handle error cases
5. Add logging where appropriate

**Context to Consider**:
- Implementation plan from Step 1
- Test specs from Step 2
- Relevant templates (component.tsx, api-route.ts, etc.)
- Relevant skills (react-patterns, backend-patterns, etc.)

**Output**:
- Source code changes
- Passing tests

**Quality Check**:
- [ ] All tests passing
- [ ] Code follows project patterns
- [ ] No console.log or debug code
- [ ] Error handling implemented
- [ ] Templates used for new files

---

### Step 4: Code Review
**Agent**: `code-reviewer`
**Duration**: 15-30 minutes

**Actions**:
1. Review code for quality issues
2. Check for patterns violations
3. Identify performance concerns
4. Suggest improvements

**Output**: Review report with:
- Blocker issues (must fix)
- Important issues (should fix)
- Suggestions (nice to have)

**Gate**: ⏸️ **Address blockers before proceeding**

---

### Step 5: Security Review
**Agent**: `code-reviewer` (security mode)
**Duration**: 10-20 minutes

**Actions**:
1. Check for security vulnerabilities (OWASP Top 10)
2. Verify input validation
3. Review authentication/authorization
4. Check for data exposure risks

**Output**: Security report with:
- Critical findings
- Recommendations
- Compliance notes

**Gate**: ⏸️ **Fix critical security issues**

---

### Step 6: Documentation
**Agent**: `doc-updater`
**Duration**: 10-15 minutes

**Actions**:
1. Update README if needed
2. Add/update JSDoc comments
3. Update API documentation
4. Prepare changelog entry

**Output**:
- Updated documentation
- Changelog entry

---

### Step 7: Checkpoint Gate
**Command**: `/checkpoint`
**Script**: `.claude/scripts/checkpoint.sh`
**Duration**: 1-5 minutes

Runs the full automated verification pipeline:
1. TypeScript type checking
2. Linting (ESLint, Ruff, etc.)
3. Format checking (Prettier, Black, etc.)
4. Tests (vitest, jest, pytest, etc.)
5. Build verification
6. Security audit (npm audit, etc.)
7. Mutation testing (if Stryker configured)

All checks must pass before proceeding to commit.

**Gate**: **All checks must pass**

**Alternative**: For features with mixed verification methods (TEST/BROWSER/MANUAL), use `/test-ladder` instead for progressive escalation that ties back to the spec.

---

### Step 8: Commit & PR
**Agent**: Orchestrator (coordinates git operations)
**Duration**: 5-10 minutes

**Auto-Gate**: 🔄 **PR Review Checklist Auto-Triggered**
> Before creating the PR, automatically run through `.claude/checklists/pr-review.md`

**Actions**:
1. Stage all changes
2. Create conventional commit
3. Push to remote
4. Create pull request using `.claude/templates/pr-description.md.template`

**Commit Format**:
```
feat(scope): brief description

- Detail 1
- Detail 2
- Detail 3

Closes #123
```

**PR Template**:
```markdown
## Summary
[What this PR does]

## Changes
- [Change 1]
- [Change 2]

## Test Plan
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Screenshots
[If UI changes]
```

---

## Parallel Execution Opportunities

```
Phase 1: Planning + Spec Audit
  architect → creates structured spec with REQ-XXX IDs
  ↓ SPEC AUDIT GATE (audit-spec.sh)
  ↓ USER APPROVAL GATE

Phase 2: Test + Implementation
  Main agent OR specialist:
  - Write tests mapped to REQ IDs (test-writer)
  - Implement feature
  - Can parallel with backend-specialist (API design docs) if API feature

Phase 3: Review (Parallel)
  ┌─ code-reviewer ────────┐
  ├─ code-reviewer(security)┤ All run in parallel
  └─ doc-updater ──────────┘

Phase 4: Checkpoint Gate
  /checkpoint → types, lint, format, tests, build, security
  (or /test-ladder for spec-driven progressive escalation)
  ↓ ALL CHECKS MUST PASS

Phase 5: Commit (Main Agent)
  Main agent → git operations, PR creation
```

---

## Completion Criteria

- [ ] All tests passing
- [ ] Code review approved
- [ ] Security review passed
- [ ] Documentation updated
- [ ] PR created and ready for review

---

## Rollback Plan

If issues are found after merge:
1. Create hotfix branch
2. Revert problematic changes
3. Follow `/quick-fix` workflow
4. Deploy hotfix

---

## Tips

1. **Start with tests**: TDD catches issues early
2. **Small commits**: Easier to review and revert
3. **Early reviews**: Get feedback before completing
4. **Document as you go**: Don't leave for last

---

## External Resources

**Reference these resources during feature development:**

| Resource | Location | When to Use |
|----------|----------|-------------|
| PR Review | `.claude/checklists/pr-review.md` | Before creating PR (auto-triggered) |
| Security Audit | `.claude/checklists/security-audit.md` | During security review |
| Accessibility Audit | `.claude/checklists/accessibility-audit.md` | UI features |
| Performance Audit | `.claude/checklists/performance-audit.md` | Performance-sensitive features |
| AI Code Review | `.claude/checklists/ai-code-review.md` | Verify code quality |

**Templates to use:**

| Template | Location | When to Use |
|----------|----------|-------------|
| Component | `.claude/templates/component.tsx.template` | New React components |
| API Route | `.claude/templates/api-route.ts.template` | New API endpoints |
| Test | `.claude/templates/test.spec.ts.template` | New test files |
| PR Description | `.claude/templates/pr-description.md.template` | Creating PR |
| Form | `.claude/templates/form.tsx.template` | Form components |
