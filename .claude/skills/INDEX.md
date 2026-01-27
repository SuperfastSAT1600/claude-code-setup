# Skills Index

Lightweight directory of all available skills. Load full skill files only when needed for specific tasks.

**Documentation-Based Skills** (2026-01-23):
Nine skills are now sourced from authoritative references (OpenAPI Spec, OWASP, GraphQL Spec, PostgreSQL docs, GitHub docs, RFC standards, Anthropic/OpenAI guides, LangChain, academic research). See individual skill files for sources.

## Core Patterns

| Skill | Coverage | Load When |
|-------|----------|-----------|
| **coding-standards.md** | Style, naming, file organization | General coding work |
| **tdd-workflow.md** | Red-Green-Refactor cycle, test patterns | Test-driven development |
| **documentation-patterns.md** | Documentation standards and formats (sourced from JSDoc, TSDoc, Keep a Changelog) | Writing documentation |

## Backend

| Skill | Coverage | Load When |
|-------|----------|-----------|
| **backend-patterns.md** | Server architecture, API design, error handling | Backend development |
| **nodejs-patterns.md** | Node.js best practices, async patterns | Node.js work |
| **rest-api-design.md** | REST API design standards (sourced from OpenAPI Spec, RFC 9110, JSON:API) | REST API design |
| **database-patterns.md** | Database design, normalization, and optimization (sourced from PostgreSQL docs, SQL standards) | Database work |
| **prisma-patterns.md** | Prisma schema, queries, migrations | Prisma ORM usage |

## Frontend

| Skill | Coverage | Load When |
|-------|----------|-----------|
| **frontend-patterns.md** | Component architecture, state management | Frontend development |
| **react-patterns.md** | Hooks, context, performance optimization | React development |
| **nextjs-patterns.md** | App Router, SSR, data fetching | Next.js development |

## Specialized Patterns

| Skill | Coverage | Load When |
|-------|----------|-----------|
| **auth-patterns.md** | Authentication and authorization patterns (sourced from OWASP, RFC 7519, RFC 6749) | Authentication work |
| **graphql-patterns.md** | GraphQL schema design and best practices (sourced from GraphQL Spec, Apollo docs) | GraphQL development |
| **websocket-patterns.md** | Real-time communication patterns (sourced from RFC 6455, Socket.io docs) | Real-time features |
| **prompt-engineering.md** | LLM prompt engineering best practices (sourced from Anthropic, OpenAI guides) | AI integration |
| **rag-patterns.md** | Retrieval-Augmented Generation implementation (sourced from LangChain, academic research) | RAG system design |

## DevOps & Infrastructure

| Skill | Coverage | Load When |
|-------|----------|-----------|
| **docker-patterns.md** | Dockerfile, multi-stage builds, compose | Containerization |
| **github-actions.md** | CI/CD workflows with GitHub Actions (sourced from official GitHub docs) | CI/CD setup |

## Project Utilities

| Skill | Coverage | Load When |
|-------|----------|-----------|
| **dev-server-autoopen.md** | Auto-open localhost in browser | Dev server setup |
| **project-guidelines.md** | Project-specific patterns and conventions | Project onboarding |
| **user-intent-patterns.md** | Natural language → command routing | Intent classification |

## Usage

Instead of loading all 22 skill files (~40k tokens), reference this index to identify relevant skills, then load only those needed for the current task.

**Example**:
```
Task: "Build REST API with Prisma"
→ Identify needs: API design + ORM patterns
→ Load skills: rest-api-design.md, prisma-patterns.md
→ Skip irrelevant: frontend-patterns.md, docker-patterns.md, etc.
→ Context saved: ~30k tokens
```

## Skill Selection by Task Type

| Task Type | Relevant Skills |
|-----------|-----------------|
| **New Feature** | coding-standards, tdd-workflow, + domain-specific |
| **API Development** | rest-api-design, backend-patterns, database-patterns |
| **React Component** | react-patterns, frontend-patterns, coding-standards |
| **Next.js Page** | nextjs-patterns, react-patterns, frontend-patterns |
| **Authentication** | auth-patterns, backend-patterns, database-patterns |
| **Real-time Feature** | websocket-patterns, backend-patterns |
| **Database Work** | database-patterns, prisma-patterns |
| **CI/CD Setup** | github-actions, docker-patterns |
| **AI/LLM Integration** | prompt-engineering, rag-patterns |

## Benefits

- **Baseline reduction**: 40k tokens saved by not loading all skills
- **Targeted loading**: Load only relevant patterns per task
- **Faster reference**: Quick table for skill selection
- **Better context**: More room for code and analysis
