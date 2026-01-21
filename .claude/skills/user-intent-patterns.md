# User Intent Patterns

Reference patterns for classifying user intent and routing to appropriate automation.

This skill provides detailed pattern matching examples for the intent-routing rule.

---

## Intent Categories

### 1. Feature Request Patterns

**High Confidence Indicators:**
```
"I want..."
"I need..."
"Can you add..."
"Can you build..."
"Can you create..."
"Can you make..."
"We need..."
"Users should be able to..."
"The app should..."
"Add a..."
"Build a..."
"Create a..."
"Implement..."
"Set up..."
"Enable..."
"Let users..."
"Allow users to..."
"Make it possible to..."
"Add the ability to..."
"Add support for..."
```

**Medium Confidence (Check Context):**
```
"I was thinking about..."
"What if we had..."
"Would it be possible to..."
"How hard would it be to..."
"Could we..."
"Is there a way to..."
```

**Feature Subtype Detection:**

| Keywords | Feature Type | Suggested Agent |
|----------|--------------|-----------------|
| login, auth, sign in, password, register, account | Authentication | auth-specialist |
| pay, checkout, cart, purchase, order, subscription | E-commerce | api-designer |
| upload, download, file, image, document, attachment | File handling | - |
| notify, alert, email, message, notification | Notifications | - |
| search, filter, find, query, browse | Search | - |
| dashboard, analytics, report, chart, metrics | Analytics | - |
| admin, manage, moderate, settings, config | Admin panel | - |
| share, social, post, comment, like | Social features | - |
| schedule, calendar, booking, appointment, event | Scheduling | - |
| chat, message, conversation, real-time | Messaging | websocket-patterns |

---

### 2. Bug Fix Patterns

**High Confidence Indicators:**
```
"...doesn't work"
"...isn't working"
"...not working"
"...is broken"
"...is failing"
"...stopped working"
"...used to work but now..."
"...crashes"
"...errors"
"...bug"
"...issue"
"...problem with"
"Fix..."
"Something's wrong with..."
"There's an error..."
"Getting an error..."
"I'm seeing an error..."
"The app shows..."
"It won't..."
"Can't..."
"Unable to..."
```

**Symptoms to Bug Mapping:**

| Symptom | Likely Issue Area |
|---------|-------------------|
| "blank page", "nothing shows" | Rendering/component error |
| "wrong data", "shows incorrect" | Data fetching/state |
| "slow", "takes forever" | Performance issue |
| "disappears", "goes away" | State management |
| "can't click", "button doesn't respond" | Event handler |
| "can't type", "input not working" | Form handling |
| "error message" | Validation/backend |
| "logged out", "session lost" | Authentication |
| "after refresh", "when I reload" | State persistence |
| "on mobile", "on phone" | Responsive/mobile |

---

### 3. Code Review Patterns

**High Confidence Indicators:**
```
"Review..."
"Check..."
"Look at..."
"Can you see if..."
"Is this okay?"
"Is this right?"
"Is this correct?"
"Did I do this right?"
"What do you think of..."
"How does this look?"
"Can you give me feedback..."
"Anything wrong with..."
"Am I doing this right?"
"Best practice?"
"Is this a good approach?"
```

**Review Type Detection:**

| Keywords | Review Type |
|----------|-------------|
| "security", "safe", "vulnerable" | Security review |
| "performance", "fast", "efficient" | Performance review |
| "clean", "readable", "maintainable" | Code quality review |
| "test", "coverage", "tested" | Test coverage review |
| "architecture", "structure", "design" | Architecture review |

---

### 4. Performance Patterns

**High Confidence Indicators:**
```
"...is slow"
"...takes too long"
"...is laggy"
"...loading forever"
"Speed up..."
"Make...faster"
"Optimize..."
"Performance..."
"Too much memory"
"High CPU"
"Loading time"
"Response time"
"Page speed"
"Slow queries"
"Bottleneck"
```

**Performance Issue Types:**

| Symptom | Likely Cause | Suggested Focus |
|---------|--------------|-----------------|
| "page loads slowly" | Bundle size, API calls | Frontend optimization |
| "API is slow" | Database queries, N+1 | Backend optimization |
| "memory issues" | Memory leaks, large objects | Memory profiling |
| "database slow" | Missing indexes, bad queries | Database optimization |
| "images slow" | Large images, no lazy load | Asset optimization |

---

### 5. Testing Patterns

