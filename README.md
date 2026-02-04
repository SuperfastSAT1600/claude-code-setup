# Claude Code Workflow Template

A ready-to-use template implementing a hybrid coding workflow for Claude Code, featuring **33 specialized agents**, **20 powerful commands**, **5 orchestrated workflows**, **13 review checklists**, **16 code templates**, **20 skill references**, and **2 auto-enforced rule files**.

**Key Feature**: Main agent codes directly for standard tasks (CRUD, simple features, bug fixes) and delegates to specialized agents for complex domains (auth, databases, performance, security).

---

## 🎯 Using This Template

This template provides a complete development workflow setup that can be applied to:
- **New projects**: Use as a starting point with all configurations ready
- **Existing projects**: Integrate seamlessly without disrupting your current setup
- **Solo developers**: Comprehensive workflow automation
- **Teams**: Shared standards and knowledge base

### Quick Start (All Platforms)

```bash
# 1. Clone the repository
git clone <this-repo> my-project
cd my-project

# 2. Run the setup wizard
node setup.cjs

# 3. Start Claude Code
claude
```

The setup wizard will:
- Detect your platform (Windows/macOS/Linux) and configure MCP servers accordingly
- **REQUIRE Slack MCP setup** (mandatory for PR notifications to 개발 channel)
- Ask which optional MCP servers you want to enable
- Collect API keys securely (stored in gitignored `.mcp.json`)
- Create your `.env` file from the template
- Optionally install dependencies

### Required MCP Servers

