# Product Requirements Document (PRD)

## Claude Code Workflow Template

**Version**: 1.0
**Last Updated**: 2026-02-09
**Status**: Active

---

## 1. Overview

Claude Code Workflow Template is a ready-to-use development workflow system for Claude Code. It provides a hybrid coding architecture where the main agent handles standard tasks directly (CRUD, simple features, bug fixes) and delegates to specialized agents for complex domains (auth, databases, performance, security).

### Core Value Proposition

- Reduce context-switching by embedding domain expertise into reusable agents, skills, and templates
- Enforce quality standards automatically through rules, hooks, and checklists
- Accelerate development with parallel orchestration of specialist agents
- Maintain institutional knowledge through self-improving error logging and pattern detection

---

## 2. Target Users

| User Type | Use Case |
|-----------|----------|
| Solo developers | Full workflow automation with Claude Code |
| Development teams | Shared standards, consistent code quality, knowledge base |
| New projects | Complete starting template with all configurations ready |
| Existing projects | Non-disruptive integration into current setup |

---

## 3. System Architecture

### 3.1 Hybrid Agent Model

The system follows a **main-agent-as-orchestrator** pattern:

- **Main agent** codes directly for standard tasks and orchestrates specialists
- **10 specialist agents** handle complex domains (auth, database, security, etc.)
- **Parallel-first orchestration** maximizes throughput by launching independent agents simultaneously

### 3.2 Knowledge Layers

```
Rules (mandatory)        → Coding standards, task protocol, orchestration
Skills (reference)       → Domain patterns (auth, API, React, Node.js, etc.)
Templates (scaffolding)  → Code generation for components, services, tests
Checklists (quality)     → Pre-release, security audit, PR review
Commands (shortcuts)     → /health-check, /commit, /review-changes, etc.
Workflows (multi-step)   → Full feature, bug fix, release, refactor
```

### 3.3 Self-Improvement Loop

The system continuously improves through:
1. **Error logging** - All failures are logged with category and correction
2. **Pattern detection** - 2+ similar errors trigger auto-healing
3. **Root cause fixing** - Obvious single-error causes are fixed immediately
4. **Proactive enhancement** - Repeated patterns become new skills/templates

---

## 4. Core Features

### 4.1 Specialist Agents (10)

| Category | Agents |
|----------|--------|
| Planning & Architecture | architect |
| Code Quality | code-reviewer |
| Testing | test-writer |
| Backend & Data | backend-specialist, auth-specialist |
| Frontend | frontend-specialist |
| Real-time & AI | realtime-specialist |
| Operations | devops-specialist |
| Mobile | mobile-specialist |
| Documentation | doc-updater |

### 4.2 Skills Library (20+)

Domain-specific pattern references that agents and the main agent consult before coding:

- **Backend**: auth-patterns, backend-patterns, nodejs-patterns, database-patterns
- **Frontend**: react-patterns, frontend-patterns, nextjs-patterns
- **API**: rest-api-design, graphql-patterns, websocket-patterns
- **DevOps**: docker-patterns, github-actions
- **AI/ML**: prompt-engineering, rag-patterns
- **Process**: tdd-workflow, documentation-patterns, coding-standards, user-intent-patterns
- **Meta**: skill-creator, project-guidelines

### 4.3 Setup Wizard

Cross-platform interactive setup (`node setup.cjs`) that:
- Detects platform (Windows/macOS/Linux) and configures MCP servers
- Collects API keys for MCP integrations (Slack, GitHub, Supabase, Cloudflare, etc.)
- Creates `.env` and `.mcp.json` from templates
- Installs project dependencies

### 4.4 MCP Server Integrations

| Server | Purpose |
|--------|---------|
| Slack | PR notifications, team communication |
| GitHub | Repository operations, PR management |
| Filesystem | File operations outside sandbox |
| Render | Cloud deployment and hosting |
| Cloudflare Workers | Edge computing, builds, observability |
| Context7 | Library documentation lookup |
| Magic UI | UI component discovery |
| Memory | Cross-session knowledge persistence |
| Supabase | Database, auth, storage, real-time |

### 4.5 Automated Quality Enforcement

- **Rules** (`coding-standards.md`, `task-protocol.md`, `orchestration.md`): Mandatory protocols loaded into every agent context
- **Hooks**: Pre-commit checks, security review logging, error verification
- **Checklists**: 13 structured review checklists for PRs, security, accessibility, deployment, etc.

### 4.6 Code Templates

Templates for rapid scaffolding:
- **React**: component, form, hook, context, HOC
- **Next.js**: API route
- **Generic**: service, middleware, guard, error-handler, migration, test spec, PR description

---

## 5. Setup & Configuration

### 5.1 Library Dependencies

| Package | Purpose |
|---------|---------|
| enquirer | Interactive CLI prompts for setup wizard |
| typescript | Type checking |
| eslint | Code linting |
| prettier | Code formatting |

