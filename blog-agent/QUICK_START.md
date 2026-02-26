# 🚀 Quick Start Guide

Get your Blog Agent up and running in 5 minutes!

## Step 1: Set Up API Key

1. Get your Anthropic API key from: https://console.anthropic.com/
2. Copy the environment file:
   ```bash
   cd blog-agent
   cp .env.example .env
   ```
3. Edit `.env` and add your API key:
   ```bash
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

## Step 2: Add Your Content (Optional but Recommended)

### Add Your Blog Posts

Replace the example posts with your own:

```bash
# Delete examples
rm blog-agent/data/my-posts/example-*.md

# Add your posts (markdown format)
# Place them in: blog-agent/data/my-posts/
```

**Your posts should look like:**
```markdown
---
title: "Your Post Title"
category: SAT Prep
tags: [reading, tips, strategies]
---

# Your Post Title

Your content here...
```

### Add SAT Materials (Optional)

Add official SAT materials for better accuracy:

```bash
blog-agent/data/sat-materials/
├── official-guides/
│   └── your-guide.md
├── practice-tests/
│   └── test-1.md
└── study-tips/
    └── tips.md
```

## Step 3: Generate Your First Post

```bash
npm run blog:generate
```

This will:
1. Analyze your writing style from existing posts
2. Search SAT materials for relevant information
3. Generate a complete blog post
4. Save it to `blog-agent/data/outputs/drafts/`

## Step 4: Check the Output

Your generated post will be in:
```
blog-agent/data/outputs/drafts/2026-02-09-your-post-title.md
```

Open it, review it, edit as needed!

## Customization

### Change the Topic

Edit `blog-agent/src/index.ts` and modify the request:

```typescript
const request: ContentRequest = {
  topic: 'YOUR TOPIC HERE',
  targetAudience: 'WHO IS THIS FOR',
  desiredLength: 1500,
  includeReferences: true,
  satMaterialsQuery: 'SEARCH TERMS FOR SAT MATERIALS'
};
```

### Adjust Writing Style

Edit `blog-agent/src/config/agent-config.ts`:

```typescript
stylePreferences: {
  tone: 'conversational',    // or 'formal', 'casual', 'academic'
  complexity: 'medium',      // or 'simple', 'advanced'
  perspective: 'second-person' // or 'first-person', 'third-person'
}
```

### Modify Prompts

Customize how the AI generates content by editing:
```
blog-agent/src/config/prompts.ts
```

## Common Issues

### "API key not found"
- Make sure you created `.env` file in `blog-agent/` directory
- Check that `ANTHROPIC_API_KEY` is set correctly
- No quotes needed around the key

### "No posts found"
- Add at least one markdown file to `blog-agent/data/my-posts/`
- Or keep the example posts for testing

### "Module not found"
```bash
# Reinstall dependencies
npm install
```

## Next Steps

1. **Generate more content**: Edit the request in `src/index.ts`
2. **Create a CLI**: Add interactive prompts (use `enquirer` package)
3. **Batch generation**: Create multiple posts at once
4. **Web search**: Integrate web search API for latest info
5. **Templates**: Create post templates for different formats

## Help & Support

- Check `blog-agent/README.md` for full documentation
- Review `.claude/agents/blog-content-creator.md` for agent details
- See `.claude/skills/blog-writing-patterns.md` for writing best practices

Happy blogging! 🎉
