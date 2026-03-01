# Claude Code Workflow Template

A ready-to-use template implementing a spec-driven TDD workflow for Claude Code, featuring **10 specialized agents**, **25 slash commands**, **23 skills**, **2 workflows**, **12 review checklists**, **5 code templates**, and **5 auto-enforced rule files**.

**Key Feature**: Main agent codes directly for standard tasks (CRUD, simple features, bug fixes) and delegates to specialized agents for complex domains (auth, databases, performance, security).

---

## Quick Start

```bash
# 1. Clone the repository
git clone <this-repo> my-project
cd my-project

# 2. Run the setup wizard (auto-installs dependencies)
node setup.cjs

# 3. Start Claude Code
claude
```

The setup wizard will:
- Auto-install required dependencies (`enquirer`) if missing
- Detect your platform (Windows/macOS/Linux) and configure MCP servers
- Collect API credentials for enabled MCP servers (GitHub PAT, etc.)
- Store credentials securely in gitignored `.mcp.json`
- Create your `.env` file from the template

---

## What's Included

### Slash Commands (25)

Development workflow commands invoked with `/command-name` in Claude Code:

`/full-feature` | `/quick-fix` | `/commit-push-pr` | `/review` | `/tdd` | `/parallel-tdd` | `/checkpoint` | `/plan` | `/spike` | `/build-fix` | `/refactor-clean` | `/test-coverage` | `/test-ladder` | `/type-check` | `/e2e` | `/new-component` | `/create-migration` | `/update-docs` | `/session-report` | `/health-check` | `/req-status` | `/req-coverage` | `/generate-stubs` | `/open-localhost` | `/update-system`

### Specialized Agents (10)

| Agent | Domain |
|-------|--------|
| **architect** | System design, plans, trade-offs |
| **code-reviewer** | PR reviews, security, TypeScript, tech debt |
| **test-writer** | TDD, unit/integration/E2E/load tests |
| **backend-specialist** | REST API, DB schema, migrations |
| **auth-specialist** | OAuth, JWT, MFA, sessions |
| **devops-specialist** | CI/CD, Docker, IaC, monitoring, build errors |
| **frontend-specialist** | Accessibility, i18n, Core Web Vitals |
| **realtime-specialist** | WebSockets, GraphQL, AI/ML |
| **mobile-specialist** | React Native, Flutter |
| **doc-updater** | Documentation sync |

### Skills (23)

Domain pattern libraries loaded on demand via `Skill("name")`:

**Core**: coding-standards, tdd-workflow, documentation-patterns, spec-writing, skill-creator
**Backend**: backend-patterns, nodejs-patterns, rest-api-design, database-patterns
**Frontend**: frontend-patterns, react-patterns, nextjs-patterns
**Specialized**: auth-patterns, graphql-patterns, websocket-patterns, prompt-engineering, rag-patterns
**DevOps**: docker-patterns, github-actions
**Utilities**: dev-server-autoopen, project-guidelines, user-intent-patterns, agent-orchestration

### Other Resources

- **2 Workflows**: release, security-audit
- **12 Checklists**: PR review, security audit, deployment, build errors, database migration, and more
- **5 Code Templates**: spec, API spec, bugfix spec, UI spec, PR description
- **5 Rule Files**: essential-rules, orchestration, self-improvement, task-protocol, resource-usage

---

## Core Workflow: Spec-Driven TDD

1. Enter plan mode — discuss approach
2. Write spec to `.claude/plans/[feature].md`
3. Spec auto-audited (blocks coding if validation fails)
4. `/tdd` (single agent) or `/parallel-tdd` (multi-agent worktrees)
5. `/checkpoint` — unified verification gate
6. `/commit-push-pr`

---

## Project Structure

```
.
├── .claude/
│   ├── agents/          # 10 specialized agents + INDEX.md
│   ├── commands/        # 25 slash commands
│   ├── skills/          # 23 skill directories + INDEX.md
│   ├── workflows/       # 2 orchestrated workflows
│   ├── checklists/      # 12 review checklists
│   ├── templates/       # Code and config templates
│   ├── rules/           # 5 auto-enforced rule files
│   ├── scripts/         # Helper scripts
│   ├── plans/           # Spec files (created per feature)
│   ├── user/            # User data (gitignored)
│   ├── settings.json    # Shared settings (hooks, pre-approved ops)
│   └── settings.local.json  # Local overrides (gitignored)
├── docs/                # Project documentation
├── setup.cjs            # Cross-platform setup wizard
├── CLAUDE.md            # Team guidelines (customize for your project)
└── README.md            # This file
```

---

## Customization

### Essential (Do First)
- [ ] Edit [CLAUDE.md](CLAUDE.md) with your tech stack and project structure
- [ ] Configure git: `git config user.name` and `git config user.email`
- [ ] Run `node setup.cjs` to configure MCP servers

### Optional
- [ ] Add project-specific rules to [CLAUDE.md](CLAUDE.md)
- [ ] Create custom commands in `.claude/commands/`
- [ ] Build custom agents for domain-specific tasks
- [ ] Adjust model preferences in `.claude/settings.json`

---

## Daily Usage

```bash
# Start Claude Code
cd your-project
claude

# Common tasks (just describe what you want):
"Add a user profile page"           # Main agent implements directly
"I want users to log in with OAuth" # Delegates to auth-specialist
"Fix the checkout bug"              # Main agent fixes directly
"Is this code secure?"              # Delegates to code-reviewer

# Use slash commands:
/tdd                                # Test-Driven Development
/commit-push-pr                     # Commit and create PR
/review                             # Code review
/health-check                       # System health audit
```

---

## Updating

```bash
./.claude/scripts/update-system.sh
```

Preserves: `.claude/user/`, `settings.local.json`, `CLAUDE.md`
Updates: agents, skills, rules, commands, workflows, templates

---

## License

[Add your license here]

---

**Template Version**: 3.0
**Model**: Hybrid agent system (main agent codes + 10 specialists)
**Last Updated**: 2026-03-01
