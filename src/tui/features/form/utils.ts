import type {
  Field,
  FormField,
  GroupLayout,
  RepeatableLayout,
} from '../../../types';
import { buildFieldDefaults, isFieldVisible } from './services';
import type { FlatFieldItem } from './types';

export const getValueByPath = (
  obj: Record<string, unknown>,
  path: string,
): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
};

export const setValueByPath = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> => {
  const keys = path.split('.');
  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string;
    if (Array.isArray(current[key])) {
      current[key] = [...(current[key] as unknown[])];
    } else {
      current[key] = { ...(current[key] as Record<string, unknown>) };
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1] as string] = value;
  return result;
};

export const getRepeatableInnerFields = (
  repeatable: RepeatableLayout,
): FormField[] => {
  if (repeatable.field.type === 'group') {
    return (repeatable.field as GroupLayout).fields.filter(
      (f): f is FormField => f.type !== 'repeatable' && f.type !== 'group',
    );
  }
  return [repeatable.field as FormField];
};

/**
 * Get all inner fields including nested repeatables
 */
export const getAllRepeatableInnerFields = (
  repeatable: RepeatableLayout,
): Field[] => {
  if (repeatable.field.type === 'group') {
    return (repeatable.field as GroupLayout).fields;
  }
  return [repeatable.field];
};

/**
 * Build default values for a new repeatable item
 */
export const buildRepeatableItemDefaults = (
  repeatable: RepeatableLayout,
): Record<string, unknown> => {
  if (repeatable.field.type === 'group') {
    return buildFieldDefaults(repeatable.field.fields);
  }
  const singleField = repeatable.field as FormField;
  return {
    [singleField.id]: singleField.type === 'checkbox' ? false : '',
  };
};

type FlattenContext = {
  pathPrefix: string;
  treePrefix: string; // Prefix for items at this level (e.g., "├─ " or "│  ├─ ")
  continuationPrefix: string; // Prefix for children (e.g., "│  " or "│  │  ")
  depth: number;
};

/**
 * Flatten nested fields into a flat list with proper tree prefixes for display
 */
export const flattenFields = (
  fields: Field[],
  stepValues: Record<string, unknown>,
  rootFormData: Record<string, unknown>,
  pathPrefix = '',
  _depth = 0,
): FlatFieldItem[] => {
  return flattenFieldsInternal(fields, stepValues, rootFormData, {
    pathPrefix,
    treePrefix: '',
    continuationPrefix: '',
    depth: 0,
  });
};

const flattenFieldsInternal = (
  fields: Field[],
  stepValues: Record<string, unknown>,
  rootFormData: Record<string, unknown>,
  ctx: FlattenContext,
): FlatFieldItem[] => {
  const result: FlatFieldItem[] = [];

  for (const field of fields) {
    if (field.type === 'group') {
      result.push(
        ...flattenFieldsInternal(field.fields, stepValues, rootFormData, ctx),
      );
    } else if (field.type === 'repeatable') {
      result.push(
        ...flattenRepeatableField(field, stepValues, rootFormData, ctx),
      );
    } else {
      if (isFieldVisible(field, stepValues, rootFormData)) {
        const requiredMarker = field.required ? ' *' : '';
        result.push({
          type: 'field',
          field,
          path: ctx.pathPrefix ? `${ctx.pathPrefix}.${field.id}` : field.id,
          label: `${field.label}${requiredMarker}`,
        });
      }
    }
  }

  return result;
};

const flattenRepeatableField = (
  field: RepeatableLayout,
  stepValues: Record<string, unknown>,
  rootFormData: Record<string, unknown>,
  ctx: FlattenContext,
): FlatFieldItem[] => {
  const result: FlatFieldItem[] = [];
  const repeatablePath = ctx.pathPrefix
    ? `${ctx.pathPrefix}.${field.id}`
    : field.id;

  // Always access by field.id since stepValues is scoped to the current context
  const repeatableData = stepValues[field.id] as
    | Record<string, unknown>[]
    | undefined;
  const items = repeatableData || [];
  const allInnerFields = getAllRepeatableInnerFields(field);

  items.forEach((item, itemIndex) => {
    // Header for each repeatable item - show with treePrefix (branch indicator from parent)
    result.push({
      type: 'repeatable-header',
      repeatable: field,
      path: `${repeatablePath}.${itemIndex}`,
      index: itemIndex,
      label: `${field.label || 'Item'} #${itemIndex + 1}`,
      treePrefix: ctx.treePrefix,
    });

    // Process inner fields with tree prefixes
    const visibleInnerFields = allInnerFields.filter((innerField) => {
      if (innerField.type === 'repeatable' || innerField.type === 'group') {
        return true;
      }
      return isFieldVisible(
        innerField,
        item as Record<string, unknown>,
        rootFormData,
      );
    });

    visibleInnerFields.forEach((innerField, fieldIdx) => {
      const isLast = fieldIdx === visibleInnerFields.length - 1;
      const branchChar = isLast ? '└─ ' : '├─ ';
      const nextContinuation = isLast ? '   ' : '│  ';
      const currentPrefix = ctx.continuationPrefix + branchChar;
      const childContinuation = ctx.continuationPrefix + nextContinuation;

      if (innerField.type === 'repeatable') {
        // Nested repeatable - header uses currentPrefix, children use childContinuation
        result.push(
          ...flattenRepeatableField(
            innerField,
            item as Record<string, unknown>,
            rootFormData,
            {
              pathPrefix: `${repeatablePath}.${itemIndex}`,
              treePrefix: currentPrefix,
              continuationPrefix: childContinuation,
              depth: ctx.depth + 1,
            },
          ),
        );
      } else if (innerField.type === 'group') {
        // Group - flatten their fields
        result.push(
          ...flattenFieldsInternal(
            innerField.fields,
            item as Record<string, unknown>,
            rootFormData,
            {
              pathPrefix: `${repeatablePath}.${itemIndex}`,
              treePrefix: currentPrefix,
              continuationPrefix: childContinuation,
              depth: ctx.depth + 1,
            },
          ),
        );
      } else {
        // Form field
        const requiredMarker = innerField.required ? ' *' : '';
        result.push({
          type: 'field',
          field: innerField,
          path: `${repeatablePath}.${itemIndex}.${innerField.id}`,
          label: `${innerField.label}${requiredMarker}`,
          treePrefix: currentPrefix,
        });
      }
    });
  });

  // Add button for the repeatable - at same level as headers
  result.push({
    type: 'repeatable-add',
    repeatable: field,
    path: repeatablePath,
    label: `[+] Add ${field.label || 'item'}`,
    treePrefix: ctx.treePrefix,
  });

  return result;
};

export const getFieldTypeIndicator = (item: FlatFieldItem): string => {
  if (item.type !== 'field') return '';
  const field = item.field;
  switch (field.type) {
    case 'checkbox':
      return '[✓]';
    case 'select':
      return '[▼]';
    case 'textarea':
      return '[≡]';
    default:
      return '[_]';
  }
};

export const getValueDisplay = (
  item: FlatFieldItem,
  stepValues: Record<string, unknown>,
): string => {
  if (item.type !== 'field') return '';
  const value = getValueByPath(stepValues, item.path);

  if (item.field.type === 'checkbox') {
    return value ? '✓' : '';
  }

  if (item.field.type === 'select') {
    const strValue = String(value ?? '');
    const option = item.field.options.find((o) => o.value === strValue);
    return option ? option.label : '';
  }

  const strValue = String(value ?? '');
  if (strValue.length > 20) {
    return `${strValue.slice(0, 20)}...`;
  }
  return strValue;
};
