# Supabase Post Storage & Pattern Learning Setup

This guide walks you through setting up Supabase database integration for blog post storage and intelligent pattern learning.

---

## Benefits

✅ **Structured queries** - Filter posts by category, platform, date range
✅ **Rich metadata** - Full `writing_style` JSONB for deep style analysis
✅ **Pattern learning** - Automatically extract and apply successful writing patterns
✅ **Version history** - Track all edits to completed posts
✅ **Dual-save backup** - Filesystem + database for safety

---

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Project Created**: Create a new Supabase project
3. **Environment Variables**: Supabase URL and keys

---

## Step 1: Run Database Migration

Apply the schema to create tables (`posts`, `post_versions`, `successful_patterns`):

```bash
# Option A: Using Supabase CLI (recommended)
cd supabase
supabase db push

# Option B: Using Supabase Dashboard
# 1. Open your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Copy contents of supabase/migrations/001_initial_schema.sql
# 4. Paste and run
```

**Verify migration**:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('posts', 'post_versions', 'successful_patterns');
```

You should see 3 tables listed.

---

## Step 2: Get Supabase Credentials

### From Supabase Dashboard:

1. **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** (⚠️ Keep secret!): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Step 3: Configure Environment Variables

Add to **both** `.env` files:

### `blog-agent/.env`
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Feature Flags (enable Supabase features)
ENABLE_SUPABASE_STORAGE=true
PREFER_SUPABASE_POSTS=true
ENABLE_PATTERN_LEARNING=true
```

### Root `.env`
```bash
# Same Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Step 4: Migrate Existing Posts

Import all existing JSON drafts to Supabase:

```bash
npm run blog:migrate
```

**Expected output**:
```
🚀 Starting migration of posts to Supabase...
📁 Found 5 drafts to migrate
✅ Migrated: post-1.json → a1b2c3d4-...
✅ Migrated: post-2.json → e5f6g7h8-...
...
📊 Migration Summary:
   Total files: 5
   ✅ Successful: 5
   ❌ Failed: 0
✨ Migration complete! Posts are now in Supabase.
```

---

## Step 5: Verify Setup

### Check Posts Table
```sql
SELECT id, title, seo_platform, completed_at,
       writing_style->>'tone' as tone
FROM posts
ORDER BY completed_at DESC
LIMIT 5;
```

### Check Versions Table
```sql
SELECT post_id, version_number, change_type, created_at
FROM post_versions
ORDER BY created_at DESC
LIMIT 5;
```

### Check Patterns Table
```sql
SELECT pattern_type, seo_platform, usage_count, pattern_data
FROM successful_patterns
ORDER BY usage_count DESC;
```

---

## How It Works

### 1. Dual-Save Architecture

When you generate a new post via the web UI:

```
User clicks "Generate Post"
  ↓
Save to filesystem (backup)
  ↓
Save to Supabase (primary)
  ├── Extract writing_style (formal/conversational ratios, emoji usage, etc.)
  ├── Create initial version record
  └── Trigger pattern extraction (async, non-blocking)
```

**File**: `src/app/api/posts/save/route.ts`

---

### 2. Style-Aware Context Gathering

When generating a new post, the agent prioritizes Supabase posts (richer metadata):

```
Load from 3 sources in parallel:
  - Supabase posts (5 most recent) [PRIORITY]
  - Markdown files (5 samples)
  - PDF files (5 samples)

Deduplicate by title (Supabase > files)
  ↓
Extract writing_style from all posts
  ↓
Merge styles (average ratios, most common patterns)
  ↓
Use merged style to guide new post generation
```

**File**: `blog-agent/src/agents/blog-writer.ts` → `gatherContext()`

---

### 3. Pattern Learning

After each post save, the system extracts patterns from the 20 most recent posts:

**Patterns Extracted**:
- `korean_ending_mix` - Formal/conversational ratio per platform
- `heading_structure` - Numbering, emoji usage, length preferences
- `emoji_usage` - Frequency, common emojis, placement
- `paragraph_length` - Average paragraph/sentence length
- `engagement_style` - Questions, CTAs, reader interaction

**Example Pattern**:
```json
{
  "pattern_type": "korean_ending_mix",
  "seo_platform": "naver",
  "pattern_data": {
    "formalRatio": 0.3,
    "conversationalRatio": 0.7,
    "formalContexts": ["definitions", "main_points"],
    "conversationalContexts": ["examples", "reassurance"],
    "sampleSize": 12
  },
  "usage_count": 12
}
```

**Future Use**: These patterns can dynamically adjust prompts (e.g., "Apply 70% conversational endings for Naver posts").

---

## Rollback Plan

If issues arise:

```bash
# Disable Supabase in blog-agent/.env
ENABLE_SUPABASE_STORAGE=false
PREFER_SUPABASE_POSTS=false
ENABLE_PATTERN_LEARNING=false
```

System reverts to filesystem-only mode. No data loss - filesystem saves still exist.

---

## Troubleshooting

### Error: "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"

**Fix**: Add Supabase credentials to `.env` (both root and `blog-agent/`)

### Error: "relation 'posts' does not exist"

**Fix**: Run database migration (Step 1)

### Migration script shows "No JSON files found"

**Fix**: Generate some posts first via web UI, then run migration

### Patterns not being extracted

**Check**:
1. `ENABLE_PATTERN_LEARNING=true` in `.env`
2. At least 2 posts in database (patterns need minimum sample size)
3. Check server logs for pattern extraction errors

---

## Database Schema Reference

### `posts` Table
- `id` (UUID) - Primary key
- `title`, `content`, `outline` - Post content
- `writing_style` (JSONB) - Extracted style metadata
- `seo_platform` - google | naver | none
- `category`, `tags` - Categorization
- `completed_at` - Timestamp for sorting

### `post_versions` Table
- `post_id` (FK) - References posts.id
- `version_number` - Sequential version
- `change_type` - generated | edited | completed
- `content`, `outline` - Snapshot of changes

### `successful_patterns` Table
- `pattern_type` - korean_ending_mix | heading_structure | etc.
- `seo_platform` - Platform-specific patterns (nullable)
- `pattern_data` (JSONB) - The actual pattern
- `usage_count` - How many posts exhibit this pattern

---

## Next Steps

1. ✅ **Complete Setup** (this guide)
2. Generate a new blog post via web UI
3. Verify dual-save (check filesystem + database)
4. Generate a second post
5. Verify first post's style influenced second post
6. Check patterns extracted in `successful_patterns` table

**Enjoy intelligent, pattern-learning blog generation! 🚀**
