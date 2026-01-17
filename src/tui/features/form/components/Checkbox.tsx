import { Text } from 'ink';
import type { FC } from 'react';

export type CheckboxProps = {
  checked: boolean;
};

export const Checkbox: FC<CheckboxProps> = ({ checked }) => (
  <Text color={checked ? 'green' : 'gray'}>{checked ? 'ON' : 'OFF'}</Text>
);
