# Claude Code Plugins & Extensions

This directory documents the plugin ecosystem and how to extend the Claude Code template with domain-specific, language-specific, and framework-specific enhancements.

---

## What Are Plugins?

Plugins are packaged collections of agents, skills, rules, and commands that extend Claude Code for specific use cases. They allow you to:

- Add language-specific patterns (Python, Go, Rust, Java, etc.)
- Integrate framework-specific workflows (Django, Rails, Laravel, etc.)
- Support domain-specific tasks (ML, data engineering, mobile, etc.)
- Add tool integrations (Kubernetes, Terraform, Docker, etc.)

---

## Plugin Types

### 1. Language-Specific Skills

**Location**: `.claude/skills/languages/`
**Purpose**: Best practices and patterns for specific programming languages

**Examples:**
- `python-patterns.md` - Python idioms, PEP 8, common patterns
- `go-patterns.md` - Go idioms, error handling, concurrency
- `rust-patterns.md` - Ownership, borrowing, lifetimes, error handling
- `java-patterns.md` - Enterprise Java patterns, Spring conventions

**Structure:**
```markdown
# [Language] Patterns

## Core Language Features
[Language-specific concepts]

## Common Patterns
[Idiomatic patterns with examples]

## Best Practices
[Do's and don'ts]

## Common Mistakes
[What beginners get wrong]
```

---

### 2. Framework Agents

**Location**: `.claude/agents/frameworks/`
**Purpose**: Automated workflows for specific frameworks

**Examples:**
- `django-assistant.md` - Django migrations, admin, views, models
- `rails-assistant.md` - Rails generators, migrations, ActiveRecord
- `laravel-assistant.md` - Laravel artisan commands, Eloquent, migrations
- `nextjs-assistant.md` - Next.js routing, API routes, server components

**Structure:**
```markdown
# [Framework] Assistant

Automate common [Framework] workflows.

## Prerequisites
- [Framework] project initialized
- Dependencies installed

## Capabilities
- Task 1: Description
- Task 2: Description

## Example Usage
"Delegate to [framework]-assistant agent to create a new model"

## Common Workflows
[Step-by-step workflows]
```

---

### 3. Domain-Specific Knowledge

**Location**: `.claude/skills/domains/`
**Purpose**: Patterns and practices for specific domains

**Examples:**
- `ml-workflows.md` - Machine learning best practices
- `data-pipelines.md` - Data engineering patterns
- `mobile-patterns.md` - React Native, Flutter patterns
- `game-dev-patterns.md` - Unity, Unreal Engine patterns
- `blockchain-patterns.md` - Smart contract development
- `embedded-patterns.md` - IoT, embedded systems

**Structure:**
```markdown
# [Domain] Workflows

Best practices for [domain] development.

## Domain Overview
[Key concepts in this domain]

## Common Patterns

### Pattern 1: [Name]
**Use Case**: When to use this pattern
**Implementation**: Code examples
**Trade-offs**: Benefits and limitations

## Tools & Technologies
[Common tools in this domain]

## Resources
[External documentation]
```

---

### 4. Tool Integration Agents

**Location**: `.claude/agents/tools/`
**Purpose**: Integrate with DevOps and infrastructure tools

**Examples:**
- `kubernetes-operator.md` - kubectl operations, deployment, rollback
- `terraform-manager.md` - Terraform plan, apply, destroy workflows
- `docker-optimizer.md` - Docker image optimization, multi-stage builds
- `aws-deployer.md` - AWS deployment workflows
- `github-actions-manager.md` - CI/CD pipeline management

**Structure:**
```markdown
# [Tool] Manager

Automate [Tool] operations with safety checks.

## Prerequisites
- [Tool] installed and configured
- Credentials set up

## Operations
[List of operations this agent can perform]

## Safety Features
[Safeguards against mistakes]

## Example Usage
"Delegate to [tool]-manager agent to [operation]"
```

---

## Creating a Plugin

### Step 1: Determine Plugin Type

Ask yourself:
- **Is it language-specific?** → Skill (`.claude/skills/languages/`)
- **Is it a framework workflow?** → Agent (`.claude/agents/frameworks/`)
- **Is it domain knowledge?** → Skill (`.claude/skills/domains/`)
- **Is it a tool integration?** → Agent (`.claude/agents/tools/`)