**High Confidence Indicators:**
```
"Add tests..."
"Write tests..."
"Test..."
"Coverage..."
"Unit test..."
"Integration test..."
"E2E test..."
"End to end..."
"Make sure it works..."
"Verify..."
"TDD..."
"Test driven..."
"Test coverage..."
"How do I test..."
```

**Test Type Detection:**

| Keywords | Test Type | Command/Agent |
|----------|-----------|---------------|
| "unit", "function", "isolated" | Unit tests | /test-coverage |
| "integration", "together", "API" | Integration tests | integration-test-writer |
| "e2e", "end to end", "user flow" | E2E tests | /e2e |
| "TDD", "red green", "test first" | TDD workflow | tdd-guide agent |

---

### 6. Security Patterns

**High Confidence Indicators:**
```
"Is this secure?"
"Security..."
"Vulnerable..."
"Safe?"
"Hack..."
"Attack..."
"SQL injection"
"XSS"
"CSRF"
"Authentication"
"Authorization"
"Permissions"
"Audit..."
"OWASP"
"Penetration"
"Secrets"
"API keys"
```

---

### 7. Documentation Patterns

**High Confidence Indicators:**
```
"Document..."
"Documentation..."
"Docs..."
"README..."
"Explain..."
"Comment..."
"API docs..."
"How does this work..."
"Write docs..."
"Update docs..."
"Add comments..."
"JSDoc..."
"Describe..."
```

---

### 8. Refactoring Patterns

**High Confidence Indicators:**
```
"Refactor..."
"Clean up..."
"Simplify..."
"Make cleaner..."
"Reorganize..."
"Restructure..."
"Dead code..."
"Unused..."
"Remove unused..."
"Modernize..."
"Update old..."
"Legacy..."
"Better structure..."
"Improve code..."
```

**Refactor Type Detection:**

| Keywords | Refactor Type | Command/Agent |
|----------|---------------|---------------|
| "dead code", "unused" | Remove dead code | /dead-code |
| "simplify", "complex" | Simplify | code-simplifier agent |
| "legacy", "modernize", "old" | Modernize | /refactor-clean |
| "duplicate", "DRY" | Remove duplication | /refactor-clean |
| "rename", "naming" | Rename refactor | Manual |
| "extract", "split" | Extract/split | code-simplifier agent |

---

### 9. Deployment Patterns

**High Confidence Indicators:**
```
"Deploy..."
"Release..."
"Ship..."
"Go live..."
"Push to production..."
"Publish..."
"Launch..."
"Put online..."
"Make live..."
"Update production..."
"Roll out..."
```

---

### 10. Code Quality Patterns

**High Confidence Indicators:**
```
"Lint..."
"Format..."
"ESLint..."
"Prettier..."
"Type errors..."
"TypeScript..."
"Fix types..."
"Style issues..."
"Formatting..."
"Code style..."
```

---

## Disambiguation Patterns

### When Intent Is Unclear

**Vague Requests:**
```
"Help me with X" → Ask what kind of help
"Look at X" → Ask what to look for
"Change X" → Ask what kind of change
"Update X" → Ask what kind of update
"Work on X" → Ask what to do with X
"Something with X" → Ask to describe more
```

**Ambiguous Verbs:**
- "Fix" usually means bug fix, but could mean improve
- "Update" could mean bug fix, feature, or docs
- "Change" could mean feature, bug fix, or refactor
- "Add" usually means feature, but context matters

### Disambiguation Questions

**General Template:**
```
I can help with [X]! What would you like to do?

1. Add new functionality
2. Fix something broken
3. Improve/optimize
4. Review/check quality
5. Something else
```

**Context-Specific Templates:**

For UI mentions:
```
What would you like to do with [component]?

1. Add new features
2. Fix a bug
3. Change how it looks
4. Improve performance
```

For API mentions:
```
What would you like to do with the [API/endpoint]?

1. Add new capabilities
2. Fix an issue
3. Improve performance
4. Add documentation
```

For database mentions:
```
What would you like to do with the database?

1. Add new tables/fields
2. Fix data issues
3. Improve query performance
4. Update the schema
```

---

## Context Clues

### File Path Patterns

| Path Contains | Likely Domain |
|---------------|---------------|
| `/components/` | React components |
| `/pages/` or `/app/` | Page routing |
| `/api/` | Backend API |
| `/services/` | Business logic |
| `/hooks/` | React hooks |
| `/utils/` | Utility functions |
| `/types/` | TypeScript types |
| `/tests/` or `/__tests__/` | Testing |
| `/styles/` | CSS/styling |
| `/public/` | Static assets |

