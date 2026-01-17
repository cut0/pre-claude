import { Box, Text } from 'ink';
import { type FC, useCallback, useMemo, useState } from 'react';

import type { Scenario } from '../../../definitions';
import type { ControlItem } from '../../components/ControlBar';
import { getDocumentsForScenario } from '../../features/document/services';
import type { DocumentWithMetadata } from '../../features/document/types';
import { ACCENT_COLOR } from '../../features/form/types';
import { useControl } from '../../hooks/useControl';
import { useMount } from '../../hooks/useMount';
import { CommonLayout } from '../../layouts/CommonLayout';

type FocusPanel = 'scenarios' | 'actions';

type ActionItem =
  | { type: 'new'; label: string }
  | { type: 'document'; doc: DocumentWithMetadata };

export type SelectScenarioProps = {
  scenarios: Scenario[];
  onSelectNew: (scenarioId: string) => void;
  onSelectDocument: (scenarioId: string, doc: DocumentWithMetadata) => void;
  onExit: () => void;
};

export const SelectScenario: FC<SelectScenarioProps> = ({
  scenarios,
  onSelectNew,
  onSelectDocument,
  onExit,
}) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);
  const [focusPanel, setFocusPanel] = useState<FocusPanel>('scenarios');
  const [documents, setDocuments] = useState<DocumentWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentScenario = scenarios[scenarioIndex];

  const actionItems: ActionItem[] = useMemo(
    () => [
      { type: 'new', label: '[+] New Document' },
      ...documents.map((doc) => ({ type: 'document' as const, doc })),
    ],
    [documents],
  );

  const controls = useMemo<ControlItem[]>(() => {
    if (focusPanel === 'scenarios') {
      return [
        { key: '↑↓/jk', action: 'move' },
        { key: '→/l/Enter', action: 'select' },
        { key: 'q', action: 'quit' },
      ];
    }
    return [
      { key: '↑↓/jk', action: 'move' },
      { key: 'Enter', action: 'open' },
      { key: '←/h/Esc', action: 'back' },
      { key: 'q', action: 'quit' },
    ];
  }, [focusPanel]);

  const loadDocuments = useCallback(
    (index: number) => {
      const scenario = scenarios[index];
      if (scenario == null) return;
      setIsLoading(true);
      getDocumentsForScenario(scenario)
        .then((docs) => {
          setDocuments(docs);
          setActionIndex(0);
        })
        .catch(() => {
          setDocuments([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [scenarios],
  );

  useControl({
    onUp: () => {
      const newIndex =
        scenarioIndex > 0 ? scenarioIndex - 1 : scenarios.length - 1;
      setScenarioIndex(newIndex);
      loadDocuments(newIndex);
    },
    onDown: () => {
      const newIndex =
        scenarioIndex < scenarios.length - 1 ? scenarioIndex + 1 : 0;
      setScenarioIndex(newIndex);
      loadDocuments(newIndex);
    },
    onRight: () => {
      setFocusPanel('actions');
    },
    onEnter: () => {
      setFocusPanel('actions');
    },
    onQuit: onExit,
    isActive: focusPanel === 'scenarios',
  });

  useControl({
    onUp: () => {
      setActionIndex((prev) => (prev > 0 ? prev - 1 : actionItems.length - 1));
    },
    onDown: () => {
      setActionIndex((prev) => (prev < actionItems.length - 1 ? prev + 1 : 0));
    },
    onEnter: () => {
      const item = actionItems[actionIndex];
      if (item && currentScenario) {
        if (item.type === 'new') {
          onSelectNew(currentScenario.id);
        } else {
          onSelectDocument(currentScenario.id, item.doc);
        }
      }
    },
    onEscape: () => {
      setFocusPanel('scenarios');
    },
    onLeft: () => {
      setFocusPanel('scenarios');
    },
    onQuit: onExit,
    isActive: focusPanel === 'actions',
  });

  useMount(() => {
    loadDocuments(0);
  });

  return (
    <CommonLayout controls={controls}>
      <Box>
        <Box
          width="40%"
          flexDirection="column"
          borderStyle="round"
          borderColor={focusPanel === 'scenarios' ? ACCENT_COLOR : undefined}
          paddingX={1}
        >
          <Box marginTop={-1} marginLeft={1}>
            <Text
              backgroundColor="black"
              color={focusPanel === 'scenarios' ? ACCENT_COLOR : undefined}
              bold
            >
              {' '}
              Scenarios{' '}
            </Text>
          </Box>
          <Box flexDirection="column">
            {scenarios.map((scenario, index) => {
              const isSelected = index === scenarioIndex;
              const isFocused = focusPanel === 'scenarios';
              return (
                <Box key={scenario.id}>
                  <Text
                    color={isSelected && isFocused ? 'black' : undefined}
                    backgroundColor={
                      isSelected
                        ? isFocused
                          ? ACCENT_COLOR
                          : 'gray'
                        : undefined
                    }
                  >
                    {' '}
                    {scenario.name}{' '}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box
          marginLeft={1}
          width="60%"
          flexDirection="column"
          borderStyle="round"
          borderColor={focusPanel === 'actions' ? ACCENT_COLOR : undefined}
          paddingX={1}
        >
          <Box marginTop={-1} marginLeft={1}>
            <Text
              backgroundColor="black"
              color={focusPanel === 'actions' ? ACCENT_COLOR : undefined}
              bold
            >
              {' '}
              {currentScenario?.name ?? 'Documents'}{' '}
            </Text>
          </Box>
          <Box flexDirection="column">
            {isLoading ? (
              <Text dimColor>Loading...</Text>
            ) : (
              actionItems.map((item, index) => {
                const isSelected = index === actionIndex;
                const isFocused = focusPanel === 'actions';
                const label =
                  item.type === 'new' ? item.label : item.doc.filename;
                return (
                  <Box key={item.type === 'new' ? 'new' : item.doc.filename}>
                    <Text
                      color={
                        isSelected && isFocused
                          ? 'black'
                          : item.type === 'new'
                            ? 'green'
                            : undefined
                      }
                      backgroundColor={
                        isSelected && isFocused ? ACCENT_COLOR : undefined
                      }
                    >
                      {' '}
                      {label}{' '}
                    </Text>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    </CommonLayout>
  );
};
