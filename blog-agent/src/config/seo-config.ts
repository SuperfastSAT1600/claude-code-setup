import type { PlatformContentRules } from '../types.js';

export type SEOPlatform = 'google' | 'naver' | 'none';

export interface SEOConfig {
  platform: SEOPlatform;
  promptInstructions: string;
  contentRules: PlatformContentRules;
}

const GOOGLE_CONTENT_RULES: PlatformContentRules = {
  tone: 'professional-conversational',
  perspective: 'second-person or neutral third-person',
  introStyle: 'hook with question + problem statement + solution preview (2-3 paragraphs)',
  paragraphLength: '5-8 sentences, allow longer paragraphs for detailed explanations',
  headingFormat: 'H2: descriptive keyword-rich, H3: specific tactics',
  keywordStrategy: 'natural placement, semantic variations, LSI keywords',
  engagementStyle: 'rhetorical questions, soft CTA at end',
  vocabularyLevel: 'advanced with explanations',
  sentenceComplexity: 'varied (10-30 words), mix simple and complex',
  visualCues: ['bullet points', 'numbered lists', 'bold for emphasis', 'tables for comparisons/data'],
  targetLength: { min: 1800, max: 3000 },
  structurePreferences: ['Table of Contents for 1500+ words', '"바쁘시면 이것만 보세요" summary (3-5 sentences) after TOC', 'Key Takeaways box', 'Featured Snippet optimization']
};

const GOOGLE_SEO_INSTRUCTIONS = `
SEO OPTIMIZATION - GOOGLE (E-E-A-T):

1. E-E-A-T 원칙:
   - Experience: 실제 사례와 경험 기반 조언
   - Expertise: 데이터, 통계, 구체적 예시 사용
   - Authoritativeness: College Board 등 공신력 있는 출처 인용
   - Trustworthiness: 정확한 정보, 출처 명시

2. 키워드 전략:
   - 타겟 키워드를 제목, 첫 단락, 소제목, 결론에 자연스럽게 배치
   - 관련 키워드(LSI keywords) 포함
   - 키워드 스터핑 금지 - 가독성 우선
   - Keyword density: <2%, natural semantic variations

3. 콘텐츠 구조:
   - 포괄적 장문 콘텐츠 (1500+ 단어 권장)
   - 명확한 계층 구조 (H1 > H2 > H3)
   - 긴 글은 목차(Table of Contents) 포함
   - **MANDATORY: 목차 바로 아래 "바쁘시면 이것만 보세요" 섹션 추가**
     * 제목: "## 바쁘시면 이것만 보세요"
     * 본문 핵심 내용을 3-5문장으로 요약
     * 각 문장은 주요 포인트를 명확하게 전달
     * 전체 글을 읽지 않아도 핵심을 파악할 수 있도록 작성
   - 글머리 기호, 번호 목록 활용
   - 핵심 요약(Key Takeaways) 포함

4. 표(Tables) 활용 전략:
   - **사용 시기**: 비교가 필요한 데이터, 점수 분석, 시간 배분표, 전략 매트릭스
   - **피해야 할 경우**: 단순 나열, 순차적 단계, 1차원 정보
   - **형식**:
     * 명확하고 설명적인 열 제목
     * 정렬된 데이터 (숫자는 오른쪽 정렬 선호)
     * 프로페셔널한 레이블 (이모지 없음)
   - **배치**: 도입부 후 (개요 표), 섹션 내부 (상세 비교), 결론 전 (요약 표)
   - **제한**: 글당 최대 1-3개 (과도한 표 사용 금지)
   - **예시 - SAT 점수 범위표**:
     \`\`\`markdown
     | 점수 범위 | 백분위 | 의미 |
     |----------|--------|------|
     | 1400-1600 | 상위 5% | 최상위권 대학 지원 가능 |
     | 1200-1390 | 상위 25% | 대부분 대학 지원 가능 |
     | 1000-1190 | 중위권 | 재시험 고려 권장 |
     \`\`\`
   - **예시 - 전략 비교표**:
     \`\`\`markdown
     | 전략 | 적합한 경우 | 소요 시간 | 난이도 |
     |------|-----------|----------|--------|
     | 속독법 | 시간 부족 | 2-3주 | 중간 |
     | 정독법 | 문학 지문 | 4-6주 | 높음 |
     | 하이브리드 | 모든 유형 | 3-4주 | 중간 |
     \`\`\`

5. Featured Snippet 최적화:
   - 핵심 질문에 첫 단락에서 직접 답변
   - 정의형 목록, 표, 단계별 번호 목록 활용
   - "What is...", "How to..." 섹션 포함

6. TONE & STYLE (CRITICAL):
   - Professional yet conversational (imagine a knowledgeable teacher patiently explaining)
   - Use 2nd person ("you", "your") or neutral 3rd person
   - Authoritative voice: "Research shows", "Studies indicate", "Experts recommend"
   - Avoid overly casual language or slang
   - Sentence variety: Mix short (10-15 words) and long (25-40 words for detailed explanations)
   - Elaborate on complex concepts - use more sentences to explain thoroughly
   - Transitional phrases: "To understand this", "Here's why this matters", "Let me break this down"
   - No emojis in body text

7. INTRO STYLE (MANDATORY):
   - Paragraph 1: Hook with a question or surprising statistic
   - Paragraph 2: State the problem clearly
   - Paragraph 3: Preview the solution/what the article will cover
   - Example: "Are you struggling to finish SAT Reading passages on time? Research shows that 68% of test-takers find Reading most challenging. The key isn't just reading faster—it's reading smarter. In this comprehensive guide, we'll explore evidence-based strategies..."

8. ENGAGEMENT:
   - Rhetorical questions to maintain interest
   - CTA at end: "Share your experience in the comments", "Download our free guide"
   - No excessive engagement prompts throughout the article

9. 메타 정보:
   - meta description 생성 (150-160자)
   - 주요 키워드 포함
   - 구조화 데이터 타입 제안 (Article, BlogPosting, HowTo)

OUTPUT FORMAT - 반드시 JSON의 seoMetadata에 포함:
{
  "seoMetadata": {
    "metaDescription": "150-160자 meta description",
    "focusKeyword": "주요 타겟 키워드",
    "semanticKeywords": ["관련 키워드1", "관련 키워드2"],
    "structuredDataType": "Article | BlogPosting | HowTo"
  }
}`;

