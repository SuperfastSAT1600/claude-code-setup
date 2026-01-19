# Boris Cherny's Claude Code Workflow Guide

This document explains how to implement Boris Cherny's comprehensive Claude Code workflow for maximum productivity.

## Table of Contents
1. [Parallel Execution Setup](#parallel-execution-setup)
2. [Model Selection](#model-selection)
3. [Plan Mode Workflow](#plan-mode-workflow)
4. [Slash Commands](#slash-commands)
5. [Subagents](#subagents)
6. [CLAUDE.md Best Practices](#claudemd-best-practices)
7. [Verification Feedback Loops](#verification-feedback-loops)
8. [Tips & Best Practices](#tips--best-practices)

---

## Parallel Execution Setup

### VSCode: Multiple Claude Sessions

**How to run multiple Claude sessions in VSCode:**

1. **Open Multiple Projects**
   - Each VSCode window can have its own Claude Code session
   - Open different projects or different branches of the same project
   - Use VSCode's "Duplicate Workspace in New Window" feature

2. **Terminal Multiplexer (For CLI)**
   - Install Windows Terminal or tmux (via WSL)
   - Create 5 tabs for local Claude sessions
   - Number them 1-5 for easy reference
   - Use system notifications to know when input is needed

3. **Web + Local Hybrid**
   - Use [claude.ai/code](https://claude.ai/code) for 5-10 additional sessions
   - Use `&` command in CLI to hand off local session to web
   - Use `--teleport` flag for bidirectional transfer
   - Use iOS app for quick sessions on-the-go

**Example Terminal Setup (Windows Terminal)**:
```json
// In Windows Terminal settings.json, create profiles for each Claude session
// Replace /c/YOUR/PROJECT/PATH with your actual project directory path
{
  "profiles": {
    "list": [
      {
        "name": "Claude Project 1",
        "commandline": "bash -c 'cd /c/YOUR/PROJECT/PATH && claude'"
      },
      {
        "name": "Claude Project 2",
        "commandline": "bash -c 'cd /c/YOUR/OTHER/PROJECT && claude'"
      }
      // ... up to 5
    ]
  }
}
```

---

## Model Selection

**Always use Opus 4.5 with thinking enabled** (already configured in `.claude/settings.json`):

```json
{
  "model": "opus",
  "thinkingEnabled": true
}
```

**Why Opus 4.5?**
- Larger and slower than Sonnet
- BUT requires less steering/correction
- Better tool usage
- Results in faster overall completion
- Think of it as: slower per step, but fewer steps needed

---

## Plan Mode Workflow

This is the MOST IMPORTANT workflow pattern.

### When to Use Plan Mode

Use Plan mode (`Shift+Tab` twice) for:
- New features
- Complex refactoring
- Architectural changes
- Anything touching multiple files
- When you want to review before execution

### Plan Mode Process

1. **Enter Plan Mode**: Press `Shift+Tab` twice
2. **Describe the Task**: Give Claude the high-level goal
3. **Iterate on the Plan**:
   - Review Claude's plan
   - Ask questions
   - Request changes
   - Add constraints
   - Clarify requirements
4. **Finalize the Plan**: Get it exactly right before execution
5. **Switch to Auto-Accept**: Once plan is approved, enable auto-accept edits
6. **Execute**: Claude usually completes it in one shot (1-shot completion)

### Example Plan Mode Session

```
You: [Shift+Tab twice] Add user authentication with JWT tokens

Claude: [Generates detailed plan]
- Install jsonwebtoken and bcrypt packages
- Create auth middleware
- Add login/register endpoints
- Update user model with password hashing
- Add protected route examples

You: Looks good, but use Passport.js instead of custom middleware

Claude: [Updates plan with Passport.js]

You: Perfect, proceed with auto-accept

Claude: [Implements entire feature in one go]
```

---

## Slash Commands

We've created custom slash commands in `.claude/commands/`. Use them frequently!

### Available Commands

#### `/commit-push-pr`
**Most used command** (Boris uses it dozens of times per day)
- Commits changes with proper message
- Pushes to remote
- Creates pull request with summary and test plan
- All in one command

**Usage**:
```
/commit-push-pr
```

#### `/test-and-build`
Run before creating PRs
- Runs test suite
- Fixes any test failures
- Runs build
- Fixes any build errors
- Repeats until everything passes

**Usage**:
```
/test-and-build
```

#### `/review-changes`
Comprehensive code review before PR
- Reviews all changed files
- Checks for security issues
- Identifies code quality problems
- Suggests improvements

**Usage**:
```
/review-changes
```

### Creating Custom Commands

Add new commands in `.claude/commands/`:

```bash
# Create new command
touch .claude/commands/my-command.md
```

Format:
```markdown
# Command Name

Brief description

## Usage
When to use this command

## Instructions
Detailed step-by-step instructions for Claude to follow
```

---

## Subagents

Subagents automate repetitive workflows. We've created two essential ones:

### `code-simplifier`
**Use after**: Completing a feature
**Purpose**: Remove over-engineering and unnecessary complexity

**Usage**:
```
After you're done, run the code-simplifier agent to clean up
```

**What it does**:
- Removes single-use helpers
- Inlines unnecessary abstractions
- Simplifies complex conditionals
- Deletes dead code
- Flattens deep nesting

### `verify-app`
**Use after**: Making changes
**Purpose**: End-to-end testing and verification

**Usage**:
```
Run verify-app agent to test everything works
```

**What it does**:
- Starts the application
- Tests changed features
- Checks for regressions
- Verifies edge cases
- Reports any issues found

### Creating Custom Subagents

Add new agents in `.claude/agents/`:

```bash
# Create new agent
touch .claude/agents/my-agent.md
```

---

## CLAUDE.md Best Practices

`CLAUDE.md` is your **team's shared knowledge base**. This is critical for preventing repeated mistakes.

### When to Update

1. **During Development**: Claude makes a mistake → add it immediately
2. **During Code Review**: Tag `@.claude` in PR comments to suggest additions
3. **Weekly**: Review and update as a team
4. **After Incidents**: Document what went wrong and how to prevent it

### What to Add

**Good entries**:
```markdown
## Common Mistakes to Avoid
- Don't use `var` - always use `const` or `let`
- Never commit files in `dist/` directory
- API calls must always include authentication headers
```

**Architecture decisions**:
```markdown
## Architecture Guidelines
- All database queries go through the `db/` service layer
- State management uses Redux, not Context API for global state
- Use styled-components for styling, not CSS modules
```

**Project-specific rules**:
```markdown
## Project-Specific Rules
- Import paths use `@/` alias for `src/`
- All components must be exported as named exports
- Test files live in `__tests__/` directories
```

### Integration with GitHub

Use GitHub Actions to enforce CLAUDE.md updates:

```yaml
# .github/workflows/claude-check.yml
name: Claude Code Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          check-claude-md: true
```

---

## Verification Feedback Loops

**THIS IS THE MOST IMPORTANT TIP** - Boris says it 2-3x improves output quality.

### The Concept

Give Claude a way to verify its own work. This creates a feedback loop:
1. Claude implements
2. Claude tests
3. If failed, Claude fixes
4. Repeat until success

### How to Implement

**For Web Apps**:
```
After implementing, start the dev server and verify the changes work in the browser.
Keep iterating until everything works correctly.
```

**For APIs**:
```
After implementing, test all endpoints with curl and verify responses.
Fix any errors and re-test until all endpoints work.
```

**For CLI Tools**:
```
After implementing, run the CLI with various inputs and verify output.
Test edge cases and error handling.
```

**For Libraries**:
```
After implementing, run the test suite and verify all tests pass.
Also run the examples to ensure they work.
```

### Example: Browser Testing

```
Implement the login form, then:
1. Start the dev server (npm run dev)
2. Open the browser to localhost:3000/login
3. Test the happy path (valid credentials)
4. Test error cases (invalid email, wrong password, etc.)
5. Verify error messages display correctly
6. Test keyboard navigation
7. Fix any issues found
8. Repeat until everything works perfectly
```

### Using Hooks for Verification

You can automate verification with hooks:

```json
// .claude/settings.json
{
  "hooks": {
    "onAgentStop": {
      "command": "npm test",
      "continueOnError": false
    }
  }
}
```

---

## Tips & Best Practices

### 1. Use Permissions Wisely

Pre-approve common commands in `.claude/settings.json`:
```json
{
  "allowedPrompts": [
    { "tool": "Bash", "prompt": "run tests" },
    { "tool": "Bash", "prompt": "git status" }
  ]
}
```

**Don't use** `--dangerously-skip-permissions` in production environments!

### 2. Background Agents for Long Tasks

For very long tasks:
```
Run this as a background agent and verify when complete:
[task description]
```

Or use the Stop hook for deterministic verification.

### 3. Sandbox for Risky Operations

When experimenting or running risky operations:
```bash
# Create sandbox branch
git checkout -b sandbox/experiment

# Tell Claude to use --dangerously-skip-permissions
# (only safe in isolated branch)
```

### 4. Web Handoff for Mobile Testing

Start sessions on iOS app during commute:
```
# On iOS app, start the session
# Later, access on desktop via claude.ai/code
```

### 5. Compounding Engineering

Like Dan Shipper's concept - knowledge compounds over time:
- Every mistake added to CLAUDE.md prevents future mistakes
- Every slash command saves time on future tasks
- Every subagent automates repetitive work
- The system gets better with use

### 6. Team Collaboration

Keep everything in git:
```bash
git add .claude/ CLAUDE.md WORKFLOW.md .mcp.json
git commit -m "Add Claude Code workflow configuration"
git push
```

Team members inherit all the learnings and configurations.

### 7. Don't Over-Engineer

Remember Boris's philosophy:
- Don't add features beyond what's requested
- Don't refactor code you didn't change
- Don't add abstractions for hypothetical future needs
- Three similar lines > premature abstraction
- Boring code is good code

---

## Quick Reference Card

### Keyboard Shortcuts
- `Shift+Tab` twice: Enter Plan Mode
- `Ctrl+Shift+P`: Command Palette
- `` Ctrl+` ``: Toggle Terminal

### Common Commands
- `/commit-push-pr`: Commit, push, and create PR
- `/test-and-build`: Run tests and build
- `/review-changes`: Review all changes

### Common Prompts
```
Enter plan mode and design the implementation for [feature]
```

```
After implementing, run code-simplifier and verify-app agents
```

```
Review CLAUDE.md before starting and follow all guidelines
```

### Workflow Pattern
1. **Plan**: Use Plan mode to design approach
2. **Implement**: Auto-accept mode for execution
3. **Simplify**: Run code-simplifier agent
4. **Verify**: Run verify-app agent or manual testing
5. **Review**: Use /review-changes command
6. **Ship**: Use /commit-push-pr command

---

## Additional Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Boris Cherny's Twitter Thread](https://x.com/bcherny)

---

**Remember**: The goal is to create a compounding system where each session makes future sessions better. Invest in CLAUDE.md, slash commands, and subagents - they pay dividends over time.
