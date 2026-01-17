import { Box, Text } from 'ink';
import type { FC } from 'react';

import type { SelectField } from '../../../../types';
import { ACCENT_COLOR } from '../types';

export type SelectProps = {
  field: SelectField;
  currentValue: string;
  selectIndex: number;
  isFocused: boolean;
};

export const Select: FC<SelectProps> = ({
  field,
  currentValue,
  selectIndex,
  isFocused,
}) => {
  if (isFocused) {
    return (
      <Box flexDirection="column">
        {field.options.map((opt, idx) => (
          <Box key={opt.value}>
            <Text
              color={idx === selectIndex ? 'black' : undefined}
              backgroundColor={idx === selectIndex ? ACCENT_COLOR : undefined}
            >
              {' '}
              {opt.label}{' '}
            </Text>
            {opt.value === currentValue && <Text color="gray"> (current)</Text>}
          </Box>
        ))}
      </Box>
    );
  }

  const currentOption = field.options.find((o) => o.value === currentValue);
  return (
    <Text color={currentOption ? 'white' : 'gray'}>
      {currentOption ? currentOption.label : '(not selected)'}
    </Text>
  );
};
