export type { LLMProvider, LLMProviderType, LLMRequestOptions } from './llm-provider.js';
export { AnthropicProvider } from './anthropic-provider.js';
export { OpenAIProvider } from './openai-provider.js';

import type { LLMProvider, LLMProviderType } from './llm-provider.js';
import { AnthropicProvider } from './anthropic-provider.js';
import { OpenAIProvider } from './openai-provider.js';

/**
 * Create an LLM provider instance based on type
 */
export function createLLMProvider(type: LLMProviderType, apiKey: string): LLMProvider {
  switch (type) {
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'openai':
      return new OpenAIProvider(apiKey);
    default:
      throw new Error(`Unknown LLM provider: ${type}`);
  }
}
