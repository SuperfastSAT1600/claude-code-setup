# Template Setup Guide

This repository is a ready-to-use template implementing the Boris Cherny workflow for Claude Code. It provides a complete development workflow with custom commands, agents, and documentation.

## What This Template Provides

- **Custom Commands**: `/commit-push-pr`, `/review-changes`, `/test-and-build`, `/security-review`
- **Custom Agents**: Code simplifier, app verification, security reviewer
- **Security Rules**: Mandatory security guidelines (OWASP Top 10, secret detection)
- **Team Guidelines**: CLAUDE.md for project-specific best practices
- **MCP Configuration**: Filesystem server setup
- **Workflow Documentation**: Comprehensive guides and quickstart
- **Pre-configured Settings**: Model selection, permissions, hooks

---

## For New Projects

### Quick Start

1. **Clone or download this template**
   ```bash
   git clone <template-url> my-new-project
   cd my-new-project
   ```

2. **Remove git history** (start fresh)
   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit from template"
   ```

3. **Customize for your project**
   - Update [README.md](README.md) with your project details
   - Edit [CLAUDE.md](CLAUDE.md) with project-specific rules
   - Update tech stack and architecture sections
   - Configure git: `git config user.name "Your Name"`
   - Configure git: `git config user.email "your@email.com"`

4. **Verify setup**
   ```bash
   claude
   # Test: /commit-push-pr --help
   # Test: Read a file to verify MCP works
   ```

---

## For Existing Projects

### Integration Steps

#### 1. Backup Your Project
```bash
git commit -am "Backup before template integration"
git branch backup-$(date +%Y%m%d)
```

#### 2. Copy Template Files

**Method A: Manual Copy** (Recommended for first time)
Copy these files/directories from template to your project:
```
.claude/                  → Your project/.claude/
.mcp.json                 → Your project/.mcp.json (or merge if exists)
CLAUDE.md                 → Your project/CLAUDE.md
WORKFLOW.md              → Your project/WORKFLOW.md
QUICKSTART.md            → Your project/QUICKSTART.md
README_WORKFLOW.md       → Your project/README_WORKFLOW.md
.gitignore               → Merge with existing .gitignore
```

**Method B: Git Merge** (Advanced)
```bash
# In your existing project
git remote add template <template-url>
git fetch template
git merge --allow-unrelated-histories template/main
# Resolve conflicts, keeping your existing critical files
```

#### 3. Handle Conflicts

**If you have existing README.md**:
- Keep your existing README.md
- Add a link to [WORKFLOW.md](WORKFLOW.md) at the top
- Or merge the "Using This Template" section

**If you have existing .claude/ directory**:
- Merge custom commands: copy new `.md` files to `.claude/commands/`
- Merge custom agents: copy new `.md` files to `.claude/agents/`
- Merge settings: manually merge `.claude/settings.json` configurations
- Keep your `.claude/settings.local.json` (don't overwrite)

**If you have existing .mcp.json**:
- Add the filesystem server to your existing mcpServers:
  ```json
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "env": {}
    },
    // ... your existing servers
  }
  ```

**If you have existing .gitignore**:
- Append template .gitignore entries to your existing file
- Remove duplicates

#### 4. Customize CLAUDE.md

Update [CLAUDE.md](CLAUDE.md) with your existing project details:

```markdown
## Tech Stack
- [Your actual tech stack]

## Key Files & Directories
- [Your actual project structure]

## Project-Specific Rules
- [Your existing conventions and patterns]

