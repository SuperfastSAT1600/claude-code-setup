# Resource Usage Rules

Mandatory protocols for MCPs, APIs, and plugins.

---

## Context7
- Always query before using unfamiliar APIs (resolve-library-id → query-docs, max 3 calls)
- Check for version-specific API changes when upgrading

## Magic UI
- Always check before building common UI patterns (getUIComponents)
- Check specialized catalogs (animations, effects, buttons, backgrounds) before custom code

## Memory
- Store architectural decisions (create_entities type="decision")
- Search for similar patterns before solving problems (search_nodes)
- Store user preferences and coding style for cross-session consistency

## Render
- Check logs and metrics before debugging production (list_logs, get_metrics)
- Validate workspace selection before creating resources (get_selected_workspace)

## Filesystem MCP
- Use read_multiple_files for batch reads (not sequential Read calls)
- Use directory_tree for structure, search_files for patterns

## Playwright
- **MCP** (MANDATORY during UI dev): After implementing any UI change, navigate to localhost and take a screenshot to verify visually — do not skip this step
- **MCP**: Also use for accessibility checks, layout debugging, and interactive inspection during development
- **CLI** (`npx playwright test`): Use for running E2E suites in checkpoint, CI, and batch validation
- Always prefer CLI for repeatable test execution (checkpoint.sh, req-coverage.sh)
- For (BROWSER) REQs: write a Playwright test file for req-coverage.sh, use MCP for spot-checks during dev

---

## Priority Order
1. Check Memory for past patterns
2. Query Context7 for library docs
3. Check Magic UI for components
4. Write custom code as last resort