### 5.2 Setup Modules (`lib/`)

| Module | Responsibility |
|--------|----------------|
| `claude-code.cjs` | Claude Code CLI detection and configuration |
| `claude-md.cjs` | CLAUDE.md file generation and management |
| `config.cjs` | Configuration loading and merging |
| `dependencies.cjs` | Dependency installation orchestration |
| `env.cjs` | Environment variable and .env management |
| `files.cjs` | File system operations for setup |
| `github.cjs` | GitHub integration setup |
| `input.cjs` | User input collection |
| `localhost.cjs` | Local development server configuration |
| `mcp.cjs` | MCP server configuration |
| `platform.cjs` | Platform detection (Win/Mac/Linux) |
| `prerequisites.cjs` | System prerequisite checking |
| `supabase.cjs` | Supabase project setup |
| `summary.cjs` | Setup summary display |
| `techstack.cjs` | Tech stack detection and configuration |
| `ui.cjs` | Terminal UI helpers |
| `vercel.cjs` | Vercel deployment setup |

---

## 6. Workflow Patterns

### 6.1 Task Execution Protocol

Every task follows a mandatory 4-phase protocol:

1. **INIT**: Read error logs, check relevant skills, read PRD for core features
2. **PRE-TASK**: Analyze parallelization opportunities
3. **DURING**: Execute with immediate error logging (blocking requirement)
4. **POST-TASK**: Report observations, auto-heal, verify docs updated

### 6.2 Orchestration Patterns

| Pattern | Description |
|---------|-------------|
| Quality Gates | code-reviewer + frontend-specialist (parallel) |
| Multi-Domain Research | Explore agents across auth + database + API + frontend (parallel) |
| Test Pyramid | test-writer (handles unit + integration + E2E) |
| Feature Development | specialist agents + main agent coding (parallel) |
| Sequential | planning -> implementation -> testing (ordered) |

---

## 7. Non-Functional Requirements

### 7.1 Security

- No hardcoded secrets; all credentials via environment variables
- Input validation on all system boundaries
- Parameterized queries only (no string interpolation for SQL)
- JWT with short expiry, httpOnly cookies
- Rate limiting on auth endpoints

### 7.2 Quality Standards

- Minimum 80% test coverage (90%+ for business logic)
- Files under 300 lines, functions under 50 lines
- No `any` types in TypeScript
- Conventional commit messages
- PR size under 400 lines changed

### 7.3 Cross-Platform

- Windows (MINGW64/Git Bash), macOS, Linux support
- Platform-specific MCP server paths handled by setup wizard
- Shell scripts invoke through bash for compatibility

### 7.4 Cloud Session Compatibility

Cloud sessions (e.g., Claude Code on the web) differ from local CLI sessions:

| Capability | Local CLI | Cloud Session |
|-----------|-----------|---------------|
| tmux | Available | Not available |
| `claude` CLI (separate process) | Available | Not available |
| Git worktrees (manual) | Available | Not available |
| Agent tool with `isolation: "worktree"` | Available | Available |
| Subagent orchestration (Task/Agent) | Available | Available |
| MCP servers | Configured locally | May not be available |
| Hooks (PreToolUse, PostToolUse) | Available | Available |

**Parallel TDD in Cloud Sessions**:
- The `launch-parallel-tdd.sh` hook auto-detects the environment
- When tmux/claude CLI are unavailable, it outputs instructions for subagent worktree orchestration
- The `/parallel-tdd` command documents both local and cloud workflows
- Each subagent uses `isolation: "worktree"` for branch-level isolation
- Main agent works on shared code while subagents implement REQs in parallel
- After completion, branches are merged via `merge-parallel.sh`

**What works in both modes**:
- Spec-driven planning with REQ-XXX IDs
- Spec audit enforcement (`enforce-plan-spec.sh`)
- Traceability validation (`verify-traceability.sh`)
- Test-ladder progressive escalation
- All hooks and quality gates

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Agent task completion rate | > 95% without manual intervention |
| Error pattern detection | Auto-heal within 2 occurrences |
| Skill coverage | All common development domains covered |
| Setup wizard completion | Works on all 3 platforms without errors |
| Self-improvement cap | Max 5 system changes per session |

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Agent** | A specialist subagent with domain expertise, defined in `.claude/agents/` |
| **Skill** | A reusable reference document with domain patterns, in `.claude/skills/` |
| **Command** | A user-invocable shortcut (e.g., `/health-check`), in `.claude/commands/` |
| **Workflow** | A multi-step orchestrated process (e.g., full-feature), in `.claude/workflows/` |
| **Rule** | A mandatory protocol loaded into agent context, in `.claude/rules/` |
| **Hook** | A shell command that executes in response to tool events |
| **MCP** | Model Context Protocol - server integrations for external services |
| **Auto-heal** | Automatic fix applied when error patterns are detected (2+ occurrences) |
