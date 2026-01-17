import type { FC, ReactNode } from 'react';

import type { ControlItem } from '../../components/ControlBar';
import { CommonLayout, type StatusInfo } from '../CommonLayout';

export type ScenarioLayoutProps = {
  children: ReactNode;
  status?: StatusInfo;
  controls?: ControlItem[];
};

export const ScenarioLayout: FC<ScenarioLayoutProps> = ({
  children,
  status,
  controls = [],
}) => {
  return (
    <CommonLayout status={status} controls={controls}>
      {children}
    </CommonLayout>
  );
};