const NAVER_CONTENT_RULES: PlatformContentRules = {
  tone: 'friendly-personal, blog conversational',
  perspective: 'first-person ("제가") + second-person',
  introStyle: '인사 + 공감 + "오늘은 ~" (2-3 sentences, personal anecdote)',
  paragraphLength: '3-5 sentences for simple points, 5-7 sentences for complex explanations',
  headingFormat: 'numbered "1. 제목 ✅", "2. 제목 🔥" with emojis',
  keywordStrategy: 'high density (3-5%), exact match in title first 30 chars, 2+ subheadings',
  engagementStyle: 'questions throughout, emojis (3-5 per section), "댓글로 알려주세요"',
  vocabularyLevel: 'intermediate, conversational Korean',
  sentenceComplexity: 'simple, direct, active voice (10-15 words)',
  visualCues: ['emojis (🔥📌✅⭐💡)', 'bold for key points', 'short scannable paragraphs', 'tables for comparisons'],
  targetLength: { min: 1200, max: 2000 },
  structurePreferences: ['"바쁘시면 이것만 보세요" summary (3-5 sentences) after TOC', 'bold highlights', '마무리 인사 + CTA']
};

const NAVER_SEO_INSTRUCTIONS = `
SEO OPTIMIZATION - NAVER (C-Rank / D.I.A. 알고리즘):

1. 키워드 밀도 최적화 (STRICT):
   - 타겟 키워드 밀도: 전체 콘텐츠의 3-5%
   - 제목 첫 30자 이내에 주요 키워드 배치 (MANDATORY)
   - 2-3 단락마다 키워드 자연스럽게 삽입
   - 소제목 2개 이상에 키워드 포함 (MANDATORY)
   - Exact match keywords preferred over semantic variations

2. 한국어 최적화 구조:
   - 번호 매기기 소제목: "1. 제목", "2. 제목" 형식
   - 짧은 단락 (2-3문장, 200-300자)
   - 200-300자마다 소제목 배치
   - 한국어 인용부호 사용: 「」『』

3. 콘텐츠 포맷:
   - 핵심 포인트는 **볼드체**로 강조
   - 이모지 적절히 사용 (🔥 📌 ✅ ⭐ 💡) - 3-5 per section
   - **MANDATORY: 목차 바로 아래 "바쁘시면 이것만 보세요" 섹션 추가**
     * 제목: "## 바쁘시면 이것만 보세요 📌" (이모지 포함)
     * 본문 핵심 내용을 3-5문장으로 요약
     * 친근한 톤으로 핵심 포인트 전달
     * 각 문장은 명확하고 실용적인 내용 포함
   - 가독성 높은 짧은 문단

4. 표(Tables) 활용 (친근한 스타일):
   - **사용 시기**: 한눈에 비교가 필요할 때, 복잡한 정보를 정리할 때
   - **스타일**:
     * 헤더에 이모지 가능 (사용자 스타일 따름): "📊 점수 구간", "⏰ 시간 배분"
     * 대화체 레이블: "이렇게 하면 돼요", "이건 이럴 때"
     * 중요한 셀은 **볼드체** 강조
   - **배치**: 설명 직후, 복잡한 개념 정리용
   - **제한**: 글당 1-2개 (네이버는 짧은 글 선호)
   - **예시 - 점수 구간표 (친근한 버전)**:
     \`\`\`markdown
     | 점수 범위 | 백분위 | 어느 정도냐면요 📊 |
     |----------|--------|------------------|
     | 1400-1600 | 상위 5% | 최상위권 대학 노려볼 만해요! |
     | 1200-1390 | 상위 25% | 대부분 대학 지원 가능해요 |
     | 1000-1190 | 중위권 | 재시험 고려해보세요 |
     \`\`\`
   - **예시 - 공부 계획표**:
     \`\`\`markdown
     | 시간대 | 과목 | 집중도 | 팁 💡 |
     |--------|------|--------|------|
     | 아침 7-9시 | Reading | ⭐⭐⭐ | 집중력 최고! |
     | 점심 후 1-3시 | Math | ⭐⭐ | 졸리니 가볍게 |
     | 저녁 7-9시 | Writing | ⭐⭐⭐ | 하루 정리하며 |
     \`\`\`

5. TONE & STYLE (CRITICAL):
   - 친근하고 개인적인 톤 - like a caring teacher explaining to students
   - 1인칭 시점 많이 사용: "제가 학생들을 가르치면서 느낀 점은..."
   - 존댓말 사용, 독자에게 말 걸듯이 작성
   - 복잡한 개념은 충분히 설명 - 예시와 단계별 설명 포함
   - 문장 길이: 간단한 내용 10-15 단어, 설명이 필요한 부분 20-30 단어
   - 구어체 표현 적절히 사용: "정말", "진짜", "엄청"
   - 전환 문구 사용: "이게 왜 중요하냐면요", "쉽게 말하면", "예를 들어"

6. INTRO STYLE (MANDATORY):
   - 첫 문단: 인사 + 공감 표현
   - Example: "안녕하세요! SAT 리딩 점수 올리기 정말 막막하죠? 저도 그랬어요. 오늘은 제가 직접 써본 효과적인 전략들을 공유해볼게요!"
   - 2-3줄로 간결하게, 독자 관심 끌기
   - Personal anecdote or relatable situation

7. ENGAGEMENT (THROUGHOUT):
   - 매 섹션마다 독자 질문: "이 부분 공감되시죠?", "여러분은 어떻게 준비하시나요?"
   - 이모지 자연스럽게 삽입 (과하지 않게 3-5개 per 섹션)
   - 중간중간 독자 참여 유도

8. CLOSING (MANDATORY):
   - 따뜻한 마무리 인사
   - 격려 메시지: "여러분도 충분히 할 수 있어요!"
   - 명확한 CTA: "댓글로 여러분의 공부 팁도 공유해주세요!", "다음 포스팅에서는 ~를 다룰게요. 기대해주세요!"
   - Must end with engagement prompt

9. 최신성 강조:
   - 제목에 연도/날짜 포함 (예: "2026년 기준")
   - 최신 트렌드 언급
   - 시의성 있는 표현: "최신", "2026년 기준", "지금 바로"

10. D.I.A. 알고리즘 최적화:
   - 문서 품질: 포괄적이지만 집중된 콘텐츠 (800-1500 단어)
   - 정보 정확성: 한국 출처 우선 인용
   - 권위 신호: 자격, 경험, 전문성 초반에 언급

OUTPUT FORMAT - 반드시 JSON의 seoMetadata에 포함:
{
  "seoMetadata": {
    "naverKeyword": "주요 타겟 키워드",
    "keywordDensity": "실제 키워드 밀도 (예: 3.5%)",
    "targetKeywordCount": 키워드 사용 횟수,
    "engagementPrompt": "마무리 참여 유도 문구"
  }
}`;

