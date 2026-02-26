import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, LLMRequestOptions, LLMResponse } from './llm-provider.js';
import { Logger } from '../utils/logger.js';

export class AnthropicProvider implements LLMProvider {
  readonly providerType = 'anthropic' as const;
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateText(userPrompt: string, options: LLMRequestOptions): Promise<LLMResponse> {
    Logger.info(`Calling Anthropic API (model: ${options.model})...`);

    const message = await this.client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: options.systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return {
      text: content.text,
      stopReason: message.stop_reason as 'end_turn' | 'max_tokens' | 'stop_sequence',
      tokenUsage: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens
      }
    };
  }
}
