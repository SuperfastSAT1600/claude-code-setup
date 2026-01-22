# Code Review Rules

Standards for conducting and responding to code reviews.

---

## 1. Review Scope

**Rule**: Review the right things at the right depth.

### What to Review:
| Category | Focus |
|----------|-------|
| **Correctness** | Logic, edge cases, error handling |
| **Security** | Input validation, auth, data exposure |
| **Performance** | N+1 queries, memory leaks, inefficiency |
| **Maintainability** | Readability, complexity, duplication |
| **Testing** | Coverage, meaningful tests, edge cases |
| **Documentation** | Comments for complex logic, API docs |

### What NOT to Review (Automate Instead):
- Code formatting (Prettier)
- Import sorting (ESLint)
- Unused variables (TypeScript)
- Style preferences (ESLint rules)

---

## 2. Review Size Limits

**Rule**: PRs should be small and focused.

### Guidelines:
| Size | Lines | Review Time | Recommended |
|------|-------|-------------|-------------|
| XS | <50 | 5 min | ✅ Ideal |
| S | 50-200 | 15 min | ✅ Good |
| M | 200-400 | 30 min | ⚠️ Acceptable |
| L | 400-800 | 1 hour | ⚠️ Split if possible |
| XL | >800 | 2+ hours | ❌ Must split |

### When Large PRs Are OK:
- Generated code (migrations, types)
- Dependency updates
- Find-and-replace refactors
- Moving files (with diff view)

---

## 3. Feedback Categories

**Rule**: Categorize feedback by severity.

### Severity Levels:
```markdown
🚨 **Blocker**: Must fix before merge
- Security vulnerabilities
- Data loss risks
- Breaking changes without migration
- Obvious bugs

⚠️ **Major**: Should fix before merge
- Performance issues
- Missing error handling
- Poor patterns that will cause maintenance burden
- Missing tests for critical paths

💡 **Minor**: Nice to have, can be follow-up
- Code style improvements
- Better naming suggestions
- Documentation improvements
- Refactoring opportunities

❓ **Question**: Need clarification
- Unclear logic
- Unusual patterns
- Missing context
```

### Example:
```markdown
🚨 **Blocker**: SQL Injection Risk
**File**: `src/repositories/UserRepository.ts:45`

This query is vulnerable to SQL injection:
```typescript
const user = await db.query(`SELECT * FROM users WHERE id = '${id}'`);
```

Use parameterized query instead:
```typescript
const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
```
```

---

## 4. Review Checklist

**Rule**: Use a systematic checklist for consistency.

### Code Quality:
- [ ] Code is readable and self-documenting
- [ ] Functions are focused (single responsibility)
- [ ] No code duplication
- [ ] No overly complex logic
- [ ] Error handling is appropriate
- [ ] Edge cases are handled

### Security:
- [ ] User input is validated
- [ ] No hardcoded secrets
- [ ] Authentication/authorization checks present
- [ ] No SQL/XSS injection risks
- [ ] Sensitive data handled properly

### Performance:
- [ ] No N+1 database queries
- [ ] No unnecessary computations
- [ ] Appropriate data structures used
- [ ] No memory leaks (event listeners, subscriptions)
- [ ] Efficient algorithms for large datasets

### Testing:
- [ ] New code has tests
- [ ] Tests cover happy path and edge cases
- [ ] Tests are meaningful (not just coverage padding)
- [ ] No flaky tests introduced
- [ ] Integration tests for complex flows

### Documentation:
- [ ] Complex logic has comments explaining "why"
- [ ] Public APIs have JSDoc
- [ ] README updated if needed
- [ ] Changelog updated for user-facing changes

---

## 5. Giving Feedback

**Rule**: Be constructive, specific, and educational.

