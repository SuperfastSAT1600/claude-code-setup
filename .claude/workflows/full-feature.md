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

### Step 1: Planning
**Agent**: `planner`
**Duration**: 15-30 minutes

**Actions**:
1. Analyze feature requirements
2. Identify affected files and modules
3. Break down into implementable tasks
4. Identify dependencies and risks
5. Estimate effort

**Output**: Implementation plan with:
- Task breakdown
- File modifications list
- Dependency list
- Risk assessment
- Test strategy

**Gate**: ⏸️ **User approval required**
> Review the plan before proceeding to implementation.

---

### Step 2: Test Specification
**Agent**: `tdd-guide`
**Duration**: 20-40 minutes

**Actions**:
1. Write acceptance test specifications
2. Create unit test skeletons
3. Define edge cases to test
4. Set up test fixtures

**Output**:
- Test file(s) with failing tests
- Test data fixtures
- Mocked dependencies

**Quality Check**:
- [ ] Tests cover all acceptance criteria
- [ ] Edge cases identified
- [ ] Test names describe behavior

---

### Step 3: Implementation
**Agent**: Main context (you)
**Duration**: Variable

**Actions**:
1. Implement code to pass tests (TDD green phase)
2. Follow existing patterns and conventions
3. Handle error cases
4. Add logging where appropriate

**Output**:
- Source code changes
- Passing tests

**Quality Check**:
- [ ] All tests passing
- [ ] Code follows project patterns
- [ ] No console.log or debug code
- [ ] Error handling implemented

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
**Agent**: `security-reviewer`
**Duration**: 10-20 minutes

**Actions**:
1. Check for security vulnerabilities
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

### Step 7: Final Checks
**Agent**: Main context
**Duration**: 5-10 minutes

**Actions**:
1. Run full test suite
2. Run linting
3. Verify build succeeds
4. Review all changes

**Checklist**:
- [ ] All tests passing
- [ ] No lint errors
- [ ] Build successful
- [ ] Documentation updated
- [ ] Changelog entry added

---

### Step 8: Commit & PR
**Agent**: Main context
**Duration**: 5-10 minutes

**Auto-Gate**: 🔄 **PR Review Checklist Auto-Triggered**
> Before creating the PR, automatically run through `.claude/checklists/pr-review.md`

**Actions**:
1. Stage all changes
2. Create conventional commit
3. Push to remote
4. Create pull request

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
