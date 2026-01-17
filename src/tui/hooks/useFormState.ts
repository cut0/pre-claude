import { useCallback, useState } from 'react';

import type { Scenario, Step } from '../../definitions';
import {
  buildAiContext,
  buildFormDefaultValues,
} from '../features/form/services';
import type { FormValues } from '../features/form/types';

export const useFormState = (scenario: Scenario) => {
  const [formValues, setFormValues] = useState<FormValues>(
    () => buildFormDefaultValues(scenario.steps) as FormValues,
  );

  const updateStepValues = useCallback(
    (stepName: string, values: Record<string, unknown>) => {
      setFormValues((prev) => ({
        ...prev,
        [stepName]: {
          ...prev[stepName],
          ...values,
        },
      }));
    },
    [],
  );

  const updateFieldValue = useCallback(
    (stepName: string, fieldId: string, value: unknown) => {
      setFormValues((prev) => ({
        ...prev,
        [stepName]: {
          ...prev[stepName],
          [fieldId]: value,
        },
      }));
    },
    [],
  );

  const getStepValues = useCallback(
    (step: Step): Record<string, unknown> => {
      return (formValues[step.name] ?? {}) as Record<string, unknown>;
    },
    [formValues],
  );

  const getAiContext = useCallback(() => {
    return buildAiContext(scenario.steps);
  }, [scenario.steps]);

  const resetForm = useCallback(() => {
    setFormValues(buildFormDefaultValues(scenario.steps) as FormValues);
  }, [scenario.steps]);

  return {
    formValues,
    setFormValues,
    updateStepValues,
    updateFieldValue,
    getStepValues,
    getAiContext,
    resetForm,
  };
};
