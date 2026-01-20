# Boris Cherny Workflow - Quick Start Guide

You've successfully set up the comprehensive Boris Cherny workflow for Claude Code! Here's how to get started immediately.

## ✅ What's Already Configured

Your workspace now includes:

1. **`.claude/settings.json`** - Permissions, hooks, and model configuration (49 pre-approved operations)
2. **`CLAUDE.md`** - Team knowledge base with concrete examples
3. **`.claude/commands/`** - 10 powerful slash commands
4. **`.claude/agents/`** - 10 specialized workflow automation agents
5. **`.claude/rules/`** - 10 always-active quality guardrails
6. **`.claude/skills/`** - 6 reusable knowledge files
7. **`.mcp.json`** - MCP server configuration (18 servers, 17 disabled by default)
8. **`WORKFLOW.md`** - Comprehensive workflow guide (1500+ lines) - **[Read this for complete guidance](WORKFLOW.md)**
9. **Environment Configs** - Dev, prod, and default configurations
10. **Advanced Hooks** - PreToolUse warnings + PostToolUse auto-formatting

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

## 🔧 Available Slash Commands

### Workflow Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/commit-push-pr` | Commit, push, create PR | After completing a feature |
| `/test-and-build` | Run tests and build | Before creating a PR |
| `/review-changes` | Comprehensive code review | Before creating a PR |

### Development Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/tdd [feature]` | Test-Driven Development | Writing new features test-first |
| `/plan [feature]` | Implementation planning | Before implementing complex features |
| `/e2e [workflow]` | E2E test generation | Testing critical user workflows |

### Code Quality Commands
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/build-fix` | Fix build errors | When build fails |
| `/refactor-clean [path]` | Remove dead code | Modernizing legacy code |
| `/test-coverage [path]` | Analyze coverage | Ensuring adequate tests |
| `/security-review [path]` | Security audit | Before commits/releases |

## 🤖 Available Agents

### Code Quality Agents
| Agent | Purpose | Usage |
|-------|---------|-------|
| `code-simplifier` | Remove over-engineering | "Run code-simplifier agent" |
| `refactor-cleaner` | Modernize legacy code | "Refactor with refactor-cleaner agent" |

### Testing & Verification Agents
| Agent | Purpose | Usage |
|-------|---------|-------|
| `verify-app` | End-to-end testing | "Run verify-app agent" |
| `e2e-runner` | E2E test generation | "Generate E2E tests with e2e-runner" |
| `tdd-guide` | TDD coaching | "Guide me through TDD workflow" |

### Planning & Architecture Agents
| Agent | Purpose | Usage |
|-------|---------|-------|
| `planner` | Implementation planning | "Create plan with planner agent" |
| `architect` | Technical decisions | "Evaluate options with architect agent" |

### Error Resolution & Documentation Agents
| Agent | Purpose | Usage |
|-------|---------|-------|
| `build-error-resolver` | Fix build errors | "Fix build with build-error-resolver" |
| `doc-updater` | Sync documentation | "Update docs with doc-updater agent" |
| `security-reviewer` | Security audit | "Security audit with security-reviewer" |

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

## 📚 Skills (Referenced as Needed)

These provide best practices when relevant:

| Skill | Purpose | Used By |
|-------|---------|---------|
| `coding-standards.md` | Language best practices | All agents, refactoring |
| `backend-patterns.md` | API/database patterns | planner, architect agents |
| `frontend-patterns.md` | React/UI patterns | planner, refactoring |
| `tdd-workflow.md` | TDD methodology | tdd-guide agent, /tdd command |
| `project-guidelines.md` | Project-specific template | Onboarding, documentation |

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

1. **Read [WORKFLOW.md](WORKFLOW.md)** - **Complete comprehensive workflow guide (1500+ lines)** with:
   - Decision trees for "I need to..." scenarios
   - Command/agent selection matrices
   - Real-world authentication implementation walkthrough
   - MCP server integration guide
   - Agent orchestration patterns
   - Performance optimization strategies
   - Progressive adoption roadmap (Week 1 → Month 1 → Ongoing)
   - Team collaboration workflows
2. **Customize [CLAUDE.md](CLAUDE.md)** - Add your project specifics
3. **Create custom slash commands** - Add to `.claude/commands/`
4. **Create custom agents** - Add to `.claude/agents/`
5. **Set up MCP servers** - Configure in `.mcp.json` (see WORKFLOW.md Section 5)

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