## Common Mistakes to Avoid
- [Things you've noticed Claude doing wrong in your project]
```

#### 5. Test Integration

**Test MCP**:
```bash
claude
# Ask Claude to read a file from your project
# Verify it can access your project files
```

**Test Custom Commands**:
```bash
# In Claude Code session:
/commit-push-pr --help
/review-changes --help
/test-and-build --help
```

**Test Your Build**:
```bash
# Let Claude run your actual build
# Say: "Run the project's build command"
# Verify it detects your build system (npm/cargo/make/etc)
```

#### 6. Verify Everything Works

Checklist:
- [ ] Claude can read files from your project
- [ ] Custom commands appear when typing `/`
- [ ] Your existing git history is intact
- [ ] Your build system works with `/test-and-build`
- [ ] CLAUDE.md reflects your project specifics
- [ ] Team members can access the workflow docs

---

## Customization Checklist

After applying the template (new or existing project), customize:

### Must Customize
- [ ] Update [README.md](README.md) with your project name and description
- [ ] Fill in [CLAUDE.md](CLAUDE.md) "Tech Stack" section
- [ ] Add your project structure to [CLAUDE.md](CLAUDE.md) "Key Files & Directories"
- [ ] Configure git user.name and user.email
- [ ] Update "Last Updated" date in [CLAUDE.md](CLAUDE.md)

### Should Customize
- [ ] Add project-specific rules to [CLAUDE.md](CLAUDE.md)
- [ ] Document your team's naming conventions
- [ ] Add common mistakes Claude has made
- [ ] List approved/forbidden dependencies
- [ ] Add links to your documentation/design system

### Optional Customization
- [ ] Create custom commands for your workflows
- [ ] Create custom agents for your domain
- [ ] Adjust model selection preferences in `.claude/settings.json`
- [ ] Add project-specific bash permissions
- [ ] Customize hook configurations

---

## Security Best Practices

### Built-in Security Features

This template includes comprehensive security guidelines and tools:

#### Security Rules (`.claude/rules/security.md`)
Mandatory security checks enforced automatically:
- **No Hardcoded Secrets**: API keys, passwords must use environment variables
- **Input Validation**: All user input must be validated and sanitized
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Proper output encoding and sanitization
- **Authentication/Authorization**: Proper checks before operations
- **HTTPS in Production**: Secure transport layer
- **Dependency Security**: Regular vulnerability scanning
- **Rate Limiting**: Prevent brute force attacks
- **Error Handling**: Don't expose internals in error messages
- **Security Logging**: Log security events without sensitive data

#### Security Reviewer Agent
Specialized agent for security audits:
- OWASP Top 10 vulnerability detection
- Static code analysis for security issues
- Hardcoded secret detection
- Dependency vulnerability scanning
- Generates prioritized remediation report

### Running Security Audits

#### Before Every Commit (Security-Critical Code)
```bash
# In Claude Code session
/security-review src/auth/
```

#### Weekly/Monthly Audits
```bash
# Full codebase security scan
/security-review

# Or specific modules
/security-review src/api/
/security-review src/database/
```

#### In CI/CD Pipeline
```yaml
# .github/workflows/security.yml
name: Security Audit
on: [pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Dependency audit
        run: npm audit --audit-level=moderate
      - name: Static analysis
        run: npx eslint . --ext .ts,.tsx
```

### Security Checklist

Before deploying:
- [ ] Ran `/security-review` on security-critical code
- [ ] No hardcoded secrets in codebase
- [ ] All user inputs validated and sanitized
- [ ] Authentication/authorization checks in place
- [ ] HTTPS enforced in production
- [ ] Dependencies scanned for vulnerabilities (`npm audit`)
- [ ] Rate limiting on sensitive endpoints
- [ ] Error messages don't expose internals
- [ ] Security logging configured
- [ ] `.env` file in `.gitignore`

### Common Security Issues to Avoid

#### 1. Hardcoded Secrets
```typescript
// ❌ WRONG: Hardcoded
const apiKey = "sk-1234567890";

// ✅ CORRECT: Environment variable
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY not configured');
```

#### 2. SQL Injection
```typescript
// ❌ WRONG: String concatenation
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ CORRECT: Parameterized query
db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

#### 3. XSS Vulnerabilities
```typescript
// ❌ WRONG: Unsanitized HTML
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ CORRECT: Sanitized or escaped
<div>{escapeHtml(userInput)}</div>
// Or use DOMPurify for HTML content
```

#### 4. Missing Rate Limiting
```typescript
// ❌ WRONG: No rate limit
app.post('/api/login', loginHandler);

// ✅ CORRECT: Rate limited
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
app.post('/api/login', limiter, loginHandler);
```

### Security Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Security Rules**: See `.claude/rules/security.md`
- **Security Agent**: See `.claude/agents/security-reviewer.md`
- **Security Command**: See `.claude/commands/security-review.md`

---

## Troubleshooting

### MCP Not Working
**Symptom**: Claude can't read files or says "permission denied"

**Solution**:
1. Check [.mcp.json](.mcp.json) uses relative path: `"."`
2. Restart Claude Code session
3. Verify npx is installed: `npx --version`
4. Check MCP server logs: `claude --debug`

### Custom Commands Not Showing
**Symptom**: `/` doesn't show custom commands

**Solution**:
1. Verify files exist: `ls .claude/commands/`
2. Check file names end in `.md`
3. Restart Claude Code session
4. Verify settings.json has commands configured

### Git Conflicts After Merge
**Symptom**: Merge created conflicts in critical files

**Solution**:
1. Identify conflict: `git status`
2. For README: Keep yours, add reference to workflow docs
3. For source files: Keep yours (template doesn't include source)
4. For configs: Manually merge, prefer your existing settings
5. Mark resolved: `git add <file>` then `git commit`

### Build Command Not Detected
**Symptom**: `/test-and-build` doesn't find your build

**Solution**:
1. Check [.claude/commands/test-and-build.md](.claude/commands/test-and-build.md) supports your system
2. Tell Claude explicitly: "Use `<your-build-command>` for building"
3. Add your build system to CLAUDE.md

---

## File Structure Reference

```
.
├── .claude/
│   ├── agents/                    # Custom agents
│   │   ├── code-simplifier.md
│   │   ├── security-reviewer.md   # Security audit agent
│   │   └── verify-app.md
│   ├── commands/                  # Custom commands
│   │   ├── commit-push-pr.md
│   │   ├── review-changes.md
│   │   ├── security-review.md     # Security audit command
│   │   └── test-and-build.md
│   ├── rules/                     # Always-follow guidelines
│   │   ├── security.md            # Security best practices
│   │   ├── coding-style.md        # Code style rules
│   │   ├── testing.md             # Testing requirements
│   │   ├── git-workflow.md        # Git conventions
│   │   ├── performance.md         # Performance optimization
│   │   ├── agents.md              # Agent delegation rules
│   │   └── hooks.md               # Hook documentation
│   ├── settings.json              # Shared settings
│   ├── settings.local.json        # Local settings (gitignored)
│   └── SETUP_COMPLETE.md          # Setup documentation
├── .mcp.json                      # MCP server configuration
├── .gitignore                     # Git ignore rules
├── CLAUDE.md                      # Team guidelines ⚠️ CUSTOMIZE THIS
├── WORKFLOW.md                    # Complete workflow guide
├── QUICKSTART.md                  # Quick reference
├── README_WORKFLOW.md             # Workflow summary
├── TEMPLATE_SETUP.md              # This file
└── README.md                      # Project readme ⚠️ CUSTOMIZE THIS
```

---

## Next Steps

After setup:

1. **Read the documentation**:
   - Start with [QUICKSTART.md](QUICKSTART.md) for daily workflow
   - Read [WORKFLOW.md](WORKFLOW.md) for comprehensive guide
   - Review [CLAUDE.md](CLAUDE.md) regularly

2. **Share with your team**:
   - Point them to [QUICKSTART.md](QUICKSTART.md)
   - Update [CLAUDE.md](CLAUDE.md) when patterns emerge
   - Tag `@.claude` in PRs to suggest guideline updates

3. **Customize over time**:
   - Add mistakes to [CLAUDE.md](CLAUDE.md) as they happen
   - Create custom commands for repeated workflows
   - Build custom agents for domain-specific tasks

4. **Keep it updated**:
   - Review [CLAUDE.md](CLAUDE.md) weekly
   - Remove outdated rules as project evolves
   - Update documentation when workflow changes

---

## Support

- **Template Issues**: [Report on template repository]
- **Claude Code Help**: Run `/help` or visit https://claude.com/claude-code
- **Team Questions**: Update [CLAUDE.md](CLAUDE.md) with answers

---

**Template Version**: 1.0
**Last Updated**: 2026-01-19
**Based On**: Boris Cherny Workflow