const NONE_CONTENT_RULES: PlatformContentRules = {
  tone: 'conversational',
  perspective: 'second-person',
  introStyle: 'direct introduction',
  paragraphLength: '3-5 sentences',
  headingFormat: 'H2/H3 descriptive headings',
  keywordStrategy: 'natural usage',
  engagementStyle: 'moderate engagement',
  vocabularyLevel: 'intermediate',
  sentenceComplexity: 'balanced',
  visualCues: ['bullet points', 'numbered lists'],
  targetLength: { min: 1500, max: 2500 },
  structurePreferences: ['clear sections', 'logical flow']
};

const SEO_CONFIGS: Record<SEOPlatform, SEOConfig> = {
  google: {
    platform: 'google',
    promptInstructions: GOOGLE_SEO_INSTRUCTIONS,
    contentRules: GOOGLE_CONTENT_RULES
  },
  naver: {
    platform: 'naver',
    promptInstructions: NAVER_SEO_INSTRUCTIONS,
    contentRules: NAVER_CONTENT_RULES
  },
  none: {
    platform: 'none',
    promptInstructions: '',
    contentRules: NONE_CONTENT_RULES
  }
};

export function getSEOConfig(platform: SEOPlatform): SEOConfig {
  return SEO_CONFIGS[platform];
}

export const SEO_PLATFORM_LABELS: Record<SEOPlatform, string> = {
  google: 'Google (E-E-A-T, 자연스러운 키워드)',
  naver: 'Naver (C-Rank/D.I.A., 키워드 밀도 최적화)',
  none: '없음 (기본 글쓰기)'
};