### Good Feedback:
```markdown
💡 Consider using `useMemo` here to prevent recalculating `expensiveData`
on every render. Since the calculation depends only on `items`, we can
memoize it:

```typescript
const expensiveData = useMemo(() => {
  return items.map(item => heavyCalculation(item));
}, [items]);
```

This will improve performance when parent components re-render.
```

### Bad Feedback:
```markdown
❌ "This is wrong"
❌ "You should know better"
❌ "Why didn't you...?"
❌ "This code is bad"
```

### Feedback Format:
```markdown
**[Category]**: [Brief title]
**Location**: [File:line]

[Explanation of the issue]

[Suggested fix with code example]

[Optional: Link to documentation or rationale]
```

---

## 6. Receiving Feedback

**Rule**: Respond to all feedback professionally.

### Do:
- ✅ Thank reviewers for their time
- ✅ Address all comments (fix or explain why not)
- ✅ Ask clarifying questions if unclear
- ✅ Acknowledge valid points
- ✅ Explain your reasoning when disagreeing

### Don't:
- ❌ Take feedback personally
- ❌ Ignore comments
- ❌ Argue without explanation
- ❌ Make excuses

### Response Templates:
```markdown
# Agreeing and fixing
"Good catch! Fixed in abc123."

# Explaining why you disagree
"I considered that approach, but went with X because [reason].
Happy to change if you still think Y is better."

# Asking for clarification
"Could you elaborate on what you mean by X?
I want to make sure I understand the concern."

# Deferring to follow-up
"Great suggestion! I've created issue #123 to track this
as a follow-up improvement."
```

---

## 7. Review Timeline

**Rule**: Review promptly to maintain velocity.

### Guidelines:
| Priority | First Response | Complete Review |
|----------|----------------|-----------------|
| Urgent | 2 hours | Same day |
| Normal | 4 hours | 24 hours |
| Low | 24 hours | 48 hours |

### If You Can't Review:
- Comment that you'll review later
- Suggest another reviewer
- Don't leave PRs hanging

---

## 8. Approval Criteria

**Rule**: Approve only when confident code is ready.

### Approve When:
- All blockers resolved
- Major issues addressed or tracked
- Tests pass
- You understand what the code does
- You would be comfortable maintaining it

### Request Changes When:
- Blockers exist
- Tests missing for critical paths
- Security issues present
- Code doesn't work as intended

### Comment Without Blocking When:
- Only minor suggestions
- Questions that don't block merge
- Future improvement ideas

---

## 9. Special Review Types

### Security Review:
```markdown
Focus on:
- Authentication/authorization
- Input validation
- Data exposure
- Injection vulnerabilities
- Cryptography usage
- Secret management
```

### Performance Review:
```markdown
Focus on:
- Database query efficiency
- Memory usage
- Algorithm complexity
- Bundle size impact
- Caching opportunities
```

### Architecture Review:
```markdown
Focus on:
- Pattern consistency
- Separation of concerns
- Coupling/cohesion
- Scalability implications
- Future maintenance
```

---

## 10. Review Tools

### Automated Checks:
```yaml
# PR must pass before review
- Lint (ESLint, Prettier)
- Type check (TypeScript)
- Unit tests
- Integration tests
- Security scan
- Bundle size check
```

### Reviewer Aids:
- Use GitHub's suggestion feature for small changes
- Use "Start a review" to batch comments
- Use saved replies for common feedback
- Reference documentation/guidelines

---

## Review Checklist Summary

### Reviewer Checklist:
- [ ] Read PR description and linked issues
- [ ] Understand the context and goal
- [ ] Check code against review checklist
- [ ] Categorize feedback by severity
- [ ] Be constructive and specific
- [ ] Approve or request changes clearly

### Author Checklist:
- [ ] PR is small and focused
- [ ] Description explains what and why
- [ ] Tests included and passing
- [ ] Self-reviewed before requesting
- [ ] Respond to all feedback
- [ ] Get required approvals

---

## Resources

- [Google's Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Conventional Comments](https://conventionalcomments.org/)
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/)
