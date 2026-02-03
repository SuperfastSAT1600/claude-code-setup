# Resource Usage Rules

Mandatory protocols for MCPs, APIs, and plugins.

---

## Context7
- Always query Context7 before using unfamiliar APIs (`resolve-library-id` → `query-docs`, max 3 calls)
- Check Context7 for version-specific API changes when upgrading libraries

## Magic UI
- Always check Magic UI before building common UI patterns (`getUIComponents`)
- Check specialized catalogs for animations, effects, buttons, backgrounds before custom code

## Memory
- Store architectural decisions in Memory (`create_entities` type="decision")
- Search Memory for similar patterns before solving problems (`search_nodes`)
- Store user preferences and coding style decisions for cross-session consistency

## Render
- Check logs and metrics before debugging production issues (`list_logs`, `get_metrics`)
- Validate workspace selection before creating resources (`get_selected_workspace`)

## Filesystem MCP
- Use `read_multiple_files` for batch reads instead of sequential Read calls
- Use `directory_tree` for structure overview, `search_files` for pattern matching

---

## Priority Order
1. Check Memory for past patterns
2. Query Context7 for library docs
3. Check Magic UI for component matches
4. Write custom code as last resort
