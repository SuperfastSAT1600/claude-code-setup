# Commands Directory

This directory contains **user-invoked workflows** that orchestrate agents and automate common development tasks. Commands are triggered using `/command-name` syntax.

---

## What Are Commands?

Commands are markdown files that define:
- 🚀 **Workflows**: Multi-step automated processes
- 🔧 **Orchestration**: Coordination of multiple agents
- ⚡ **Shortcuts**: Quick access to common operations

Commands differ from agents:
- **Agents** = Specialized workers with domain expertise
- **Commands** = Workflow orchestrators that coordinate agents

---

## Available Commands (19 Total)

### Workflow Orchestration

| Command | Usage | Purpose | Duration |
|---------|-------|---------|----------|
| [`full-feature`](full-feature.md) | `/full-feature <description>` | Complete feature: plan → spec audit → implement → test → review → checkpoint → commit | Hours |
| [`quick-fix`](quick-fix.md) | `/quick-fix <issue>` | Fast bug fix with regression test | Minutes |
| [`spike`](spike.md) | `/spike <topic>` | Time-boxed technical research and exploration | 30min-2hr |
| [`plan`](plan.md) | `/plan <feature>` | Structured spec with REQ-XXX IDs and verification tags | 10-20min |

### Verification & Quality Gates

| Command | Usage | Purpose | Duration |
|---------|-------|---------|----------|
| [`checkpoint`](checkpoint.md) | `/checkpoint` | Unified gate: types, lint, format, tests, build, security, mutation | 1-5min |
| [`test-ladder`](test-ladder.md) | `/test-ladder` | Progressive escalation: unit → integration → E2E → manual checklist | 5-30min |
| [`review`](review.md) | `/review` | Code review + security audit (delegates to code-reviewer) | 5-30min |

### Testing

| Command | Usage | Purpose | Duration |
|---------|-------|---------|----------|
| [`tdd`](tdd.md) | `/tdd <feature>` | Red-Green-Refactor TDD workflow | Varies |
| [`test-coverage`](test-coverage.md) | `/test-coverage` | Coverage analysis, identify gaps, generate missing tests | 5-15min |
| [`e2e`](e2e.md) | `/e2e <workflow>` | Generate and run Playwright/Cypress E2E tests | 10-30min |

### Code Quality

| Command | Usage | Purpose | Duration |
|---------|-------|---------|----------|
| [`type-check`](type-check.md) | `/type-check` | Strict TypeScript checking, eliminate `any` types | < 2min |
| [`refactor-clean`](refactor-clean.md) | `/refactor-clean [scope]` | Dead code removal + modernization + complexity reduction | 15-30min |
| [`build-fix`](build-fix.md) | `/build-fix` | Fix build errors systematically | Varies |

### Development Tools

| Command | Usage | Purpose | Duration |
|---------|-------|---------|----------|
| [`new-component`](new-component.md) | `/new-component <Name>` | Scaffold React component with tests and stories | < 1min |
| [`create-migration`](create-migration.md) | `/create-migration "<desc>"` | Database migration with rollback and validation | 5min |
| [`update-docs`](update-docs.md) | `/update-docs` | Sync documentation with code changes | 5-10min |
| [`open-localhost`](open-localhost.md) | `/open-localhost [port]` | Auto-detect and open dev server in browser | < 5sec |

### Git & Observability

| Command | Usage | Purpose | Duration |
|---------|-------|---------|----------|
| [`commit-push-pr`](commit-push-pr.md) | `/commit-push-pr` | Conventional commit, push, create PR | 2-5min |
| [`session-report`](session-report.md) | `/session-report` | Agent activity, checkpoint results, error summary | < 1min |

---

## How Commands Work

### Invocation

Commands are triggered with `/command-name`:
```
/full-feature add user notifications
/quick-fix login button not responding
/checkpoint
```

### With Arguments

Some commands accept arguments:
```
/new-component UserAvatar          # Component name
/create-migration "add index"      # Description in quotes
/spike evaluate caching options    # Research topic
```

### Command vs Agent Decision

| Need | Use |
|------|-----|
| Complete workflow (plan → implement → test → PR) | **Command** (`/full-feature`) |
| Code + security review | **Command** (`/review`) |
| One-off specialized task | **Agent** (direct delegation) |
| Simple code change | Neither (do it directly) |

---

## Command Categories

### By Duration

| Duration | Commands |
|----------|----------|
| **Fast** (<1 min) | `/new-component`, `/open-localhost`, `/session-report` |
| **Medium** (1-15 min) | `/quick-fix`, `/create-migration`, `/update-docs`, `/test-coverage`, `/checkpoint`, `/type-check` |
| **Long** (15+ min) | `/full-feature`, `/review`, `/e2e`, `/test-ladder`, `/refactor-clean` |

### By Purpose

| Purpose | Commands |
|---------|----------|
| **Feature Development** | `/full-feature`, `/plan`, `/tdd` |
| **Bug Fixing** | `/quick-fix`, `/build-fix` |
| **Code Quality** | `/type-check`, `/refactor-clean` |
| **Verification** | `/checkpoint`, `/test-ladder`, `/review` |
| **Testing** | `/tdd`, `/test-coverage`, `/e2e` |
| **Observability** | `/session-report` |
| **Documentation** | `/update-docs` |
| **Development Tools** | `/new-component`, `/create-migration`, `/open-localhost` |
| **Git/CI** | `/commit-push-pr`, `/build-fix` |

---

## Creating a New Command

### Template

```markdown
# Command Name

One-line description.

---

## Usage

\`\`\`
/command-name <arguments>
\`\`\`

---

## What This Command Does

Numbered list of steps...

---

## Workflow Steps

### Step 1: Name
Details...

### Step 2: Name
Details...

---

## Success Criteria

- Criterion 1
- Criterion 2

---

## Related

- Related command
- Related agent
```

### Best Practices

1. **Clear purpose**: One-line description of what it does
2. **Usage examples**: Show common invocations
3. **Defined steps**: Clear workflow with phases
4. **Success criteria**: How to know it completed successfully
5. **Duration estimate**: Help users plan their time

---

## Troubleshooting

### "Command not recognized"
- Check spelling of command name
- Ensure command file exists in `.claude/commands/`
- Verify file is valid markdown

### "Command failed partway through"
- Check error messages in output
- Verify prerequisites are met
- Try running failed step manually

### "Command taking too long"
- Some commands (like `/full-feature`) are designed for long tasks
- Check progress updates for status
- Can interrupt and resume later

---

## Resources

- [Agents Index](../agents/INDEX.md) - Agent directory and usage guide
- [Skills Index](../skills/INDEX.md) - Skills directory and selection guide
- [Workflows](../workflows/) - Detailed workflow definitions
- [Checklists](../checklists/) - Quality gate checklists

---

**Last Updated**: 2026-02-26
