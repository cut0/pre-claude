import { Box, Text } from 'ink';
import { type FC, useState } from 'react';

import {
  ACCENT_COLOR,
  type FlatFieldItem,
} from '../../../../features/form/types';
import {
  getFieldTypeIndicator,
  getValueDisplay,
} from '../../../../features/form/utils';
import { useControl } from '../../../../hooks/useControl';
import { adjustScrollOffset } from '../../../../utils/scroll';

export type FieldSelectorProps = {
  flatItems: FlatFieldItem[];
  stepValues: Record<string, unknown>;
  isFocused: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  maxHeight: number;
  onFocusUp: () => void;
  onFocusToForm: (item: FlatFieldItem, index: number) => void;
  onAddItem: (item: FlatFieldItem) => void;
  onDeleteItem: (item: FlatFieldItem) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onGenerate: () => void;
  onBack: () => void;
};

export const FieldSelector: FC<FieldSelectorProps> = ({
  flatItems,
  stepValues,
  isFocused,
  isFirstStep,
  isLastStep,
  maxHeight,
  onFocusUp,
  onFocusToForm,
  onAddItem,
  onDeleteItem,
  onNextStep,
  onPrevStep,
  onGenerate,
  onBack,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const validIndex = Math.min(selectedIndex, Math.max(0, flatItems.length - 1));
  const currentItem = flatItems[validIndex];

  // Account for borders (2 lines) and title (1 line)
  const maxVisibleItems = Math.max(3, maxHeight - 3);

  const visibleItems = flatItems.slice(
    scrollOffset,
    scrollOffset + maxVisibleItems,
  );

  const hasMoreAbove = scrollOffset > 0;
  const hasMoreBelow = scrollOffset + maxVisibleItems < flatItems.length;

  useControl({
    onUp: () => {
      if (selectedIndex === 0) {
        onFocusUp();
        return;
      }
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setScrollOffset((prev) =>
        adjustScrollOffset(newIndex, prev, maxVisibleItems),
      );
    },
    onDown: () => {
      const newIndex =
        selectedIndex < flatItems.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(newIndex);
      setScrollOffset((prev) =>
        adjustScrollOffset(newIndex, prev, maxVisibleItems),
      );
    },
    onEnter: () => {
      if (!currentItem) return;
      if (currentItem.type === 'repeatable-add') {
        onAddItem(currentItem);
      } else if (currentItem.type === 'field') {
        onFocusToForm(currentItem, validIndex);
      }
    },
    onDelete: () => {
      if (currentItem?.type === 'repeatable-header') {
        onDeleteItem(currentItem);
      }
    },
    onNext: () => {
      if (!isLastStep) {
        onNextStep();
      }
    },
    onPrev: () => {
      if (!isFirstStep) {
        onPrevStep();
      }
    },
    onGenerate,
    onEscape: onBack,
    onQuit: onBack,
    isActive: isFocused,
  });

  return (
    <Box
      width="50%"
      flexDirection="column"
      borderStyle="round"
      borderColor={isFocused ? ACCENT_COLOR : undefined}
      paddingX={1}
    >
      <Box marginTop={-1} marginLeft={1}>
        <Text
          backgroundColor="black"
          color={isFocused ? ACCENT_COLOR : undefined}
          bold
        >
          {' '}
          Fields{' '}
        </Text>
      </Box>
      <Box flexDirection="column" overflowY="hidden">
        {hasMoreAbove && <Text dimColor>↑ more</Text>}
        {visibleItems.map((item, visibleIndex) => {
          const actualIndex = scrollOffset + visibleIndex;
          const isSelected = actualIndex === validIndex;
          const valueDisplay = getValueDisplay(item, stepValues);
          const typeIndicator = getFieldTypeIndicator(item);

          const treePrefix = item.treePrefix || '';

          if (item.type === 'repeatable-add') {
            return (
              <Box key={`add-${item.path}`}>
                <Text color="gray">{treePrefix}</Text>
                <Text
                  color={isSelected && isFocused ? 'black' : 'green'}
                  backgroundColor={
                    isSelected && isFocused ? ACCENT_COLOR : undefined
                  }
                >
                  {item.label}
                </Text>
              </Box>
            );
          }

          if (item.type === 'repeatable-header') {
            return (
              <Box key={`header-${item.path}`}>
                <Text color="gray">{treePrefix}</Text>
                <Text
                  color={isSelected && isFocused ? 'black' : ACCENT_COLOR}
                  backgroundColor={
                    isSelected && isFocused ? ACCENT_COLOR : undefined
                  }
                  bold
                >
                  {item.label}
                </Text>
              </Box>
            );
          }

          return (
            <Box key={item.path}>
              <Text color="gray">{treePrefix}</Text>
              <Text
                color={isSelected && isFocused ? 'black' : undefined}
                backgroundColor={
                  isSelected && isFocused ? ACCENT_COLOR : undefined
                }
              >
                {typeIndicator} {item.label}
              </Text>
              {valueDisplay && <Text color="gray"> : {valueDisplay}</Text>}
            </Box>
          );
        })}
        {hasMoreBelow && <Text dimColor>↓ more</Text>}
      </Box>
    </Box>
  );
};
