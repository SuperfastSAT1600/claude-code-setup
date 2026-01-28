# Template Variants

Framework-specific code templates organized by technology.

---

## Directory Structure

```
variants/
├── generic/        # Framework-agnostic templates
│   ├── test.spec.ts.template
│   ├── migration.sql.template
│   ├── pr-description.md.template
│   ├── error-handler.ts.template
│   ├── guard.ts.template
│   ├── middleware.ts.template
│   ├── service.ts.template
│   ├── hook.ts.template
│   └── Dockerfile.template
├── react/          # React-specific templates
│   ├── component.tsx.template
│   └── form.tsx.template
├── nextjs/         # Next.js App Router templates
│   └── api-route.ts.template
└── vue/            # Vue-specific templates
    └── (empty - add your Vue templates)
```

---

## Usage

### For Template Users

When setting up the template:

1. **Copy generic templates** (always needed):
   ```bash
   cp .claude/templates/variants/generic/* .claude/templates/
   ```

2. **Copy framework-specific templates** (only if you use that framework):
   ```bash
   # Using React?
   cp .claude/templates/variants/react/* .claude/templates/

   # Using Next.js?
   cp .claude/templates/variants/nextjs/* .claude/templates/

   # Using Vue?
   cp .claude/templates/variants/vue/* .claude/templates/
   ```

3. **Delete unused variant directories**:
   ```bash
   # Not using React? Delete it
   rm -rf .claude/templates/variants/react/

   # Not using Next.js? Delete it
   rm -rf .claude/templates/variants/nextjs/
   ```

### For Template Maintainers

When adding new templates:

1. **Determine if it's framework-specific**:
   - Generic (works with any framework) → `generic/`
   - React-only (uses JSX, React hooks) → `react/`
   - Next.js-only (uses Next.js APIs) → `nextjs/`
   - Vue-only (uses Vue composition API) → `vue/`

2. **Add the template** to the appropriate directory

3. **Update this README** with the new template

---

## Template Descriptions

### Generic Templates

| Template | Purpose | Use With |
|----------|---------|----------|
| `test.spec.ts.template` | Unit/integration test | Any TypeScript project |
| `migration.sql.template` | Database migration | Any SQL database |
| `pr-description.md.template` | Pull request description | Any project with git |
| `error-handler.ts.template` | Custom error classes | Any TypeScript project |
| `guard.ts.template` | Route/permission guards | Express, Next.js, any framework |
| `middleware.ts.template` | Middleware functions | Express, Next.js, any framework |
| `service.ts.template` | Business logic services | Any TypeScript backend |
| `hook.ts.template` | Custom utility hook | Any TypeScript project |
| `Dockerfile.template` | Docker container | Any project |

### React Templates

| Template | Purpose | Use With |
|----------|---------|----------|
| `component.tsx.template` | React component with props | React, Next.js, Remix |
| `form.tsx.template` | Form with validation | React, Next.js, Remix |

### Next.js Templates

| Template | Purpose | Use With |
|----------|---------|----------|
| `api-route.ts.template` | App Router API route | Next.js 14+ App Router |

### Vue Templates

| Template | Purpose | Use With |
|----------|---------|----------|
| *(empty)* | Add Vue-specific templates here | Vue 3, Nuxt 3 |

---

## Creating New Variants

### Adding a Vue Component Template

1. **Create the template**:
   ```bash
   touch .claude/templates/variants/vue/component.vue.template
   ```

2. **Write the template content**:
   ```vue
   <script setup lang="ts">
   // {{COMPONENT_NAME}} Component
   // {{COMPONENT_DESCRIPTION}}

   interface {{COMPONENT_NAME}}Props {
     // Define props
   }

   const props = defineProps<{{COMPONENT_NAME}}Props>();
   </script>

   <template>
     <div class="{{COMPONENT_NAME_KEBAB}}">
       <!-- Component content -->
     </div>
   </template>

   <style scoped>
   .{{COMPONENT_NAME_KEBAB}} {
     /* Component styles */
   }
   </style>
   ```

3. **Update this README** with the new template

### Adding a Svelte Component Template

1. **Create directory** if it doesn't exist:
   ```bash
   mkdir -p .claude/templates/variants/svelte
   ```

2. **Create template**:
   ```bash
   touch .claude/templates/variants/svelte/component.svelte.template
   ```

3. **Update this README**

---

## Migration Guide

### From Flat Structure to Variants

If you have templates in `.claude/templates/` (old structure):

1. **Create variants directories**:
   ```bash
   mkdir -p .claude/templates/variants/{generic,react,nextjs,vue}
   ```

2. **Move templates**:
   ```bash
   # Generic templates
   mv .claude/templates/test.spec.ts.template .claude/templates/variants/generic/
   mv .claude/templates/migration.sql.template .claude/templates/variants/generic/
   mv .claude/templates/pr-description.md.template .claude/templates/variants/generic/

   # React templates
   mv .claude/templates/component.tsx.template .claude/templates/variants/react/
   mv .claude/templates/form.tsx.template .claude/templates/variants/react/

   # Next.js templates
   mv .claude/templates/api-route.ts.template .claude/templates/variants/nextjs/
   ```

3. **Copy back what you need**:
   ```bash
   # Copy generic (always)
   cp .claude/templates/variants/generic/* .claude/templates/

   # Copy framework-specific (only if you use it)
   cp .claude/templates/variants/react/* .claude/templates/
   ```

---

## Best Practices

1. **Keep templates small** - Each template should do one thing
2. **Use clear placeholders** - `{{COMPONENT_NAME}}`, `{{ROUTE_PATH}}`, etc.
3. **Include usage examples** - Show how to use the template
4. **Document assumptions** - What framework version, what libraries, etc.
5. **Test templates** - Ensure they work with Claude Code's replacement logic

---

## Troubleshooting

### "Template not found"

**Cause**: Template is in `variants/` but not copied to root `templates/`

**Fix**: Copy the template:
```bash
cp .claude/templates/variants/react/component.tsx.template .claude/templates/
```

### "Wrong framework patterns in template"

**Cause**: Using React template in Vue project

**Fix**: Delete React variants, only keep relevant ones:
```bash
rm -rf .claude/templates/variants/react/
rm -rf .claude/templates/variants/nextjs/
```

---

**Last Updated**: 2026-01-28
