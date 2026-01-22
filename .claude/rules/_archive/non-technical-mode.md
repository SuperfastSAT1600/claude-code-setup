# Non-Technical Mode Rules

Translate technical output to plain English. Assume users don't know programming terminology.

---

## Core Principle

- Communicate in plain English
- Avoid jargon, command names, technical terms
- Focus on outcomes, not implementation
- Adapt to user's demonstrated expertise level

---

## Translation Quick Reference

### Technical → Plain English

| Technical | Say Instead |
|-----------|-------------|
| Running /full-feature | Building your new feature... |
| Running /quick-fix | Fixing the issue... |
| Delegating to agent | Analyzing/checking/designing... |
| git commit | Saving changes... |
| git push | Uploading changes... |
| Creating PR | Preparing for review... |
| Build failed | There's an error to fix... |
| Tests passing | All checks passed! |
| Type errors | Found code errors... |

### Terms to Replace

| Avoid | Use |
|-------|-----|
| API | Connection to [service] |
| Endpoint | Feature/function |
| Component | Part of the page |
| Repository | Project |
| Branch | Version/copy |
| Deploy | Put online |
| Environment variable | Setting |
| Database | Data storage |
| Migration | Database update |
| Dependencies | Required tools |
| Refactor | Clean up |

### Phrases to Avoid

| Don't Say | Say Instead |
|-----------|-------------|
| "Spin up a server" | "Start the app" |
| "grep for that" | "Search for that" |
| "Bootstrap the project" | "Set up the project" |
| "Parsing the response" | "Reading the data" |
| "The build is green" | "Everything is working" |

---

## Progress Reporting

### Format
```
Building your [feature]:

[Done] Step 1: Planned what to build
[Done] Step 2: Created the code
[Working] Step 3: Testing...
[Pending] Step 4: Preparing for review
```

### Indicators
- In progress → "Working on..."
- Complete → "Done!" or [Done]
- Waiting → "Waiting for..."
- Error → "Found an issue, fixing..."

---

## Error Messages

### Translation Pattern
```
Found a small issue and fixed it.

What happened: [Simple explanation]
What I did: [Simple fix]
Result: Working now!

(Technical: [original error for reference])
```

### Common Errors
| Error | Plain English |
|-------|---------------|
| TypeError: Cannot read property 'X' of undefined | Missing data issue, fixing... |
| Module not found | Missing file, adding... |
| SyntaxError | Typo in code, fixing... |
| 401 Unauthorized | Login required |
| 404 Not Found | Couldn't find it |
| 500 Internal Server Error | Server problem |

---

## Completion Messages

### Feature Complete
```
Your [feature] is ready!

What was built:
- [Item 1]
- [Item 2]

Next steps:
- Review the changes
- Test it in your browser
```

### Bug Fixed
```
Fixed! The [issue] is working now.

What was wrong: [Simple explanation]
What I fixed: [Simple description]
```

---

## Adaptive Mode

### Signs of Technical User
- Uses command syntax (`/command`)
- Mentions file paths, line numbers
- Uses terminology correctly

→ **Response**: More technical language OK, show code snippets

### Signs of Non-Technical User
- Plain language descriptions
- General terms ("the thing that does X")
- Asks "what does that mean?"

→ **Response**: Plain English, avoid code, focus on outcomes

---

## Technical Details

### Show Optionally (at end)
```
Done! [Plain summary]

(Technical details: [for reference])
```

### Show When Asked
```
In simple terms:
- Added a login button
- Created the login form

Technical details:
- Created LoginForm.tsx
- Added /api/auth/login endpoint
```

---

## Goal

Non-developers use Claude Code like asking a coworker:
- No command syntax needed
- No agent names needed
- No technical terminology needed
- Just describe what you want → get results
