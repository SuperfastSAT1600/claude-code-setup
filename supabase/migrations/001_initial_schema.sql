-- ============================================
-- Blog Post Database Schema
-- ============================================
-- Purpose: Store completed blog posts with version history and pattern analysis
-- Created: 2026-02-12

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: posts
-- ============================================
-- Stores completed blog posts with full metadata
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core content
  title TEXT NOT NULL,
  content TEXT NOT NULL,  -- Full markdown content
  outline TEXT[] NOT NULL,  -- Array of section titles

  -- Metadata
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  reading_time INTEGER,
  word_count INTEGER,

  -- Generation context
  seo_platform TEXT CHECK (seo_platform IN ('google', 'naver', 'none')),
  topic TEXT NOT NULL,
  target_audience TEXT,

  -- SEO metadata (JSONB for flexibility)
  seo_metadata JSONB,

  -- References used (JSONB array)
  references JSONB DEFAULT '[]',

  -- Completion tracking
  completion_status JSONB,  -- {stopReason, tokenUsage}

  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- For pattern analysis
  writing_style JSONB,  -- Snapshot of WritingStyle used for generation

  -- Performance tracking (for future use)
  performance_metrics JSONB  -- {views, engagement, etc.}
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(seo_platform);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_completed_at ON posts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: post_versions
-- ============================================
-- Tracks edit history for completed posts
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Version tracking
  version_number INTEGER NOT NULL,

  -- Content snapshot
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  outline TEXT[] NOT NULL,

  -- What changed
  change_type TEXT NOT NULL CHECK (change_type IN ('generated', 'edited', 'completed')),
  changes_summary JSONB,  -- {added_sections: [], removed_sections: [], modified_sections: []}

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one version number per post
  UNIQUE(post_id, version_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_versions_post_id ON post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON post_versions(created_at DESC);

-- ============================================
-- TABLE: successful_patterns
-- ============================================
-- Stores learned patterns from completed posts for future improvement
CREATE TABLE IF NOT EXISTS successful_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Pattern identification
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'korean_ending_mix',
    'heading_structure',
    'paragraph_length',
    'emoji_usage',
    'engagement_style',
    'topic_approach'
  )),

  -- Platform context
  seo_platform TEXT,
  category TEXT,

  -- Pattern data
  pattern_data JSONB NOT NULL,  -- The actual pattern (e.g., {formalRatio: 0.7, conversationalRatio: 0.3})

  -- Metrics
  success_score FLOAT,  -- 0-1 score based on user satisfaction
  usage_count INTEGER DEFAULT 1,  -- How many posts exhibit this pattern

  -- Example posts
  example_post_ids UUID[],  -- Array of post IDs that demonstrate this pattern

  -- Timestamps
  first_observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patterns_type ON successful_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_platform ON successful_patterns(seo_platform);
CREATE INDEX IF NOT EXISTS idx_patterns_score ON successful_patterns(success_score DESC);

-- Updated timestamp trigger for patterns
CREATE TRIGGER update_patterns_last_updated BEFORE UPDATE ON successful_patterns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE posts IS 'Completed blog posts with full metadata and generation context';
COMMENT ON TABLE post_versions IS 'Version history tracking all edits made to completed posts';
COMMENT ON TABLE successful_patterns IS 'Learned patterns extracted from successful posts for continuous improvement';

COMMENT ON COLUMN posts.writing_style IS 'Snapshot of WritingStyle object used during generation for pattern analysis';
COMMENT ON COLUMN posts.completion_status IS 'LLM completion metadata including stop reason and token usage';
COMMENT ON COLUMN post_versions.changes_summary IS 'Summary of what changed between versions';
COMMENT ON COLUMN successful_patterns.pattern_data IS 'The extracted pattern data in JSONB format for flexibility';
