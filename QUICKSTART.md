# Boris Cherny Workflow - Quick Start Guide

You've successfully set up the comprehensive Boris Cherny workflow for Claude Code! Here's how to get started immediately.

## ✅ What's Already Configured

Your workspace now includes:

1. **`.claude/settings.json`** - Permissions, hooks, and model configuration
2. **`CLAUDE.md`** - Team knowledge base (ready to customize)
3. **`.claude/commands/`** - Three powerful slash commands
4. **`.claude/agents/`** - Two workflow automation agents
5. **`.mcp.json`** - MCP server configuration
6. **`WORKFLOW.md`** - Complete workflow documentation
7. **Environment Variables** - Git Bash integration configured

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

### Workflow 1: Adding a New Feature

```
1. [Shift+Tab twice] Enter Plan mode
2. Describe the feature
3. Review and refine the plan
4. Approve and let Claude implement
5. Run: code-simplifier agent
6. Run: verify-app agent
7. /review-changes
8. /test-and-build
9. /commit-push-pr
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

### Workflow 3: Code Review

```
1. /review-changes
2. Review Claude's findings
3. Fix identified issues
4. /test-and-build
5. /commit-push-pr
```

## 🔧 Available Slash Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/commit-push-pr` | Commit, push, create PR | After completing a feature |
| `/test-and-build` | Run tests and build | Before creating a PR |
| `/review-changes` | Comprehensive code review | Before creating a PR |

## 🤖 Available Agents

| Agent | Purpose | Usage |
|-------|---------|-------|
| `code-simplifier` | Remove over-engineering | "Run code-simplifier agent" |
| `verify-app` | End-to-end testing | "Run verify-app agent" |

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

1. **Read [WORKFLOW.md](WORKFLOW.md)** - Complete workflow guide
2. **Customize [CLAUDE.md](CLAUDE.md)** - Add your project specifics
3. **Create custom slash commands** - Add to `.claude/commands/`
4. **Create custom agents** - Add to `.claude/agents/`
5. **Set up MCP servers** - Configure in `.mcp.json`

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
