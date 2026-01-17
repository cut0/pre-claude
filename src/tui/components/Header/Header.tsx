import { Box, Text } from 'ink';
import type { FC } from 'react';

import { ACCENT_COLOR } from '../../features/form/types';

const ASCII_LOGO = `                          _                 _
 _ __  _ __ ___       ___| | __ _ _   _  __| | ___
| '_ \\| '__/ _ \\_____/ __| |/ _\` | | | |/ _\` |/ _ \\
| |_) | | |  __/_____| (__| | (_| | |_| | (_| |  __/
| .__/|_|  \\___|      \\___|_|\\__,_|\\__,_|\\__,_|\\___|
|_|`;

export type HeaderProps = {
  description?: string;
};

export const Header: FC<HeaderProps> = ({
  description = 'Structured Prompt Builder for Claude',
}) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={ACCENT_COLOR}
      paddingX={1}
    >
      <Text color={ACCENT_COLOR}>{ASCII_LOGO}</Text>
      <Box marginTop={1} justifyContent="flex-end">
        <Text color={ACCENT_COLOR}>🐍 {description}</Text>
      </Box>
    </Box>
  );
};
