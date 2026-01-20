# Contributing to Claude Code Template

Thank you for considering contributing! This template is designed to help teams adopt Claude Code with production-ready configurations. Community contributions make it better for everyone.

---

## What We're Looking For

### ✅ Highly Welcome Contributions

**Language-Specific Skills**
- Python patterns (Django, FastAPI, Flask)
- Go patterns (Gin, Echo, standard library)
- Rust patterns (Axum, Actix, Rocket)
- Java/Kotlin patterns (Spring Boot, Ktor)
- Ruby patterns (Rails, Sinatra)

**Framework-Specific Configurations**
- Django agents and commands
- Ruby on Rails workflow patterns
- Laravel patterns
- NestJS patterns
- Svelte/SvelteKit patterns

**DevOps & Infrastructure**
- Kubernetes agents (deployment, rollback, monitoring)
- Terraform agents (plan, apply, destroy workflows)
- Docker optimization patterns
- AWS/GCP/Azure specific agents
- CI/CD pipeline patterns

**Domain-Specific Knowledge**
- Machine Learning workflows (model training, deployment)
- Data Engineering patterns (ETL, data pipelines)
- Mobile development (React Native, Flutter)
- Game development patterns (Unity, Unreal)
- Embedded systems patterns

**Developer Experience Improvements**
- Better hooks for code quality
- More efficient pre-approved operations
- Improved agent delegation patterns
- Enhanced MCP server configurations
- Better documentation examples

**Bug Fixes**
- Broken examples or outdated patterns
- Configuration errors
- Documentation typos or unclear instructions
- Hook performance issues

### ❌ Please Avoid

**Opinionated Style Preferences**
- Personal coding style preferences without team consensus
- Framework wars or "my way is better" arguments
- Use CLAUDE.md for project-specific preferences instead

**Project-Specific Configurations**
- Hardcoded API keys or credentials
- Configurations specific to one company's internal tools
- Very niche tools used by <100 developers worldwide

**Overly Complex Abstractions**
- Meta-agents that manage other agents
- Hooks that generate hooks
- Keep it simple and maintainable

---

## How to Contribute

### 1. Fork & Branch

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/claude-code-template.git
cd claude-code-template
git checkout -b feature/my-contribution
```

### 2. Make Your Changes

Follow the existing file structure and documentation style:

#### For Agents (`.claude/agents/`)
- **Purpose**: Single, focused task
- **Length**: 300-400 lines max
- **Structure**: Purpose → Prerequisites → Instructions → Examples

Example:
```markdown
# Django Migration Agent

Automate Django database migrations with safety checks.

## Prerequisites
- Django project with manage.py
- Database configured
- Migrations directory exists

## Instructions
[Detailed step-by-step instructions]

## Example Usage
"Delegate to django-migration agent to create and apply migrations"
```

#### For Skills (`.claude/skills/`)
- **Purpose**: Reusable knowledge and patterns
- **Length**: 500-800 lines max
- **Structure**: Concepts → Patterns → Examples → Trade-offs

Example:
```markdown
# Python Django Patterns

Best practices for Django development.

## Core Concepts
[Explain fundamental ideas]

## Common Patterns

### Pattern 1: Class-Based Views
**When to use**: Complex view logic with multiple HTTP methods
[Implementation with code examples]

**Benefits**: Reusability, DRY principle
**Trade-offs**: More complex than function views
```

#### For Rules (`.claude/rules/`)
- **Purpose**: Always-enforce guidelines
- **Length**: 300-500 lines max
- **Structure**: Rule statement → Why → Examples (do/don't) → Checklist

Example:
```markdown
# Python-Specific Rules

## 1. Type Hints

**Rule**: Always use type hints for function signatures.

**Why**: Improves code clarity and catches errors early.

**Examples**:
```python
# ✅ CORRECT
def calculate_total(items: List[Item]) -> float:
    return sum(item.price for item in items)

# ❌ WRONG
def calculate_total(items):
    return sum(item.price for item in items)
```

#### For Commands (`.claude/commands/`)
- **Purpose**: User-triggered workflows
- **Length**: 200-400 lines max
- **Structure**: Usage → What it does → Examples → Related commands

---

### 3. Test Your Changes

Before submitting:

**Test Agents Work Correctly**
```
1. Start Claude Code session
2. Delegate to your agent: "Delegate to [agent-name] agent to [task]"
3. Verify agent completes task successfully
4. Check output quality
```

**Test Commands Execute Successfully**
```
1. Start Claude Code session
2. Run command: /your-command
3. Verify command completes without errors
4. Check expected behavior
```

**Verify Documentation Renders Properly**
- Check markdown formatting is correct
- Ensure code blocks have proper language tags
- Verify links work (if any)
- Check for typos and grammar

**Validate File Sizes**
```bash
# Check file line counts
wc -l .claude/agents/your-agent.md     # Should be <400
wc -l .claude/skills/your-skill.md     # Should be <800
wc -l .claude/rules/your-rule.md       # Should be <500
wc -l .claude/commands/your-command.md # Should be <400
```

---

### 4. Submit Pull Request

**PR Title Format:**
```
[Type]: Brief description

Examples:
feat: add Django migration agent
fix: correct TypeScript patterns in coding-standards.md
docs: improve hook examples in hooks.md
chore: update dependencies
```

**PR Description Template:**
```markdown
## What This Changes
Brief description of what you're adding/fixing.

## Why This is Useful
Explain the value this provides to users.

## How I Tested It
- [ ] Tested agent executes correctly
- [ ] Verified command works
- [ ] Checked documentation renders properly
- [ ] Validated file sizes are within limits
- [ ] Ran existing examples to ensure no breakage

## Screenshots/Examples (if applicable)
[Add examples of your contribution in action]

## Related Issues
Closes #[issue-number] (if applicable)
```

