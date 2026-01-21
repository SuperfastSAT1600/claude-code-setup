# Claude Code Comprehensive Guide

**Complete reference** for all Claude Code features: agents, commands, rules, skills, workflows, checklists, templates, and scripts.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Agents](#agents) - Specialized AI assistants
3. [Commands](#commands) - User-invoked workflows
4. [Rules](#rules) - Always-enforced guidelines
5. [Skills](#skills) - Reference knowledge
6. [Workflows](#workflows) - Orchestrated sequences
7. [Checklists](#checklists) - Quality verification
8. [Templates](#templates) - Code scaffolding
9. [Scripts](#scripts) - Automation hooks
10. [Decision Trees](#decision-trees)

---

## Quick Start

### First Time Here?

1. **Read INDEX.md** - Get overview of all features
2. **Check CLAUDE.md** - Project-specific context
3. **Browse this guide** - Understand how everything works
4. **Try a command** - Start with `/quick-fix` or `/lint-fix`

### Information Hierarchy

```
INDEX.md          ← Quick reference (what exists)
    ↓
GUIDE.md          ← Deep reference (how it works) [YOU ARE HERE]
    ↓
CLAUDE.md         ← Project specifics (your setup)
    ↓
Individual files  ← Detailed implementations
```

---

## Agents

### What Are Agents?

**Agents** are specialized AI assistants that handle specific types of work. Each agent has:
- **Focused expertise** in one domain
- **Specific tools** it can access
- **Model configuration** (opus/sonnet/haiku)
- **Clear use cases** for when to delegate

### When to Use Agents

Use agents when:
- ✅ Task requires specialized knowledge
- ✅ Need isolated context (don't pollute main conversation)
- ✅ Complex multi-step work
- ✅ Reading >10 files
- ✅ Expertise outside your domain

Don't use agents for:
- ❌ Simple one-line fixes
- ❌ Formatting code
- ❌ Reading 1-2 files
- ❌ Trivial changes

### Agent Categories (28 Total)

#### Core Workflow
- **planner** - New features, unclear requirements, creates implementation plans
- **architect** - System design, architectural decisions, evaluates trade-offs
- **security-reviewer** - Before commits, security-critical changes, OWASP checks
- **code-reviewer** - Comprehensive code review before PRs
- **verify-app** - After significant changes, before deployment, E2E testing

#### Code Quality
- **code-simplifier** - Over-engineered code, unnecessary abstractions
- **refactor-cleaner** - Legacy code, dead code removal, modernization
- **tech-debt-analyzer** - Identify and prioritize technical debt
- **type-safety-enforcer** - Eliminate `any`, strict TypeScript

#### Testing
- **tdd-guide** - Implementing new features with tests, Red-Green-Refactor
- **unit-test-writer** - Generate unit tests with AAA pattern
- **integration-test-writer** - API/database integration tests
- **e2e-runner** - Web applications, user workflows, Playwright/Cypress
- **load-test-specialist** - k6/Artillery load tests

#### Development
- **api-designer** - Design REST/GraphQL APIs, OpenAPI specs
- **database-architect** - Schema design, ERDs, migrations
- **auth-specialist** - JWT, OAuth 2.0, session management
- **graphql-specialist** - GraphQL schemas and resolvers
- **websocket-specialist** - Socket.io real-time features

#### Operations
- **build-error-resolver** - Multiple build errors, complex compiler issues
- **ci-cd-specialist** - GitHub Actions pipelines
- **docker-specialist** - Dockerfiles, multi-stage builds
- **migration-specialist** - Zero-downtime database migrations
- **dependency-manager** - npm audit, updates, license checks

#### Accessibility & i18n
- **accessibility-auditor** - WCAG 2.1 AA compliance
- **i18n-specialist** - Internationalization with next-intl

#### Documentation
- **doc-updater** - After implementation, before PR, syncs docs with code
- **performance-optimizer** - Profile and optimize, fix N+1 queries

### How to Use Agents

**Explicit delegation:**
```
"Delegate to the api-designer agent to design a REST API for user management"

"Use the performance-optimizer agent to identify bottlenecks in the checkout flow"

"Have the security-reviewer agent audit the authentication system"
```

**Via commands:**
```
/security-review   → security-reviewer agent
/refactor-clean    → refactor-cleaner agent
/tdd               → tdd-guide agent
```

### Agent Best Practices

1. **Provide context**: Give agents specific files/modules to focus on
2. **Clear goals**: State what you want the agent to accomplish
3. **Constraints**: Mention requirements, limitations, dependencies
4. **Review output**: Agents advise, you decide what to implement

---

## Commands

### What Are Commands?

**Commands** are user-invoked workflows that orchestrate one or more agents to complete a task. Commands are triggered with `/command-name` syntax.

### Command Categories

#### Workflow Orchestration (Long-running)
- `/full-feature` - Complete feature: plan → implement → test → review → PR
- `/quick-fix` - Fast bug fix: locate → fix → test → commit
- `/spike` - Time-boxed research and exploration (30min-2hr)

#### Quality & Maintenance (Fast)
- `/lint-fix` - ESLint + Prettier + TypeScript (<1min)
- `/type-check` - Strict TypeScript, eliminate `any` (<2min)
- `/audit-deps` - Security + outdated + licenses (<1min)
- `/dead-code` - Remove unused code/exports/deps (5-10min)

#### Development Tools (Medium)
- `/new-component` - Scaffold React component with tests (<1min)
- `/create-migration` - Database migration with rollback (5min)
- `/update-docs` - Sync documentation with code (5-10min)

#### Template Commands (Existing)
- `/build-fix` - Fix build errors systematically
- `/commit-push-pr` - Commit, push, create PR
- `/e2e` - Generate and run E2E tests
- `/plan` - Create implementation plans
- `/refactor-clean` - Remove dead code, modernize
- `/review-changes` - Review uncommitted changes
- `/security-review` - Comprehensive security audit
- `/tdd` - TDD Red-Green-Refactor workflow
- `/test-and-build` - Run tests and build
- `/test-coverage` - Analyze and improve coverage

### How Commands Work

Commands typically:
1. **Parse arguments** from user input
2. **Delegate to agents** for specialized work
3. **Orchestrate steps** in sequence
4. **Report results** back to user

Example flow:
```
User: /full-feature implement password reset

Command execution:
1. planner agent creates implementation plan
2. User reviews and approves
3. Implementation in main context (with TDD)
4. unit-test-writer generates tests
5. code-reviewer reviews code
6. security-reviewer checks for vulnerabilities
7. doc-updater syncs documentation
8. commit-push-pr creates PR
```

---

## Rules

### What Are Rules?

**Rules** are always-enforced guidelines that Claude follows automatically in every session. Rules define:
- ✅ What Claude **must** do
- ❌ What Claude **must not** do
- 📋 Standards to follow consistently

### Active Rules

#### Security Rules (`security.md`)
**Enforces:**
- No hardcoded secrets
- Input validation
- SQL injection prevention
- XSS protection
- HTTPS only in production

**Example:**
```typescript
// ❌ BLOCKED: Hardcoded API key
const apiKey = "sk-1234567890";

// ✅ ALLOWED: Environment variable
const apiKey = process.env.API_KEY;
```

#### Coding Style (`coding-style.md`)
**Enforces:**
- Immutability (prefer `const`)
- File size limits (300 lines)
- Function length (<50 lines)
- Naming conventions
- Early returns

#### Testing (`testing.md`)
**Enforces:**
- TDD workflow
- 80% minimum coverage
- AAA pattern
- Test independence
- Meaningful names

#### Git Workflow (`git-workflow.md`)
**Enforces:**
- Conventional Commits format
- Branch naming
- PR size limits
- Code review requirements

#### Performance (`performance.md`)
**Enforces:**
- Model selection (haiku/sonnet/opus)
- Context management (<80k tokens)
- Code performance patterns
- Caching strategies

#### API Design (`api-design.md`)
**Enforces:**
- REST standards
- Consistent response formats
- HTTP methods
- Status codes

#### Error Handling (`error-handling.md`)
**Enforces:**
- Error class hierarchy
- Layer responsibilities
- Async error handling

#### Code Review (`code-review.md`)
**Enforces:**
- Review criteria (blocker/major/minor)
- Feedback format
- Timeline expectations

#### Documentation (`documentation.md`)
**Enforces:**
- When to document
- JSDoc standards
- README structure

### How Rules Work

**Auto-enforcement**: Rules are loaded at session start and applied automatically.

**Priority hierarchy:**
```
User's explicit instructions (highest)
    ↓
CLAUDE.md (project-specific)
    ↓
.claude/rules/ (general guidelines)
    ↓
Default Claude behavior (lowest)
```

---

## Skills

### What Are Skills?

**Skills** are reusable knowledge that agents and commands reference when needed. Skills contain:
- 📚 Best practices and patterns
- 🔧 How-to guides
- 📋 Reference material with code examples

**Difference from rules:**
- **Rules** = Always enforced ("you must")
- **Skills** = Referenced when needed ("here's how")

### Available Skills (14 Total)

#### Framework-Specific
- **react-patterns** - Hooks, memoization, compound components, error boundaries
- **nextjs-patterns** - App Router, Server Components, Server Actions, middleware
- **nodejs-patterns** - Express, error handling, validation, logging
- **prisma-patterns** - Schema design, queries, transactions, migrations
- **github-actions** - Workflows, matrix builds, caching, deployment

#### API & Real-time
- **rest-api-design** - Resource naming, HTTP methods, pagination, versioning
- **graphql-patterns** - Schema design, resolvers, DataLoader, subscriptions
- **websocket-patterns** - Socket.io, rooms, reconnection, scaling

#### Meta Skills
- **coding-standards** - SOLID, DRY, KISS, language-specific best practices
- **backend-patterns** - Repository pattern, caching, auth, error handling
- **frontend-patterns** - React patterns, state management, performance
- **tdd-workflow** - Red-Green-Refactor cycle, test patterns, TDD methodology
- **project-guidelines** - Template for project-specific customization
- **user-intent-patterns** - Natural language intent detection and routing

### How Skills Work

**On-demand reference**: Skills are loaded when relevant to the task.

**Not always active**: Unlike rules (always enforced), skills are referenced when useful.

**Composable**: Agents can combine multiple skills.

Example:
```
planner agent planning API feature:
→ References backend-patterns.md (API design)
→ References coding-standards.md (SOLID principles)
→ References tdd-workflow.md (test strategy)
```

### When to Create a New Skill

Create when you have:
- ✅ Reusable knowledge for multiple features
- ✅ Best practices to follow consistently
- ✅ Complex patterns needing detailed explanation
- ✅ Domain-specific knowledge (e.g., payment processing)

Don't create for:
- ❌ One-time implementation details
- ❌ Project config (use CLAUDE.md)
- ❌ Enforcement rules (use rules/)
- ❌ Simple facts (use project docs)

---

## Workflows

### What Are Workflows?

**Workflows** are orchestrated sequences of agent invocations that automate common development patterns. Each workflow defines:
- **Steps** - Ordered sequence of operations
- **Agents** - Which agents to use at each step
- **Gates** - Checkpoints for user approval
- **Outputs** - Expected deliverables

### Available Workflows

#### 1. Full Feature Development (`full-feature.md`)
**8 steps**: Plan → Branch → Implement → Test → Review → Document → PR → Merge

**When to use**: New feature development

**Agents involved**:
- planner (planning)
- unit-test-writer (tests)
- integration-test-writer (integration tests)
- code-reviewer (review)
- security-reviewer (security check)
- doc-updater (documentation)

**Duration**: Hours (varies by feature size)

#### 2. Bug Fix (`bug-fix.md`)
**5 steps**: Reproduce → Locate → Fix → Test → Document

**When to use**: Bug resolution

**Agents involved**:
- code-reviewer (code analysis)
- unit-test-writer (regression test)

**Duration**: Minutes to hours

#### 3. Refactor (`refactor.md`)
**7 steps**: Analyze → Plan → Write Tests → Refactor → Verify → Document → Review

**When to use**: Code improvement, technical debt reduction

**Agents involved**:
- tech-debt-analyzer (identify issues)
- code-reviewer (review changes)
- unit-test-writer (ensure coverage)

**Duration**: Hours

#### 4. Release Preparation (`release.md`)
**10 steps**: Verify → Version → Changelog → Tag → Build → Test → Deploy → Monitor → Announce → Retrospective

**When to use**: Production deployment

**Agents involved**:
- security-reviewer (final audit)
- dependency-manager (check deps)
- doc-updater (release notes)

**Duration**: Hours to days

#### 5. Security Audit (`security-audit.md`)
**8 steps**: Scan → Review → Prioritize → Fix → Verify → Document → Report → Monitor

**When to use**: Security assessment, before major releases

**Agents involved**:
- security-reviewer (comprehensive audit)

**Duration**: Hours

### How to Use Workflows

**Command-based:**
```
/full-feature implement user authentication
/refactor UserService module
```

**Manual invocation:**
Follow steps in workflow file, invoking agents as directed.

---

## Checklists

### What Are Checklists?

**Checklists** ensure consistent quality by providing step-by-step verification criteria. They help prevent common mistakes.

### Available Checklists

#### 1. PR Review (`pr-review.md`)
**25 items** covering:
- Code quality
- Test coverage
- Security concerns
- Documentation
- Performance
- Breaking changes

**When to use**: Before approving any PR

#### 2. Security Audit (`security-audit.md`)
**40+ items** covering:
- OWASP Top 10
- Authentication/authorization
- Input validation
- Secret management
- Dependencies
- Infrastructure

**When to use**: Before release, after major changes

#### 3. Performance Audit (`performance-audit.md`)
**35 items** covering:
- Frontend (bundle size, rendering, lazy loading)
- Backend (database queries, caching, API performance)
- Database (indexes, query optimization)

**When to use**: Optimization tasks, before release

#### 4. Accessibility Audit (`accessibility-audit.md`)
**30 items** covering:
- Keyboard navigation
- Screen readers
- ARIA attributes
- Color contrast
- Focus management

**When to use**: UI changes, before release

#### 5. Pre-Release (`pre-release.md`)
**45 items** covering:
- All tests pass
- Security audit complete
- Documentation updated
- Breaking changes documented
- Performance benchmarks
- Rollback plan ready

**When to use**: Before every release

#### 6. Onboarding (`onboarding.md`)
**50+ items** covering:
- Environment setup
- Tool installation
- Access provisioning
- Codebase orientation
- Team practices

**When to use**: New team member joining

### How to Use Checklists

1. Copy relevant checklist
2. Work through each item
3. Mark complete: `- [x]`
4. Document exceptions
5. Archive with PR/release

---

## Templates

### What Are Templates?

**Templates** are boilerplate files with placeholders for quickly scaffolding new code while maintaining standards.

### Available Templates

#### 1. React Component (`component.tsx.template`)
**Placeholders**: `{{NAME}}`, `{{PROPS}}`, `{{DESCRIPTION}}`

**Creates**: Functional component with TypeScript, props interface, proper exports

**Usage**: `/new-component UserProfile`

#### 2. API Route (`api-route.ts.template`)
**Placeholders**: `{{RESOURCE}}`, `{{RESOURCE_SINGULAR}}`, `{{SCHEMA_DEFINITION}}`

**Creates**: Full CRUD Next.js API route with validation, error handling, authentication

**Usage**: Ask Claude to create API route using template

#### 3. Test File (`test.spec.ts.template`)
**Placeholders**: `{{FILE_PATH}}`, `{{FUNCTION_NAME}}`, `{{DESCRIPTION}}`

**Creates**: Vitest test file with AAA pattern, common assertions, describe blocks

**Usage**: Ask Claude to create test file using template

#### 4. Database Migration (`migration.sql.template`)
**Placeholders**: `{{MIGRATION_NAME}}`, `{{DESCRIPTION}}`, `{{UP_SQL}}`, `{{DOWN_SQL}}`

**Creates**: Migration with forward changes, rollback, validation queries

**Usage**: `/create-migration "add user preferences table"`

#### 5. PR Description (`pr-description.md.template`)
**Placeholders**: `{{SUMMARY}}`, `{{CHANGES}}`, `{{SCREENSHOTS}}`, `{{BREAKING_CHANGES}}`

**Creates**: Comprehensive PR description with checklist

**Usage**: Automatically used by `/commit-push-pr`

### Placeholder Syntax

```
{{PLACEHOLDER_NAME}}
```

Common placeholders:
- `{{COMPONENT_NAME}}` - PascalCase (UserProfile)
- `{{COMPONENT_NAME_LOWER}}` - camelCase (userProfile)
- `{{ROUTE_NAME}}` - API route (users)
- `{{TABLE_NAME}}` - Database table (user_sessions)
- `{{DATE}}` - Current date (2026-01-21)

### Using Templates

**Manual:**
1. Copy template file
2. Rename to target filename
3. Replace all `{{PLACEHOLDER}}` values
4. Remove template comments

**With Claude:**
```
"Create a new React component called UserProfile using the component template"

"Create an API route for /api/orders using the api-route template"
```

---

## Scripts

### What Are Scripts?

**Scripts** are automation for hooks, CI/CD, and development workflows. They:
- Automate quality checks
- Integrate with Claude Code hooks
- Standardize workflows
- Enforce project standards

### Available Scripts

#### 1. Pre-Commit Checks (`pre-commit-checks.sh`)
**Runs**: Before every `git commit`

**Checks**:
- console.log detection
- Debugger statements
- Merge conflicts
- Large files (>5MB)
- File naming conventions
- Secret detection

**Exit codes**:
- `0` - Pass
- `1` - Warn
- `2` - Block commit

#### 2. Require Tests Pass (`require-tests-pass.sh`)
**Runs**: Before PR creation

**Does**: Detects test framework, runs tests, blocks PR if tests fail

**Supports**: npm test, vitest, jest, playwright, pytest, go test, cargo test

#### 3. Log Security Review (`log-security-review.sh`)
**Runs**: After security-reviewer agent completes

**Does**: Creates audit trail in `.claude/logs/security-reviews.log`

#### 4. Auto-Format (`auto-format.sh`)
**Runs**: After Edit/Write tool usage

**Formats**: JS/TS (Prettier), JSON, CSS, Python (Black), Go (gofmt), Rust (rustfmt), SQL, Markdown, YAML

#### 5. Sync Dependencies (`sync-deps.sh`)
**Runs**: Manual or scheduled

**Does**: Synchronize package versions, verify lockfile, audit vulnerabilities

**Options**: `--check`, `--update`, `--audit`

### How Scripts Work

**With hooks** (automatic):
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "tool == \"Bash\" && tool_input.command matches \"git commit\"",
      "hooks": [{ "command": "./.claude/scripts/pre-commit-checks.sh" }]
    }]
  }
}
```

**Manual execution**:
```bash
./.claude/scripts/pre-commit-checks.sh
./.claude/scripts/auto-format.sh
```

### Script Requirements

**Permissions**: Must be executable (`chmod +x`)

**Exit codes**:
- `0` - Success
- `1` - Failure (warn)
- `2` - Block (for PreToolUse)

**Performance**: Complete in <100ms for hooks

---

## Decision Trees

### "I need to implement a feature"

```
Start: /full-feature
  ↓
1. Planning → planner agent creates plan
2. API design? → api-designer agent
3. Database changes? → database-architect agent
4. Authentication? → auth-specialist agent
5. Tests → unit-test-writer + integration-test-writer
6. Review → code-reviewer agent
7. Security → security-reviewer agent
8. Docs → doc-updater agent
9. PR → commit-push-pr
```

### "I found a bug"

```
Start: /quick-fix
  ↓
1. Reproduce bug
2. Locate issue
3. Fix code
4. Add regression test (unit-test-writer)
5. Commit and push
```

### "Performance is slow"

```
Start: performance-optimizer agent
  ↓
1. Profile (Lighthouse/DevTools)
2. Identify bottlenecks
   - N+1 queries?
   - Large bundles?
   - Excessive re-renders?
3. Implement optimizations
4. Verify with metrics
```

### "Code quality issues"

```
Maintenance commands:
  /lint-fix      → ESLint + Prettier + TypeScript
  /type-check    → Eliminate `any` types
  /dead-code     → Remove unused code
  /audit-deps    → Security audit
  /refactor-clean → Remove tech debt
```

### "Need to scaffold new code"

```
Determine type:
  React component? → /new-component UserProfile
  API route? → Use api-route.ts.template
  Test file? → Use test.spec.ts.template
  Database change? → /create-migration "description"
```

### "Setting up CI/CD"

```
Use: ci-cd-specialist agent
  ↓
Creates GitHub Actions with:
- Matrix builds (multiple Node versions)
- Caching (node_modules, build artifacts)
- Test + build + deploy pipeline
- Automatic rollback on failure
```

---

## Best Practices

### Agent Usage
- ✅ Provide specific context and goals
- ✅ Use for complex, specialized work
- ✅ Review agent output before applying
- ❌ Don't delegate trivial tasks
- ❌ Don't use for simple file reads

### Command Usage
- ✅ Use workflows for multi-step tasks
- ✅ Let commands orchestrate agents
- ✅ Customize command parameters
- ❌ Don't skip approval gates
- ❌ Don't use for one-off operations

### Rule Compliance
- ✅ Rules are auto-enforced
- ✅ Update rules when patterns change
- ✅ Document exceptions in rules
- ❌ Don't fight rules without discussion
- ❌ Don't add rules for one-time cases

### Skill Development
- ✅ Reference when learning patterns
- ✅ Keep skills updated
- ✅ Add project-specific examples
- ❌ Don't duplicate CLAUDE.md content
- ❌ Don't use for enforcement (use rules)

---

## Troubleshooting

### "Agent isn't doing what I expected"
- Check agent's `when_to_use` in INDEX.md
- Provide more specific context/goals
- Try different phrasing
- Verify agent has access to needed tools

### "Command failed"
- Check prerequisites in command file
- Verify all dependencies installed
- Look for error messages in output
- Try manual agent invocation instead

### "Hook blocking my operation"
- Check `.claude/scripts/` output
- Fix the issue hook detected
- Or use `--no-verify` to bypass (not recommended)

### "Can't find right feature to use"
- Start with INDEX.md quick lookup
- Search this GUIDE.md for keywords
- Check decision trees above
- Ask: "How do I [task] with Claude Code?"

---

## Quick Reference

### By Use Case

| Use Case | Start Here |
|----------|------------|
| New feature | `/full-feature` |
| Bug fix | `/quick-fix` |
| Code quality | `/lint-fix`, `/type-check`, `/dead-code` |
| Performance | performance-optimizer agent |
| Security | `/security-review` |
| Tests | unit-test-writer, integration-test-writer agents |
| Documentation | doc-updater agent, `/update-docs` |
| API design | api-designer agent, rest-api-design skill |
| Database | database-architect agent, `/create-migration` |
| DevOps | ci-cd-specialist, docker-specialist agents |
| Accessibility | accessibility-auditor agent |
| Internationalization | i18n-specialist agent |

---

**Last Updated**: 2026-01-21
**See Also**: INDEX.md, CLAUDE.md, individual feature files
