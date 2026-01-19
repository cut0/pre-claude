import { Box, Text } from 'ink';
import type { FC } from 'react';

import { ACCENT_COLOR } from '../types';
import { SimpleTextInput } from './SimpleTextInput';

export type TextFieldProps = {
  value: string;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onTextSubmit: () => void;
  onTextCancel: () => void;
  placeholder: string;
  isTextarea: boolean;
  isFocused: boolean;
  suggestions?: string[];
  onOpenExternalEditor?: () => void;
};

export const TextField: FC<TextFieldProps> = ({
  value,
  editValue,
  onEditValueChange,
  onTextSubmit,
  onTextCancel,
  placeholder,
  isTextarea,
  isFocused,
  suggestions,
  onOpenExternalEditor,
}) => {
  if (isFocused) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={ACCENT_COLOR}
        paddingX={1}
        minHeight={isTextarea ? 5 : 1}
      >
        <SimpleTextInput
          value={editValue}
          onChange={onEditValueChange}
          onSubmit={onTextSubmit}
          onCancel={onTextCancel}
          placeholder={placeholder}
          multiline={isTextarea}
          suggestions={suggestions}
          onOpenExternalEditor={isTextarea ? onOpenExternalEditor : undefined}
        />
        {isTextarea && (
          <Box marginTop={1}>
            <Text dimColor>Enter: newline | Ctrl+G: vim | Tab: confirm</Text>
          </Box>
        )}
      </Box>
    );
  }

  return <Text color={value ? 'white' : 'gray'}>{value || '(empty)'}</Text>;
};
