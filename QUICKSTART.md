# Boris Cherny Workflow - Quick Start Guide

You've successfully set up the comprehensive Boris Cherny workflow for Claude Code! Here's how to get started immediately.

## ✅ What's Already Configured

Your workspace now includes:

1. **`.claude/settings.json`** - Permissions, hooks, and model configuration (49 pre-approved operations)
2. **`CLAUDE.md`** - Team knowledge base with Quick Reference section
3. **`.claude/INDEX.md`** - Quick reference for all features (300 lines) - **[Start here for feature discovery](.claude/INDEX.md)**
4. **`.claude/GUIDE.md`** - Comprehensive how-to guide (950 lines) - **[Deep dive into all features](.claude/GUIDE.md)**
5. **`.claude/commands/`** - 15 powerful slash commands
6. **`.claude/agents/`** - 18 specialized workflow automation agents
7. **`.claude/rules/`** - 9 always-active quality guardrails
8. **`.claude/skills/`** - 8 reusable knowledge files (React, Next.js, Node.js, API design, GraphQL, WebSocket patterns)
9. **`.claude/workflows/`** - 5 orchestrated agent sequences (full-feature, bug-fix, refactor, release, security-audit)
10. **`.claude/checklists/`** - 6 review checklists (PR review, security, performance, accessibility, pre-release, onboarding)
11. **`.claude/templates/`** - 5 code templates (component, API route, test, migration, PR description)
12. **`.claude/scripts/`** - 5 automation scripts (pre-commit checks, test gating, security logging, auto-format, sync-deps)
13. **`.mcp.json`** - MCP server configuration (27 servers, most disabled by default)
14. **`WORKFLOW.md`** - Comprehensive workflow guide (1500+ lines) - **[Complete guidance](WORKFLOW.md)**
15. **Environment Configs** - Dev, prod, and default configurations
16. **Advanced Hooks** - PreToolUse blocking + PostToolUse auto-formatting

## 🚀 Getting Started in 5 Minutes

### Step 1: Initialize Git (if not already)

```bash
git init
git add .
git commit -m "Initial commit with Boris Cherny workflow setup"
```

### Step 2: Customize CLAUDE.md

Open [CLAUDE.md](CLAUDE.md) and add:
- Your tech stack
- Your coding standards
- Common mistakes to avoid
- Project-specific rules

**Example**:
```markdown
## Tech Stack
- React 18 with TypeScript
- Node.js with Express
- PostgreSQL database
- Tailwind CSS for styling

## Coding Standards
- Use functional components, not class components
- Always add TypeScript types, never use `any`
- Use `const` by default, `let` only when necessary
```

### Step 3: Try Your First Slash Command

In this chat, type:
```
/commit-push-pr
```

This will:
1. Check git status
2. Create a commit with proper formatting
3. Push to remote
4. Create a pull request

### Step 4: Try Plan Mode

Press `Shift+Tab` twice to enter Plan Mode, then say:
```
Create a simple "Hello World" example file
```

Claude will:
1. Create a detailed plan
2. Let you review and refine it
3. Execute it perfectly when approved

### Step 5: Install Additional Tools (Optional)

For the full experience, install these tools:

**Prettier (for code formatting)**:
```bash
npm install --save-dev prettier
# or
yarn add -D prettier
```

**ESLint (for linting)**:
```bash
npm install --save-dev eslint
# or
yarn add -D eslint
```

**GitHub CLI (for PR creation)**:
```bash
# Windows (with Chocolatey)
choco install gh

# Or download from https://cli.github.com/
```

Then authenticate:
```bash
gh auth login
```

## 📋 Common Workflows

### Workflow 1: Adding a New Feature (Standard)

```
1. /plan [feature]            # Or use Plan mode (Shift+Tab twice)
2. Review and refine the plan
3. Implement OR use /tdd [feature] for test-first
4. /e2e [critical workflows]  # Generate E2E tests
5. Run: code-simplifier agent
6. Run: verify-app agent
7. /security-review           # Security audit
8. /review-changes
9. /test-and-build
10. /commit-push-pr
```

### Workflow 2: Fixing a Bug

