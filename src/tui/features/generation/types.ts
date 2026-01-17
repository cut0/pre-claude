import type { AiContext, Scenario } from '../../../types';

export type StreamChunk = {
  type: 'text_delta';
  text: string;
};

export type GenerateDesignDocParams = {
  scenario: Scenario;
  formData: Record<string, unknown>;
  aiContext: AiContext;
};

export type GeneratePreviewParams = {
  scenario: Scenario;
  formData: Record<string, unknown>;
  aiContext: AiContext;
  onChunk: (chunk: string) => void;
  onComplete: (content: string) => void;
  onError: (error: Error) => void;
};
