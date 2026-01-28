# System Health Changelog

Log of all self-healing, evolution, adaptation, and refactoring actions.

---

<!-- Entries are prepended here by the self-aware system. Format:
## [YYYY-MM-DD] type(scope): description
- **Type**: heal|evolve|adapt|refactor
- **Changed**: file(s)
- **Reason**: why
-->

## [2026-01-28] heal(skills): update documentation for new skill structure
- **Type**: heal
- **Changed**:
  - .claude/skills/INDEX.md (documented new skill structure with SKILL.md + bundled resources)
  - .claude/skills/README.md (added onboarding guide for new format)
  - .claude/health/changelog.md (comprehensive documentation of all 4 phases)
- **Reason**: Complete documentation update for skill system overhaul. INDEX.md now accurately reflects the new SKILL.md structure with YAML frontmatter and bundled resources. README.md provides clear onboarding for the new format. Maintains system health and discoverability.

## [2026-01-28] evolve(skills): add bundled resources to 5 skills
- **Type**: evolve
- **Changed**:
  - dev-server-autoopen/scripts/ (production-ready scripts for 9 frameworks)
  - auth-patterns/references/ (deep-dive references: jwt-deep-dive.md, oauth-flows.md, password-security.md, session-management.md)
  - database-patterns/references/ (deep-dive references: indexing-strategies.md, normalization-guide.md, query-optimization.md, transaction-patterns.md)
  - rest-api-design/references/ (deep-dive references: hypermedia-apis.md, versioning-strategies.md, rate-limiting.md, caching-headers.md)
  - graphql-patterns/references/ (deep-dive references: schema-design.md, n+1-solutions.md, error-handling.md, security-patterns.md)
- **Reason**: Demonstrate full skill capabilities with bundled resources. Dev-server-autoopen now includes production-ready scripts for all major frameworks. Four domain skills include comprehensive deep-dive references for progressive learning. Shows the power of the new skill format beyond just YAML metadata.

## [2026-01-28] refactor(skills): split 4 large skills into lean core + references
- **Type**: refactor
- **Changed**:
  - nodejs-patterns (split into SKILL.md + 7 reference files: layered-architecture.md, error-handling.md, config-management.md, service-patterns.md, middleware-patterns.md, testing-patterns.md, supabase-integration.md)
  - react-patterns (split into SKILL.md + 6 reference files: component-patterns.md, custom-hooks.md, state-management.md, performance-optimization.md, testing-strategies.md, typescript-patterns.md)
  - docker-patterns (split into SKILL.md + 5 reference files: multi-stage-builds.md, optimization.md, orchestration.md, security-hardening.md, ci-cd-integration.md)
  - backend-patterns (split into SKILL.md + 5 reference files: api-design.md, database-operations.md, caching-strategies.md, error-handling.md, testing-strategies.md)
- **Reason**: Improve scannability and reduce token usage. Each skill now has a lean SKILL.md (50-150 lines) with comprehensive patterns, plus detailed references for deep dives. Enables progressive disclosure: agents get quick reference by default, access deep knowledge when needed.

## [2026-01-28] refactor(skills): convert all 20 skills to new skill-creator format
- **Type**: refactor
- **Changed**: All 20 skill files in .claude/skills/ (auth-patterns, backend-patterns, coding-standards, database-patterns, dev-server-autoopen, docker-patterns, documentation-patterns, frontend-patterns, github-actions, graphql-patterns, nextjs-patterns, nodejs-patterns, project-guidelines, prompt-engineering, rag-patterns, react-patterns, rest-api-design, skill-creator, tdd-workflow, user-intent-patterns, websocket-patterns)
- **Reason**: Standardize skill format with YAML frontmatter for validation and tooling support. Enable bundled resources (scripts, references, examples) to be packaged with skills. Improve scannability with consistent structure: frontmatter → core patterns → references. Establishes foundation for skill marketplace and automated validation.

## [2026-01-28] heal(templates): connect component templates to agents
- **Type**: heal
- **Changed**:
  - CLAUDE.md (added Main Agent Templates section)
  - .claude/agents/mobile-specialist.md (added templates section)
  - .claude/agents/docker-specialist.md (removed invalid Dockerfile.template reference)
  - Deleted .claude/agents/_archive/ directory
- **Reason**: Component and form templates existed but were orphaned from agent system. Main agent and mobile-specialist now properly reference variants/react/component.tsx.template and variants/react/form.tsx.template. Removed broken docker-specialist reference to non-existent Dockerfile.template. Cleaned up archived implementer agent per user request.
