import type {
  AiContext,
  AiContextFieldMeta,
  AiContextRepeatable,
  AiContextStep,
  Field,
  FieldConditionObject,
  FieldConditionSingle,
  FormField,
  LayoutField,
  Step,
} from '../../../definitions';

const isLayoutField = (field: Field): field is LayoutField => {
  return field.type === 'repeatable' || field.type === 'group';
};

const getValueByPath = (
  obj: Record<string, unknown>,
  path: string,
): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
};

const isSingleCondition = (
  condition: FieldConditionObject,
): condition is FieldConditionSingle => {
  return 'field' in condition;
};

const evaluateSingleCondition = (
  condition: FieldConditionSingle,
  itemData: Record<string, unknown>,
  rootFormData: Record<string, unknown>,
): boolean => {
  const fieldPath = condition.field;
  let fieldValue: unknown;

  if (fieldPath.includes('.')) {
    fieldValue = getValueByPath(rootFormData, fieldPath);
  } else {
    fieldValue =
      itemData[fieldPath] !== undefined
        ? itemData[fieldPath]
        : getValueByPath(rootFormData, fieldPath);
  }

  if ('is' in condition) {
    const expected = condition.is;
    if (Array.isArray(expected)) {
      return expected.includes(fieldValue as string | boolean);
    }
    return fieldValue === expected;
  }

  if ('isNot' in condition) {
    const expected = condition.isNot;
    if (Array.isArray(expected)) {
      return !expected.includes(fieldValue as string | boolean);
    }
    return fieldValue !== expected;
  }

  if ('isEmpty' in condition) {
    return fieldValue == null || fieldValue === '' || fieldValue === false;
  }

  if ('isNotEmpty' in condition) {
    return fieldValue != null && fieldValue !== '' && fieldValue !== false;
  }

  return true;
};

export const evaluateCondition = (
  condition: FieldConditionObject,
  itemData: Record<string, unknown>,
  rootFormData: Record<string, unknown>,
): boolean => {
  if ('and' in condition) {
    return condition.and.every((c) =>
      evaluateCondition(c, itemData, rootFormData),
    );
  }

  if ('or' in condition) {
    return condition.or.some((c) =>
      evaluateCondition(c, itemData, rootFormData),
    );
  }

  if (isSingleCondition(condition)) {
    return evaluateSingleCondition(condition, itemData, rootFormData);
  }

  return true;
};

export const isFieldVisible = (
  field: FormField,
  itemData: Record<string, unknown>,
  rootFormData?: Record<string, unknown>,
): boolean => {
  const condition = field.when;
  if (condition == null) return true;

  return evaluateCondition(condition, itemData, rootFormData ?? itemData);
};

const getLayoutFields = (field: Field): Field[] => {
  if (field.type === 'group') {
    return field.fields;
  }
  if (field.type === 'repeatable') {
    return [field.field];
  }
  return [];
};

export const extractRequiredFieldIds = (
  fields: Field[],
  formData: Record<string, unknown>,
): string[] => {
  const result: string[] = [];
  for (const field of fields) {
    if (field.type === 'repeatable') {
      continue;
    }
    if (isLayoutField(field)) {
      result.push(...extractRequiredFieldIds(getLayoutFields(field), formData));
    } else if (field.required === true && isFieldVisible(field, formData)) {
      result.push(field.id);
    }
  }
  return result;
};

export const getVisibleFieldIds = (
  fields: Field[],
  formData: Record<string, unknown>,
): string[] => {
  const result: string[] = [];
  for (const field of fields) {
    if (field.type === 'repeatable') {
      result.push(field.id);
      continue;
    }
    if (isLayoutField(field)) {
      result.push(...getVisibleFieldIds(getLayoutFields(field), formData));
    } else if (isFieldVisible(field, formData)) {
      result.push(field.id);
    }
  }
  return result;
};