**Slack MCP** (REQUIRED): This template requires Slack MCP for automatic PR notifications to the 개발 channel. You'll need:
- Slack Bot Token (from https://api.slack.com/apps)
- Slack Team ID (starts with T)

The setup wizard will prompt you for these credentials.

### Manual Setup (Alternative)

**For New Projects**:
```bash
git clone <this-repo> my-project
cd my-project
rm -rf .git && git init
cp .claude/templates/mcp.template.json .mcp.json
cp .claude/templates/.env.example .env
# Edit .mcp.json and .env with your API keys
```

**For Existing Projects**:
```bash
# Copy template files into your existing project
# See .claude/docs/getting-started/INTEGRATION.md and .claude/docs/guides/WORKFLOW.md Section 7 for integration guide
```

📖 **Full Setup Instructions**: See [.claude/docs/getting-started/INTEGRATION.md](.claude/docs/getting-started/INTEGRATION.md) for 5-minute setup, or [.claude/docs/guides/WORKFLOW.md](.claude/docs/guides/WORKFLOW.md) Section 7 for comprehensive customization guide

---

## What's Included

### ⚡ Custom Commands (20)
- `/full-feature` - Complete feature cycle (plan → test → PR)
- `/quick-fix` - Fast bug fix workflow
- `/commit-push-pr` - Commit, push, and create PR workflow (auto-notifies 개발 channel in natural Korean)
- `/review-changes` - Comprehensive code review
- `/test-and-build` - Run tests and build with auto-fix
- `/test-coverage` - Analyze and improve test coverage
- `/lint-fix` - ESLint + Prettier + TypeScript
- `/type-check` - Strict TypeScript checking
- `/build-fix` - Automatically fix build errors
- `/refactor-clean` - Remove dead code, modernize patterns
- `/spike` - Time-boxed technical research
- `/plan` - Create detailed implementation plans
- `/tdd` - Test-Driven Development workflow
- `/new-component` - Scaffold React component + tests + stories
- `/dead-code` - Find unused code/exports/dependencies
- `/audit-deps` - Dependency security audit
- `/create-migration` - Generate database migration with rollback
- `/e2e` - Generate and run end-to-end tests
- `/security-review` - Comprehensive security audit
- `/update-docs` - Sync documentation with code changes

### 🤖 Custom Agents (33 Specialists)

**Philosophy**: Main agent handles standard development directly. Specialized agents provide expert guidance for complex domains.

**Core Workflow:**
- **planner** - Implementation planning and task breakdown (optional for complex features)
- **architect** - System design and architectural decisions
- **code-reviewer** - Comprehensive code quality review
- **security-reviewer** - OWASP security audits
- **verify-app** - End-to-end application verification

**Code Quality:**
- **code-simplifier** - Remove unnecessary complexity
- **refactor-cleaner** - Modernize legacy code, remove dead code
- **tech-debt-analyzer** - Technical debt prioritization
- **type-safety-enforcer** - Eliminate `any` types

**Testing:**
- **tdd-guide** - Test-Driven Development workflow
- **unit-test-writer** - Unit tests with AAA pattern
- **integration-test-writer** - API/service integration tests
- **e2e-runner** - Playwright/Cypress E2E tests
- **load-test-specialist** - k6/Artillery performance testing

**Development:**
- **api-designer** - REST/GraphQL API design and documentation
- **database-architect** - Schema design & optimization
- **auth-specialist** - OAuth, JWT, MFA implementation
- **graphql-specialist** - GraphQL schema and resolvers
- **websocket-specialist** - Real-time Socket.io patterns

**Operations:**
- **build-error-resolver** - Fix build errors iteratively
- **ci-cd-specialist** - GitHub Actions pipelines
- **docker-specialist** - Containerization & optimization
- **migration-specialist** - Zero-downtime database migrations
- **dependency-manager** - Package management & audits

**Specialized:**
- **accessibility-auditor** - WCAG 2.1 AA compliance
- **i18n-specialist** - Internationalization support
- **doc-updater** - Sync documentation with code
- **performance-optimizer** - Profile and optimize bottlenecks
- **monitoring-architect** - Logging, metrics, and alerting
- **runbook-writer** - Deployment and troubleshooting guides
- **mobile-specialist** - React Native/Flutter development
- **ai-integration-specialist** - LLM APIs, RAG, prompt engineering
- **iac-specialist** - Terraform, CloudFormation infrastructure

### 📂 Organization
- **5 Orchestrated Workflows** - full-feature, bug-fix, refactor, release, security-audit
- **13 Review Checklists** - PR review, security, performance, accessibility, pre-release, onboarding, ai-code-review, database-migration, dependency-audit, deployment, hotfix, build-errors, e2e-testing
- **16 Code Templates** - component, API route, test, migration, PR description, error-handler, form, guard, hook, middleware, service, API documentation, GitHub workflow, Dockerfile, Playwright config, README
- **20 Skill References** - React, Next.js, REST API, GraphQL, WebSocket, TDD, backend patterns, frontend patterns, coding standards, Node.js, Prisma, GitHub Actions, project guidelines, user intent, prompt engineering, RAG patterns, auth patterns, database patterns, Docker patterns, documentation patterns
- **Hybrid Agent Rules** - Main agent codes standard tasks, delegates specialized work for efficiency and expertise

### 📚 Documentation
- [.claude/docs/getting-started/INTEGRATION.md](.claude/docs/getting-started/INTEGRATION.md) - Daily workflow quick reference (5-minute setup)
- [.claude/docs/guides/WORKFLOW.md](.claude/docs/guides/WORKFLOW.md) - **Complete workflow guide (1500+ lines)** with decision trees and real-world examples
- [CLAUDE.md](CLAUDE.md) - Team guidelines (customize for your project)
- `.claude/rules/` - Auto-enforced guidelines (2 rule files)
- `.claude/skills/` - Pattern references (20 skill files)

### ⚙️ Configuration
- `.claude/settings.json` - Shared team settings (49 pre-approved operations, hooks)
- `.mcp.template.json` - MCP server template (27 servers, cross-platform)
- `.env.example` - Environment variables template
- `setup.cjs` - Cross-platform setup wizard
- `.gitignore` - Sensible defaults for various project types

---

## Getting Started

1. **Quick Start**: [.claude/docs/getting-started/INTEGRATION.md](.claude/docs/getting-started/INTEGRATION.md) - Get started in 5 minutes
2. **Master the Workflow**: [.claude/docs/guides/WORKFLOW.md](.claude/docs/guides/WORKFLOW.md) - **Complete 1500+ line guide** with:
   - Decision trees for "I need to..." scenarios
   - Command and agent selection matrices
   - Real-world authentication implementation example
   - MCP server integration guide
   - Progressive adoption roadmap
3. **Customize Guidelines**: Edit [CLAUDE.md](CLAUDE.md) for your project specifics
4. **Explore Resources**: Check `.claude/rules/` and `.claude/skills/` for patterns
5. **Try a Command**: Run `/full-feature` or `/commit-push-pr` in Claude Code

---

## Workflow Overview

### Basic Development Flow
1. Start Claude Code in your project: `claude`
2. Describe what you want to build
3. Review and approve the plan
4. Let Claude implement with custom commands
5. Use `/commit-push-pr` when done

### Key Features
- **Parallel Sessions**: Run up to 5 simultaneous Claude sessions
- **Model Selection**: Automatic model switching (Sonnet for most, Haiku for simple, Opus for complex)
- **Pre-approved Commands**: Common bash operations pre-approved for speed
- **Custom Hooks**: Automated quality checks and formatting

---

## Customization

### Essential Customization (Do First)
- [ ] Update this README with your project details
- [ ] Edit [CLAUDE.md](CLAUDE.md) with your tech stack
- [ ] Add your project structure to [CLAUDE.md](CLAUDE.md)
- [ ] Configure git: `git config user.name` and `git config user.email`

### Optional Customization
- [ ] Add project-specific rules to [CLAUDE.md](CLAUDE.md)
- [ ] Create custom commands for your workflows
- [ ] Build custom agents for domain-specific tasks
- [ ] Adjust model preferences in `.claude/settings.json`

See [.claude/docs/guides/WORKFLOW.md](.claude/docs/guides/WORKFLOW.md) Section 7 for the complete customization roadmap.

---

## Project Structure

```
.
├── .claude/
│   ├── agents/               # 33 specialized agents
│   │   ├── planner.md
│   │   ├── architect.md
│   │   ├── code-reviewer.md
│   │   ├── auth-specialist.md
│   │   └── ... (29 more)
│   ├── commands/             # 20 slash commands
│   │   ├── full-feature.md
│   │   ├── quick-fix.md
│   │   ├── commit-push-pr.md
│   │   └── ... (17 more)
│   ├── workflows/            # 5 orchestrated agent sequences
│   │   ├── full-feature.md
│   │   ├── bug-fix.md
│   │   └── ... (3 more)
│   ├── checklists/           # 13 review checklists
│   │   ├── pr-review.md
│   │   ├── security-audit.md
│   │   ├── build-errors-checklist.md
│   │   └── ... (10 more)
│   ├── templates/            # Templates for code, config, and environment
│   │   ├── mcp.template.json # MCP server template (27 servers, committed)
│   │   ├── .env.example      # Application environment template
│   │   ├── *.template        # Working templates (8 generic templates)
│   │   └── variants/         # Organized source templates
│   │       ├── generic/      # Framework-agnostic (8 templates)
│   │       ├── react/        # React-specific (2 templates)
│   │       ├── nextjs/       # Next.js-specific (1 template)
│   │       └── vue/          # Vue-specific (add your own)
│   ├── rules/                # Core guidelines
│   │   ├── essential-rules.md
│   │   ├── agent-workflow.md (hybrid model)
│   │   └── self-aware-system.md
│   ├── skills/               # 20 reference knowledge files
│   │   ├── react-patterns.md
│   │   ├── auth-patterns.md
│   │   ├── database-patterns.md
│   │   └── ... (17 more)
│   ├── settings.json         # Shared settings (hooks, pre-approved ops)
│   └── settings.local.json   # Local overrides (gitignored)
├── lib/                      # Setup wizard modules
│   ├── techstack.cjs         # Auto-detect framework/backend/database
│   ├── claude-md.cjs         # Generate CLAUDE.md from detected stack
│   └── ... (other modules)
│   ├── docs/                 # System documentation
│   │   ├── README.md         # Documentation index
│   │   ├── getting-started/  # Integration guides
│   │   │   ├── INTEGRATION.md    # Add to existing projects
│   │   │   └── INTEGRATION.ko.md # 통합 가이드 (한국어)
│   │   ├── guides/           # Comprehensive guides
│   │   │   ├── WORKFLOW.md       # Complete workflow guide (1500+ lines)
│   │   │   └── WORKFLOW.ko.md    # 워크플로우 가이드 (한국어)
│   │   └── system/           # Internal documentation
│   │       ├── error-verification-system.md
│   │       └── slack-notifications.md
├── .mcp.json                 # MCP config with keys (gitignored, generated)
├── .env                      # Your secrets (gitignored, generated)
├── setup.cjs                 # Cross-platform setup wizard
├── CLAUDE.md                 # Team guidelines ⚠️ CUSTOMIZE
└── README.md                 # This file
```

---

## Daily Usage

### Starting a Session
```bash
cd your-project
claude
```

### Common Tasks
```bash
# In Claude Code:
"Help me implement user authentication"
"Fix the bug in checkout.ts"
"Add tests for the payment module"
"/review-changes"              # Review before committing
"/commit-push-pr"              # Commit and create PR
```

### Tips
- Use `/` to see all custom commands
- Reference files with [filename.ts:42](src/filename.ts#L42) syntax
- Run up to 5 parallel sessions for different features
- See [.claude/docs/](.claude/docs/) for complete documentation

---

## Support & Resources

- **Documentation Index**: [.claude/docs/README.md](.claude/docs/README.md) - Complete guide navigation
- **Integration Guide**: [.claude/docs/getting-started/INTEGRATION.md](.claude/docs/getting-started/INTEGRATION.md) - Add to existing projects
- **Complete Workflow Guide (1500+ lines)**: [.claude/docs/guides/WORKFLOW.md](.claude/docs/guides/WORKFLOW.md) - Decision trees, examples, and integration patterns
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) - Track system updates and migration guides
- **Claude Code Help**: Run `/help` in Claude or visit https://claude.com/claude-code

---

## Maintenance

### Keep It Current
- Update [CLAUDE.md](CLAUDE.md) when Claude makes mistakes
- Add new rules as patterns emerge
- Review weekly and remove outdated guidelines
- Tag `@.claude` in PRs to suggest updates

### Version Control
- Commit template updates: `git add .claude/ CLAUDE.md`
- Share with team: Guidelines in CLAUDE.md apply to all
- Keep synchronized: Pull template updates regularly

---

## License

[Add your license here]

---

**Template Version**: 2.1
**Model**: Hybrid agent system (main agent codes + specialists)
**Last Updated**: 2026-01-26
