import { Box, Text } from 'ink';
import type { FC } from 'react';

import { Checkbox } from '../../../../features/form/components/Checkbox';
import { Empty } from '../../../../features/form/components/Empty';
import { Select } from '../../../../features/form/components/Select';
import { TextField } from '../../../../features/form/components/TextField';
import type { FlatFieldItem } from '../../../../features/form/types';
import { getValueByPath } from '../../../../features/form/utils';

export type FieldEditorContentProps = {
  currentItem: FlatFieldItem | undefined;
  stepValues: Record<string, unknown>;
  isFocused: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onTextSubmit: () => void;
  onTextCancel: () => void;
  selectIndex: number;
  onOpenExternalEditor?: () => void;
};

export const FieldEditorContent: FC<FieldEditorContentProps> = ({
  currentItem,
  stepValues,
  isFocused,
  editValue,
  onEditValueChange,
  onTextSubmit,
  onTextCancel,
  selectIndex,
  onOpenExternalEditor,
}) => {
  if (!currentItem) {
    return <Empty />;
  }

  if (currentItem.type === 'repeatable-add') {
    return (
      <Box flexDirection="column">
        <Text color="green">Press Enter to add item</Text>
      </Box>
    );
  }

  if (currentItem.type === 'repeatable-header') {
    return (
      <Box flexDirection="column">
        <Text dimColor>d: delete item</Text>
      </Box>
    );
  }

  const field = currentItem.field;
  const value = getValueByPath(stepValues, currentItem.path);

  if (field.type === 'checkbox') {
    return <Checkbox checked={Boolean(value)} />;
  }

  if (field.type === 'select') {
    return (
      <Select
        field={field}
        currentValue={String(value ?? '')}
        selectIndex={selectIndex}
        isFocused={isFocused}
      />
    );
  }

  return (
    <TextField
      value={String(value ?? '')}
      editValue={editValue}
      onEditValueChange={onEditValueChange}
      onTextSubmit={onTextSubmit}
      onTextCancel={onTextCancel}
      placeholder={field.placeholder ?? ''}
      isTextarea={field.type === 'textarea'}
      isFocused={isFocused}
      suggestions={field.type === 'input' ? field.suggestions : undefined}
      onOpenExternalEditor={
        field.type === 'textarea' ? onOpenExternalEditor : undefined
      }
    />
  );
};
