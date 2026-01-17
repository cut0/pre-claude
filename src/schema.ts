import * as v from 'valibot';
import type {
  Field,
  FieldConditionObject,
  GroupLayout,
  LayoutField,
  RepeatableLayout,
} from './types';

// =============================================================================
// Type Guards
// =============================================================================

export const isLayoutField = (field: Field): field is LayoutField => {
  return field.type === 'repeatable' || field.type === 'group';
};

// =============================================================================
// Form Field Schemas
// =============================================================================

// =============================================================================
// Field Condition Schema
// =============================================================================

// Single field condition (supports dot notation for nested paths)
const FieldConditionSingleSchema = v.union([
  v.object({
    field: v.string(),
    is: v.union([
      v.string(),
      v.boolean(),
      v.array(v.union([v.string(), v.boolean()])),
    ]),
  }),
  v.object({
    field: v.string(),
    isNot: v.union([
      v.string(),
      v.boolean(),
      v.array(v.union([v.string(), v.boolean()])),
    ]),
  }),
  v.object({
    field: v.string(),
    isEmpty: v.literal(true),
  }),
  v.object({
    field: v.string(),
    isNotEmpty: v.literal(true),
  }),
]);

// Full condition schema with and/or support (recursive)
const FieldConditionSchema: v.GenericSchema<FieldConditionObject> = v.union([
  FieldConditionSingleSchema,
  v.object({
    and: v.array(v.lazy(() => FieldConditionSchema)),
  }),
  v.object({
    or: v.array(v.lazy(() => FieldConditionSchema)),
  }),
]) as v.GenericSchema<FieldConditionObject>;

const FieldBaseSchema = v.object({
  id: v.string(),
  label: v.string(),
  description: v.string(),
  placeholder: v.optional(v.string()),
  required: v.optional(v.boolean()),
  when: v.optional(FieldConditionSchema),
});

export const SelectOptionSchema = v.object({
  value: v.string(),
  label: v.string(),
});

export const InputFieldSchema = v.object({
  ...FieldBaseSchema.entries,
  type: v.literal('input'),
  inputType: v.optional(v.picklist(['text', 'date', 'url'])),
  suggestions: v.optional(v.array(v.string())),
  default: v.optional(v.string()),
});

export const TextareaFieldSchema = v.object({
  ...FieldBaseSchema.entries,
  type: v.literal('textarea'),
  rows: v.optional(v.number()),
  default: v.optional(v.string()),
});

export const SelectFieldSchema = v.object({
  ...FieldBaseSchema.entries,
  type: v.literal('select'),
  options: v.array(SelectOptionSchema),
  default: v.optional(v.string()),
});

export const CheckboxFieldSchema = v.object({
  ...FieldBaseSchema.entries,
  type: v.literal('checkbox'),
  default: v.optional(v.boolean()),
});

export const FormFieldSchema = v.union([
  InputFieldSchema,
  TextareaFieldSchema,
  SelectFieldSchema,
  CheckboxFieldSchema,
]);

// =============================================================================
// Layout Schemas
// =============================================================================

export const GroupLayoutSchema: v.GenericSchema<GroupLayout> = v.object({
  type: v.literal('group'),
  fields: v.array(v.lazy(() => FieldSchema)),
});

export const RepeatableLayoutSchema: v.GenericSchema<RepeatableLayout> =
  v.object({
    type: v.literal('repeatable'),
    id: v.string(),
    label: v.string(),
    minCount: v.optional(v.number()),
    defaultCount: v.optional(v.number()),
    field: v.union([FormFieldSchema, GroupLayoutSchema]),
  });

export const FieldSchema: v.GenericSchema<Field> = v.union([
  FormFieldSchema,
  RepeatableLayoutSchema,
  GroupLayoutSchema,
]);

// =============================================================================
// Step Schema
// =============================================================================

export const StepSchema = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  name: v.string(),
  fields: v.array(FieldSchema),
});

// =============================================================================
// Scenario Schema
// =============================================================================

export const ScenarioBaseSchema = v.object({
  id: v.string(),
  name: v.string(),
  steps: v.array(StepSchema),
  prompt: v.custom<
    (params: { formData: unknown; aiContext: unknown }) => string
  >((value) => typeof value === 'function'),
});

export const ScenarioSchema = ScenarioBaseSchema;

// =============================================================================
// Configuration Schemas
// =============================================================================

export const ConfigSchema = v.object({
  scenarios: v.array(ScenarioSchema),
});

// =============================================================================
// Parser Functions
// =============================================================================

export const parseConfig = (data: unknown) => {
  return v.parse(ConfigSchema, data);
};

export const safeParseConfig = (data: unknown) => {
  return v.safeParse(ConfigSchema, data);
};
