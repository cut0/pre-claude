import { spawn } from 'node:child_process';
import { Box, Text, useApp, useStdout } from 'ink';
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
  const [dataPreviewScrollOffset, setDataPreviewScrollOffset] = useState(0);
  const [savedFilename, setSavedFilename] = useState<string | null>(null);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const { stdout } = useStdout();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { exit } = useApp();

  const isEditing = editingFilename != null;
  const canSave = previewContent !== '' && !isGenerating;
  const lines = previewContent.split('\n');
  // Layout: padding(1) + Header(1) + content + ControlBar(1) + StatusBar(1) + padding(1) + border(2) + line info(1)
  const fixedHeight = 8;
  const maxVisible = Math.max(10, (stdout?.rows ?? 24) - fixedHeight);
  const visibleLines = lines.slice(scrollOffset, scrollOffset + maxVisible);

  const canContinue = sessionId != null && !isGenerating;
  const controls = useMemo<ControlItem[]>(
    () => [
      { key: '↑↓/jk', action: 'scroll' },
      { key: 'r', action: 'regenerate' },
      ...(canSave ? [{ key: 's', action: 'save' }] : []),
      ...(canContinue ? [{ key: 'c', action: 'continue in Claude' }] : []),
      { key: 'i', action: 'info' },
      { key: 'q/Esc', action: 'back' },
    ],
    [canSave, canContinue],
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
    setSessionId(null);

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
        onComplete: (result) => {
          setPreviewContent(result.content);
          setSessionId(result.sessionId);
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

  // Memoize JSON data for scroll calculations
  const formDataLines = useMemo(
    () => JSON.stringify(formValues, null, 2).split('\n'),
    [formValues],
  );
  const aiContextLines = useMemo(
    () => JSON.stringify(aiContext, null, 2).split('\n'),
    [aiContext],
  );
  const maxDataLines = Math.max(formDataLines.length, aiContextLines.length);
  const handleContinueInClaude = useCallback(
    async (shouldSave: boolean) => {
      if (!sessionId) return;

      if (shouldSave && canSave) {
        setIsSaving(true);
        setError(null);
        try {
          await saveDocument({
            config,
            scenario,
            formData: formValues,
            aiContext,
            content: previewContent,
            existingFilename: editingFilename,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to save');
          setIsSaving(false);
          setShowContinueDialog(false);
          return;
        }
        setIsSaving(false);
      }

      exit();

      setTimeout(() => {
        const child = spawn('claude', ['--resume', sessionId], {
          stdio: 'inherit',
          shell: true,
        });

        child.on('close', (code) => {
          process.exit(code ?? 0);
        });
      }, 100);
    },
    [
      sessionId,
      exit,
      canSave,
      config,
      scenario,
      formValues,
      aiContext,
      previewContent,
      editingFilename,
    ],
  );

  useControl({
    onEscape: () => {
      if (showContinueDialog) {
        setShowContinueDialog(false);
      } else if (showDataPreview) {
        setShowDataPreview(false);
      } else {
        onBack();
      }
    },
    onQuit: showContinueDialog ? undefined : onBack,
    onSave: () => {
      if (!isGenerating && !isSaving && !showContinueDialog) {
        handleSave();
      }
    },
    onRegenerate: () => {
      if (!isGenerating && !showContinueDialog) {
        handleGenerate();
      }
    },
    onUp: () => {
      if (showContinueDialog) return;
      if (showDataPreview) {
        setDataPreviewScrollOffset((prev) => Math.max(0, prev - 1));
      } else {
        setScrollOffset((prev) => Math.max(0, prev - 1));
      }
    },
    onDown: () => {
      if (showContinueDialog) return;
      if (showDataPreview) {
        // Account for borders (2) and title (1) and hint (1)
        const maxDataVisible = Math.max(5, maxVisible - 2);
        setDataPreviewScrollOffset((prev) =>
          Math.min(prev + 1, Math.max(0, maxDataLines - maxDataVisible)),
        );
      } else {
        setScrollOffset((prev) =>
          Math.min(prev + 1, Math.max(0, lines.length - maxVisible)),
        );
      }
      setScrollOffset((prev) =>
        Math.min(prev + 1, Math.max(0, lines.length - maxVisible)),
      );
    },
    onInfo: () => {
      if (showContinueDialog) return;
      setShowDataPreview((prev) => {
        if (!prev) {
          // Reset scroll when opening data preview
          setDataPreviewScrollOffset(0);
        }
        return !prev;
      });
    },
    onContinue: () => {
      if (canContinue && !showContinueDialog) {
        setShowContinueDialog(true);
      }
    },
    onChar: (char) => {
      if (showContinueDialog) {
        if (char === 'y' || char === 'Y') {
          handleContinueInClaude(true);
        } else if (char === 'n' || char === 'N') {
          handleContinueInClaude(false);
        }
      }
    },
  });

  useMount(() => {
    if (previewContent === '' && !isGenerating) {
      handleGenerate();
    }
  });

  if (showDataPreview) {
    // Account for borders (2) and title (1) and hint (1)
    const maxDataVisible = Math.max(5, maxVisible - 2);
    const visibleFormDataLines = formDataLines.slice(
      dataPreviewScrollOffset,
      dataPreviewScrollOffset + maxDataVisible,
    );
    const visibleAiContextLines = aiContextLines.slice(
      dataPreviewScrollOffset,
      dataPreviewScrollOffset + maxDataVisible,
    );
    const hasMoreDataAbove = dataPreviewScrollOffset > 0;
    const hasMoreDataBelow =
      dataPreviewScrollOffset + maxDataVisible < maxDataLines;

    return (
      <ScenarioLayout controls={controls} status={status}>
        <Box flexDirection="row" gap={1} flexGrow={1}>
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
            <Box flexDirection="column" overflowY="hidden">
              {hasMoreDataAbove && <Text dimColor>↑ more</Text>}
              {visibleFormDataLines.map((line, index) => (
                <Text key={dataPreviewScrollOffset + index}>{line || ' '}</Text>
              ))}
              {hasMoreDataBelow && <Text dimColor>↓ more</Text>}
            </Box>
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
            <Box flexDirection="column" overflowY="hidden">
              {hasMoreDataAbove && <Text dimColor>↑ more</Text>}
              {visibleAiContextLines.map((line, index) => (
                <Text key={dataPreviewScrollOffset + index}>{line || ' '}</Text>
              ))}
              {hasMoreDataBelow && <Text dimColor>↓ more</Text>}
            </Box>
          </Box>
        </Box>
        <Box paddingX={1}>
          <Text dimColor>
            Press i or Esc to close
            {maxDataLines > maxDataVisible &&
              ` | Lines ${dataPreviewScrollOffset + 1}-${Math.min(dataPreviewScrollOffset + maxDataVisible, maxDataLines)} of ${maxDataLines}`}
          </Text>
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

      {showContinueDialog && (
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="yellow"
          paddingX={1}
          paddingY={0}
          marginTop={1}
        >
          <Box marginTop={-1} marginLeft={1}>
            <Text backgroundColor="black" color="yellow" bold>
              {' '}
              Continue in Claude{' '}
            </Text>
          </Box>
          <Text>Save document before continuing?</Text>
          <Box marginTop={1}>
            <Text>
              <Text color="green" bold>
                [y]
              </Text>{' '}
              Save and continue{'  '}
              <Text color="blue" bold>
                [n]
              </Text>{' '}
              Continue without saving{'  '}
              <Text dimColor bold>
                [Esc]
              </Text>{' '}
              Cancel
            </Text>
          </Box>
        </Box>
      )}
    </ScenarioLayout>
  );
};
