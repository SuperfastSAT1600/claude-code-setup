# Claude Code Workflow Template

A ready-to-use template implementing the Boris Cherny workflow for Claude Code, complete with custom commands, agents, and comprehensive documentation.

---

## 🎯 Using This Template

This template provides a complete development workflow setup that can be applied to:
- **New projects**: Use as a starting point with all configurations ready
- **Existing projects**: Integrate seamlessly without disrupting your current setup

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

### Custom Commands
- `/commit-push-pr` - Commit, push, and create PR in one workflow
- `/review-changes` - Comprehensive code review of all changes
- `/test-and-build` - Run tests and build, fixing errors automatically

### Custom Agents
- **code-simplifier** - Refactor complex code for clarity
- **verify-app** - End-to-end application testing

### Documentation
- [QUICKSTART.md](QUICKSTART.md) - Daily workflow quick reference (5-minute getting started)
- [WORKFLOW.md](WORKFLOW.md) - **Comprehensive workflow guide (1500+ lines)** with decision trees, real-world examples, and complete integration patterns
- [CLAUDE.md](CLAUDE.md) - Team guidelines (customize for your project)

### Configuration
- `.claude/settings.json` - Shared team settings
- `.mcp.template.json` - MCP server template (cross-platform)
- `.env.example` - Environment variables template
- `setup.js` - Cross-platform setup wizard
- `.gitignore` - Sensible defaults for various project types

---

## Getting Started

1. **Read the Quick Start**: [QUICKSTART.md](QUICKSTART.md) - Get started in 5 minutes
2. **Understand the Complete Workflow**: [WORKFLOW.md](WORKFLOW.md) - **Comprehensive 1500+ line guide** with:
   - Decision trees for "I need to..." scenarios
   - Command and agent selection matrices
   - Real-world authentication implementation example
   - MCP server integration guide
   - Progressive adoption roadmap
3. **Customize Guidelines**: Edit [CLAUDE.md](CLAUDE.md) for your project specifics
4. **Try a Command**: Run `/commit-push-pr` in Claude Code

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
│   ├── agents/               # Custom agents
│   ├── commands/             # Custom commands
│   ├── rules/                # Auto-enforced guidelines
│   ├── skills/               # Reference knowledge
│   ├── settings.json         # Shared settings
│   └── settings.local.json   # Local overrides (gitignored)
├── .mcp.template.json        # MCP template (committed)
├── .mcp.json                 # MCP config with keys (gitignored, generated)
├── .env.example              # Environment template
├── .env                      # Your secrets (gitignored, generated)
├── setup.js                  # Cross-platform setup wizard
├── CLAUDE.md                 # Team guidelines ⚠️ CUSTOMIZE
├── WORKFLOW.md               # Complete guide
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
