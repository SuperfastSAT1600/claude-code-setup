# Templates Directory

Cross-cutting templates that aren't owned by a specific skill. Domain-specific templates now live with their skills.

---

## Cross-Cutting Templates (This Directory)

| Template | Purpose | Usage |
|----------|---------|-------|
| `spec.md.template` | Full-featured spec (default) | General features |
| `spec-api.md.template` | API endpoint spec (lighter) | REST endpoints |
| `spec-bugfix.md.template` | Bug fix spec (lighter) | Bug investigations |
| `spec-ui.md.template` | UI component spec (lighter) | Components/pages |
| `pr-description.md.template` | Pull request description | PR creation |
| `api-documentation.md` | API reference documentation | Documenting APIs |
| `.env.example` | Environment variable template | Project setup |
| `mcp.template.json` | MCP server configuration | MCP setup |

---

## Skill-Owned Templates

Domain-specific templates live with their owning skill. Load the skill to access its templates.

| Skill | Templates | Load With |
|-------|-----------|-----------|
| **react-patterns** | component.tsx, form.tsx, hook.ts, react-hook.ts, context.tsx, hoc.tsx | `Skill("react-patterns")` |
| **backend-patterns** | service.ts, error-handler.ts, middleware.ts | `Skill("backend-patterns")` |
| **auth-patterns** | guard.ts | `Skill("auth-patterns")` |
| **database-patterns** | migration.sql | `Skill("database-patterns")` |
| **tdd-workflow** | test.spec.ts | `Skill("tdd-workflow")` |
| **github-actions** | github-workflow.yml | `Skill("github-actions")` |
| **nextjs-patterns** | api-route.ts | `Skill("nextjs-patterns")` |

---

## Placeholder Syntax

Templates use the following placeholder format:

```
{{PLACEHOLDER_NAME}}
```

### Common Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{COMPONENT_NAME}}` | PascalCase component name | `UserProfile` |
| `{{COMPONENT_NAME_LOWER}}` | camelCase component name | `userProfile` |
| `{{ROUTE_NAME}}` | API route name | `users` |
| `{{TABLE_NAME}}` | Database table name | `user_sessions` |
| `{{DATE}}` | Current date | `2026-01-21` |

---

## Best Practices

- **Don't over-template**: Only template truly repetitive patterns
- **Keep templates current**: Update when project standards change
- **Domain templates go with skills**: If a template belongs to one domain, put it in that skill's `templates/` dir
- **Cross-cutting templates stay here**: Specs, PR descriptions, and project setup templates
