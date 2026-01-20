# Rules Directory

This directory contains **always-active guidelines** that Claude follows automatically during every session. Rules are your project's quality guardrails.

---

## What Are Rules?

Rules are markdown files that define:
- ✅ What Claude **must** do
- ❌ What Claude **must not** do
- 📋 Standards to follow consistently

Unlike commands (user-triggered) or skills (reference knowledge), rules are **automatically enforced** on every interaction.

---

## Available Rules

### [`security.md`](security.md)
**Purpose**: Prevent security vulnerabilities

**Enforces**:
- No hardcoded secrets or API keys
- Input validation on all user data
- SQL injection prevention
- XSS protection
- Authentication best practices
- HTTPS-only in production

**When It Applies**: Always, on every code change

**Example**:
```typescript
// ❌ BLOCKED: Hardcoded API key
const apiKey = "sk-1234567890";

// ✅ ALLOWED: Environment variable
const apiKey = process.env.API_KEY;
```

---

### [`coding-style.md`](coding-style.md)
**Purpose**: Maintain consistent code style

**Enforces**:
- Immutability (prefer `const`)
- File size limits (300 lines max)
- Function length (<50 lines)
- Naming conventions
- Early returns over deep nesting

**When It Applies**: During code writing and refactoring

**Example**:
```typescript
// ❌ WRONG: Deep nesting
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // ...
    }
  }
}

// ✅ CORRECT: Early returns
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission) return;
// ...
```

---

### [`testing.md`](testing.md)
**Purpose**: Ensure adequate test coverage

**Enforces**:
- TDD workflow (test-first when possible)
- 80% minimum coverage
- AAA pattern (Arrange, Act, Assert)
- Test independence
- Meaningful test names

**When It Applies**: When writing tests or new features

**Example**:
```typescript
// ✅ CORRECT: Descriptive, independent test
it('should reject invalid email format', () => {
  // Arrange
  const invalidEmail = 'not-an-email';

  // Act
  const result = validateEmail(invalidEmail);

  // Assert
  expect(result.valid).toBe(false);
  expect(result.error).toBe('Invalid email format');
});
```

---

### [`git-workflow.md`](git-workflow.md)
**Purpose**: Maintain clean git history

**Enforces**:
- Conventional Commits format
- Branch naming conventions
- PR size limits
- Code review requirements

**When It Applies**: During commits and PR creation

**Example**:
```bash
# ✅ CORRECT: Conventional Commit
feat: add user authentication with JWT

# ❌ WRONG: Vague message
fixed stuff
```

---

### [`performance.md`](performance.md)
**Purpose**: Optimize for performance

**Enforces**:
- Correct model selection (Haiku/Sonnet/Opus)
- Context window management (<80k tokens)
- Code performance patterns
- Caching strategies

**When It Applies**: Always, affects Claude's own operation

**Guidelines**:
- **Haiku**: Simple tasks, formatting
- **Sonnet**: Most development work
- **Opus**: Complex architecture, critical decisions

---

### [`agents.md`](agents.md)
**Purpose**: Know when to delegate to specialized agents

**Enforces**:
- When to use which agent
- Agent delegation patterns
- Context management
- Parallel agent usage

**When It Applies**: When tasks could benefit from specialized handling

**Decision Matrix**:
| Task | Agent | Why |
|------|-------|-----|
| Build fails | `build-error-resolver` | Systematic error fixing |
| Security audit | `security-reviewer` | Specialized security knowledge |
| Complex planning | `planner` | Breaks down requirements |

---

### [`hooks.md`](hooks.md)
**Purpose**: Document hook patterns and best practices

**Enforces**:
- Hook performance (<100ms)
- Correct hook types (PreToolUse vs PostToolUse)
- Error handling in hooks
- Debugging patterns

**When It Applies**: When creating or modifying hooks

**Example**:
```json
// ✅ CORRECT: Fast, error-handled hook
{
  "matcher": "tool == \"Write\"",
  "hooks": [{
    "command": "grep -q 'TODO' \"$file_path\" && echo 'TODO found' >&2 || true"
  }]
}
```

---

## How Rules Work

