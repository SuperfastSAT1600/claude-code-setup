# Claude Code Workflow Template

A ready-to-use template implementing the Boris Cherny workflow for Claude Code, featuring **18 specialized agents**, **15 powerful commands**, **5 orchestrated workflows**, **6 review checklists**, **5 code templates**, and comprehensive documentation with easy feature discovery.

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
node setup.js

# 3. Start Claude Code
claude
```

The setup wizard will:
- Detect your platform (Windows/macOS/Linux) and configure MCP servers accordingly
- Ask which MCP servers you want to enable
- Collect API keys securely (stored in gitignored `.mcp.json`)
- Create your `.env` file from the template
- Optionally install dependencies

### Manual Setup (Alternative)

**For New Projects**:
```bash
git clone <this-repo> my-project
cd my-project
rm -rf .git && git init
cp .mcp.template.json .mcp.json
cp .env.example .env
# Edit .mcp.json and .env with your API keys
```

**For Existing Projects**:
```bash
# Copy template files into your existing project
# See QUICKSTART.md and WORKFLOW.md Section 7 for integration guide
```

📖 **Full Setup Instructions**: See [QUICKSTART.md](QUICKSTART.md) for 5-minute setup, or [WORKFLOW.md](WORKFLOW.md) Section 7 for comprehensive customization guide

---

## What's Included

### 📋 Feature Discovery
- **[.claude/INDEX.md](.claude/INDEX.md)** - Quick reference for all features (300 lines) - **Start here!**
- **[.claude/GUIDE.md](.claude/GUIDE.md)** - Comprehensive how-to guide (950 lines) - Consolidated all README files

### ⚡ Custom Commands (15)
- `/full-feature` - Complete feature cycle (plan → test → PR)
- `/commit-push-pr` - Commit, push, and create PR workflow
- `/review-changes` - Comprehensive code review
- `/test-and-build` - Run tests and build with auto-fix
- `/lint-fix` - ESLint + Prettier + TypeScript
- `/type-check` - Strict TypeScript checking
- `/spike` - Time-boxed technical research
- `/new-component` - Scaffold React component + tests + stories
- `/dead-code` - Find unused code/exports/dependencies
- `/audit-deps` - Dependency security audit
- `/create-migration` - Generate database migration with rollback
- Plus: `/tdd`, `/plan`, `/e2e`, `/security-review`, `/update-docs`

### 🤖 Custom Agents (18)
- **api-designer** - REST/GraphQL API design (opus)
- **code-reviewer** - Comprehensive code review (opus)
- **unit-test-writer** - Generate unit tests with AAA pattern (sonnet)
- **integration-test-writer** - API/service integration tests (sonnet)
- **graphql-specialist** - GraphQL schema, resolvers, DataLoader (sonnet)
- **websocket-specialist** - Real-time Socket.io patterns (sonnet)
- **i18n-specialist** - Internationalization with next-intl (sonnet)
- **accessibility-auditor** - WCAG 2.1 AA compliance (sonnet)
- **load-test-specialist** - k6/Artillery performance testing (sonnet)
- **ci-cd-specialist** - GitHub Actions pipelines (sonnet)
- **docker-specialist** - Containerization & optimization (sonnet)
- **auth-specialist** - OAuth, JWT, MFA implementation (opus)
- **database-architect** - Schema design & optimization (opus)
- **performance-optimizer** - Profile and optimize bottlenecks (sonnet)
- **migration-specialist** - Zero-downtime database migrations (sonnet)
- **type-safety-enforcer** - Eliminate `any` types (haiku)
- **dependency-manager** - Package management & audits (haiku)
- **tech-debt-analyzer** - Technical debt prioritization (sonnet)

### 📂 Organization
- **5 Orchestrated Workflows** - full-feature, bug-fix, refactor, release, security-audit
- **6 Review Checklists** - PR review, security, performance, accessibility, pre-release, onboarding
- **5 Code Templates** - component, API route, test, migration, PR description
- **5 Automation Scripts** - pre-commit, test gating, security logging, auto-format, sync-deps

### 📚 Documentation
- [.claude/INDEX.md](.claude/INDEX.md) - Quick reference (start here for feature discovery!)
- [.claude/GUIDE.md](.claude/GUIDE.md) - Comprehensive consolidated guide
- [QUICKSTART.md](QUICKSTART.md) - Daily workflow quick reference (5-minute setup)
- [WORKFLOW.md](WORKFLOW.md) - **Complete workflow guide (1500+ lines)** with decision trees and real-world examples
- [CLAUDE.md](CLAUDE.md) - Team guidelines (customize for your project)

### ⚙️ Configuration
- `.claude/settings.json` - Shared team settings (49 pre-approved operations, hooks)
- `.mcp.template.json` - MCP server template (27 servers, cross-platform)
- `.env.example` - Environment variables template
- `setup.js` - Cross-platform setup wizard
- `.gitignore` - Sensible defaults for various project types

---

## Getting Started

1. **Discover Features**: [.claude/INDEX.md](.claude/INDEX.md) - Quick reference to all 18 agents, 15 commands (2-minute scan)
2. **Learn How-To**: [.claude/GUIDE.md](.claude/GUIDE.md) - Comprehensive consolidated guide (950 lines)
3. **Quick Start**: [QUICKSTART.md](QUICKSTART.md) - Get started in 5 minutes
4. **Master the Workflow**: [WORKFLOW.md](WORKFLOW.md) - **Complete 1500+ line guide** with:
   - Decision trees for "I need to..." scenarios
   - Command and agent selection matrices
   - Real-world authentication implementation example
   - MCP server integration guide
   - Progressive adoption roadmap
5. **Customize Guidelines**: Edit [CLAUDE.md](CLAUDE.md) for your project specifics
6. **Try a Command**: Run `/full-feature` or `/commit-push-pr` in Claude Code

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

See [WORKFLOW.md](WORKFLOW.md) Section 7 for the complete customization roadmap.

---

## Project Structure

```
.
├── .claude/
│   ├── INDEX.md              # ⭐ Quick reference for all features (START HERE!)
│   ├── GUIDE.md              # Comprehensive consolidated how-to guide
│   ├── agents/               # 18 specialized agents
│   │   ├── api-designer.md
│   │   ├── code-reviewer.md
│   │   ├── graphql-specialist.md
│   │   ├── websocket-specialist.md
│   │   └── ... (14 more)
│   ├── commands/             # 15 slash commands
│   │   ├── full-feature.md
│   │   ├── commit-push-pr.md
│   │   ├── lint-fix.md
│   │   ├── type-check.md
│   │   └── ... (11 more)
│   ├── workflows/            # 5 orchestrated agent sequences
│   │   ├── full-feature.md
│   │   ├── bug-fix.md
│   │   └── ... (3 more)
│   ├── checklists/           # 6 review checklists
│   │   ├── pr-review.md
│   │   ├── security-audit.md
│   │   └── ... (4 more)
│   ├── templates/            # 5 code templates
│   │   ├── component.tsx.template
│   │   ├── api-route.ts.template
│   │   └── ... (3 more)
│   ├── scripts/              # 5 automation scripts
│   │   ├── pre-commit-checks.sh
│   │   ├── require-tests-pass.sh
│   │   └── ... (3 more)
│   ├── rules/                # 9 auto-enforced guidelines
│   │   ├── security.md
│   │   ├── coding-style.md
│   │   └── ... (7 more)
│   ├── skills/               # 8 reference knowledge files
│   │   ├── react-patterns.md
│   │   ├── nextjs-patterns.md
│   │   ├── rest-api-design.md
│   │   └── ... (5 more)
│   ├── settings.json         # Shared settings (hooks, pre-approved ops)
│   └── settings.local.json   # Local overrides (gitignored)
├── .mcp.template.json        # MCP template (27 servers, committed)
├── .mcp.json                 # MCP config with keys (gitignored, generated)
├── .env.example              # Environment template
├── .env                      # Your secrets (gitignored, generated)
├── setup.js                  # Cross-platform setup wizard
├── CLAUDE.md                 # Team guidelines ⚠️ CUSTOMIZE
├── WORKFLOW.md               # Complete 1500+ line guide
├── QUICKSTART.md             # Quick reference
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
- Check [QUICKSTART.md](QUICKSTART.md) for keyboard shortcuts

---

## Support & Resources

- **Quick Start (5 min)**: [QUICKSTART.md](QUICKSTART.md)
- **Complete Workflow Guide (1500+ lines)**: [WORKFLOW.md](WORKFLOW.md) - Decision trees, examples, and integration patterns
- **Claude Code Help**: Run `/help` in Claude or visit https://claude.com/claude-code
- **Archived Documentation**: See [.archive/README.md](.archive/README.md) for legacy files

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

**Template Version**: 1.0
**Based On**: Boris Cherny Workflow
**Last Updated**: 2026-01-19
