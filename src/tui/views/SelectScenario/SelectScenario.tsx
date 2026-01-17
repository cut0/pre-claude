import { Box, Text } from 'ink';
import { type FC, useCallback, useMemo, useState } from 'react';

import type { Scenario } from '../../../definitions';
import type { ControlItem } from '../../components/ControlBar';
import { getDocumentsForScenario } from '../../features/document/services';
import type { DocumentWithMetadata } from '../../features/document/types';
import { ACCENT_COLOR } from '../../features/form/types';
import { useControl } from '../../hooks/useControl';
import { useMount } from '../../hooks/useMount';
import { useTerminalHeight } from '../../hooks/useTerminalHeight';
import { CommonLayout } from '../../layouts/CommonLayout';
import { adjustScrollOffset } from '../../utils/scroll';

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
  const [scenarioScrollOffset, setScenarioScrollOffset] = useState(0);
  const [actionScrollOffset, setActionScrollOffset] = useState(0);

  const { availableHeight } = useTerminalHeight();
  // Account for panel borders (2 lines) and title (1 line)
  const maxVisibleItems = Math.max(3, availableHeight - 3);

  const currentScenario = scenarios[scenarioIndex];

  const actionItems: ActionItem[] = useMemo(
    () => [
      { type: 'new', label: '[+] New Document' },
      ...documents.map((doc) => ({ type: 'document' as const, doc })),
    ],
    [documents],
  );

  const visibleScenarios = scenarios.slice(
    scenarioScrollOffset,
    scenarioScrollOffset + maxVisibleItems,
  );

  const visibleActionItems = actionItems.slice(
    actionScrollOffset,
    actionScrollOffset + maxVisibleItems,
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
      setScenarioScrollOffset((prev) =>
        adjustScrollOffset(newIndex, prev, maxVisibleItems),
      );
      loadDocuments(newIndex);
    },
    onDown: () => {
      const newIndex =
        scenarioIndex < scenarios.length - 1 ? scenarioIndex + 1 : 0;
      setScenarioIndex(newIndex);
      setScenarioScrollOffset((prev) =>
        adjustScrollOffset(newIndex, prev, maxVisibleItems),
      );
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
      const newIndex =
        actionIndex > 0 ? actionIndex - 1 : actionItems.length - 1;
      setActionIndex(newIndex);
      setActionScrollOffset((prev) =>
        adjustScrollOffset(newIndex, prev, maxVisibleItems),
      );
    },
    onDown: () => {
      const newIndex =
        actionIndex < actionItems.length - 1 ? actionIndex + 1 : 0;
      setActionIndex(newIndex);
      setActionScrollOffset((prev) =>
        adjustScrollOffset(newIndex, prev, maxVisibleItems),
      );
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

  const hasMoreScenariosAbove = scenarioScrollOffset > 0;
  const hasMoreScenariosBelow =
    scenarioScrollOffset + maxVisibleItems < scenarios.length;
  const hasMoreActionsAbove = actionScrollOffset > 0;
  const hasMoreActionsBelow =
    actionScrollOffset + maxVisibleItems < actionItems.length;

  return (
    <CommonLayout controls={controls}>
      <Box flexGrow={1}>
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
          <Box flexDirection="column" overflowY="hidden">
            {hasMoreScenariosAbove && <Text dimColor>↑ more</Text>}
            {visibleScenarios.map((scenario, visibleIndex) => {
              const actualIndex = scenarioScrollOffset + visibleIndex;
              const isSelected = actualIndex === scenarioIndex;
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
            {hasMoreScenariosBelow && <Text dimColor>↓ more</Text>}
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
          <Box flexDirection="column" overflowY="hidden">
            {isLoading ? (
              <Text dimColor>Loading...</Text>
            ) : (
              <>
                {hasMoreActionsAbove && <Text dimColor>↑ more</Text>}
                {visibleActionItems.map((item, visibleIndex) => {
                  const actualIndex = actionScrollOffset + visibleIndex;
                  const isSelected = actualIndex === actionIndex;
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
                })}
                {hasMoreActionsBelow && <Text dimColor>↓ more</Text>}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </CommonLayout>
  );
};