```
1. Describe the bug and provide reproduction steps
2. Let Claude investigate and propose a fix
3. Review the fix in Plan mode if complex
4. Implement the fix
5. /test-and-build
6. /commit-push-pr
```

### Workflow 3: Legacy Code Refactoring

```
1. /plan refactor [module]
2. /test-coverage [module]     # Ensure tests exist
3. Use refactor-cleaner agent
4. Run: code-simplifier agent
5. /test-and-build
6. /review-changes
7. /commit-push-pr
```

### Workflow 4: Build Error Recovery

```
1. /build-fix                  # Auto-fix build errors
2. Handle manual intervention items if any
3. /test-and-build             # Verify fixes
4. /commit-push-pr
```

### Workflow 5: Production Release

```
1. /test-coverage              # Ensure adequate tests
2. /e2e [critical workflows]   # E2E tests for critical paths
3. /security-review            # Security audit
4. /review-changes             # Code review
5. /test-and-build             # Final verification
6. /commit-push-pr             # Create release PR
```

## 🔧 Available Slash Commands (15)

### Full Workflow Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/full-feature` | Complete feature cycle (plan → test → PR) | New feature development end-to-end |
| `/commit-push-pr` | Commit, push, create PR | After completing a feature |
| `/test-and-build` | Run tests and build | Before creating a PR |
| `/review-changes` | Comprehensive code review | Before creating a PR |

### Development Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/tdd [feature]` | Test-Driven Development | Writing new features test-first |
| `/plan [feature]` | Implementation planning | Before implementing complex features |
| `/e2e [workflow]` | E2E test generation | Testing critical user workflows |
| `/spike [question]` | Time-boxed technical research | Exploring technologies/approaches |
| `/new-component [name]` | Scaffold component + tests + stories | Creating new React components |

### Code Quality Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/build-fix` | Fix build errors | When build fails |
| `/refactor-clean [path]` | Remove dead code | Modernizing legacy code |
| `/test-coverage [path]` | Analyze coverage | Ensuring adequate tests |
| `/security-review [path]` | Security audit | Before commits/releases |
| `/lint-fix` | Run ESLint + Prettier + TypeScript | Fixing all linting/formatting issues |
| `/type-check` | Strict TypeScript checking | Eliminating `any` types |
| `/dead-code` | Find unused code/exports/deps | Code cleanup |
| `/audit-deps` | Dependency security audit | Before releases |
| `/update-docs` | Sync documentation with code | After implementation |
| `/create-migration [description]` | Generate database migration | Schema changes |

## 🤖 Available Agents (18)

### Code Development Agents
| Agent | Purpose | Model | When to Use |
|-------|---------|-------|-------------|
| `api-designer` | Design REST/GraphQL APIs | opus | Creating new APIs, OpenAPI specs |
| `code-reviewer` | Comprehensive code review | opus | Before PRs, learning best practices |
| `database-architect` | Schema design & optimization | opus | Database design, migrations |
| `auth-specialist` | Authentication flows | opus | OAuth, JWT, MFA implementation |

### Testing & Quality Agents
| Agent | Purpose | Model | When to Use |
|-------|---------|-------|-------------|
| `unit-test-writer` | Generate unit tests (AAA pattern) | sonnet | Creating test coverage |
| `integration-test-writer` | API/service integration tests | sonnet | Testing component interactions |
| `e2e-runner` | E2E test generation | sonnet | Testing user workflows |
| `tdd-guide` | TDD coaching (Red-Green-Refactor) | sonnet | Test-first development |
| `verify-app` | End-to-end verification | sonnet | Smoke testing after changes |

### Code Quality & Refactoring Agents
| Agent | Purpose | Model | When to Use |
|-------|---------|-------|-------------|
| `code-simplifier` | Remove over-engineering | sonnet | Simplifying complex code |
| `refactor-cleaner` | Modernize legacy code | sonnet | Dead code removal |
| `type-safety-enforcer` | Eliminate `any` types | haiku | Strict TypeScript enforcement |
| `performance-optimizer` | Profile and optimize | sonnet | Bottleneck identification |

