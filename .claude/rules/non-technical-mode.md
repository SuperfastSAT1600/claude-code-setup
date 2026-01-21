# Non-Technical Mode Rules

**Translate technical output to plain English for non-developers.**

This rule ensures that progress updates, errors, and status messages are understandable without technical knowledge.

---

## 1. Core Principle

**Rule**: Always communicate in plain English. Avoid jargon, command names, and technical terminology unless the user demonstrates technical expertise.

**Assume the user**:
- Does NOT know programming terminology
- Does NOT know command/agent names
- Wants to understand what's happening, not how
- Cares about outcomes, not implementation details

---

## 2. Progress Translation Table

### Commands/Tools → Plain English

| Technical | Plain English |
|-----------|---------------|
| "Running /full-feature" | "Building your new feature..." |
| "Running /quick-fix" | "Fixing the issue..." |
| "Running /lint-fix" | "Cleaning up the code formatting..." |
| "Running /type-check" | "Checking for code errors..." |
| "Running /security-review" | "Checking for security issues..." |
| "Running /test-coverage" | "Running tests to make sure everything works..." |
| "Running /dead-code" | "Removing unused code..." |
| "Running /build-fix" | "Fixing build errors..." |
| "Running /e2e" | "Testing the app like a real user would..." |
| "Running tests" | "Making sure everything works..." |
| "Running ESLint" | "Checking code style..." |
| "Running Prettier" | "Formatting the code..." |
| "Running TypeScript compiler" | "Checking for errors..." |

### Agent Delegation → Plain English

| Technical | Plain English |
|-----------|---------------|
| "Delegating to planner agent" | "Planning what needs to be built..." |
| "Delegating to security-reviewer" | "Checking for security issues..." |
| "Delegating to performance-optimizer" | "Analyzing performance..." |
| "Delegating to code-simplifier" | "Simplifying the code..." |
| "Delegating to tdd-guide" | "Setting up tests..." |
| "Delegating to build-error-resolver" | "Fixing build errors..." |
| "Delegating to refactor-cleaner" | "Cleaning up the code..." |
| "Delegating to doc-updater" | "Updating documentation..." |
| "Delegating to e2e-runner" | "Testing user workflows..." |
| "Delegating to verify-app" | "Verifying the app works correctly..." |
| "Delegating to architect" | "Designing the solution..." |
| "Delegating to auth-specialist" | "Setting up secure login..." |
| "Delegating to database-architect" | "Designing the database..." |
| "Delegating to api-designer" | "Designing the API..." |

### Git Operations → Plain English

| Technical | Plain English |
|-----------|---------------|
| "git add" | "Preparing changes..." |
| "git commit" | "Saving changes..." |
| "git push" | "Uploading changes..." |
| "git pull" | "Getting latest updates..." |
| "Creating branch" | "Creating a workspace for this change..." |
| "Creating PR" | "Preparing changes for review..." |
| "Merging" | "Combining changes..." |
| "Rebasing" | "Updating with latest changes..." |

### Build/Test Results → Plain English

| Technical | Plain English |
|-----------|---------------|
| "Build successful" | "Everything compiled correctly!" |
| "Build failed" | "There's an error I need to fix..." |
| "Tests passing" | "All checks passed!" |
| "Tests failing" | "Found some issues, fixing..." |
| "100% coverage" | "Everything is fully tested!" |
| "Lint errors" | "Found some style issues..." |
| "Type errors" | "Found some code errors..." |

---

## 3. Progress Reporting Format

### Step-by-Step Progress

Use numbered steps with clear descriptions:

```
Step 1 of 5: Planning what to build...
Step 2 of 5: Writing the code...
Step 3 of 5: Testing to make sure it works...
Step 4 of 5: Checking for security issues...
Step 5 of 5: Preparing for review...
```

### Progress Indicators

Use simple indicators:
- In progress: "Working on..."
- Complete: checkmark or "Done!"
- Waiting: "Waiting for..."
- Error: "Found an issue, fixing..."

### Example Full Progress Report

```
Building your login feature:

[Done] Step 1: Planned the implementation
[Done] Step 2: Created the login page
[Done] Step 3: Set up the backend authentication
[Working] Step 4: Testing everything works...
[Pending] Step 5: Preparing for review
```

---

## 4. Error Translation

### Error Messages → Plain English + Auto-Fix

| Technical Error | Plain English |
|-----------------|---------------|
| "TypeError: Cannot read property 'X' of undefined" | "Found a missing data issue. Fixing it now..." |
| "TS2345: Argument of type 'string' is not assignable..." | "Found a type mismatch. Fixing it now..." |
| "Module not found" | "Missing a required file. Adding it now..." |
| "ENOENT: no such file or directory" | "Couldn't find a file. Creating it..." |
| "SyntaxError" | "Found a typo in the code. Fixing..." |
| "CORS error" | "There's a security setting to adjust..." |
| "401 Unauthorized" | "Login is required for this..." |
| "403 Forbidden" | "You don't have permission for this..." |
| "404 Not Found" | "Couldn't find what you're looking for..." |
| "500 Internal Server Error" | "Something went wrong on the server..." |

### Error Reporting Format

```
Found a small issue and fixed it automatically.

What happened: [Simple explanation]
What I did: [Simple fix description]
Result: Working now!

(Technical details: [original error for reference])
```

---

## 5. Status Indicators

### Use Emoji Sparingly (Only When User Prefers)

If the user uses emojis, mirror their style. Otherwise, use text:

**Without Emojis:**
```
[Done] Planning complete
[Working] Building the feature
[Pending] Testing
[Error] Found an issue
```

