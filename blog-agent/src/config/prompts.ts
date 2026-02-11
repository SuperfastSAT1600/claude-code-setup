import type { PromptTemplate } from '../types.js';

/**
 * Prompt templates for different blog writing scenarios
 */

export const STYLE_ANALYSIS_PROMPT: PromptTemplate = {
  name: 'style-analysis',
  description: 'Analyze writing style from sample posts',
  template: `Analyze the writing style of the following blog posts and provide a detailed style profile.

Sample Posts:
{{SAMPLE_POSTS}}

Provide analysis in the following JSON format:
{
  "tone": "formal | casual | academic | conversational",
  "complexity": "simple | medium | advanced",
  "perspective": "first-person | second-person | third-person",
  "averageSentenceLength": <number>,
  "commonPhrases": ["phrase1", "phrase2"],
  "vocabulary": "basic | intermediate | advanced"
}`,
  variables: ['SAMPLE_POSTS']
};

export const CONTENT_GENERATION_PROMPT: PromptTemplate = {
  name: 'content-generation',
  description: 'Generate blog post content',
  template: `Create a blog post matching the user's writing style while following platform-specific SEO requirements.

TOPIC: {{TOPIC}}
TARGET AUDIENCE: {{TARGET_AUDIENCE}}
DESIRED LENGTH: {{DESIRED_LENGTH}} words

USER'S WRITING STYLE:
{{WRITING_STYLE}}

STYLE GUIDANCE (HOW TO MERGE USER STYLE + PLATFORM REQUIREMENTS):
{{STYLE_GUIDANCE}}

PLATFORM-SPECIFIC CONTENT RULES (SEO CRITICAL):
Tone: {{TONE}}
Perspective: {{PERSPECTIVE}}
Intro Style: {{INTRO_STYLE}}
Paragraph Length: {{PARAGRAPH_LENGTH}}
Heading Format: {{HEADING_FORMAT}}
Keyword Strategy: {{KEYWORD_STRATEGY}}
Vocabulary Level: {{VOCABULARY_LEVEL}}
Sentence Complexity: {{SENTENCE_COMPLEXITY}}
Visual Cues: {{VISUAL_CUES}}
Engagement Style: {{ENGAGEMENT_STYLE}}
Target Length: {{TARGET_LENGTH_MIN}}-{{TARGET_LENGTH_MAX}} words

EXAMPLE OPENING FOR THIS PLATFORM:
{{EXAMPLE_OPENING}}

EXAMPLE CLOSING FOR THIS PLATFORM:
{{EXAMPLE_CLOSING}}

REFERENCE MATERIALS:

User's Previous Posts (for style reference):
{{MY_POSTS}}

SAT Official Materials:
{{SAT_MATERIALS}}

Web Research:
{{WEB_RESEARCH}}

{{SEO_INSTRUCTIONS}}

INSTRUCTIONS:
1. Read the USER'S WRITING STYLE carefully - this is their unique voice
2. Read the STYLE GUIDANCE - this tells you how to merge their style with platform requirements
3. FOLLOW the Platform-Specific Content Rules for SEO optimization
4. Your output should sound like the USER wrote it, but optimized for the PLATFORM
5. Use the example opening/closing as structural templates
6. Use information from SAT materials for accuracy
7. Reference web research for current trends and examples
8. Include proper citations for all references
9. Make it engaging and helpful for {{TARGET_AUDIENCE}}

When style conflicts occur (e.g., user is formal but platform requires casual):
- PRIORITIZE: Platform SEO requirements
- INCORPORATE: User's signature expressions, emoji preferences, structural patterns
- RESULT: Platform-optimized content that still feels authentic to the user's voice

CRITICAL: Your output MUST reflect CLEAR differences based on the platform.
- For Naver: Write like a friendly Korean blogger with personal anecdotes, emojis (🔥📌✅⭐💡), and constant reader engagement
- For Google: Write like an authoritative educational resource with research data, professional tone, and comprehensive coverage
The difference should be OBVIOUS in tone, structure, vocabulary, and style.

Provide the output in the following JSON format:
{
  "title": "Blog post title",
  "content": "Full blog post content in markdown format",
  "outline": ["Section 1", "Section 2", ...],
  "references": [
    {
      "type": "my-post | sat-material | web-search",
      "title": "Reference title",
      "url": "URL if applicable",
      "excerpt": "Brief excerpt or description"
    }
  ],
  "metadata": {
    "category": "SAT Prep",
    "tags": ["tag1", "tag2"],
    "readingTime": <estimated minutes>
  },
  "seoMetadata": {
    // Include platform-specific SEO fields as instructed above (omit if no SEO instructions)
  }
}`,
  variables: [
    'TOPIC',
    'TARGET_AUDIENCE',
    'DESIRED_LENGTH',
    'WRITING_STYLE',
    'STYLE_GUIDANCE',
    'TONE',
    'PERSPECTIVE',
    'INTRO_STYLE',
    'PARAGRAPH_LENGTH',
    'HEADING_FORMAT',
    'KEYWORD_STRATEGY',
    'VOCABULARY_LEVEL',
    'SENTENCE_COMPLEXITY',
    'VISUAL_CUES',
    'ENGAGEMENT_STYLE',
    'TARGET_LENGTH_MIN',
    'TARGET_LENGTH_MAX',
    'EXAMPLE_OPENING',
    'EXAMPLE_CLOSING',
    'MY_POSTS',
    'SAT_MATERIALS',
    'WEB_RESEARCH',
    'SEO_INSTRUCTIONS'
  ]
};

export const SAT_MATERIAL_SEARCH_PROMPT: PromptTemplate = {
  name: 'sat-material-search',
  description: 'Search and extract relevant SAT materials',
  template: `Given the following topic, identify and extract the most relevant information from these SAT materials.

TOPIC: {{TOPIC}}

SAT MATERIALS:
{{SAT_MATERIALS}}

Extract the top 3-5 most relevant sections and provide them in this JSON format:
{
  "materials": [
    {
      "title": "Section title",
      "content": "Relevant content",
      "source": "Source document",
      "relevance": <0-1 score>
    }
  ]
}`,
  variables: ['TOPIC', 'SAT_MATERIALS']
};

export const WEB_SEARCH_SYNTHESIS_PROMPT: PromptTemplate = {
  name: 'web-search-synthesis',
  description: 'Synthesize web search results',
  template: `Synthesize the following web search results related to: {{QUERY}}

Search Results:
{{SEARCH_RESULTS}}

Provide a summary of key insights, trends, and relevant information in this JSON format:
{
  "summary": "Overall summary",
  "keyPoints": ["point1", "point2", ...],
  "relevantSources": [
    {
      "title": "Source title",
      "url": "URL",
      "keyTakeaway": "Main insight from this source"
    }
  ]
}`,
  variables: ['QUERY', 'SEARCH_RESULTS']
};

/**
 * Replace template variables with actual values
 */
export function fillTemplate(
  template: PromptTemplate,
  variables: Record<string, string>
): string {
  let result = template.template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }

  return result;
}