### Recent Activity

If user recently:
- Created files → Likely wants to continue building
- Fixed bugs → Might have related issues
- Ran tests → Might want to see results/coverage
- Reviewed code → Might want to implement changes

---

## Urgency Detection

### Urgent Indicators
```
"ASAP"
"urgent"
"right now"
"immediately"
"quickly"
"fast"
"as soon as possible"
"critical"
"emergency"
"production is down"
"users are affected"
"blocking"
```

**Response**: Skip optional steps, prioritize speed, minimal ceremony.

### Thorough Indicators
```
"carefully"
"thoroughly"
"properly"
"completely"
"make sure"
"double-check"
"comprehensive"
"full"
"extensive"
```

**Response**: Include all steps, extra validation, comprehensive testing.

---

## Multi-Intent Requests

Sometimes users combine multiple intents:

**Example 1: "Fix the bug and add a test"**
- Intent 1: Bug fix (/quick-fix)
- Intent 2: Testing
- Action: Fix bug, then add regression test

**Example 2: "Add login and make sure it's secure"**
- Intent 1: Feature (authentication)
- Intent 2: Security review
- Action: Build feature, then security audit

**Example 3: "Clean up the code and update the docs"**
- Intent 1: Refactor
- Intent 2: Documentation
- Action: Refactor, then update docs

---

## Edge Cases

### Questions vs Requests

**Questions (provide information):**
```
"What is..."
"How does...work"
"Why does..."
"Can you explain..."
"What's the difference between..."
```

**Requests (take action):**
```
"Can you..."
"Please..."
"I need..."
"Help me..."
```

### Research vs Implementation

**Research (gather information):**
```
"Is it possible to..."
"What would be involved in..."
"How would we..."
"What's the best way to..."
"Should we..."
```

**Implementation (do the work):**
```
"Add..."
"Build..."
"Create..."
"Fix..."
"Let's..."
"Go ahead and..."
```

---

## Pattern Confidence Scoring

### High Confidence (Auto-Route)
- Clear action verb + specific target
- Unambiguous intent words
- Single clear intent
- Example: "Fix the broken checkout button"

### Medium Confidence (Brief Confirm)
- Action implied but not stated
- Multiple possible interpretations
- Example: "The checkout has issues"

### Low Confidence (Disambiguate)
- Vague or general language
- No clear action
- Multiple intents possible
- Example: "Help with checkout"

---

## Routing Decision Tree

```
User Input
    │
    ├─► Contains clear action verb?
    │   ├─► Yes → Route based on verb
    │   └─► No → Check for symptoms
    │
    ├─► Contains symptom words (broken, slow, error)?
    │   ├─► Yes → Route to fix/optimize
    │   └─► No → Check for questions
    │
    ├─► Is it a question?
    │   ├─► Yes → Provide information or clarify
    │   └─► No → Check context
    │
    └─► Default
        └─► Ask disambiguation question
```

---

## Examples

### Example 1: Clear Feature Request
```
Input: "I want users to be able to reset their passwords"
Analysis:
- "I want" = feature request indicator
- "users to be able to" = capability request
- "reset passwords" = authentication feature
Route: /full-feature with auth-specialist consultation
```

### Example 2: Clear Bug Report
```
Input: "The checkout page shows a blank screen when I click pay"
Analysis:
- "shows a blank screen" = symptom (rendering error)
- "when I click pay" = trigger condition
- "checkout page" = specific location
Route: /quick-fix targeting checkout
```

### Example 3: Ambiguous Request
```
Input: "Help me with the user profile"
Analysis:
- "Help me with" = unclear action
- "user profile" = specific area
- No symptoms or features mentioned
Route: Disambiguation question
```

### Example 4: Multi-Intent
```
Input: "Add a dark mode and make sure it's accessible"
Analysis:
- "Add dark mode" = feature request
- "make sure it's accessible" = accessibility requirement
Route: /full-feature with accessibility-auditor consultation
```

---

## Remember

The goal is to understand what the user wants to accomplish, not what words they use. Focus on:

1. **Outcomes**: What result do they want?
2. **Problems**: What issue are they facing?
3. **Improvements**: What do they want to be better?

Then route to the automation that achieves that outcome.
