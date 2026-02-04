# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- **BREAKING**: Moved all documentation to `.claude/docs/` directory
  - `docs/getting-started/` → `.claude/docs/getting-started/`
  - `docs/guides/` → `.claude/docs/guides/`
  - System documentation → `.claude/docs/system/`
  - All documentation now travels with `.claude/` folder
  - Prevents conflicts with user project `docs/` folders
- Updated all references in README.md and README.ko.md to point to `.claude/docs/`

### Previous Changes (from earlier unreleased work)
- Documentation organization with `docs/` directory structure (now moved to `.claude/docs/`)
- `docs/README.md` as documentation index (now `.claude/docs/README.md`)
- `.claude/templates/.env.example` with application-only variables
- Clear distinction between `.env` (app runtime) and `.mcp.json` (Claude tooling)
- **BREAKING**: Moved `.mcp.template.json` to `.claude/templates/mcp.template.json`
- **BREAKING**: Moved `.env.example` to `.claude/templates/.env.example`
- Supabase MCP configuration to use cloud-hosted MCP server
  - Updated from localhost (`http://localhost:54321/mcp`) to cloud (`https://mcp.supabase.com/mcp?project_ref=XXX`)
  - Simplified authentication flow (no local server required)
- `lib/mcp.cjs` to auto-configure Supabase MCP URL with project reference
- `lib/env.cjs` to use new template location
- `lib/supabase.cjs` to reflect new cloud MCP workflow

### Removed
- MCP server API key configurations from `.env.example` (moved to `.mcp.json`)
- Root-level documentation files (moved to `docs/`)

### Fixed
- Updated all internal documentation links to reflect new `docs/` structure
- Corrected `.gitignore` comments to reference new template locations

---

## [1.0.0] - 2026-02-03

### Added
- Initial release of Claude Code workflow template
- 33 specialized agents for different development tasks
- 20 custom commands for common workflows
- 5 orchestrated workflow sequences
- 13 review checklists
- 16 code templates (generic, React, Next.js)
- 20+ skill reference files
- Cross-platform setup wizard (`setup.cjs`)
- Automatic tech stack detection
- MCP server configuration (27 pre-configured servers)
- Slack integration for PR notifications
- Supabase integration for database operations
- GitHub integration for repository management

### Features
- Hybrid agent model (main agent codes, specialists handle complex domains)
- Parallel agent orchestration
- Self-improvement system with error logging
- Auto-healing for recurring patterns
- Aggressive skill usage protocol
- Documentation update enforcement

---

## Migration Guide

### From Pre-1.2.0 to 1.2.0+ (Current)

If you're upgrading from an earlier version, follow these steps:

1. **Move Documentation to .claude/docs/:**
   ```bash
   mkdir -p .claude/docs/getting-started .claude/docs/guides .claude/docs/system

   # Move user-facing docs
   mv docs/getting-started/* .claude/docs/getting-started/
   mv docs/guides/* .claude/docs/guides/

   # Move system docs (if they exist in old location)
   mv .claude/docs/*.md .claude/docs/system/ 2>/dev/null || true

   # Remove old docs folder
   rm -rf docs/
   ```

2. **Update any custom scripts or references:**
   - Replace `docs/getting-started` with `.claude/docs/getting-started`
   - Replace `docs/guides` with `.claude/docs/guides`

### From Pre-1.1.0 to 1.1.0+

If you're upgrading from an earlier version, follow these steps:

1. **Move MCP Template:**
   ```bash
   mkdir -p .claude/templates
   mv .mcp.template.json .claude/templates/mcp.template.json
   ```

2. **Move Environment Template:**
   ```bash
   mv .env.example .claude/templates/.env.example
   ```

3. **Move Documentation to docs/ (now superseded by 1.2.0):**
   ```bash
   mkdir -p docs/getting-started docs/guides
   mv INTEGRATION.md docs/getting-started/
   mv INTEGRATION.ko.md docs/getting-started/
   mv WORKFLOW.md docs/guides/
   mv WORKFLOW.ko.md docs/guides/
   ```

   **Note**: As of 1.2.0, documentation has moved again to `.claude/docs/`. See migration guide above.

4. **Update Supabase MCP Configuration:**
   - Edit `.mcp.json`
   - Find the `supabase` entry
   - Update to:
     ```json
     "supabase": {
       "type": "http",
       "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF",
       "disabled": false
     }
     ```

5. **Re-authenticate Supabase MCP:**
   ```bash
   claude /mcp
   # Select "supabase" → "Authenticate"
   ```

---

**Note**: This changelog tracks system-level changes to the template infrastructure. For project-specific changes, maintain a separate changelog in your project.