### Step 2: Follow the Structure

Use existing files as templates. Match the formatting, documentation style, and level of detail.

**Required Elements:**
- Clear title and one-line description
- Purpose/prerequisites
- Detailed content (patterns, workflows, examples)
- Concrete code examples
- When to use / when NOT to use
- Common mistakes to avoid
- Resources/references

### Step 3: Test Your Plugin

```bash
# 1. Add your plugin files
cp my-plugin/agents/* .claude/agents/
cp my-plugin/skills/* .claude/skills/

# 2. Start Claude Code
claude

# 3. Test your plugin
"Delegate to my-agent agent to [task]"

# 4. Verify it works correctly
```

### Step 4: Document Usage

Create a README for your plugin:

```markdown
# My Plugin for Claude Code

[One-line description]

## Installation

​```bash
# Copy files to your Claude Code directory
cp agents/*.md ~/.claude/agents/
cp skills/*.md ~/.claude/skills/
​```

## Usage

[How to use your plugin]

## Examples

[Concrete usage examples]

## Compatibility

- Claude Code version: v1.0.0+
- Dependencies: [List any required tools]
```

### Step 5: Share Your Plugin

**Option 1: Contribute to Main Template**
- Submit PR to this repository
- Follow [CONTRIBUTING.md](../CONTRIBUTING.md)
- Go through review process

**Option 2: Publish Standalone**
- Create separate GitHub repository
- Link back to this template
- Add to Plugin Marketplace (below)

---

## Plugin Marketplace

Community plugins available for Claude Code:

### Official Plugins (Vetted)

*Coming soon - As community contributions are merged*

### Community Plugins (Unvetted)

*List will be maintained as plugins are published*

**To add your plugin:**
1. Publish plugin on GitHub
2. Submit PR adding entry to this section
3. Include: Name, Description, Author, Link, Last Updated

**Format:**
```markdown
### [Plugin Name]
**Author**: @username
**Description**: One-line description
**Link**: https://github.com/user/repo
**Last Updated**: 2026-01-20
**Claude Code Version**: v1.0.0+
```

---

## Plugin Standards

To ensure quality and compatibility:

### File Naming
- Use `kebab-case.md`
- Be descriptive: `python-django-patterns.md` not `patterns.md`
- Include framework/domain in name

### File Sizes
- **Agents**: 300-400 lines max
- **Skills**: 500-800 lines max
- **Rules**: 300-500 lines max
- **Commands**: 200-400 lines max

### Documentation Requirements
- Clear purpose statement
- Prerequisites listed
- Concrete code examples
- When to use guidance
- Common mistakes section
- Resources/links

### Code Quality
- Examples must be runnable
- Follow language best practices
- Include error handling
- Show both good and bad examples

### Compatibility
- Specify Claude Code version
- List tool dependencies
- Note operating system requirements
- Document breaking changes

---

## Plugin Installation

### Manual Installation

```bash
# 1. Download plugin files
git clone https://github.com/user/plugin-name.git

# 2. Copy to Claude Code directory
cd plugin-name
cp agents/*.md ~/.claude/agents/
cp skills/*.md ~/.claude/skills/
cp rules/*.md ~/.claude/rules/
cp commands/*.md ~/.claude/commands/

# 3. Verify installation
ls ~/.claude/agents/ | grep plugin-name
```

### Package Installation (Future)

```bash
# Future: Package manager for Claude Code plugins
claude plugin install python-django-plugin
claude plugin list
claude plugin update python-django-plugin
```

---

## Plugin Development Best Practices

### Keep Plugins Focused
- ✅ One language/framework/domain per plugin
- ❌ Generic "utilities" plugins
- ✅ Clear, specific purpose
- ❌ Kitchen-sink approach

### Provide Complete Examples
```markdown
## Example Usage

**Task**: Create a Django model with migrations

**Input**:
"Delegate to django-assistant agent to create a User model with email and password fields"

**Agent Actions**:
1. Creates models.py with User model
2. Runs makemigrations
3. Shows migration file
4. Asks for confirmation
5. Runs migrate

**Output**:
```python
# users/models.py
from django.db import models

class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
```
```

### Document Dependencies
```markdown
## Prerequisites

**Required:**
- Django 4.0+
- Python 3.9+
- PostgreSQL database configured

**Optional:**
- Django REST Framework (for API patterns)
- Celery (for async task patterns)
```

### Include Troubleshooting
```markdown
## Troubleshooting

### "Migration already exists"
**Problem**: Django migration file conflicts with existing migrations
**Solution**: Delete conflicting migration and re-run makemigrations

### "Module not found: django"
**Problem**: Django not installed or not in PATH
**Solution**: `pip install django` or activate virtual environment
```

---

## Plugin Categories

### Backend Frameworks
- Django
- Rails
- Laravel
- Express.js
- NestJS
- Spring Boot
- FastAPI
- Gin
- Actix

### Frontend Frameworks
- React
- Vue
- Angular
- Svelte
- Next.js
- Nuxt.js
- Remix

### Mobile Development
- React Native
- Flutter
- Swift/SwiftUI
- Kotlin

### Data & ML
- Data pipelines (Airflow, Prefect)
- ML training (PyTorch, TensorFlow)
- Model deployment (MLflow, KServe)
- Data visualization (Plotly, D3)

### DevOps & Infrastructure
- Kubernetes
- Terraform
- Ansible
- Docker
- AWS/GCP/Azure
- GitHub Actions/GitLab CI

### Game Development
- Unity
- Unreal Engine
- Godot

### Domain-Specific
- Blockchain (Solidity, Web3)
- IoT (Embedded C, MicroPython)
- Scientific Computing (NumPy, SciPy)
- Financial Systems (QuantLib, trading algorithms)

---

## Publishing Your Plugin

### Standalone Repository Structure

```
my-claude-plugin/
├── README.md                    # Plugin documentation
├── agents/                      # Agent files
│   └── my-agent.md
├── skills/                      # Skill files
│   └── my-skill.md
├── rules/                       # Rule files (optional)
│   └── my-rule.md
├── commands/                    # Command files (optional)
│   └── my-command.md
├── examples/                    # Usage examples
│   └── example-session.md
├── tests/                       # Test cases
│   └── test-agent.md
└── CHANGELOG.md                 # Version history
```

### README Template for Plugins

```markdown
# [Plugin Name] for Claude Code

[One-line description of what your plugin does]

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation

​```bash
# Clone this repository
git clone https://github.com/user/plugin-name.git
cd plugin-name

# Copy files to Claude Code directory
cp agents/*.md ~/.claude/agents/
cp skills/*.md ~/.claude/skills/
​```

## Usage

[Basic usage examples]

## Examples

[Detailed usage examples with input/output]

## Compatibility

- **Claude Code**: v1.0.0+
- **Dependencies**: [List tools/languages required]
- **Operating Systems**: [Windows/Mac/Linux]

## Documentation

See [docs/](docs/) for detailed documentation.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[Your chosen license]

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
```

---

## Plugin Versioning

Follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (incompatible with previous versions)
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

**Example:**
```
v1.0.0 - Initial release
v1.1.0 - Added new Django REST Framework patterns
v1.1.1 - Fixed typo in authentication example
v2.0.0 - Breaking: Changed agent delegation syntax
```

---

## Resources

- **Main Template**: [Claude Code Template](https://github.com/user/claude-code-template)
- **Contributing Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Example Plugins**: [examples/](examples/)
- **Plugin Development Guide**: [docs/plugin-development.md](docs/plugin-development.md)

---

## FAQ

### Can I create private plugins?
Yes! Plugins don't need to be public. Keep them in your private repository or local directory.

### How do I update a plugin?
```bash
cd plugin-directory
git pull
cp agents/*.md ~/.claude/agents/
```

### Can plugins conflict with each other?
Yes, if they have files with the same names. Use unique prefixes: `django-auth-agent.md` instead of `auth-agent.md`.

### How do I uninstall a plugin?
```bash
rm ~/.claude/agents/plugin-*
rm ~/.claude/skills/plugin-*
```

### Can I mix multiple plugins?
Yes! Install as many as you need. Be mindful of context usage (see [context-management.md](../.claude/rules/context-management.md)).

---

**Remember**: Plugins should enhance, not complicate. Keep them focused, well-documented, and useful to others!
