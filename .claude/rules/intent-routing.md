# Intent Routing Rules

**Auto-classify user intent and route to the appropriate command, agent, or workflow.**

This rule enables non-developers to describe what they want in plain language without knowing specific commands or agent names.

---

## 1. Core Principle

**Rule**: When a user describes what they want in plain language, automatically detect their intent and route to the appropriate automation.

**Do NOT** ask users to use specific commands or agent names. Instead:
1. Classify the intent from their natural language
2. Select the appropriate command/agent/workflow
3. Execute automatically (with brief confirmation for major operations)

---

## 2. Intent Classification Matrix

### Feature Requests → `/full-feature` workflow

**Trigger phrases:**
- "I want...", "I need...", "Can you add..."
- "Build...", "Create...", "Make...", "Implement..."
- "Add a new...", "Set up...", "Enable..."
- "Users should be able to..."
- "The app needs..."

**Examples:**
```
"I want people to log into my app" → /full-feature (authentication)
"Add a shopping cart" → /full-feature (e-commerce)
"Create a dashboard page" → /full-feature (new page)
"Users should be able to upload files" → /full-feature (file upload)
"Build a notification system" → /full-feature (notifications)
```

**Auto-select specialized agents based on context:**
- Authentication mentioned → Consult `auth-specialist` agent
- Database schema needed → Consult `database-architect` agent
- API design required → Consult `api-designer` agent
- UI components needed → Use component templates

---

### Bug Fixes → `/quick-fix` workflow

**Trigger phrases:**
- "Fix...", "Broken...", "Not working..."
- "Bug...", "Error...", "Issue..."
- "Doesn't work...", "Failing...", "Crashed..."
- "Something's wrong with..."
- "It used to work but now..."

**Examples:**
```
"The login button doesn't work" → /quick-fix
"Fix the broken checkout" → /quick-fix
"Error when I try to save" → /quick-fix
"The page crashes when I click submit" → /quick-fix
"Something's wrong with the search" → /quick-fix
```

**Auto-actions:**
1. Identify the affected area
2. Reproduce the issue if possible
3. Fix and add regression test
4. Verify the fix works

---

### Code Review → `/review-changes` command

**Trigger phrases:**
- "Review...", "Check my code...", "Look at..."
- "Is this good?", "Is this right?", "Is this okay?"
- "What do you think of...", "Can you check..."
- "Did I do this correctly?"

**Examples:**
```
"Review my changes" → /review-changes
"Is this code okay?" → /review-changes
"Check if I did this right" → /review-changes
"What do you think of my implementation?" → /review-changes
```

---

### Security → `/security-review` command

**Trigger phrases:**
- "Secure?", "Safe?", "Vulnerable?"
- "Security...", "Hack...", "Attack..."
- "Is this secure?", "Check for security..."
- "Audit...", "Penetration...", "OWASP..."

**Examples:**
```
"Is this secure?" → /security-review
"Check for vulnerabilities" → /security-review
"Audit the authentication system" → /security-review
"Make sure it's safe" → /security-review
```

---

### Performance → `performance-optimizer` agent

**Trigger phrases:**
- "Slow...", "Fast...", "Speed up..."
- "Performance...", "Optimize...", "Efficient..."
- "Taking too long...", "Laggy...", "Faster..."
- "Memory...", "CPU...", "Load time..."

**Examples:**
```
"The app is slow" → Delegate to performance-optimizer agent
"Make the page load faster" → Delegate to performance-optimizer agent
"Optimize the database queries" → Delegate to performance-optimizer agent
"It's taking too long to load" → Delegate to performance-optimizer agent
```

---

### Testing → `/test-coverage` or `tdd-guide` agent

**Trigger phrases:**
- "Test...", "Tests...", "Coverage..."
- "Unit test...", "Integration test...", "E2E..."
- "Make sure it works...", "Verify..."
- "TDD...", "Test-driven..."

