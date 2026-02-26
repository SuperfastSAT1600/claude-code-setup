import OpenAI from 'openai';
import type { LLMProvider, LLMRequestOptions, LLMResponse } from './llm-provider.js';
import { Logger } from '../utils/logger.js';

export class OpenAIProvider implements LLMProvider {
  readonly providerType = 'openai' as const;
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateText(userPrompt: string, options: LLMRequestOptions): Promise<LLMResponse> {
    Logger.info(`Calling OpenAI API (model: ${options.model})...`);

    const completion = await this.client.chat.completions.create({
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      messages: [
        { role: 'developer', content: options.systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return {
      text: content,
      stopReason: completion.choices[0].finish_reason === 'length' ? 'max_tokens' : 'end_turn',
      tokenUsage: {
        input: completion.usage?.prompt_tokens || 0,
        output: completion.usage?.completion_tokens || 0
      }
    };
  }
}