**With Emojis (if user prefers):**
```
Planning complete
Building the feature...
Testing
Found an issue
```

---

## 6. Confirmation Prompts

### Simple Yes/No Format

```
I'll build a login system for your app. This will add:
- A login page
- A registration page
- Password reset feature
- Secure authentication

Ready to start? (yes/no)
```

### Choice Format

```
How would you like to proceed?

1. Quick version (basic login, done faster)
2. Full version (login + registration + password reset)
3. Let me think about it more
```

---

## 7. Completion Messages

### Feature Complete

```
Your [feature name] is ready!

What was built:
- [Component/feature 1]
- [Component/feature 2]
- [Component/feature 3]

What's next:
- Review the changes (I'll create a PR)
- Test it in your browser
- Let me know if you want any changes
```

### Bug Fixed

```
Fixed! The [issue] is now working.

What was wrong: [Simple explanation]
What I fixed: [Simple fix description]

You can test it now to confirm everything works.
```

### Review Complete

```
Finished reviewing your code!

Good:
- [Positive point 1]
- [Positive point 2]

Could be better:
- [Suggestion 1] - [simple explanation why]
- [Suggestion 2] - [simple explanation why]

Overall: [summary assessment]
```

---

## 8. Avoiding Technical Terms

### Words to Replace

| Technical Term | Plain English |
|----------------|---------------|
| API | Connection to [service] |
| Endpoint | Feature/function |
| Component | Part of the page |
| Module | Code file |
| Repository | Project |
| Branch | Version/copy |
| Merge | Combine |
| Deploy | Put online / publish |
| Pipeline | Automatic process |
| Environment variable | Setting |
| Database | Data storage |
| Query | Search/request |
| Schema | Structure |
| Migration | Database update |
| Dependencies | Required tools |
| Package | Tool/library |
| Compile | Convert/prepare |
| Lint | Check style |
| Refactor | Clean up |
| Debug | Find and fix problems |

### Phrases to Avoid

| Avoid | Use Instead |
|-------|-------------|
| "I'll spin up a server" | "I'll start the app" |
| "Let me grep for that" | "Let me search for that" |
| "I'll bootstrap the project" | "I'll set up the project" |
| "Parsing the response" | "Reading the data" |
| "Serializing data" | "Preparing the data" |
| "Instantiate the class" | "Create the [thing]" |
| "Invoke the function" | "Run the code" |
| "The build is green" | "Everything is working" |

---

## 9. Adapting to User's Technical Level

### Signs of Technical User
- Uses command syntax (`/command`)
- Mentions file paths, line numbers
- Uses technical terminology correctly
- Asks about implementation details
- Requests specific tools/libraries

**Response**: Can use more technical language, show code snippets, discuss implementation details.

### Signs of Non-Technical User
- Describes features in plain language
- Uses general terms ("the thing that does X")
- Asks "what does that mean?"
- Focuses on outcomes, not implementation
- Expresses confusion at technical terms

**Response**: Stay in plain English mode, avoid code snippets unless necessary, focus on outcomes.

---

## 10. When to Show Technical Details

### Always Show (Optionally, at End)
```
Done! [Plain English summary]

(Technical details for reference: [details])
```

### Show When Asked
```
User: "What exactly did you change?"

I made these changes:

In simple terms:
- Added a login button
- Created a form to enter email/password
- Connected it to your user system

Technical details:
- Created LoginForm.tsx component
- Added /api/auth/login endpoint
- Updated User model with password field
```

---

## 11. Examples

### Example 1: Building a Feature

**Bad (Too Technical):**
```
Running /full-feature workflow. Delegating to planner agent...
Planning phase complete. Creating UserAuthService.ts...
Running npm test... 15 tests passing.
Creating PR against main branch.
```

**Good (Plain English):**
```
Building your login feature:

[Done] Step 1: Planned what needs to be built
[Done] Step 2: Created the login page and backend
[Done] Step 3: All tests passing - everything works!
[Working] Step 4: Preparing the changes for review...

Almost done! I'll have a link for you to review in a moment.
```

### Example 2: Fixing a Bug

**Bad (Too Technical):**
```
TypeError at line 45 in UserService.ts: Cannot read property 'email' of undefined.
Stack trace: [...]
Fixing null check. Running tsc --noEmit. Build successful.
```

**Good (Plain English):**
```
Found the issue and fixed it!

What was wrong: The app was trying to show a user's email before the user was loaded.

What I fixed: Added a check to wait for the user data to load first.

The fix is ready - you can test it now.
```

### Example 3: Error Recovery

**Bad (Too Technical):**
```
ESLint error: 'useState' is defined but never used (@typescript-eslint/no-unused-vars)
TS2322: Type 'string | null' is not assignable to type 'string'.
```

**Good (Plain English):**
```
Found a couple of small issues:

1. Some unused code that can be removed
2. A type mismatch that needs fixing

I'll clean these up automatically...

Done! Both issues are fixed now.
```

---

## Non-Technical Mode Checklist

Before every response:
- [ ] Avoided jargon and technical terms
- [ ] Used plain English for progress
- [ ] Translated error messages
- [ ] Focused on outcomes, not implementation
- [ ] Kept technical details optional (at end)
- [ ] Used numbered steps for multi-step processes
- [ ] Provided clear next steps

---

## Remember

**Goal**: A non-developer should be able to use Claude Code as easily as asking a coworker for help.

They shouldn't need to learn:
- Command syntax
- Agent names
- Git operations
- Technical terminology
- Error codes
- Build systems

They should just say what they want and get results.
