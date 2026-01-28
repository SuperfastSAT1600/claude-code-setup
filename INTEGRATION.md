# Integration Guide

How to add Claude Code to your **existing codebase**.

---

## Overview

You have an existing project and want to add Claude Code workflow automation.

**Example scenario**: You have a project at `/home/user/my-app` and want to add Claude Code.

**What you'll end up with**:
```
my-app/                    (your existing project)
├── .claude/              ← NEW (workflow system)
├── CLAUDE.md             ← NEW (your tech stack config)
├── setup.cjs             ← NEW (optional setup wizard)
├── lib/                  ← NEW (wizard modules)
├── src/                  (your existing code - unchanged)
├── package.json          (your existing code - unchanged)
└── ... (rest of your code - unchanged)
```

**Estimated Time**: 20-40 minutes

---

## Prerequisites

- [x] Existing codebase with code in it
- [x] Git initialized
- [x] Claude Code CLI installed: `npm install -g @anthropic-ai/claude-code`

---

## Step 1: Download Claude Code Setup

First, get the `claude-code-setup` files. Two options:

### Option A: Clone Next to Your Project (Recommended)

```bash
# Where you are now: /home/user/my-app (your project)

# Go up one level
cd ..

# Clone claude-code-setup next to your project
git clone https://github.com/YOUR-ORG/claude-code-setup.git

# Now you have:
# /home/user/my-app/              (your project)
# /home/user/claude-code-setup/   (the template)
```

### Option B: Clone to Temp Directory

```bash
# Clone to /tmp (will be deleted later)
git clone https://github.com/YOUR-ORG/claude-code-setup.git /tmp/claude-code-setup
```

---

## Step 2: Copy Files Into Your Project

Now copy the Claude Code files into your project:

```bash
# Go to your project directory
cd /home/user/my-app

# Copy workflow system
cp -r ../claude-code-setup/.claude/ .

# Copy tech stack config (REQUIRED!)
cp ../claude-code-setup/CLAUDE.md .

# Copy setup wizard (OPTIONAL but recommended)
cp ../claude-code-setup/setup.cjs .
cp -r ../claude-code-setup/lib/ .

# Copy MCP template (OPTIONAL)
cp ../claude-code-setup/.mcp.template.json .
```

**If you used /tmp in Option B**, replace `../claude-code-setup/` with `/tmp/claude-code-setup/`:
```bash
cp -r /tmp/claude-code-setup/.claude/ .
cp /tmp/claude-code-setup/CLAUDE.md .
# etc...
```

**After this step, your project has**:
```
my-app/
├── .claude/       ← NEW (33 agents, 20 commands, 13 checklists)
├── CLAUDE.md      ← NEW (tech stack config)
├── setup.cjs      ← NEW (wizard)
├── lib/           ← NEW (wizard modules)
├── src/           (your existing code)
└── ...
```

---

## Step 3: Customize CLAUDE.md

Open `CLAUDE.md` in your project and replace the placeholders:

```bash
# Open CLAUDE.md in your editor
code CLAUDE.md   # or vim, nano, etc.
```

**Find and replace**:
- `{{FRONTEND_STACK}}` → `Next.js 14, React 18, TypeScript` (or whatever you use)
- `{{BACKEND_STACK}}` → `Supabase, PostgreSQL` (or whatever you use)
- `{{TESTING_STACK}}` → `Vitest, Playwright` (or whatever you use)
- `{{PROJECT_STRUCTURE}}` → Your actual directory structure

**Or use the wizard** (easier):
```bash
# Wizard will detect your stack and update CLAUDE.md automatically
node setup.cjs
```

---

## Step 4: Add Framework-Specific Templates (If Needed)

Claude Code includes generic templates (test, migration, PR description) that work out of the box.

If you use React/Next.js, copy those templates:

```bash
# Using React?
cp .claude/templates/variants/react/*.template .claude/templates/

# Using Next.js?
cp .claude/templates/variants/nextjs/*.template .claude/templates/
```

---

## Step 5: Test It Works

```bash
# Start Claude Code
claude
```

In Claude, ask:
```
What's our tech stack?
```

Claude should describe YOUR stack (from `CLAUDE.md`), not the template defaults.

---

## Complete Example Walkthrough

Let's say you have a Next.js + Supabase project at `/Users/john/projects/my-saas-app`:

```bash
# 1. Download claude-code-setup
cd /Users/john/projects
git clone https://github.com/YOUR-ORG/claude-code-setup.git

# 2. Go to your project
cd my-saas-app

# 3. Copy files
cp -r ../claude-code-setup/.claude/ .
cp ../claude-code-setup/CLAUDE.md .
cp ../claude-code-setup/setup.cjs .
cp -r ../claude-code-setup/lib/ .

# 4. Run setup wizard (detects Next.js + Supabase automatically)
node setup.cjs

# The wizard will:
# - Detect: Next.js 14, Supabase, Vitest
# - Offer to update CLAUDE.md with detected stack
# - Configure MCP servers
# - Done!

# 5. Copy Next.js templates
cp .claude/templates/variants/nextjs/*.template .claude/templates/
cp .claude/templates/variants/react/*.template .claude/templates/

# 6. Add to git
git add .claude/ CLAUDE.md setup.cjs lib/
git commit -m "Add Claude Code workflow automation"

# 7. Start using it
claude
```

Your project now has Claude Code! 🎉

---

## What If I Don't Want setup.cjs?

You can skip copying `setup.cjs` and `lib/`:

```bash
# Minimal integration (just copy these 2)
cp -r ../claude-code-setup/.claude/ .
cp ../claude-code-setup/CLAUDE.md .

# Edit CLAUDE.md manually
code CLAUDE.md
# Replace {{...}} placeholders with your stack

# Done!
claude
```

---

## Cleanup (Optional)

After copying everything, you can delete the cloned template:

```bash
# If you cloned next to your project:
rm -rf ../claude-code-setup

# If you cloned to /tmp:
rm -rf /tmp/claude-code-setup
```

---

## Troubleshooting

### "I don't see .claude/ folder after copying"

**Cause**: You might be in the wrong directory

**Fix**: Check where you are:
```bash
pwd  # Should show /home/user/my-app (your project)
ls -la  # Should show .claude/ folder
```

### "Claude doesn't know my tech stack"

**Cause**: `CLAUDE.md` still has `{{...}}` placeholders

**Fix**: Edit `CLAUDE.md` and replace all placeholders, OR run `node setup.cjs`

### "setup.cjs not found"

**Cause**: You didn't copy `setup.cjs` and `lib/`

**Fix**: Either copy them, or skip the wizard and edit `CLAUDE.md` manually

---

## Next Steps

1. Read [WORKFLOW.md](WORKFLOW.md) - Complete workflow guide
2. Try `/full-feature` - Build your first feature with Claude
3. Commit changes: `git add .claude/ CLAUDE.md && git commit -m "Add Claude Code"`

---

**Need Help?**
- Template setup: [TEMPLATE-SETUP.md](TEMPLATE-SETUP.md)
- Main README: [README.md](README.md)
- Issues: https://github.com/YOUR-ORG/claude-code-setup/issues