**Examples:**
```
"Add tests for this" → /test-coverage
"Test the login feature" → /test-coverage
"Guide me through TDD" → Delegate to tdd-guide agent
"What's our test coverage?" → /test-coverage
```

---

### Documentation → `/update-docs` command

**Trigger phrases:**
- "Document...", "Documentation...", "Docs..."
- "README...", "Explain in code...", "Comment..."
- "API docs...", "How does this work..."

**Examples:**
```
"Update the documentation" → /update-docs
"Document this API" → /update-docs
"Add comments to explain this" → /update-docs
```

---

### Refactoring → `/refactor-clean` command

**Trigger phrases:**
- "Refactor...", "Clean up...", "Simplify..."
- "Make it cleaner...", "Reorganize..."
- "Dead code...", "Unused...", "Remove..."
- "Modernize...", "Update the old..."

**Examples:**
```
"Clean up this code" → /refactor-clean
"Remove dead code" → /dead-code
"Simplify this function" → Delegate to code-simplifier agent
"Modernize the legacy code" → /refactor-clean
```

---

### Code Quality → `/lint-fix` or `/type-check`

**Trigger phrases:**
- "Lint...", "Format...", "Style..."
- "Type errors...", "TypeScript...", "Types..."
- "ESLint...", "Prettier..."

**Examples:**
```
"Fix the linting errors" → /lint-fix
"Format the code" → /lint-fix
"Fix the type errors" → /type-check
"Run prettier" → /lint-fix
```

---

### Deployment/Release → `release` workflow

**Trigger phrases:**
- "Deploy...", "Release...", "Ship..."
- "Push to production...", "Go live..."
- "Publish...", "Launch..."

**Examples:**
```
"Deploy to production" → release workflow
"Ship the new version" → release workflow
"We're ready to go live" → release workflow
```

---

### Component Creation → `/new-component`

**Trigger phrases:**
- "New component...", "Create component..."
- "Add a button...", "Add a form...", "Add a modal..."
- "Scaffold...", "Generate..."

**Examples:**
```
"Create a new Button component" → /new-component Button
"Add a login form component" → /new-component LoginForm
"Scaffold a modal component" → /new-component Modal
```

---

### Database → `/create-migration` or `database-architect` agent

**Trigger phrases:**
- "Database...", "Migration...", "Schema..."
- "Table...", "Column...", "Index..."
- "Add a field...", "Change the database..."

**Examples:**
```
"Add a new field to users" → /create-migration
"Design the database schema" → Delegate to database-architect agent
"Create a migration for the orders table" → /create-migration
```

---

## 3. Disambiguation Flow

When intent is unclear, ask ONE focused clarifying question:

### Template:
```
I can help with that! What would you like me to do?

1. Build something new (new feature)
2. Fix something broken (bug fix)
3. Improve existing code (refactor/optimize)
4. Check code quality (review/test/security)
5. Something else - please describe
```

### Specific Disambiguations:

**"Help with X" (vague):**
```
"What kind of help do you need with [X]?
1. Add new functionality
2. Fix an issue
3. Improve performance
4. Review/test it"
```

**"Change X" (vague):**
```
"What kind of change to [X]?
1. Add new features
2. Fix a bug
3. Refactor/clean up
4. Change how it looks"
```

**"Update X" (vague):**
```
"What kind of update to [X]?
1. Add new functionality
2. Fix something broken
3. Improve/modernize code
4. Update documentation"
```

---

## 4. Confirmation for Major Operations

**Rule**: For operations that make significant changes, provide a brief confirmation.

### Confirm Before:
- Creating multiple new files
- Modifying more than 5 files
- Database migrations
- Deployment operations
- Deleting files/code

### Confirmation Format:
```
I'll [action description]. This will:
- [Change 1]
- [Change 2]
- [Change 3]

Should I proceed? (y/n)
```

### Skip Confirmation For:
- Code reviews (read-only)
- Linting/formatting (auto-fixable)
- Single file edits
- Running tests
- Generating reports

