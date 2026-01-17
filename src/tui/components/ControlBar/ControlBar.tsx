import { Box, Text } from 'ink';
import type { FC } from 'react';

import { HELP_COLOR } from '../../features/form/types';

export type ControlItem = {
  key: string;
  action: string;
};

export type ControlBarProps = {
  items: ControlItem[];
};

export const ControlBar: FC<ControlBarProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  const helpText = items
    .map((item) => `${item.key}: ${item.action}`)
    .join(' | ');

  return (
    <Box paddingX={1}>
      <Text color={HELP_COLOR}>{helpText}</Text>
    </Box>
  );
};
