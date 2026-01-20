# Archived Documentation

This directory contains legacy documentation files that have been superseded by the new comprehensive [WORKFLOW.md](../WORKFLOW.md).

## Archived Files

### `README_WORKFLOW.md` (185 lines)
**Archived**: 2026-01-20
**Reason**: Content merged into comprehensive WORKFLOW.md
**Replaced By**: [WORKFLOW.md](../WORKFLOW.md) Section 1 (Philosophy) and Section 2 (Decision Trees)

This file provided a high-level workflow overview but lacked:
- Decision trees for command/agent selection
- Real-world implementation examples
- MCP server integration guide
- Progressive adoption roadmap

All valuable content has been incorporated into the new unified WORKFLOW.md.

### `TEMPLATE_SETUP.md` (437 lines)
**Archived**: 2026-01-20
**Reason**: Content merged into comprehensive WORKFLOW.md
**Replaced By**: [WORKFLOW.md](../WORKFLOW.md) Section 7 (Customization Roadmap) and [QUICKSTART.md](../QUICKSTART.md)

This file provided template setup instructions but was:
- Redundant with QUICKSTART.md
- Missing progressive adoption guidance
- Not integrated with the enhanced philosophy

Setup instructions now in QUICKSTART.md (5-minute start) and detailed customization in WORKFLOW.md Section 7 (Week 1 → Month 1 → Ongoing).

## Why Archive Instead of Delete?

These files contain historical context and may be useful for:
1. Understanding the evolution of the template
2. Recovering specific examples or patterns if needed
3. Comparing old vs new documentation approaches
4. Rolling back if issues are discovered with new WORKFLOW.md

## Current Documentation Structure

**Primary Documents** (Read in this order):
1. **[QUICKSTART.md](../QUICKSTART.md)** (394 lines) - Get started in 5 minutes
2. **[WORKFLOW.md](../WORKFLOW.md)** (1515 lines) - Comprehensive workflow guide with:
   - Enhanced philosophy (Boris Cherny + Everything-Claude-Code + Our Unique Integration)
   - Decision trees for "I need to..." scenarios
   - Command/agent selection matrices
   - Real-world authentication implementation example
   - MCP server integration guide
   - Agent orchestration patterns
   - Performance optimization strategies
   - Progressive adoption roadmap (Week 1 → Month 1 → Ongoing)
   - Team collaboration workflows
   - Troubleshooting guide
   - Advanced topics (hooks, environments, pre-approved operations)
3. **[CLAUDE.md](../CLAUDE.md)** (513 lines) - Team knowledge base (customize for your project)

**Supporting Documents**:
- **[README.md](../README.md)** - Project introduction and overview
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Community contribution guide
- **[plugins/README.md](../plugins/README.md)** - Plugin ecosystem documentation

## Migration Notes

If you were following README_WORKFLOW.md or TEMPLATE_SETUP.md:

### From README_WORKFLOW.md → WORKFLOW.md
- High-level philosophy → WORKFLOW.md Section 1
- Feature matrix → WORKFLOW.md Sections 2-4
- Integration strategy → WORKFLOW.md Sections 5-7

### From TEMPLATE_SETUP.md → QUICKSTART.md + WORKFLOW.md
- Initial setup → QUICKSTART.md Step 1-5
- Customization checklist → WORKFLOW.md Section 7
- Environment configs → WORKFLOW.md Section 10

## Restoration

If you need to restore these files:
```bash
cp .archive/README_WORKFLOW.md ./
cp .archive/TEMPLATE_SETUP.md ./
```

However, we recommend using the new comprehensive WORKFLOW.md instead, as it contains all the same information plus:
- 3x more examples
- Decision trees and selection matrices
- Real-world implementation walkthroughs
- MCP integration guide
- Progressive adoption timeline

---

**Archive Created**: 2026-01-20
**Last Updated**: 2026-01-20
