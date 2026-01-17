import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { AiContext, Config, Scenario } from '../../../types';
import type {
  DocumentMetadata,
  DocumentWithMetadata,
  ReadDocumentResult,
} from './types';

const METADATA_START = '<!-- design-docs-metadata';
const METADATA_END = '-->';

export const serializeMetadata = (metadata: DocumentMetadata): string => {
  return `${METADATA_START}\n${JSON.stringify(metadata, null, 2)}\n${METADATA_END}`;
};

export const addMetadataToContent = (
  content: string,
  metadata: DocumentMetadata,
): string => {
  return `${content}\n\n${serializeMetadata(metadata)}`;
};

export const parseMetadata = (
  content: string,
): { metadata: DocumentMetadata | null; content: string } => {
  const metadataStartIndex = content.lastIndexOf(METADATA_START);
  if (metadataStartIndex === -1) {
    return { metadata: null, content };
  }

  const metadataEndIndex = content.indexOf(METADATA_END, metadataStartIndex);
  if (metadataEndIndex === -1) {
    return { metadata: null, content };
  }

  try {
    const metadataJson = content
      .slice(metadataStartIndex + METADATA_START.length, metadataEndIndex)
      .trim();
    const metadata = JSON.parse(metadataJson) as DocumentMetadata;
    const cleanContent = content.slice(0, metadataStartIndex).trim();
    return { metadata, content: cleanContent };
  } catch {
    return { metadata: null, content };
  }
};

export const getOutputDir = (scenario: Scenario): string => {
  return scenario.outputDir ?? join(process.cwd(), 'output');
};

export const getFilename = (
  scenario: Scenario,
  scenarioId: string,
  content: string,
  formData: Record<string, unknown>,
  aiContext: AiContext,
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const filename = scenario.filename;
  if (filename != null) {
    return typeof filename === 'function'
      ? filename({
          scenarioId,
          timestamp,
          content,
          formData,
          aiContext,
        })
      : filename;
  }

  return `design-doc-${scenarioId}-${timestamp}.md`;
};

type SaveDocumentParams = {
  config: Config;
  scenario: Scenario;
  formData: Record<string, unknown>;
  aiContext: AiContext;
  content: string;
  existingFilename?: string;
};

export const saveDocument = async ({
  scenario,
  aiContext,
  content,
  formData,
  existingFilename,
}: SaveDocumentParams): Promise<string> => {
  const filename =
    existingFilename ??
    getFilename(scenario, scenario.id, content, formData, aiContext);

  const outputDir = getOutputDir(scenario);
  const outputPath = join(outputDir, filename);

  const contentWithMetadata = addMetadataToContent(content, {
    scenarioId: scenario.id,
    formData,
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, contentWithMetadata, 'utf-8');

  return outputPath;
};

export const readDocument = async (
  scenario: Scenario,
  filename: string,
): Promise<ReadDocumentResult> => {
  const outputDir = getOutputDir(scenario);
  const filePath = join(outputDir, filename);

  try {
    const rawContent = await readFile(filePath, 'utf-8');
    const { metadata, content } = parseMetadata(rawContent);

    if (metadata?.scenarioId !== scenario.id) {
      return { success: false, error: 'scenario_mismatch' };
    }

    return {
      success: true,
      doc: { filename, content, metadata },
    };
  } catch {
    return { success: false, error: 'not_found' };
  }
};

export const getDocumentsForScenario = async (
  scenario: Scenario,
): Promise<DocumentWithMetadata[]> => {
  const outputDir = getOutputDir(scenario);

  try {
    const files = await readdir(outputDir);
    const mdFiles = files.filter((file) => file.endsWith('.md'));

    const docs = await Promise.all(
      mdFiles.map(async (filename) => {
        const result = await readDocument(scenario, filename);
        return result.success ? result.doc : null;
      }),
    );

    return docs.filter((doc) => doc != null);
  } catch {
    return [];
  }
};
