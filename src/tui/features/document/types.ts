export type DocumentMetadata = {
  scenarioId: string;
  formData: Record<string, unknown>;
};

export type DocumentWithMetadata = {
  filename: string;
  content: string;
  metadata: DocumentMetadata | null;
};

export type ReadDocumentResult =
  | { success: true; doc: DocumentWithMetadata }
  | { success: false; error: 'not_found' | 'scenario_mismatch' };
