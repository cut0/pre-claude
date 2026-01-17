import { Box, Text } from 'ink';
import type { FC } from 'react';

export type StatusType = 'success' | 'error' | 'warning' | 'info';

export type StatusBarProps = {
  message: string;
  type?: StatusType;
};

const getStatusColor = (type: StatusType): string => {
  switch (type) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'warning':
      return 'yellow';
    case 'info':
      return 'blue';
  }
};

const getStatusBackground = (
  type: StatusType,
): 'green' | 'red' | 'yellow' | undefined => {
  switch (type) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'warning':
      return 'yellow';
    case 'info':
      return undefined;
  }
};

export const StatusBar: FC<StatusBarProps> = ({ message, type = 'info' }) => {
  if (!message) {
    return null;
  }

  const backgroundColor = getStatusBackground(type);
  const color = getStatusColor(type);

  return (
    <Box paddingX={1}>
      {backgroundColor ? (
        <Text backgroundColor={backgroundColor} color="white">
          {' '}
          {message}{' '}
        </Text>
      ) : (
        <Text color={color}>{message}</Text>
      )}
    </Box>
  );
};
