# Agent Delegation Rules

Know when to delegate tasks to specialized agents for better results and context management.

---

## 1. When to Use Agents

**Rule**: Delegate complex, specialized, or context-heavy tasks to agents.

### Use Agents For:
- ✅ Security audits (isolated security context)
- ✅ Performance optimization (focused profiling)
- ✅ Test generation (TDD workflow)
- ✅ Documentation updates (sync code → docs)
- ✅ Refactoring large files (separate context)
- ✅ Build error resolution (iterative fixing)
- ✅ E2E test writing (Playwright/Cypress expertise)

### Don't Use Agents For:
- ❌ Simple one-line fixes
- ❌ Formatting code
- ❌ Reading a single file
- ❌ Trivial changes
- ❌ Tasks you can do in main context

---

## 2. Available Agents

### Security Reviewer
**When to use**: Before commits, security-critical changes
**What it does**: OWASP checks, vulnerability scanning, secret detection
**Command**: Use `/security-review` or delegate directly

### Code Simplifier
**When to use**: Over-engineered code, unnecessary abstractions
**What it does**: Removes complexity, inlines single-use functions
**Command**: Delegate with specific file/module

### Verify App
**When to use**: After significant changes, before deployment
**What it does**: End-to-end testing, integration checks
**Command**: Delegate with test scenarios

### Planner
**When to use**: New features, unclear requirements
**What it does**: Creates implementation plans, identifies dependencies
**Command**: Use `/plan` or delegate

### Architect
**When to use**: System design, architectural decisions
**What it does**: Evaluates trade-offs, suggests patterns
**Command**: Delegate with design questions

### TDD Guide
**When to use**: Implementing new features with tests
**What it does**: Guides through Red-Green-Refactor cycle
**Command**: Use `/tdd` or delegate

### Build Error Resolver
**When to use**: Multiple build errors, complex compiler issues
**What it does**: Iteratively fixes build errors
**Command**: Use `/build-fix` or delegate

### Refactor Cleaner
**When to use**: Legacy code, dead code removal
**What it does**: Modernizes code, removes unused code
**Command**: Use `/refactor-clean` or delegate

### Doc Updater
**When to use**: After implementation, before PR
**What it does**: Syncs documentation with code changes
**Command**: Use `/update-docs` or delegate

### E2E Runner
**When to use**: Web applications, user workflows
**What it does**: Generates and runs Playwright/Cypress tests
**Command**: Use `/e2e` or delegate

---

## 3. Agent Delegation Syntax

### Direct Delegation:
```
"Delegate to the security-reviewer agent to audit the authentication module"

"Use the planner agent to create an implementation plan for user notifications"

"Have the refactor-cleaner agent modernize the legacy UserService class"
```

### Via Commands:
```
/security-review
/plan
/tdd
/build-fix
/refactor-clean
/update-docs
/e2e
```

---

## 4. Agent Context Management

**Rule**: Provide agents with focused context, not entire codebase.

### Good Delegation:
```
"Delegate to planner agent:
- Goal: Implement user notifications
- Files: UserService.ts, NotificationService.ts
- Requirements: Email and in-app notifications"
```

### Bad Delegation:
```
"Have an agent look at everything and figure out what to do"
```

### Context Tips:
- Specify which files to focus on
- Provide clear goals
- Include relevant constraints
- Mention related systems

---

## 5. When NOT to Delegate

**Rule**: Don't delegate if you can do it faster in main context.

### Keep in Main Context:
- Reading 1-3 files
- Simple edits
- Running a single command
- Quick refactoring
- Small bug fixes

### Delegate to Agent:
- Reading 10+ files
- Complex analysis
- Multi-step workflows
- Specialized expertise needed
- Context-heavy tasks

---

## 6. Parallel Agent Usage

**Rule**: Run multiple agents in parallel for independent tasks.

### Example Parallel Work:
```
Session 1 (Main): Implementing feature
Session 2 (Security Agent): Security audit
Session 3 (Test Agent): Writing E2E tests
Session 4 (Doc Agent): Updating documentation
```

### Benefits:
- Faster completion
- Independent contexts
- Specialized focus
- Better resource use

---

## 7. Agent Communication

**Rule**: Agents return results to main context. Review and apply.

### Workflow:
1. Delegate task to agent
2. Agent completes work
3. Agent returns findings/code
4. You review in main context
5. You apply or reject changes

### Example:
```
You: "Delegate to security-reviewer to audit authentication"
Agent: Returns list of 5 vulnerabilities with severity levels
You: Review findings, prioritize fixes, implement
```

---

## 8. Agent Limitations

**Rule**: Understand what agents can and cannot do.

### Agents Can:
- ✅ Read files
- ✅ Analyze code
- ✅ Generate code
- ✅ Run read-only commands
- ✅ Create reports

### Agents Cannot:
- ❌ Make commits (you do this)
- ❌ Push to remote (you do this)
- ❌ Approve changes (you do this)
- ❌ Make architectural decisions (they advise)
- ❌ Access main conversation history (usually)

---

## 9. Agent Selection Matrix

| Task | Agent | Reason |
|------|-------|--------|
| Security audit | security-reviewer | Specialized security knowledge |
| Remove complexity | code-simplifier | Focused on simplification |
| Plan feature | planner | Breaks down requirements |
| Design system | architect | Evaluates architecture |
| Write tests | tdd-guide | TDD expertise |
| Fix build | build-error-resolver | Iterative error fixing |
| Clean code | refactor-cleaner | Modernization patterns |
| Update docs | doc-updater | Code-doc sync |
| E2E tests | e2e-runner | Playwright/Cypress |
| Verify changes | verify-app | End-to-end testing |

---

## 10. Agent Performance

**Rule**: Use agents to reduce main context bloat.

### Context Savings:
```
Without Agent:
Main context: 150k tokens
- 50 files read
- Security analysis
- Test generation
- Documentation
Result: Slow, approaching limit

With Agents:
Main context: 60k tokens
Security agent: 40k tokens (separate)
Test agent: 30k tokens (separate)
Doc agent: 20k tokens (separate)
Result: Fast, efficient
```

---

## Agent Delegation Checklist

Before delegating:
- [ ] Task is complex enough to warrant delegation
- [ ] Clear goal and context provided
- [ ] Relevant files identified
- [ ] Appropriate agent selected
- [ ] Can't be done faster in main context

After delegation:
- [ ] Review agent findings
- [ ] Validate recommendations
- [ ] Apply changes selectively
- [ ] Test results
- [ ] Update documentation if needed

---

## Common Patterns

### Pattern 1: Pre-Commit Workflow
```
1. Implement feature (main context)
2. Security audit (security-reviewer agent)
3. Update docs (doc-updater agent)
4. Run tests (main context)
5. Commit (main context)
```

### Pattern 2: New Feature Workflow
```
1. Plan (planner agent)
2. Review plan (main context)
3. Implement (main context with TDD agent)
4. Verify (verify-app agent)
5. Document (doc-updater agent)
```

### Pattern 3: Legacy Code Workflow
```
1. Analyze (main context)
2. Modernize (refactor-cleaner agent)
3. Add tests (tdd-guide agent)
4. Security audit (security-reviewer agent)
5. Document changes (doc-updater agent)
```

---

## Resources

- Agent Architecture: See .claude/agents/ directory
- Commands: See .claude/commands/ directory
- Skills: See .claude/skills/ directory
