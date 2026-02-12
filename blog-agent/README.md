# Blog Agent - SAT Content Writer

AI-powered blog writing agent that creates engaging SAT preparation content by learning from your writing style, referencing official SAT materials, and incorporating web research.

## 🎯 Features

- **Style Matching**: Analyzes your existing blog posts to match your writing tone and voice
- **SAT Materials Integration**: References official SAT guides, practice tests, and study tips
- **Web Research**: Incorporates current trends and information from web searches
- **Automated Content Generation**: Creates well-structured, engaging blog posts
- **Multiple Output Formats**: Markdown with frontmatter, ready for publishing

## 📁 Project Structure

```
blog-agent/
├── src/
│   ├── agents/              # AI agent implementations
│   │   └── blog-writer.ts   # Main blog writing agent
│   ├── sources/             # Data source loaders
│   │   ├── my-posts-loader.ts
│   │   └── sat-materials-loader.ts
│   ├── processors/          # Content processors
│   ├── templates/           # Template management
│   ├── utils/              # Utilities
│   │   ├── file-manager.ts
│   │   └── logger.ts
│   ├── config/             # Configuration
│   │   ├── agent-config.ts
│   │   └── prompts.ts
│   └── index.ts            # Main entry point
├── data/
│   ├── my-posts/           # Your existing blog posts
│   ├── sat-materials/      # SAT official materials
│   └── outputs/            # Generated content
└── tests/                  # Test files
```

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp blog-agent/.env.example blog-agent/.env
```

### 2. Configuration

Edit `blog-agent/.env`:

```env
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
```

### 3. Add Your Content

**Add your existing posts** (for style analysis):
```bash
# Place your blog posts in markdown format
blog-agent/data/my-posts/post-001.md
blog-agent/data/my-posts/post-002.md
```

**Add SAT materials** (for reference):
```bash
blog-agent/data/sat-materials/official-guides/reading-guide.md
blog-agent/data/sat-materials/practice-tests/test-1.md
blog-agent/data/sat-materials/study-tips/time-management.md
```

### 4. Generate Content

```bash
# Run the blog agent
npm run blog:generate

# Development mode with watch
npm run dev
```

## 📝 Usage

### Basic Example

```typescript
import { BlogWriterAgent } from './blog-agent/src/index.js';

const agent = new BlogWriterAgent();

const content = await agent.generatePost({
  topic: 'SAT Math: Algebra Strategies',
  targetAudience: 'High school students preparing for SAT',
  desiredLength: 1500,
  includeReferences: true,
  satMaterialsQuery: 'algebra math strategies'
});

console.log(content.title);
console.log(content.content);
```

### Content Request Options

```typescript
interface ContentRequest {
  topic: string;              // Main topic of the blog post
  targetAudience: string;     // Who is this for?
  desiredLength: number;      // Approximate word count
  includeReferences: boolean; // Include citations?
  satMaterialsQuery?: string; // Search query for SAT materials
  webSearchQuery?: string;    // Web search query (future)
}
```

## 📊 Data Format

### Your Posts Format

```markdown
---
title: "My SAT Reading Tips"
category: SAT Prep
tags: [reading, comprehension, tips]
---

# My SAT Reading Tips

Your content here...
```

### SAT Materials Format

```markdown
---
source: College Board
title: "Official SAT Reading Guide"
---

# Reading Guide

SAT material content...
```

## 🔧 Configuration

### Agent Configuration

Edit `src/config/agent-config.ts`:

```typescript
export const defaultBlogWriterConfig: BlogWriterConfig = {
  model: 'claude-sonnet-4-5-20250929',
  temperature: 0.7,
  maxTokens: 4000,
  stylePreferences: {
    tone: 'conversational',
    complexity: 'medium',
    perspective: 'second-person'
  }
};
```

### Custom Prompts

Modify prompts in `src/config/prompts.ts` to customize the AI's behavior.

## 🎨 Output

Generated posts are saved to:
- **Drafts**: `blog-agent/data/outputs/drafts/`
- **Published**: `blog-agent/data/outputs/published/`

Output format:

```markdown
---
title: "Generated Post Title"
category: SAT Prep
tags: [tag1, tag2]
generated: 2026-02-09T...
readingTime: 7
---

# Post Content

Your AI-generated content...

## References

1. [Official SAT Guide](...)
2. Previous post: "Related Topic"
```

## 🛠 Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev

# Format code
npm run format

# Lint
npm run lint
npm run lint:fix
```

## 📚 Technologies

- **TypeScript** - Type-safe development
- **Anthropic Claude API** - AI content generation
- **Node.js** - Runtime environment

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Claude API key | Required |
| `CLAUDE_MODEL` | Model to use | `claude-sonnet-4-5-20250929` |
| `CLAUDE_TEMPERATURE` | Creativity level (0-1) | `0.7` |
| `CLAUDE_MAX_TOKENS` | Max response length | `4000` |
| `ENABLE_WEB_SEARCH` | Enable web research | `true` |
| `ENABLE_SAT_REFERENCES` | Use SAT materials | `true` |
| `ENABLE_MY_POSTS_ANALYSIS` | Analyze your style | `true` |

## 📖 Examples

See `blog-agent/data/my-posts/` for example posts (add your own!)

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📄 License

MIT
