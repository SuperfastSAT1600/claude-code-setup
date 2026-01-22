# Git Workflow Rules

Consistent git practices improve collaboration, code review, and project history.

---

## 1. Commit Message Format

**Rule**: Follow Conventional Commits format.

### Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code restructuring (no feature/fix)
- `perf`: Performance improvements
- `test`: Test additions or fixes
- `chore`: Build process, dependencies, tooling

### Examples:
```bash
# ✅ CORRECT: Clear, descriptive
feat(auth): add password reset functionality

Implements password reset via email token. Users can request
a reset link and set a new password within 1 hour.

Closes #123

# ✅ CORRECT: Simple fix
fix(api): handle null response from user service

# ❌ WRONG: Vague, no context
updated stuff

# ❌ WRONG: Too long subject
fix: fixed the bug where users couldn't log in when their email address was very long and contained special characters
```

### Rules:
- Subject line: max 72 characters
- Use imperative mood ("add" not "added")
- No period at end of subject
- Blank line between subject and body
- Body: wrap at 72 characters
- Include "Closes #issue" if applicable

---

## 2. Commit Frequency

**Rule**: Commit often. Each commit should be a logical unit of work.

### Good Commit Boundaries:
- ✅ Completed a feature
- ✅ Fixed a bug
- ✅ Refactored a module
- ✅ Added tests for existing code
- ✅ Updated documentation

### Bad Commit Boundaries:
- ❌ End of day (arbitrary)
- ❌ Mix of unrelated changes
- ❌ Incomplete feature (breaks tests)
- ❌ "WIP" commits in main branch

```bash
# ✅ CORRECT: Logical commits
feat(cart): add item validation
feat(cart): implement discount calculation
test(cart): add edge case tests

# ❌ WRONG: Dumping ground commit
chore: various updates
- Fixed cart bug
- Updated README
- Refactored user service
- Added new feature
```

---

## 3. Branch Naming

**Rule**: Use descriptive branch names with type prefix.

### Format:
```
<type>/<short-description>
```

### Examples:
```bash
# ✅ CORRECT
feature/user-authentication
fix/cart-total-calculation
refactor/database-queries
docs/api-documentation

# ❌ WRONG
my-branch
updates
branch1
fix
```

### Branch Types:
- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Test additions

---

## 4. Pull Request Guidelines

**Rule**: PRs should be focused, reviewable, and well-documented.

### PR Size:
- **Ideal**: 200-400 lines changed
- **Maximum**: 1000 lines changed
- If larger, break into smaller PRs

### PR Description Template:
```markdown
## Summary
Brief description of what changed and why.

## Changes
- Added user authentication
- Implemented JWT tokens
- Added auth middleware

## Test Plan
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if UI change)
[Add screenshots here]

## Breaking Changes
List any breaking changes and migration steps.
```

---

## 5. Code Review Standards

**Rule**: All code must be reviewed before merging.

### Reviewer Responsibilities:
- Check for logic errors
- Verify tests are adequate
- Ensure code follows style guide
- Look for security issues
- Suggest improvements

### Author Responsibilities:
- Respond to all comments
- Make requested changes
- Don't merge until approved
- Resolve conversations

### Review Turnaround:
- Review within 24 hours
- Request changes or approve
- Don't leave PRs hanging

---

## 6. Branching Strategy

**Rule**: Use feature branch workflow or GitFlow.

### Feature Branch Workflow:
```
main (production)
  ├── feature/new-feature
  ├── fix/bug-fix
  └── hotfix/critical-issue
```

### GitFlow (larger projects):
```
main (production)
  └── develop (integration)
      ├── feature/new-feature
      ├── release/v1.2.0
      └── hotfix/critical-issue
```

### Branch Protections:
- `main` requires PR + approval
- `main` requires passing tests
- `main` cannot be force-pushed
- Delete branches after merge

---

## 7. Rebase vs Merge

**Rule**: Rebase feature branches, merge to main.

```bash
# Update feature branch (REBASE)
git checkout feature/my-feature
git pull --rebase origin main

# Merge to main (MERGE)
git checkout main
git merge --no-ff feature/my-feature
```

### Why Rebase Feature Branches:
- Clean, linear history
- Easier to review
- Simpler git log

### Why Merge to Main:
- Preserves feature branch history
- Clear merge commits
- Easy to revert entire feature

---

## 8. Never Force Push to Shared Branches

**Rule**: Never `git push --force` to `main`, `develop`, or shared branches.

```bash
# ✅ CORRECT: Force push to your feature branch
git checkout feature/my-feature
git push --force-with-lease origin feature/my-feature

# ❌ WRONG: Force push to main
git checkout main
git push --force origin main
```

### When Force Push is OK:
- Your own feature branch
- After rebasing feature branch
- Use `--force-with-lease` (safer)

---

## 9. Keep History Clean

**Rule**: Don't commit generated files, build artifacts, or dependencies.

### .gitignore Should Include:
```
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.min.js

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
```

---

## 10. Semantic Versioning

**Rule**: Use semantic versioning for releases.

### Format: MAJOR.MINOR.PATCH
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Examples:
```
v1.0.0 → v1.0.1  (bug fix)
v1.0.1 → v1.1.0  (new feature)
v1.1.0 → v2.0.0  (breaking change)
```

---

## Git Workflow Checklist

Before pushing:
- [ ] Commit messages follow format
- [ ] Branch name is descriptive
- [ ] No generated files committed
- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] No merge conflicts

Before merging PR:
- [ ] PR description complete
- [ ] All tests pass in CI
- [ ] Code reviewed and approved
- [ ] Conversations resolved
- [ ] Branch up to date with main

---

## Common Commands

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit with message
git add .
git commit -m "feat(scope): description"

# Push feature branch
git push -u origin feature/my-feature

# Update feature branch with main
git checkout feature/my-feature
git pull --rebase origin main

# Interactive rebase (clean up commits)
git rebase -i HEAD~3

# Amend last commit (if not pushed)
git commit --amend

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes
git stash
git stash pop
```

---

## Resources

- Conventional Commits: https://www.conventionalcommits.org/
- GitFlow: https://nvie.com/posts/a-successful-git-branching-model/
- Semantic Versioning: https://semver.org/