### Auto-Enforcement
Claude automatically loads and follows all rules in this directory at the start of every session. You don't need to mention them.

### Priority
Rules override general Claude behavior but are subordinate to:
1. Explicit user instructions in the current conversation
2. Project-specific CLAUDE.md guidelines

### Hierarchy
```
User's explicit instructions (highest priority)
    ↓
CLAUDE.md (project-specific)
    ↓
.claude/rules/ (general guidelines)
    ↓
Default Claude behavior (lowest priority)
```

---

## When to Add a New Rule

Add a new rule when:
- ✅ Pattern is repeated across multiple sessions
- ✅ Mistake has been made more than twice
- ✅ Applies to most/all code in the project
- ✅ Prevents a category of bugs
- ✅ Enforces a critical standard

**Don't** add a rule for:
- ❌ One-off edge cases
- ❌ Personal preferences without team buy-in
- ❌ Framework-specific details (put in CLAUDE.md)
- ❌ Frequently changing requirements

---

## Creating a New Rule

### Template

```markdown
# [Rule Name]

[One-line description of what this rule prevents or enforces]

---

## 1. Core Principle

**Rule**: [State the rule clearly]

[Explain why this rule exists]

---

## 2. Examples

### Do:
- ✅ [Good example with code]

### Don't:
- ❌ [Bad example with code and why it's wrong]

---

## 3. Exceptions

[If there are legitimate exceptions, document them]

---

## 4. Related Rules

- [Link to related rule files]
```

### Best Practices for Rules

**Be Specific**:
```markdown
❌ Bad: "Write good code"
✅ Good: "Functions must not exceed 50 lines"
```

**Include Examples**:
```markdown
✅ Always show both good and bad examples
```

**Keep Concise**:
```markdown
✅ Max 500 lines per rule file
✅ Focus on one topic per file
```

**Use Clear Formatting**:
```markdown
✅ Use ✅/❌ markers for do/don't
✅ Use code blocks for examples
✅ Use headers for organization
```

---

## Customizing Rules for Your Project

### 1. Review Default Rules
Read through each rule file and determine if it applies to your project.

### 2. Modify as Needed
```bash
# Edit a rule to match your standards
code .claude/rules/coding-style.md
```

### 3. Add Project-Specific Rules
```bash
# Create a new rule for your project
touch .claude/rules/api-design.md
```

### 4. Disable Irrelevant Rules
```bash
# Remove rules that don't apply
rm .claude/rules/hooks.md  # If not using hooks
```

---

## Rule Maintenance

### Monthly Review
- [ ] Review all rules with team
- [ ] Remove outdated rules
- [ ] Add new patterns discovered
- [ ] Update examples to match current codebase

### After Major Changes
- [ ] Update rules when architecture changes
- [ ] Align rules with new frameworks
- [ ] Document new patterns

### Version Control
All rules are committed to git, so the team shares the same standards.

---

## Troubleshooting

### "Claude isn't following a rule"
1. Check if user instruction explicitly overrode it
2. Verify rule is in `.claude/rules/` directory
3. Check rule is valid markdown
4. Try restarting Claude Code session

### "Rule is too strict"
1. Add exceptions section to rule
2. Document when to break the rule
3. Consider moving to CLAUDE.md as guideline instead

### "Rule conflicts with another rule"
1. Merge related rules
2. Clarify priority in each rule
3. Remove redundancy

---

## Examples of Good Rules

**Good Rule** (Specific, Actionable):
```markdown
## File Size Limit

**Rule**: No file should exceed 300 lines of code.

**Why**: Large files are hard to understand and test.

**Action**: If file exceeds 300 lines, split into modules.
```

**Bad Rule** (Vague, Unenforceable):
```markdown
## Code Quality

**Rule**: Code should be clean.

**Why**: Clean code is better.
```

---

## Resources

- [Security Best Practices](security.md)
- [Coding Style Guide](coding-style.md)
- [Testing Standards](testing.md)
- [CLAUDE.md](../../CLAUDE.md) - Project-specific guidelines

---

**Remember**: Rules are guardrails, not handcuffs. They prevent common mistakes while allowing flexibility for legitimate needs.
