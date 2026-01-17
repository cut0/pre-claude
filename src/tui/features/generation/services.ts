import { query } from '@anthropic-ai/claude-agent-sdk';

import type {
  GenerateDesignDocParams,
  GeneratePreviewParams,
  StreamChunk,
} from './types';

export async function* generateDesignDocStream({
  scenario,
  formData,
  aiContext,
}: GenerateDesignDocParams): AsyncGenerator<StreamChunk> {
  const prompt = scenario.prompt({ formData, aiContext });

  for await (const msg of query({
    prompt,
    options: {
      includePartialMessages: true,
    },
  })) {
    if (msg.type === 'stream_event') {
      const event = msg.event as {
        type: string;
        delta?: { type: string; text?: string };
      };
      if (
        event.type === 'content_block_delta' &&
        event.delta?.type === 'text_delta' &&
        event.delta.text != null
      ) {
        yield { type: 'text_delta', text: event.delta.text };
      }
    }
  }
}

export const generatePreview = async ({
  scenario,
  formData,
  aiContext,
  onChunk,
  onComplete,
  onError,
}: GeneratePreviewParams): Promise<void> => {
  try {
    let content = '';
    for await (const chunk of generateDesignDocStream({
      scenario,
      formData,
      aiContext,
    })) {
      content += chunk.text;
      onChunk(chunk.text);
    }
    onComplete(content);
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};
