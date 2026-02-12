#!/usr/bin/env node

/**
 * Blog Agent CLI
 * Main entry point for the blog writing agent system
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { BlogWriterAgent } from './agents/blog-writer.js';
import { BlogCLI } from './cli.js';
import { FileManager } from './utils/file-manager.js';
import { formatAsMarkdown, slugify, countWords } from './utils/content-formatter.js';
import { Logger, LogLevel } from './utils/logger.js';
import { paths } from './config/agent-config.js';

// Set log level from environment
if (process.env.DEBUG === 'true') {
  Logger.setLevel(LogLevel.DEBUG);
}

/**
 * Main CLI function
 */
async function main() {
  try {
    // Get user input interactively
    const request = await BlogCLI.getContentRequest();

    // Generate blog post
    BlogCLI.showProgress('자료 수집 및 분석 중');

    const agent = new BlogWriterAgent(undefined, request.llmProvider);
    const generated = await agent.generatePost(request);

    // Save to outputs
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `${timestamp}-${slugify(generated.title)}.md`;
    const outputPath = path.join(paths.drafts, filename);

    // Format as markdown with frontmatter
    const markdown = formatAsMarkdown(generated);
    await FileManager.writeFile(outputPath, markdown);

    // Show results
    console.log('\n' + '='.repeat(60));
    BlogCLI.showSuccess('블로그 글 생성 완료!');
    console.log('='.repeat(60) + '\n');

    console.log(`📄 제목: ${generated.title}`);
    console.log(`📝 길이: ${countWords(generated.content)} 단어`);
    console.log(`📁 저장 위치: ${outputPath}\n`);

    if (generated.references.length > 0) {
      console.log('📚 참고 자료:');
      generated.references.forEach((ref, i) => {
        console.log(`   ${i + 1}. [${ref.type}] ${ref.title}`);
      });
      console.log('');
    }

    BlogCLI.showInfo('파일을 열어서 내용을 확인하고 수정하세요!');
    console.log(`   notepad "${outputPath}"\n`);

  } catch (error) {
    if (error instanceof Error && error.message === 'User cancelled the prompt') {
      console.log('\n👋 취소되었습니다.\n');
      process.exit(0);
    }

    console.error('\n❌ 오류 발생:', error instanceof Error ? error.message : error);
    Logger.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { BlogWriterAgent };
export * from './types.js';
