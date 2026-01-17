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

export type GeneratePreviewResult = {
  content: string;
  sessionId: string | null;
};

export type GeneratePreviewParams = {
  scenario: Scenario;
  formData: Record<string, unknown>;
  aiContext: AiContext;
  onChunk: (chunk: string) => void;
  onComplete: (result: GeneratePreviewResult) => void;
  onError: (error: Error) => void;
};
