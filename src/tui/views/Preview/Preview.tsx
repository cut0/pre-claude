import { Box, Text } from 'ink';
import { type FC, useCallback, useMemo, useState } from 'react';

import type { AiContext, Config, Scenario } from '../../../types';
import type { ControlItem } from '../../components/ControlBar';
import { saveDocument } from '../../features/document/services';
import { ACCENT_COLOR, type FormValues } from '../../features/form/types';
import { generatePreview } from '../../features/generation/services';
import { useControl } from '../../hooks/useControl';
import { useMount } from '../../hooks/useMount';
import type { StatusInfo } from '../../layouts/CommonLayout';
import { ScenarioLayout } from '../../layouts/ScenarioLayout';

export type PreviewProps = {
  config: Config;
  scenario: Scenario;
  formValues: FormValues;
  aiContext: AiContext;
  initialContent?: string;
  editingFilename?: string;
  onBack: () => void;
};

export const Preview: FC<PreviewProps> = ({
  config,
  scenario,
  formValues,
  aiContext,
  initialContent = '',
  editingFilename,
  onBack,
}) => {
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [savedFilename, setSavedFilename] = useState<string | null>(null);
  const [showDataPreview, setShowDataPreview] = useState(false);

  const isEditing = editingFilename != null;
  const canSave = previewContent !== '' && !isGenerating;
  const lines = previewContent.split('\n');
  const maxVisible = 15;
  const visibleLines = lines.slice(scrollOffset, scrollOffset + maxVisible);

  const controls = useMemo<ControlItem[]>(
    () => [
      { key: '↑↓/jk', action: 'scroll' },
      { key: 'r', action: 'regenerate' },
      ...(canSave ? [{ key: 's', action: 'save' }] : []),
      { key: 'i', action: 'info' },
      { key: 'q/Esc', action: 'back' },
    ],
    [canSave],
  );

  const status = useMemo((): StatusInfo | undefined => {
    if (error) {
      return { message: `Error: ${error}`, type: 'error' };
    }
    if (isGenerating) {
      return { message: 'Generating...', type: 'warning' };
    }
    if (isSaving) {
      return { message: 'Saving...', type: 'warning' };
    }
    if (savedFilename) {
      return { message: `Saved: ${savedFilename}`, type: 'success' };
    }
    return undefined;
  }, [error, isGenerating, isSaving, savedFilename]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setPreviewContent('');

    let accumulatedContent = '';

    try {
      await generatePreview({
        scenario,
        formData: formValues,
        aiContext,
        onChunk: (chunk) => {
          accumulatedContent += chunk;
          setPreviewContent(accumulatedContent);
        },
        onComplete: (content) => {
          setPreviewContent(content);
          setIsGenerating(false);
        },
        onError: (err) => {
          setError(err.message);
          setIsGenerating(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsGenerating(false);
    }
  }, [scenario, formValues, aiContext]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);
    setSavedFilename(null);

    try {
      const filename = await saveDocument({
        config,
        scenario,
        formData: formValues,
        aiContext,
        content: previewContent,
        existingFilename: editingFilename,
      });
      setIsSaving(false);
      setSavedFilename(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setIsSaving(false);
    }
  }, [
    config,
    scenario,
    formValues,
    aiContext,
    previewContent,
    editingFilename,
    isSaving,
  ]);

  useControl({
    onEscape: () => {
      if (showDataPreview) {
        setShowDataPreview(false);
      } else {
        onBack();
      }
    },
    onQuit: onBack,
    onSave: () => {
      if (!isGenerating && !isSaving) {
        handleSave();
      }
    },
    onRegenerate: () => {
      if (!isGenerating) {
        handleGenerate();
      }
    },
    onUp: () => {
      setScrollOffset((prev) => Math.max(0, prev - 1));
    },
    onDown: () => {
      setScrollOffset((prev) => prev + 1);
    },
    onInfo: () => {
      setShowDataPreview((prev) => !prev);
    },
  });

  useMount(() => {
    if (previewContent === '' && !isGenerating) {
      handleGenerate();
    }
  });

  if (showDataPreview) {
    const formDataJson = JSON.stringify(formValues, null, 2);
    const aiContextJson = JSON.stringify(aiContext, null, 2);

    return (
      <ScenarioLayout controls={controls} status={status}>
        <Box flexDirection="row" gap={1}>
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={ACCENT_COLOR}
            paddingX={1}
            flexGrow={1}
            flexBasis={0}
          >
            <Box marginTop={-1} marginLeft={1}>
              <Text backgroundColor="black" color={ACCENT_COLOR} bold>
                {' '}
                formData{' '}
              </Text>
            </Box>
            {formDataJson.split('\n').map((line, index) => (
              <Text key={index}>{line || ' '}</Text>
            ))}
          </Box>
          <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={ACCENT_COLOR}
            paddingX={1}
            flexGrow={1}
            flexBasis={0}
          >
            <Box marginTop={-1} marginLeft={1}>
              <Text backgroundColor="black" color={ACCENT_COLOR} bold>
                {' '}
                aiContext{' '}
              </Text>
            </Box>
            {aiContextJson.split('\n').map((line, index) => (
              <Text key={index}>{line || ' '}</Text>
            ))}
          </Box>
        </Box>
        <Box paddingX={1}>
          <Text dimColor>Press i or Esc to close</Text>
        </Box>
      </ScenarioLayout>
    );
  }

  return (
    <ScenarioLayout controls={controls} status={status}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={ACCENT_COLOR}
        paddingX={1}
        height={maxVisible + 2}
      >
        <Box marginTop={-1} marginLeft={1}>
          <Text backgroundColor="black" color={ACCENT_COLOR} bold>
            {' '}
            Preview{isEditing ? ` (${editingFilename})` : ''}{' '}
          </Text>
        </Box>
        {previewContent === '' && !isGenerating && !error ? (
          <Text dimColor>No preview content yet.</Text>
        ) : (
          visibleLines.map((line, index) => (
            <Text key={scrollOffset + index}>{line || ' '}</Text>
          ))
        )}
      </Box>

      {lines.length > maxVisible && (
        <Box paddingX={1}>
          <Text dimColor>
            Lines {scrollOffset + 1}-
            {Math.min(scrollOffset + maxVisible, lines.length)} of{' '}
            {lines.length}
          </Text>
        </Box>
      )}
    </ScenarioLayout>
  );
};
