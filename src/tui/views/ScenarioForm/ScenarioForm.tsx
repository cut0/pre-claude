import { Box, Text } from 'ink';
import { type FC, useCallback, useMemo, useState } from 'react';

import type { AiContext, RepeatableLayout, Scenario } from '../../../types';
import type { ControlItem } from '../../components/ControlBar';
import { buildAiContext } from '../../features/form/services';
import type {
  FlatFieldItem,
  FocusPanel,
  FormValues,
} from '../../features/form/types';
import {
  buildRepeatableItemDefaults,
  flattenFields,
  getValueByPath,
  setValueByPath,
} from '../../features/form/utils';
import { useFormState } from '../../hooks/useFormState';
import { useMount } from '../../hooks/useMount';
import { useTerminalHeight } from '../../hooks/useTerminalHeight';
import type { StatusInfo } from '../../layouts/CommonLayout';
import { ScenarioLayout } from '../../layouts/ScenarioLayout';
import { FieldEditor } from './-internal/FieldEditor';
import { FieldSelector } from './-internal/FieldSelector';
import { StepSelector } from './-internal/StepSelector';

export type ScenarioFormProps = {
  scenario: Scenario;
  initialFormValues?: FormValues;
  onGeneratePreview: (formValues: FormValues, aiContext: AiContext) => void;
  onBack: () => void;
};