### Specialized Domain Agents
| Agent | Purpose | Model | When to Use |
|-------|---------|-------|-------------|
| `graphql-specialist` | GraphQL development | sonnet | Schema design, DataLoader, N+1 |
| `websocket-specialist` | Real-time communication | sonnet | Chat, collaborative editing |
| `i18n-specialist` | Internationalization | sonnet | next-intl setup, RTL support |
| `accessibility-auditor` | WCAG 2.1 AA compliance | sonnet | Accessibility audits |
| `load-test-specialist` | Performance testing | sonnet | k6/Artillery load tests |

### Infrastructure & DevOps Agents
| Agent | Purpose | Model | When to Use |
|-------|---------|-------|-------------|
| `ci-cd-specialist` | GitHub Actions pipelines | sonnet | CI/CD configuration |
| `docker-specialist` | Containerization | sonnet | Dockerfile optimization |
| `dependency-manager` | Package management | haiku | npm audit, updates |
| `migration-specialist` | Database migrations | sonnet | Zero-downtime migrations |

### Planning & Support Agents
| Agent | Purpose | Model | When to Use |
|-------|---------|-------|-------------|
| `planner` | Implementation planning | opus | Feature planning |
| `architect` | Technical decisions | opus | Architectural choices |
| `build-error-resolver` | Fix build errors | sonnet | Systematic error fixing |
| `doc-updater` | Sync documentation | sonnet | Code-doc synchronization |
| `security-reviewer` | Security audit | opus | OWASP Top 10 checks |
| `tech-debt-analyzer` | Technical debt analysis | sonnet | Debt prioritization |

## 📋 Rules (Always Active)

These are automatically enforced on every interaction:

| Rule | Purpose | Example |
|------|---------|---------|
| `security.md` | Prevent vulnerabilities | No hardcoded secrets, input validation |
| `coding-style.md` | Consistent style | Max 300 lines per file, prefer const |
| `testing.md` | Test standards | 80% minimum coverage, AAA pattern |
| `git-workflow.md` | Clean git history | Conventional Commits, PR size limits |
| `performance.md` | Optimization | Model selection, context management |
| `agents.md` | When to delegate | Which agent for which task |
| `hooks.md` | Hook patterns | Performance guidelines, examples |
| `patterns.md` | Common patterns | API responses, error handling |
| `context-management.md` | Context limits | <10 MCPs enabled, <80k tokens |
| `project-guidelines.md` | Template for projects | Customize for your tech stack |

## 📚 Skills (Referenced as Needed) - 8 Files

These provide best practices when relevant:

| Skill | Purpose | Used By |
|-------|---------|---------|
| `coding-standards.md` | Language best practices | All agents, refactoring |
| `backend-patterns.md` | API/database patterns | planner, architect agents |
| `frontend-patterns.md` | React/UI patterns | planner, refactoring |
| `tdd-workflow.md` | TDD methodology | tdd-guide agent, /tdd command |
| `project-guidelines.md` | Project-specific template | Onboarding, documentation |
| `react-patterns.md` | React hooks, state, performance | Frontend development |
| `nextjs-patterns.md` | App Router, Server Components | Next.js projects |
| `nodejs-patterns.md` | Event loop, streams, clustering | Backend development |
| `prisma-patterns.md` | Prisma ORM best practices | Database access |
| `github-actions.md` | CI/CD workflows | ci-cd-specialist agent |
| `rest-api-design.md` | REST API standards | api-designer agent |
| `graphql-patterns.md` | GraphQL schema, resolvers | graphql-specialist agent |
| `websocket-patterns.md` | Socket.io real-time patterns | websocket-specialist agent |

## 🎯 Best Practices

### 1. Always Use Plan Mode for Non-Trivial Tasks
```
[Shift+Tab twice] Let's plan the implementation of [feature]
```

### 2. Provide Verification Feedback Loops
```
After implementing, start the dev server and verify it works.
Keep iterating until everything works perfectly.
```

### 3. Update CLAUDE.md When Claude Makes Mistakes
```
Add this mistake to CLAUDE.md so you don't repeat it:
[describe what went wrong]
```

### 4. Run Verification Before PRs
```
Before creating the PR:
1. /review-changes
2. /test-and-build
3. Run verify-app agent
4. Then /commit-push-pr
```

### 5. Simplify After Implementing
```
After implementing, run code-simplifier agent to remove any over-engineering
```

