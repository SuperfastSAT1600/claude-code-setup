# System Health Changelog

Log of all self-healing, evolution, adaptation, and refactoring actions.

---

<!-- Entries are prepended here by the self-aware system. Format:
## [YYYY-MM-DD] type(scope): description
- **Type**: heal|evolve|adapt|refactor
- **Changed**: file(s)
- **Reason**: why
-->

## [2026-01-28] heal(templates): connect component templates to agents
- **Type**: heal
- **Changed**:
  - CLAUDE.md (added Main Agent Templates section)
  - .claude/agents/mobile-specialist.md (added templates section)
  - .claude/agents/docker-specialist.md (removed invalid Dockerfile.template reference)
  - Deleted .claude/agents/_archive/ directory
- **Reason**: Component and form templates existed but were orphaned from agent system. Main agent and mobile-specialist now properly reference variants/react/component.tsx.template and variants/react/form.tsx.template. Removed broken docker-specialist reference to non-existent Dockerfile.template. Cleaned up archived implementer agent per user request.
