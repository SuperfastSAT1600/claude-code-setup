/**
 * LLM Provider abstraction layer
 * Supports Anthropic (Claude) and OpenAI (GPT) as interchangeable providers
 */

export type LLMProviderType = 'anthropic' | 'openai';

export interface LLMRequestOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface LLMResponse {
  text: string;
  stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  tokenUsage: {
    input: number;
    output: number;
  };
}

export interface LLMProvider {
  readonly providerType: LLMProviderType;
  generateText(userPrompt: string, options: LLMRequestOptions): Promise<LLMResponse>;
}
