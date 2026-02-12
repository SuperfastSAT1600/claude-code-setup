#!/usr/bin/env node

/**
 * Quick blog post generator without interactive prompts
 * Usage: npx tsx blog-agent/generate-post.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.log('Warning: Could not load .env file, trying parent directory');
  dotenv.config();
}

import { BlogWriterAgent } from './src/agents/blog-writer.js';
import { FileManager } from './src/utils/file-manager.js';
import { formatAsMarkdown, countWords } from './src/utils/content-formatter.js';
import { Logger } from './src/utils/logger.js';
import { paths } from './src/config/agent-config.js';
import type { ContentRequest } from './src/types.js';
import type { LLMProviderType } from './src/providers/llm-provider.js';

async function main() {
  console.log('\n🚀 Blog Agent - 포스팅 생성 중...\n');

  // LLM 프로바이더 선택 (환경변수 또는 기본값)
  const llmProvider: LLMProviderType = (process.env.LLM_PROVIDER === 'openai') ? 'openai' : 'anthropic';

  // 사용자 요청 내용
  const request: ContentRequest = {
    topic: '2026년 3월 SAT 시험 40일 완벽 대비 전략 - D-40 학습 로드맵',
    targetAudience: '2026년 3월 SAT 시험을 40일 앞둔 수험생',
    desiredLength: 2000,
    includeReferences: true,
    seoPlatform: 'naver',
    llmProvider,
    satMaterialsQuery: 'SAT preparation time management study plan',
    webSearchQuery: 'SAT 40 days study plan 2026'
  };

  console.log('📋 생성할 포스팅:');
  console.log(`   AI 모델: ${llmProvider === 'openai' ? 'OpenAI GPT' : 'Anthropic Claude'}`);
  console.log(`   플랫폼: ${request.seoPlatform} SEO`);
  console.log(`   주제: ${request.topic}`);
  console.log(`   타겟: ${request.targetAudience}`);
  console.log(`   길이: ${request.desiredLength} 단어`);
  console.log('');

  try {
    console.log('⏳ 자료 수집 중...');

    // Get API key based on provider
    const apiKey = llmProvider === 'openai'
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY;
    const envVar = llmProvider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
    if (!apiKey) {
      throw new Error(`${envVar} not found in environment variables`);
    }

    const agent = new BlogWriterAgent(apiKey, llmProvider);
    const generated = await agent.generatePost(request);

    // Save to outputs
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `${timestamp}-sat-40days-strategy.md`;
    const outputPath = path.join(paths.drafts, filename);

    // Format as markdown with frontmatter
    const markdown = formatAsMarkdown(generated);
    await FileManager.writeFile(outputPath, markdown);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 블로그 글 생성 완료!');
    console.log('='.repeat(60) + '\n');

    console.log(`📄 제목: ${generated.title}`);
    console.log(`📝 길이: ${countWords(generated.content)} 단어`);
    console.log(`📁 저장: ${outputPath}\n`);

    if (generated.references.length > 0) {
      console.log('📚 참고 자료:');
      generated.references.forEach((ref, i) => {
        console.log(`   ${i + 1}. [${ref.type}] ${ref.title}`);
      });
      console.log('');
    }

    console.log('💡 파일을 열어서 확인하세요!');
    console.log(`   notepad "${outputPath}"\n`);

  } catch (error) {
    console.error('\n❌ 오류:', error instanceof Error ? error.message : error);
    Logger.error('Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