const getFieldDefaultValue = (field: FormField): unknown => {
  if (field.default != null) {
    return field.default;
  }
  return field.type === 'checkbox' ? false : '';
};

export const buildFieldDefaults = (
  fields: Field[],
): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === 'group') {
      Object.assign(defaults, buildFieldDefaults(field.fields));
    } else if (field.type === 'repeatable') {
      const count = field.defaultCount ?? field.minCount ?? 0;
      if (field.field.type === 'group') {
        const groupFields = field.field.fields;
        defaults[field.id] = Array.from({ length: count }, () =>
          buildFieldDefaults(groupFields),
        );
      } else {
        const singleField = field.field as FormField;
        defaults[field.id] = Array.from({ length: count }, () => ({
          [singleField.id]: getFieldDefaultValue(singleField),
        }));
      }
    } else if (!isLayoutField(field)) {
      defaults[field.id] = getFieldDefaultValue(field);
    }
  }
  return defaults;
};

export const buildFormDefaultValues = (
  steps: Step[],
): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {};
  for (const step of steps) {
    defaults[step.name] = buildFieldDefaults(step.fields);
  }
  return defaults;
};

const buildFieldMeta = (
  field: Field,
): AiContextFieldMeta | AiContextRepeatable | null => {
  switch (field.type) {
    case 'input':
    case 'textarea':
    case 'select':
    case 'checkbox':
      return {
        label: field.label,
        description: field.description,
      };

    case 'repeatable': {
      const innerField = field.field;
      if (innerField.type === 'group') {
        return buildFieldsMeta(innerField.fields);
      }
      const meta = buildFieldMeta(innerField);
      if (meta != null && 'label' in meta) {
        return { [innerField.id]: meta };
      }
      return meta;
    }

    case 'group':
      return buildFieldsMeta(field.fields);

    default:
      return null;
  }
};

const buildFieldsMeta = (
  fields: readonly Field[],
): AiContextRepeatable | null => {
  const result: AiContextRepeatable = {};

  for (const field of fields) {
    if (field.type === 'group') {
      const groupMeta = buildFieldsMeta(field.fields);
      if (groupMeta != null) {
        Object.assign(result, groupMeta);
      }
      continue;
    }

    if (field.type === 'repeatable') {
      const meta = buildFieldMeta(field);
      if (meta != null) {
        result[field.id] = meta;
      }
      continue;
    }

    const meta = buildFieldMeta(field);
    if (meta != null) {
      result[field.id] = meta;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
};

export const buildAiContext = (steps: Step[]): AiContext => {
  const result: AiContext = {};

  for (const step of steps) {
    const stepContext: AiContextStep = {
      _step: {
        title: step.title,
        description: step.description,
      },
    };

    const fieldsMeta = buildFieldsMeta(step.fields);
    if (fieldsMeta != null) {
      Object.assign(stepContext, fieldsMeta);
    }

    result[step.name] = stepContext;
  }

  return result;
};

export const validateStepFields = (
  step: Step,
  stepValues: Record<string, unknown>,
  _rootFormData: Record<string, unknown>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredFieldIds = extractRequiredFieldIds(step.fields, stepValues);

  for (const fieldId of requiredFieldIds) {
    const value = stepValues[fieldId];
    if (value == null || value === '') {
      const field = findFieldById(step.fields, fieldId);
      const label = field && 'label' in field ? field.label : fieldId;
      errors.push(`${label} is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const findFieldById = (fields: Field[], fieldId: string): Field | undefined => {
  for (const field of fields) {
    if ('id' in field && field.id === fieldId) {
      return field;
    }
    if (field.type === 'group') {
      const found = findFieldById(field.fields, fieldId);
      if (found) return found;
    }
    if (field.type === 'repeatable') {
      if (field.field.type === 'group') {
        const found = findFieldById(field.field.fields, fieldId);
        if (found) return found;
      } else if (field.field.id === fieldId) {
        return field.field;
      }
    }
  }
  return undefined;
};
