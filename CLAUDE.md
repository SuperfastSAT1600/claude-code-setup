# Claude Code Workflow Template

**Setup**: `node setup.cjs` → Follow prompts → Start using

---

## Must-Read First

- **PRD**: `docs/PRD.md` - Architecture, features, workflow patterns
- **Errors**: `.claude/user/errors.md` - Read this before every task

---

## Primary Workflow: Spec-Driven TDD

1. Enter plan mode → discuss approach with user
2. **Write spec** to `.claude/plans/[feature].md` using `.claude/templates/spec.md.template`
3. Spec auto-audited when written (blocks coding tools if spec fails validation)
4. `/tdd` (single agent) or `/parallel-tdd` (multi-agent worktrees)
5. `/checkpoint` → unified verification gate (types, lint, tests, build, security)
6. `/commit-push-pr`

**Enforcement**: A SessionStart hook sets a `.plan-active` flag. All coding tools (Edit, Write, Bash, Task) are BLOCKED until a valid spec is written to `.claude/plans/`. Writing the spec clears the flag and runs `audit-spec.sh` automatically.

**Before coding**: Call `Skill("skill-name")` to load domain patterns. See orchestration.md Skills-First table for which skills match your task type.

**Spec template**: `.claude/templates/spec.md.template`
**REQ format**: Each requirement gets REQ-XXX ID + (TEST)/(BROWSER)/(MANUAL) verification tag

---

## Quick Reference

**Workflow**: Main agent codes standard tasks, delegates to 11 specialized agents for expertise
**Agents (11)**: See `.claude/agents/` for full list and INDEX.md

**Resources**:
- Skills: `.claude/skills/` (react-patterns, rest-api-design, etc.)
- Workflows: `.claude/workflows/`
- Checklists: `.claude/checklists/`
- Templates: `.claude/templates/`
- Scripts: `.claude/scripts/`

---

## Self-Aware System

This setup continuously improves itself. During every task, the system observes its own configuration and proposes fixes, evolutions, and simplifications after completing your work.

- **Execution Protocol**: `.claude/rules/task-protocol.md` (MANDATORY for all agents)
- **Rules**: `.claude/rules/self-improvement.md`
- **User Data**: `.claude/user/` (changelog, errors, custom content)
- **Health Check**: Run `/health-check` for a comprehensive audit
- **Agent count**: 11 specialists

### Mandatory Checkpoints (Every Task)

1. **PRE-TASK**: Identify parallel work opportunities [enforced]
2. **DURING**: Observe `.claude/` issues [passive noting]
3. **POST-TASK**: Auto-heal recurring patterns, report observations [enforced]

This ensures maximum speed through parallelization and continuous system improvement through auto-healing.

---

## How It Works

**Main agent codes directly** for standard tasks (CRUD, simple features, bug fixes).
**Specialists handle** complex domains (auth, databases, performance, security).

Just describe what you want in plain English:

| You say | What happens |
|---------|--------------|
| "Add a user profile page" | Main agent implements directly |
| "I want users to log in with OAuth" | Delegates to auth-specialist |
| "The checkout is broken" | Main agent fixes via quick-fix workflow |
| "Is this code secure?" | Delegates to code-reviewer |
| "Make the page faster" | Delegates to frontend-specialist |

### Main Agent Templates

When creating React code, the main agent uses templates from the `react-patterns` skill:
- `react-patterns/templates/component.tsx.template` - React components with TypeScript
- `react-patterns/templates/form.tsx.template` - Form components with React Hook Form + Zod
- `react-patterns/templates/hook.ts.template` - Custom React hooks with proper cleanup
- `react-patterns/templates/context.tsx.template` - React Context providers with type safety
- `react-patterns/templates/hoc.tsx.template` - Higher-Order Components with ref forwarding

---

## Key Locations

**Your Data** (gitignored):
- `.claude/user/errors.md` - Error log
- `.claude/user/changelog.md` - System improvements
- `.claude/user/agent-errors/` - Subagent errors

**Documentation**:
- `docs/PRD.md` - Product requirements, architecture
- `.claude/rules/` - Mandatory protocols
- `.claude/agents/INDEX.md` - All 11 specialists
- `.claude/skills/` - Domain patterns

**Configuration**:
- `.claude/settings.json` - Shared settings (hooks, MCP)
- `.claude/settings.local.json` - Local overrides (gitignored)

---

## Tech Stack

**Frontend**: {{FRONTEND_STACK}}

**Backend**: {{BACKEND_STACK}}

**Database**: Supabase (PostgreSQL)

**Testing**: {{TESTING_STACK}}

**DevOps**: Docker, GitHub Actions

---

## Project Structure

```
src/
├── app/           # Application pages/routes
├── components/    # Reusable components
├── features/      # Feature modules
├── lib/           # Third-party integrations
├── hooks/         # Custom hooks (if applicable)
├── utils/         # Utility functions
└── types/         # TypeScript types
```

---

## Dependencies

**Approved**: date-fns, zod
<!-- Add your approved dependencies here -->

**Forbidden**: moment.js, full lodash
<!-- Add your forbidden dependencies here -->

---

## Error Log

Error log is now maintained in `.claude/user/errors.md` to preserve it during system updates.

Main agent: append errors there when you make a mistake. Subagents: report errors in your response for the main agent to log.

---

## Updating System

```bash
./.claude/scripts/update-system.sh
```

The script automatically:
- Clones `claude-code-setup` (if needed) to parent directory
- Pulls latest changes from the repository
- Updates system files while preserving your data

**Preserved**: `.claude/user/`, `settings.local.json`, `CLAUDE.md`
**Updated**: agents, skills, rules, commands, workflows, templates

---

**Last Updated**: 2026-02-12
