import { Box, Text } from 'ink';
import { type FC, useCallback, useState } from 'react';

import type { SelectField } from '../../../../../types';
import {
  ACCENT_COLOR,
  type FlatFieldItem,
} from '../../../../features/form/types';
import { getValueByPath } from '../../../../features/form/utils';
import { useControl } from '../../../../hooks/useControl';
import { FieldEditorContent } from './FieldEditorContent';

const getInitialEditValue = (
  currentItem: FlatFieldItem | undefined,
  stepValues: Record<string, unknown>,
): string => {
  if (currentItem?.type !== 'field') return '';
  if (
    currentItem.field.type === 'checkbox' ||
    currentItem.field.type === 'select'
  )
    return '';
  return String(getValueByPath(stepValues, currentItem.path) ?? '');
};

const getInitialSelectIndex = (
  currentItem: FlatFieldItem | undefined,
  stepValues: Record<string, unknown>,
): number => {
  if (currentItem?.type !== 'field' || currentItem.field.type !== 'select')
    return 0;
  const currentValue = String(
    getValueByPath(stepValues, currentItem.path) ?? '',
  );
  const idx = currentItem.field.options.findIndex(
    (o) => o.value === currentValue,
  );
  return idx >= 0 ? idx : 0;
};

export type FieldEditorProps = {
  currentItem: FlatFieldItem | undefined;
  stepValues: Record<string, unknown>;
  isFocused: boolean;
  onSubmit: (value: unknown) => void;
  onCancel: () => void;
};

export const FieldEditor: FC<FieldEditorProps> = ({
  currentItem,
  stepValues,
  isFocused,
  onSubmit,
  onCancel,
}) => {
  const [editValue, setEditValue] = useState(() =>
    getInitialEditValue(currentItem, stepValues),
  );
  const [selectIndex, setSelectIndex] = useState(() =>
    getInitialSelectIndex(currentItem, stepValues),
  );

  useControl({
    onUp: () => {
      if (!currentItem || currentItem.type !== 'field') return;
      const field = currentItem.field as SelectField;
      setSelectIndex((prev) =>
        prev > 0 ? prev - 1 : field.options.length - 1,
      );
    },
    onDown: () => {
      if (!currentItem || currentItem.type !== 'field') return;
      const field = currentItem.field as SelectField;
      setSelectIndex((prev) =>
        prev < field.options.length - 1 ? prev + 1 : 0,
      );
    },
    onEnter: () => {
      if (!currentItem || currentItem.type !== 'field') return;
      const field = currentItem.field as SelectField;
      const selectedOption = field.options[selectIndex];
      if (selectedOption) {
        onSubmit(selectedOption.value);
      }
    },
    onEscape: onCancel,
    isActive:
      isFocused &&
      currentItem?.type === 'field' &&
      currentItem.field.type === 'select',
  });

  const handleTextSubmit = useCallback(() => {
    onSubmit(editValue);
  }, [editValue, onSubmit]);

  const handleTextCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Box
      marginLeft={1}
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
          Input{' '}
        </Text>
      </Box>
      <FieldEditorContent
        currentItem={currentItem}
        stepValues={stepValues}
        isFocused={isFocused}
        editValue={editValue}
        onEditValueChange={setEditValue}
        onTextSubmit={handleTextSubmit}
        onTextCancel={handleTextCancel}
        selectIndex={selectIndex}
      />
    </Box>
  );
};