## 🔥 Power User Tips

### Parallel Sessions

Run multiple Claude sessions simultaneously:
- Open multiple VSCode windows on different branches
- Use [claude.ai/code](https://claude.ai/code) for additional sessions
- Use Windows Terminal with multiple tabs

### Background Agents

For long-running tasks:
```
Run this as a background agent:
[long task description]
```

### Auto-Accept Mode

After approving a plan:
```
Enable auto-accept edits and proceed with the implementation
```

### Chain Commands

Combine workflows:
```
After implementing:
1. Run code-simplifier
2. Run verify-app
3. /test-and-build
4. /commit-push-pr
```

## 📚 Next Steps

### Essential Reading (Start Here!)

1. **[.claude/INDEX.md](.claude/INDEX.md)** - **Quick reference (300 lines)** - Start here for feature discovery:
   - All 18 agents, 15 commands, 5 workflows, 6 checklists at a glance
   - Decision trees: "I need to..." → appropriate feature
   - Quick lookup by use case
   - 2-minute scan to find what you need

2. **[.claude/GUIDE.md](.claude/GUIDE.md)** - **Comprehensive how-to guide (950 lines)**:
   - Consolidated all README files into one place
   - What each feature is, when to use it, how it works
   - Examples and best practices for all feature types
   - Reduces 11 documentation files to 1 comprehensive guide

3. **[WORKFLOW.md](WORKFLOW.md)** - **Complete comprehensive workflow guide (1500+ lines)** with:
   - Decision trees for "I need to..." scenarios
   - Command/agent selection matrices
   - Real-world authentication implementation walkthrough
   - MCP server integration guide
   - Agent orchestration patterns
   - Performance optimization strategies
   - Progressive adoption roadmap (Week 1 → Month 1 → Ongoing)
   - Team collaboration workflows

### Customization

4. **Customize [CLAUDE.md](CLAUDE.md)** - Add your project specifics (tech stack, conventions)
5. **Create custom slash commands** - Add to `.claude/commands/`
6. **Create custom agents** - Add to `.claude/agents/`
7. **Set up MCP servers** - Configure in `.mcp.json` (see WORKFLOW.md Section 5)
8. **Add project checklists** - Customize `.claude/checklists/` for your workflow
9. **Add code templates** - Create reusable templates in `.claude/templates/`

## 🆘 Troubleshooting

### Claude can't run bash commands
- Make sure you opened VSCode from Git Bash: `code .`
- Check environment variables are set (SHELL, CLAUDE_CODE_GIT_BASH_PATH)
- Restart VSCode completely

### Slash commands don't work
- Commands are in `.claude/commands/`
- Use format: `/command-name`
- Check file has `.md` extension

### Prettier/ESLint not running
- Install tools: `npm install -D prettier eslint`
- Hooks are in `.claude/settings.json`
- They run automatically after Edit/Write operations

### Can't create PRs
- Install GitHub CLI: `gh auth login`
- Make sure you're in a git repository
- Verify remote is set: `git remote -v`

## 💡 Example Session

Here's a complete example of using the workflow:

```
You: [Shift+Tab twice] Let's add a user profile page

Claude: [Creates detailed plan]
- Create ProfilePage component
- Add route to router
- Create user profile API endpoint
- Add profile form with validation
- Add tests

You: Looks good, proceed with auto-accept mode

Claude: [Implements everything]

You: Run code-simplifier agent

Claude: [Simplifies the code]

You: Run verify-app agent

Claude: [Tests the application]

You: /test-and-build

Claude: [Runs tests and build, fixes any errors]

You: /commit-push-pr

Claude: [Creates commit, pushes, creates PR]

Done! 🎉
```

## 🌟 Key Takeaway

The Boris Cherny workflow is all about:
1. **Planning first** (Plan Mode)
2. **Verifying continuously** (feedback loops)
3. **Compounding knowledge** (CLAUDE.md)
4. **Automating repetition** (slash commands & agents)

Start simple, then build up your custom workflows over time. Every addition to CLAUDE.md, every slash command, and every agent makes future work faster.

---

**Ready to start?** Try entering Plan Mode and ask Claude to help you build your first feature!