---

## 5. Auto-Agent Delegation Rules

### When to Auto-Delegate:

| Detected Need | Auto-Delegate To |
|--------------|------------------|
| Authentication/login/auth | `auth-specialist` agent |
| Database design/schema | `database-architect` agent |
| API design/endpoints | `api-designer` agent |
| Performance issues | `performance-optimizer` agent |
| Accessibility concerns | `accessibility-auditor` agent |
| Security audit | `security-reviewer` agent |
| CI/CD setup | `ci-cd-specialist` agent |
| Docker/containers | `docker-specialist` agent |
| Complex testing | `tdd-guide` agent |
| Code simplification | `code-simplifier` agent |

### Delegation Phrasing (Internal):
Do NOT tell users you're "delegating to an agent." Instead, say:
- "I'll analyze this for [purpose]..."
- "Let me check [aspect]..."
- "I'll design a solution for..."

---

## 6. Context Clues for Better Routing

### File Types Mentioned:
- `.tsx`, `.jsx`, React → Frontend/component work
- `.ts`, `.js` in `/api` → API/backend work
- `.sql`, `.prisma` → Database work
- `.yml`, `.yaml` in `.github` → CI/CD work
- `.test.ts`, `.spec.ts` → Testing work
- `.md` → Documentation work

### Keywords that Modify Intent:
- "simple", "quick", "just" → Simpler solution, less ceremony
- "robust", "production", "enterprise" → More thorough approach
- "urgent", "asap", "quickly" → Faster workflow, skip optional steps
- "carefully", "thoroughly" → More comprehensive approach

---

## 7. Fallback Behavior

When intent truly cannot be determined:

1. **Ask a clarifying question** (see disambiguation)
2. **Default to exploration**: If unsure, read relevant files first
3. **Never guess for destructive operations**: Always confirm before delete/deploy

---

## 8. Examples of Full Intent Routing

### Example 1: Feature Request
```
User: "I want people to be able to reset their passwords"

Routing:
1. Intent: Feature request (authentication-related)
2. Command: /full-feature
3. Agent consultation: auth-specialist
4. Workflow: Plan → Implement → Test → PR

Response:
"I'll build a password reset feature. This typically includes:
- A 'Forgot Password' link on the login page
- An email with a secure reset link
- A page to set a new password
- Security measures (expiring links, rate limiting)

Starting the planning phase..."
```

### Example 2: Bug Report
```
User: "The checkout isn't working, it just shows a blank page"

Routing:
1. Intent: Bug fix
2. Command: /quick-fix
3. Focus: Checkout component/API

Response:
"I'll investigate and fix the checkout issue.

Step 1: Finding the checkout code...
Step 2: Checking for errors...
[continues with plain-English progress]"
```

### Example 3: Vague Request
```
User: "Help me with the user profile"

Routing:
1. Intent: Unclear
2. Action: Disambiguate

Response:
"I can help with the user profile! What would you like to do?
1. Add new features (like avatar upload, settings)
2. Fix something that's broken
3. Improve how it works or looks
4. Check the code quality"
```

---

## 9. Integration with Other Rules

This rule works with:
- **non-technical-mode.md**: For progress translation
- **context-management.md**: For efficient context usage
- **agents.md**: For knowing when to delegate
- **hooks.md**: For automatic quality checks

---

## Intent Routing Checklist

Before executing:
- [ ] Intent clearly identified
- [ ] Appropriate command/agent selected
- [ ] Major operations confirmed (if needed)
- [ ] Context clues considered
- [ ] User's urgency/thoroughness preference noted

---

## Remember

The goal is **zero friction** for non-developers. They should be able to describe what they want in plain English and get results without learning command syntax, agent names, or technical workflows.

**Good UX**: "I want users to log in" → (magic happens) → "Done! Here's the PR."

**Bad UX**: "I want users to log in" → "Would you like to use /full-feature or delegate to auth-specialist agent?"