---

## File Structure Guidelines

### Agents

**Location**: `.claude/agents/`
**Naming**: `kebab-case.md` (e.g., `django-migration.md`)

**Required Sections:**
1. Title and one-line description
2. Prerequisites (tools, environment, dependencies)
3. Detailed instructions
4. Example usage
5. Expected output
6. Troubleshooting (common issues)

### Skills

**Location**: `.claude/skills/`
**Naming**: `kebab-case.md` (e.g., `python-django-patterns.md`)

**Required Sections:**
1. Title and description
2. Core concepts
3. Pattern catalog (multiple patterns with examples)
4. Best practices
5. Common mistakes
6. Resources/references

### Rules

**Location**: `.claude/rules/`
**Naming**: `kebab-case.md` (e.g., `python-style.md`)

**Required Sections:**
1. Title and purpose
2. Numbered rules (each with: rule → why → examples → exceptions)
3. Checklist at end
4. Related rules
5. Resources

### Commands

**Location**: `.claude/commands/`
**Naming**: `kebab-case.md` (e.g., `django-test.md`)

**Required Sections:**
1. Title
2. Usage syntax
3. What this command does
4. Example session (input/output)
5. When to use
6. Related commands

---

## Documentation Style Guide

### Markdown Formatting

**Headers:**
```markdown
# H1 - File title only
## H2 - Major sections
### H3 - Subsections
```

**Code Blocks:**
Always specify language:
```markdown
​```typescript
// TypeScript code
​```

​```python
# Python code
​```

​```bash
# Shell commands
​```
```

**Do/Don't Examples:**
```markdown
// ✅ CORRECT: Description
[good example code]

// ❌ WRONG: Description
[bad example code]
```

**Lists:**
- Use `-` for unordered lists
- Use `1.` for ordered lists
- Use `[ ]` for checkboxes

### Writing Tone

- **Be Clear**: Use simple, direct language
- **Be Specific**: Avoid vague terms like "better" or "good"
- **Be Concise**: Respect the reader's time
- **Be Practical**: Include real-world examples
- **Be Objective**: Focus on facts, not opinions

**Good:**
> "Use type hints for all function signatures to catch type errors early and improve code documentation."

**Bad:**
> "Type hints are amazing and you should definitely use them because they make code way better."

---

## Code of Conduct

### Be Respectful
- Respect different perspectives and approaches
- Provide constructive feedback
- Assume good intentions
- Help others learn

### Be Collaborative
- Review others' PRs thoughtfully
- Respond to feedback promptly
- Ask questions when unclear
- Share knowledge openly

### Be Professional
- Keep discussions on-topic
- Avoid off-topic debates
- Be patient with newcomers
- Focus on improving the template

---

## Development Setup

### Prerequisites
```bash
# Required
- Git
- Text editor (VS Code recommended)
- Claude Code CLI installed

# Optional (for testing)
- Node.js (if contributing JS/TS patterns)
- Python (if contributing Python patterns)
- Docker (if contributing Docker patterns)
```

### Local Testing
```bash
# 1. Make your changes
vim .claude/agents/my-agent.md

# 2. Start Claude Code to test
claude

# 3. Test your contribution
"Delegate to my-agent agent to [task]"

# 4. Verify it works as expected
```

---

## Review Process

### What Reviewers Look For

**Correctness:**
- Does the agent/command work as described?
- Are examples accurate and runnable?
- Is the documentation clear and complete?

**Style Consistency:**
- Does it match existing file structure?
- Is markdown formatting correct?
- Are examples formatted consistently?

**Value:**
- Is this useful to other developers?
- Does it solve a real problem?
- Is it better than existing solutions?

**Maintainability:**
- Is the code/config simple and understandable?
- Are file sizes within limits?
- Is it well-documented?

### Timeline
- **Initial Review**: Within 3-5 days
- **Follow-up**: Ongoing until approved
- **Merge**: When all feedback addressed and approved

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned in documentation (where appropriate)

---

## Questions?

- **General Questions**: Open a discussion on GitHub
- **Bug Reports**: Open an issue with reproduction steps
- **Feature Requests**: Open an issue with use case details
- **Security Issues**: Email privately (see SECURITY.md)

---

## Quick Contribution Checklist

Before submitting:
- [ ] Forked and branched from main
- [ ] Followed file structure guidelines
- [ ] Matched documentation style
- [ ] Tested changes work correctly
- [ ] File sizes within limits
- [ ] No sensitive data included
- [ ] Clear PR title and description
- [ ] Examples included and working
- [ ] Documentation is clear

---

## Examples of Good Contributions

### Example 1: Adding a New Skill

**Contribution**: `python-fastapi-patterns.md`
**Why Good**:
- Fills gap (no FastAPI patterns existed)
- Well-structured with clear patterns
- Concrete code examples
- Explains when to use each pattern
- Lists trade-offs honestly
- Within 600 lines (target for skills)

### Example 2: Improving Documentation

**Contribution**: Better examples in `hooks.md`
**Why Good**:
- Identified unclear section
- Added 3 real-world examples
- Showed input and output
- Explained why examples work
- Small, focused improvement

### Example 3: Bug Fix

**Contribution**: Fixed broken agent delegation syntax
**Why Good**:
- Identified real bug
- Provided clear reproduction steps
- Fixed root cause
- Added test to prevent regression
- Updated documentation

---

Thank you for contributing to Claude Code Template! Your improvements help developers worldwide build better software faster.
