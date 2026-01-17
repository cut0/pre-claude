import { Box, Text } from 'ink';
import type { FC } from 'react';

import type { Step } from '../../../../../types';
import { ACCENT_COLOR } from '../../../../features/form/types';
import { useControl } from '../../../../hooks/useControl';

export type StepSelectorProps = {
  steps: Step[];
  currentStepIndex: number;
  isFocused: boolean;
  onStepSelect: (stepIndex: number) => void;
  onFocusDown: () => void;
  onGenerate: () => void;
  onBack: () => void;
};

export const StepSelector: FC<StepSelectorProps> = ({
  steps,
  currentStepIndex,
  isFocused,
  onStepSelect,
  onFocusDown,
  onGenerate,
  onBack,
}) => {
  useControl({
    onLeft: () => {
      const prevIndex =
        currentStepIndex > 0 ? currentStepIndex - 1 : steps.length - 1;
      onStepSelect(prevIndex);
    },
    onRight: () => {
      const nextIndex =
        currentStepIndex < steps.length - 1 ? currentStepIndex + 1 : 0;
      onStepSelect(nextIndex);
    },
    onEnter: onFocusDown,
    onDown: onFocusDown,
    onGenerate,
    onEscape: onBack,
    onQuit: onBack,
    isActive: isFocused,
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={isFocused ? ACCENT_COLOR : undefined}
      paddingX={1}
    >
      <Box marginTop={-1} marginLeft={1}>
        <Text
          backgroundColor="black"
          color={isFocused ? ACCENT_COLOR : undefined}
          bold
        >
          {' '}
          Steps{' '}
        </Text>
      </Box>
      <Box>
        {steps.map((step, idx) => {
          const isCurrentStep = idx === currentStepIndex;
          return (
            <Box key={step.name} marginRight={1}>
              <Text
                color={isCurrentStep ? ACCENT_COLOR : 'gray'}
                bold={isCurrentStep}
                inverse={isFocused && isCurrentStep}
              >
                {' '}
                {idx + 1}.{step.title}{' '}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
