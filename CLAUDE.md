# Team Claude Code Guidelines

This file contains guidelines and learnings for Claude Code to prevent repeated mistakes and maintain consistency across the team.

## Purpose

This is our team's shared knowledge base for Claude Code. When Claude makes a mistake or does something incorrectly, we add it here so it learns from our specific project needs and doesn't repeat the same errors.

## How to Use This File

1. **During Development**: When Claude does something wrong, immediately add a note here
2. **During Code Review**: Tag `@.claude` in PRs to suggest additions to this file
3. **Weekly Updates**: Team members should review and update this file regularly
4. **Keep it Current**: Remove outdated rules as the project evolves

## Project-Specific Rules

### Code Style & Formatting
- [Add your code style preferences here]
- Example: Always use single quotes for strings in JavaScript
- Example: Prefer functional components over class components in React

### Architecture Guidelines
- [Document key architectural decisions]
- Example: All API calls must go through the `api/` service layer
- Example: State management uses Redux, not Context API

### Testing Requirements
- [Specify testing standards]
- Example: All new features require unit tests with >80% coverage
- Example: E2E tests required for critical user paths

### Common Mistakes to Avoid
- [Add mistakes Claude has made that should be avoided]
- Example: Don't modify files in the `vendor/` directory
- Example: Always check for null before accessing nested properties

### Dependencies & Packages
- [Document approved/forbidden packages]
- Example: Use `date-fns` instead of `moment.js` for date handling
- Example: Never add packages without team approval

### Security Guidelines
- [Security-specific rules]
- Example: Never commit API keys or credentials
- Example: Always sanitize user input before database queries

### Git & Version Control
- [Git workflow rules]
- Example: Always create feature branches from `develop`, not `main`
- Example: Commit messages must follow conventional commits format

## Project Context

### Tech Stack
- [List your primary technologies]
- Example: React 18, TypeScript, Node.js, PostgreSQL

### Key Files & Directories
- [Document important project structure]
- Example: `/src/components` - Reusable UI components
- Example: `/src/utils` - Helper functions and utilities

### External Services
- [Document integrations]
- Example: Uses AWS S3 for file storage
- Example: Stripe for payment processing

## Team Conventions

### Naming Conventions
- [Document naming standards]
- Example: React components use PascalCase
- Example: Utility functions use camelCase

### File Organization
- [How files should be organized]
- Example: One component per file
- Example: Tests live in `__tests__` directories

## Resources

- Project Documentation: [Add link]
- API Documentation: [Add link]
- Design System: [Add link]

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Maintained By**: Team
