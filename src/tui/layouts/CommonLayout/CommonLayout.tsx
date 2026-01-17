import { Box } from 'ink';
import type { FC, ReactNode } from 'react';

import { ControlBar, type ControlItem } from '../../components/ControlBar';
import { Header } from '../../components/Header';
import { StatusBar, type StatusType } from '../../components/StatusBar';
import { useTerminalHeight } from '../../hooks/useTerminalHeight';

export type StatusInfo = {
  message: string;
  type?: StatusType;
};

export type CommonLayoutProps = {
  children: ReactNode;
  status?: StatusInfo;
  controls?: ControlItem[];
};

export const CommonLayout: FC<CommonLayoutProps> = ({
  children,
  status,
  controls = [],
}) => {
  const { rows } = useTerminalHeight();

  return (
    <Box flexDirection="column" padding={1} height={rows}>
      <Header />
      <Box flexDirection="column" flexGrow={1}>
        {children}
      </Box>
      {controls.length > 0 && <ControlBar items={controls} />}
      {status?.message && (
        <StatusBar message={status.message} type={status.type} />
      )}
    </Box>
  );
};
