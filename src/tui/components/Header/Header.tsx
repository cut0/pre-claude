import { Box, Text } from 'ink';
import type { FC } from 'react';

import { ACCENT_COLOR } from '../../features/form/types';

export type HeaderProps = {
  description?: string;
};

export const Header: FC<HeaderProps> = ({
  description = 'Structured Prompt Builder for Claude',
}) => {
  return (
    <Box
      borderStyle="double"
      borderColor={ACCENT_COLOR}
      paddingX={1}
      justifyContent="space-between"
    >
      <Text color={ACCENT_COLOR} bold>
        🐍 pre-claude
      </Text>
      <Box flexDirection="column" alignItems="flex-end">
        <Text color={ACCENT_COLOR}>{description}</Text>
        <Text color={ACCENT_COLOR} dimColor>
          https://github.com/cut0/pre-claude
        </Text>
      </Box>
    </Box>
  );
};