export const ScenarioForm: FC<ScenarioFormProps> = ({
  scenario,
  initialFormValues,
  onGeneratePreview,
  onBack,
}) => {
  const formState = useFormState(scenario);
  const [stepIndex, setStepIndex] = useState(0);
  const [focusPanel, setFocusPanel] = useState<FocusPanel>('steps');
  const [currentItem, setCurrentItem] = useState<FlatFieldItem | undefined>();
  const [validationError, setValidationError] = useState<string | null>(null);
  const { availableHeight } = useTerminalHeight();
  // Account for StepSelector (~3 lines with borders)
  const fieldSelectorHeight = Math.max(8, availableHeight - 3);

  const currentStep = scenario.steps[stepIndex];

  if (currentStep == null) {
    return <Text color="red">Error: Step not found</Text>;
  }

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === scenario.steps.length - 1;

  const stepValues = (formState.formValues[currentStep.name] ?? {}) as Record<
    string,
    unknown
  >;

  const flatItems = flattenFields(
    currentStep.fields,
    stepValues,
    formState.formValues as Record<string, unknown>,
  );

  const controls = useMemo<ControlItem[]>(() => {
    switch (focusPanel) {
      case 'steps':
        return [
          { key: '←→/hl', action: 'select step' },
          { key: '↓/j', action: 'to fields' },
          { key: 'Enter', action: 'confirm' },
          { key: 'g', action: 'generate' },
          { key: 'q', action: 'back' },
        ];
      case 'form':
        return [
          { key: '↑↓/jk', action: 'move' },
          { key: 'Enter', action: 'confirm' },
          { key: 'Esc', action: 'back' },
        ];
      case 'list':
        return [
          { key: '↑↓/jk', action: 'move' },
          { key: 'Enter', action: 'edit' },
          { key: 'd', action: 'delete' },
          ...(!isFirstStep ? [{ key: 'p', action: 'prev' }] : []),
          ...(!isLastStep ? [{ key: 'n', action: 'next' }] : []),
          { key: 'g', action: 'generate' },
          { key: 'q', action: 'back' },
        ];
    }
  }, [focusPanel, isFirstStep, isLastStep]);

  const status = useMemo((): StatusInfo | undefined => {
    if (validationError) {
      return { message: validationError, type: 'error' };
    }
    return undefined;
  }, [validationError]);

  const updateValue = useCallback(
    (path: string, value: unknown) => {
      const keys = path.split('.');
      if (keys.length === 1) {
        formState.updateFieldValue(currentStep.name, path, value);
      } else {
        const newStepValues = setValueByPath(stepValues, path, value);
        const rootKey = keys[0] as string;
        formState.updateFieldValue(
          currentStep.name,
          rootKey,
          newStepValues[rootKey],
        );
      }
    },
    [currentStep.name, stepValues, formState],
  );

  const addRepeatableItem = useCallback(
    (repeatable: RepeatableLayout, path: string) => {
      const newItem = buildRepeatableItemDefaults(repeatable);

      // Check if this is a nested repeatable (path contains dots)
      if (path.includes('.')) {
        const items =
          (getValueByPath(stepValues, path) as Record<string, unknown>[]) || [];
        const newStepValues = setValueByPath(stepValues, path, [
          ...items,
          newItem,
        ]);
        const rootKey = path.split('.')[0] as string;
        formState.updateFieldValue(
          currentStep.name,
          rootKey,
          newStepValues[rootKey],
        );
      } else {
        const items =
          (stepValues[repeatable.id] as Record<string, unknown>[]) || [];
        formState.updateFieldValue(currentStep.name, repeatable.id, [
          ...items,
          newItem,
        ]);
      }
    },
    [currentStep.name, stepValues, formState],
  );

  const removeRepeatableItem = useCallback(
    (repeatable: RepeatableLayout, index: number, path: string) => {
      // Extract the repeatable path (remove the item index from the end)
      const pathParts = path.split('.');
      pathParts.pop(); // Remove the index
      const repeatablePath = pathParts.join('.');

      const minCount = repeatable.minCount ?? 0;

      // Check if this is a nested repeatable
      if (repeatablePath.includes('.')) {
        const items =
          (getValueByPath(stepValues, repeatablePath) as
            | Record<string, unknown>[]
            | undefined) || [];
        if (items.length > minCount) {
          const newItems = items.filter((_, i) => i !== index);
          const newStepValues = setValueByPath(
            stepValues,
            repeatablePath,
            newItems,
          );
          const rootKey = repeatablePath.split('.')[0] as string;
          formState.updateFieldValue(
            currentStep.name,
            rootKey,
            newStepValues[rootKey],
          );
        }
      } else {
        const items =
          (stepValues[repeatable.id] as Record<string, unknown>[]) || [];
        if (items.length > minCount) {
          const newItems = items.filter((_, i) => i !== index);
          formState.updateFieldValue(currentStep.name, repeatable.id, newItems);
        }
      }
    },
    [currentStep.name, stepValues, formState],
  );

  const validateAllSteps = useCallback((): boolean => {
    for (const step of scenario.steps) {
      const values = (formState.formValues[step.name] ?? {}) as Record<
        string,
        unknown
      >;
      const items = flattenFields(
        step.fields,
        values,
        formState.formValues as Record<string, unknown>,
      );
      for (const item of items) {
        if (item.type === 'field' && item.field.required) {
          const value = getValueByPath(values, item.path);
          if (value == null || value === '') {
            return false;
          }
        }
      }
    }
    return true;
  }, [scenario.steps, formState.formValues]);

  const handleGenerate = useCallback(() => {
    if (!validateAllSteps()) {
      setValidationError('Required fields are missing');
      return;
    }
    setValidationError(null);
    const aiContext = buildAiContext(scenario.steps);
    onGeneratePreview(formState.formValues, aiContext);
  }, [
    validateAllSteps,
    scenario.steps,
    formState.formValues,
    onGeneratePreview,
  ]);

  const handleNextStep = useCallback(() => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < scenario.steps.length) {
      setStepIndex(nextIndex);
    }
  }, [stepIndex, scenario.steps.length]);

  const handlePrevStep = useCallback(() => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setStepIndex(prevIndex);
    }
  }, [stepIndex]);

  const handleGoToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < scenario.steps.length) {
        setStepIndex(index);
      }
    },
    [scenario.steps.length],
  );

  const handleFocusToForm = useCallback(
    (item: FlatFieldItem) => {
      if (item.type === 'field') {
        const field = item.field;
        if (field.type === 'checkbox') {
          const currentValue = Boolean(getValueByPath(stepValues, item.path));
          updateValue(item.path, !currentValue);
          return;
        }
        setCurrentItem(item);
        setFocusPanel('form');
      }
    },
    [stepValues, updateValue],
  );

  const handleFormSubmit = useCallback(
    (value: unknown) => {
      if (currentItem?.type === 'field') {
        updateValue(currentItem.path, value);
      }
      setFocusPanel('list');
    },
    [currentItem, updateValue],
  );

  const handleFormCancel = useCallback(() => {
    setFocusPanel('list');
  }, []);

  const handleAddItem = useCallback(
    (item: FlatFieldItem) => {
      if (item.type === 'repeatable-add') {
        addRepeatableItem(item.repeatable, item.path);
      }
    },
    [addRepeatableItem],
  );

  const handleDeleteItem = useCallback(
    (item: FlatFieldItem) => {
      if (item.type === 'repeatable-header') {
        removeRepeatableItem(item.repeatable, item.index, item.path);
      }
    },
    [removeRepeatableItem],
  );

  useMount(() => {
    if (initialFormValues) {
      formState.setFormValues(initialFormValues);
    }
  });

  return (
    <ScenarioLayout controls={controls} status={status}>
      <StepSelector
        steps={scenario.steps}
        currentStepIndex={stepIndex}
        isFocused={focusPanel === 'steps'}
        onStepSelect={handleGoToStep}
        onFocusDown={() => setFocusPanel('list')}
        onGenerate={handleGenerate}
        onBack={onBack}
      />

      <Box flexGrow={1}>
        <FieldSelector
          flatItems={flatItems}
          stepValues={stepValues}
          isFocused={focusPanel === 'list'}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          maxHeight={fieldSelectorHeight}
          onFocusUp={() => setFocusPanel('steps')}
          onFocusToForm={handleFocusToForm}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          onGenerate={handleGenerate}
          onBack={onBack}
        />

        <FieldEditor
          key={currentItem?.type === 'field' ? currentItem.path : undefined}
          currentItem={currentItem}
          stepValues={stepValues}
          isFocused={focusPanel === 'form'}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Box>
    </ScenarioLayout>
  );
};
