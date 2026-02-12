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
1. **LANGUAGE REQUIREMENT**: Write the ENTIRE post in KOREAN (한국어) regardless of platform
2. Read the USER'S WRITING STYLE carefully - this is their unique voice
3. Read the STYLE GUIDANCE - this tells you how to merge their style with platform requirements
4. FOLLOW the Platform-Specific Content Rules for SEO optimization
5. Your output should sound like the USER wrote it, but optimized for the PLATFORM
6. Use the example opening/closing as structural templates
7. Use information from SAT materials for accuracy
8. Reference web research for current trends and examples
9. Include proper citations for all references
10. Make it engaging and helpful for {{TARGET_AUDIENCE}}
11. **ELABORATION REQUIREMENTS (Expert-Teacher Tone):**
    - For each main point: Explain WHAT it is, WHY it matters, HOW to apply it
    - Break down complex concepts into digestible steps
    - Provide concrete examples for abstract ideas
    - Use transitional phrases to guide readers through explanations
    - Don't assume prior knowledge - explain background when needed
    - Reassure readers when topics are challenging
    - Use more sentences to ensure thorough understanding - aim for clarity over conciseness

12. **표(TABLE) 사용 가이드라인:**
    - **먼저 평가하기**: 이 정보가 표 형식에 적합한가?
    - **표를 사용해야 할 때:**
      * 2개 이상의 전략/방법을 여러 속성으로 비교할 때
      * 점수 범위/분석을 해석과 함께 보여줄 때
      * 시간표나 학습 계획을 표시할 때
      * 문제 유형 분석 (유형, 접근법, 난이도, 시간)
      * 전후 비교 (점수 개선, 학습 습관 변화)
    - **표를 사용하지 말아야 할 때:**
      * 단순 순차적 단계 (번호 목록 사용)
      * 1차원 나열 (글머리 기호 사용)
      * 서술적 설명이나 이야기
    - **표 품질 요구사항:**
      * 열은 3-5개 최대 (모바일 가독성)
      * 행은 3-8개 이상적 (너무 많으면 압도적)
      * 명확하고 설명적인 헤더
      * 간결한 셀 내용 (셀당 2-10단어 이상적)
      * 일관된 데이터 정렬
    - **플랫폼별 스타일:**
      * 구글: 전문적 레이블, 표에 이모지 없음, 데이터 중심
      * 네이버: 대화체 레이블, 헤더에 이모지 가능 (사용자 스타일 따름), 참여 중심
    - **배치 전략:**
      * 개요 표: 도입부 후
      * 상세 비교 표: 관련 섹션 내부
      * 요약 표: 결론 전
    - **제한**: 글당 최대 1-3개의 표
    - **SAT 사용 예시:**
      * 점수 해석 표 (범위 → 의미)
      * 전략 비교 매트릭스 (방법 → 장단점 → 시간 → 난이도)
      * 학습 일정 (시간 → 과목 → 집중도 → 팁)
      * 문제 유형 분석 (유형 → 특징 → 접근법)

When style conflicts occur (e.g., user is formal but platform requires casual):
- PRIORITIZE: Platform SEO requirements
- INCORPORATE: User's signature expressions, emoji preferences, structural patterns
- RESULT: Platform-optimized content that still feels authentic to the user's voice

CRITICAL: Your output MUST reflect CLEAR differences based on the platform.
- For Naver: Write IN KOREAN (한국어) like a friendly Korean blogger with personal anecdotes and constant reader engagement (emoji usage determined by user's style)
- For Google: Write IN KOREAN (한국어) like an authoritative educational resource with research data, professional tone, and comprehensive coverage
The difference should be OBVIOUS in tone, structure, vocabulary, and style.

**LANGUAGE REMINDER: ALL content must be written in KOREAN (한국어). Do NOT write in English.**

**KOREAN SENTENCE ENDING MIXING (CRITICAL INSTRUCTION):**

If the user's style shows a MIXED sentence ending pattern (e.g., 70% formal + 30% conversational):

1. **Follow the Exact Ratio**: Match the percentage distribution shown in "Korean Sentence Ending Pattern"
   - Example: If user uses 70% formal, aim for ~7 formal sentences per 10 sentences
   - Maintain this ratio throughout the entire post, not just overall

2. **Contextual Usage Rules** (when to use which ending):

   **FORMAL (~다, ~ㄴ다, ~습니다)** - Use for main explanations, definitions, core concepts:
   * "SAT Reading은 시간 관리가 핵심이다"
   * "첫 번째 전략은 키워드 찾기다"
   * "문법 규칙을 이해하는 것이 중요하다"
   * "이 방법은 효과적이다"

   **CONVERSATIONAL (~요, ~어요, ~죠)** - Use for examples, reassurance, questions:
   * "예를 들어, 이런 문제를 봤어요?"
   * "여러분도 충분히 할 수 있어요"
   * "궁금한 점 있으면 댓글로 알려주세요"
   * "이해가 되시나요?"

3. **Paragraph-Level Mixing Pattern**:
   - Typical structure: Formal intro + Formal main points + Conversational example/reassurance
   - Example paragraph:
     * SAT Reading에서 시간 관리가 가장 중요하다. [FORMAL - main point]
     * 각 지문당 13분을 배분하는 것이 이상적이다. [FORMAL - explanation]
     * 예를 들어, 첫 번째 지문을 12분 안에 풀면 나머지 시간을 확보할 수 있어요. [CONVERSATIONAL - example]
     * 여러분도 충분히 할 수 있어요! [CONVERSATIONAL - reassurance]

4. **Platform Independence**: This mixing pattern applies to BOTH Google AND Naver
   - The expert tone with controlled friendliness works across platforms
   - Naver gets additional engagement elements (emojis, CTAs) but NOT pure conversational style
   - Google maintains the same professional-approachable mix

**CRITICAL**: Do NOT default to pure conversational (~요) just because platform is Naver. Respect the user's sophisticated mixing pattern that creates expert authority with approachability.

**CRITICAL OUTPUT REQUIREMENTS:**
- The "outline" field MUST contain exactly 3 items (main sections)
- If user's style shows emojiUsage.frequency='none', do NOT use emojis anywhere in content

Provide the output in the following JSON format:
{
  "title": "Blog post title",
  "content": "Full blog post content in markdown format",
  "outline": ["Section 1", "Section 2", "Section 3"],  // MUST be exactly 3 items
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
