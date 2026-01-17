// =============================================================================
// Form Field Types
// =============================================================================

/**
 * Option for select/dropdown fields
 *
 * @example
 * ```ts
 * const option: SelectOption = {
 *   value: 'high',
 *   label: 'High Priority'
 * };
 * ```
 */
export type SelectOption = {
  /** Internal value used in form data */
  value: string;
  /** Display label shown to users */
  label: string;
};

// =============================================================================
// Field Condition Types
// =============================================================================

/**
 * Single field condition for visibility
 *
 * The `field` property supports dot notation for nested paths (e.g., 'overview.priority').
 *
 * @example
 * ```ts
 * // Show when priority is 'high'
 * when: { field: 'priority', is: 'high' }
 *
 * // Show when priority is 'high' or 'medium'
 * when: { field: 'priority', is: ['high', 'medium'] }
 *
 * // Show when priority is NOT 'low'
 * when: { field: 'priority', isNot: 'low' }
 *
 * // Show when checkbox is checked
 * when: { field: 'has_deadline', is: true }
 *
 * // Show when field is not empty
 * when: { field: 'title', isNotEmpty: true }
 *
 * // Cross-section reference using dot notation
 * when: { field: 'overview.priority', is: 'high' }
 * ```
 */
export type FieldConditionSingle =
  | { field: string; is: string | boolean | (string | boolean)[] }
  | { field: string; isNot: string | boolean | (string | boolean)[] }
  | { field: string; isEmpty: true }
  | { field: string; isNotEmpty: true };

/**
 * Composite condition using AND logic
 *
 * All conditions must be true for the field to be visible.
 *
 * @example
 * ```ts
 * // Show when priority is 'high' AND type is 'feature'
 * when: {
 *   and: [
 *     { field: 'priority', is: 'high' },
 *     { field: 'type', is: 'feature' }
 *   ]
 * }
 * ```
 */
export type FieldConditionAnd = {
  and: FieldConditionObject[];
};

/**
 * Composite condition using OR logic
 *
 * At least one condition must be true for the field to be visible.
 *
 * @example
 * ```ts
 * // Show when priority is 'high' OR type is 'urgent'
 * when: {
 *   or: [
 *     { field: 'priority', is: 'high' },
 *     { field: 'type', is: 'urgent' }
 *   ]
 * }
 * ```
 */
export type FieldConditionOr = {
  or: FieldConditionObject[];
};

/**
 * Declarative condition for field visibility
 *
 * Supports single field conditions, AND/OR composite conditions,
 * and dot notation for cross-section field references.
 *
 * @example
 * ```ts
 * // Simple condition
 * when: { field: 'priority', is: 'high' }
 *
 * // AND condition
 * when: {
 *   and: [
 *     { field: 'priority', is: 'high' },
 *     { field: 'type', is: 'feature' }
 *   ]
 * }
 *
 * // OR condition
 * when: {
 *   or: [
 *     { field: 'priority', is: 'high' },
 *     { field: 'overview.urgent', is: true }
 *   ]
 * }
 *
 * // Nested AND/OR
 * when: {
 *   or: [
 *     { field: 'priority', is: 'high' },
 *     {
 *       and: [
 *         { field: 'type', is: 'feature' },
 *         { field: 'status', is: 'approved' }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export type FieldConditionObject =
  | FieldConditionSingle
  | FieldConditionAnd
  | FieldConditionOr;

/**
 * Field visibility condition (object-based only)
 *
 * Use declarative object conditions for field visibility.
 * Supports single conditions, AND/OR logic, and dot notation for nested fields.
 *
 * Note: Function-based conditions are not supported as they cannot be
 * serialized when sending scenario data from server to client.
 */
export type FieldCondition = FieldConditionObject;

/**
 * Text input field configuration
 *
 * Supports various input types including text, date, and URL.
 * Can include autocomplete suggestions.
 *
 * @example
 * ```ts
 * const field: InputField = {
 *   id: 'project_name',
 *   type: 'input',
 *   label: 'Project Name',
 *   description: 'Enter the name of your project',
 *   placeholder: 'My Awesome Project',
 *   required: true,
 *   inputType: 'text',
 *   suggestions: ['Project A', 'Project B']
 * };
 * ```
 */
export type InputField = {
  /** Unique identifier for the field (used as form data key) */
  id: string;
  /** Display label shown above the input */
  label: string;
  /** Help text describing the field's purpose */
  description: string;
  /** Placeholder text shown when input is empty */
  placeholder?: string;
  /** Whether the field must be filled before submission */
  required?: boolean;
  /** Field type discriminator */
  type: 'input';
  /** HTML input type - affects keyboard and validation */
  inputType?: 'text' | 'date' | 'url';
  /** Autocomplete suggestions shown as datalist options */
  suggestions?: string[];
  /** Condition for when this field should be visible */
  when?: FieldCondition;
  /** Default value for the field */
  default?: string;
};

/**
 * Multi-line text area field configuration
 *
 * @example
 * ```ts
 * const field: TextareaField = {
 *   id: 'description',
 *   type: 'textarea',
 *   label: 'Description',
 *   description: 'Provide a detailed description',
 *   rows: 5
 * };
 * ```
 */
export type TextareaField = {
  /** Unique identifier for the field */
  id: string;
  /** Display label shown above the textarea */
  label: string;
  /** Help text describing the field's purpose */
  description: string;
  /** Placeholder text shown when textarea is empty */
  placeholder?: string;
  /** Whether the field must be filled before submission */
  required?: boolean;
  /** Field type discriminator */
  type: 'textarea';
  /** Number of visible text rows (affects initial height) */
  rows?: number;
  /** Condition for when this field should be visible */
  when?: FieldCondition;
  /** Default value for the field */
  default?: string;
};

/**
 * Dropdown select field configuration
 *
 * @example
 * ```ts
 * const field: SelectField = {
 *   id: 'priority',
 *   type: 'select',
 *   label: 'Priority',
 *   description: 'Select the priority level',
 *   options: [
 *     { value: 'low', label: 'Low' },
 *     { value: 'medium', label: 'Medium' },
 *     { value: 'high', label: 'High' }
 *   ]
 * };
 * ```
 */
export type SelectField = {
  /** Unique identifier for the field */
  id: string;
  /** Display label shown above the select */
  label: string;
  /** Help text describing the field's purpose */
  description: string;
  /** Placeholder text (shown as first disabled option) */
  placeholder?: string;
  /** Whether a selection must be made before submission */
  required?: boolean;
  /** Field type discriminator */
  type: 'select';
  /** Available options for selection */
  options: SelectOption[];
  /** Condition for when this field should be visible */
  when?: FieldCondition;
  /** Default value for the field (must match one of the option values) */
  default?: string;
};

/**
 * Boolean checkbox field configuration
 *
 * @example
 * ```ts
 * const field: CheckboxField = {
 *   id: 'agree_terms',
 *   type: 'checkbox',
 *   label: 'I agree to the terms',
 *   description: 'You must agree to continue',
 *   required: true
 * };
 * ```
 */
export type CheckboxField = {
  /** Unique identifier for the field */
  id: string;
  /** Display label shown next to the checkbox */
  label: string;
  /** Help text describing the field's purpose */
  description: string;
  /** Placeholder (not typically used for checkboxes) */
  placeholder?: string;
  /** Whether the checkbox must be checked before submission */
  required?: boolean;
  /** Field type discriminator */
  type: 'checkbox';
  /** Condition for when this field should be visible */
  when?: FieldCondition;
  /** Default value for the field */
  default?: boolean;
};

export type FormField =
  | InputField
  | TextareaField
  | SelectField
  | CheckboxField;

// =============================================================================
// Layout Types
// =============================================================================

/**
 * Group layout for visually grouping multiple fields together
 *
 * Used for visual grouping only. Does not create nested structure in formData.
 * To repeat a group of fields, wrap this in a RepeatableLayout.
 *
 * @example
 * ```ts
 * // Standalone group (visual grouping only)
 * const layout: GroupLayout = {
 *   type: 'group',
 *   fields: [
 *     { id: 'firstName', type: 'input', label: 'First Name', description: '' },
 *     { id: 'lastName', type: 'input', label: 'Last Name', description: '' }
 *   ]
 * };
 * // formData: { firstName: '...', lastName: '...' }
 * ```
 */
export type GroupLayout = {
  /** Layout type discriminator */
  type: 'group';
  /** Fields contained in the group */
  fields: Field[];
};

/**
 * Repeatable layout for fields that can be repeated
 *
 * Allows users to add multiple instances of a field or group.
 * The id is used as the key in form data, with values stored as an array.
 *
 * @example
 * ```ts
 * // Single field repeatable
 * const tagsLayout: RepeatableLayout = {
 *   type: 'repeatable',
 *   id: 'tags',
 *   label: 'Tags',
 *   minCount: 1,
 *   field: { id: 'name', type: 'input', label: 'Tag', description: '' }
 * };
 * // formData: { tags: [{ name: 'tag1' }, { name: 'tag2' }] }
 *
 * // Group repeatable (multiple fields)
 * const librariesLayout: RepeatableLayout = {
 *   type: 'repeatable',
 *   id: 'libraries',
 *   label: 'Libraries',
 *   minCount: 1,
 *   field: {
 *     type: 'group',
 *     fields: [
 *       { id: 'name', type: 'input', label: 'Name', description: '' },
 *       { id: 'url', type: 'input', label: 'URL', description: '' }
 *     ]
 *   }
 * };
 * // formData: { libraries: [{ name: 'React', url: '...' }, ...] }
 * ```
 */
export type RepeatableLayout = {
  /** Layout type discriminator */
  type: 'repeatable';
  /** Unique identifier (used as key in form data) */
  id: string;
  /** Display label shown above the repeatable field */
  label: string;
  /** Minimum number of entries required (default: 0) */
  minCount?: number;
  /** Default number of entries to create initially (defaults to minCount if not specified) */
  defaultCount?: number;
  /** The field or group to repeat */
  field: FormField | GroupLayout;
};

export type LayoutField = RepeatableLayout | GroupLayout;
export type Field = FormField | LayoutField;

// =============================================================================
// Step Types
// =============================================================================

/**
 * Step definition for multi-step form wizard
 *
 * Each step represents one page in the form wizard, containing
 * fields for the user to fill out.
 *
 * @example
 * ```ts
 * const step: Step = {
 *   slug: 'basic-info',
 *   title: 'Basic Information',
 *   description: 'Enter the basic details of your project',
 *   name: 'basic',
 *   fields: [
 *     { id: 'title', type: 'input', label: 'Title', description: '...' },
 *     { id: 'priority', type: 'select', label: 'Priority', description: '...', options: [...] }
 *   ]
 * };
 *
 * // For repeatable fields (single field):
 * const stepWithRepeatable: Step = {
 *   slug: 'tags',
 *   title: 'Tags',
 *   description: 'Add tags',
 *   name: 'tags',
 *   fields: [
 *     {
 *       type: 'repeatable',
 *       id: 'items',
 *       minCount: 1,
 *       field: { id: 'name', type: 'input', label: 'Tag', description: '' }
 *     }
 *   ]
 * };
 * // formData: { tags: { items: [{ name: 'tag1' }, { name: 'tag2' }] } }
 *
 * // For repeatable group (multiple fields):
 * const stepWithRepeatableGroup: Step = {
 *   slug: 'libraries',
 *   title: 'Libraries',
 *   description: 'Add libraries',
 *   name: 'libraries',
 *   fields: [
 *     {
 *       type: 'repeatable',
 *       id: 'items',
 *       minCount: 1,
 *       field: {
 *         type: 'group',
 *         fields: [
 *           { id: 'name', type: 'input', label: 'Name', description: '...' },
 *           { id: 'url', type: 'input', label: 'URL', description: '...' }
 *         ]
 *       }
 *     }
 *   ]
 * };
 * // formData: { libraries: { items: [{ name: '...', url: '...' }, ...] } }
 * ```
 */
export type Step = {
  /** URL-friendly identifier (used in routing) */
  slug: string;
  /** Display title shown in step header */
  title: string;
  /** Description text shown below the title */
  description: string;
  /** Step name (used as key in form data output) */
  name: string;
  /** Fields contained in this step */
  fields: Field[];
};

// =============================================================================
// Scenario Types
// =============================================================================

/**
 * Base scenario definition (serializable to JSON)
 *
 * Contains the core fields that can be validated by Valibot schema.
 * Extended by `Scenario` with function-based fields.
 */
export type ScenarioBase = {
  /** Unique identifier for the scenario (used in URLs) */
  id: string;
  /** Display name shown in the scenario list */
  name: string;
  /** Steps that make up the scenario's form wizard */
  steps: Step[];
};

/**
 * Step metadata in AiContext
 */
export type AiContextStepMeta = {
  title: string;
  description: string;
};

/**
 * Field metadata in AiContext
 */
export type AiContextFieldMeta = {
  label: string;
  description: string;
};

/**
 * AiContext for a repeatable field (nested structure)
 */
export type AiContextRepeatable = {
  [fieldId: string]: AiContextFieldMeta | AiContextRepeatable;
};

/**
 * AiContext for a step
 */
export type AiContextStep = {
  _step: AiContextStepMeta;
  [fieldId: string]:
    | AiContextStepMeta
    | AiContextFieldMeta
    | AiContextRepeatable;
};

/**
 * AiContext type - metadata for form fields to help AI understand the data
 *
 * This is included in formData as `ai_context` property.
 * Contains labels and descriptions for each field, organized by step name.
 *
 * @example
 * ```ts
 * {
 *   overview: {
 *     _step: { title: "Overview", description: "Basic information" },
 *     title: { label: "Title", description: "Feature title" },
 *     priority: { label: "Priority", description: "Priority level" }
 *   },
 *   modules: {
 *     _step: { title: "Modules", description: "Module structure" },
 *     items: {
 *       name: { label: "Module Name", description: "Name of the module" },
 *       features: {
 *         feature_name: { label: "Feature Name", description: "Name of feature" }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type AiContext = {
  [stepName: string]: AiContextStep;
};

/**
 * Filename function type for custom document naming
 *
 * Can be a static string or a function for dynamic naming.
 * Default format: `design-doc-{scenarioId}-{timestamp}.md`
 *
 * @typeParam TFormData - Type of the raw form data from UI
 *
 * @example
 * ```ts
 * // Static filename
 * filename: 'design-doc.md'
 *
 * // Dynamic filename based on form data
 * filename: ({ formData, timestamp }) =>
 *   `${formData.project_name}-${timestamp}.md`
 * ```
 */
export type ScenarioFilename<
  TFormData extends Record<string, unknown> = Record<string, unknown>,
> =
  | string
  | ((params: {
      scenarioId: string;
      timestamp: string;
      content: string;
      formData: TFormData;
      aiContext: AiContext;
    }) => string);

/**
 * Prompt function type
 *
 * A function that generates the prompt string.
 * Use `formData` for raw values and `aiContext` for field metadata.
 *
 * @typeParam TFormData - Type of the raw form data from UI
 *
 * @example
 * ```ts
 * prompt: ({ formData, aiContext }) =>
 *   `Create a document based on:\n${JSON.stringify({ formData, aiContext }, null, 2)}`
 * ```
 */
export type ScenarioPrompt<
  TFormData extends Record<string, unknown> = Record<string, unknown>,
> = (params: { formData: TFormData; aiContext: AiContext }) => string;

/**
 * Complete scenario definition
 *
 * Extends ScenarioBase with function-based fields that cannot be
 * serialized to JSON (prompt and filename can be functions).
 *
 * @typeParam TFormData - Type of the raw form data from UI (inferred from steps)
 *
 * @example
 * ```ts
 * const scenario: Scenario = {
 *   id: 'design-doc',
 *   name: 'Design Document',
 *   steps: [...],
 *   prompt: ({ formData, aiContext }) =>
 *     `Generate a design doc based on:\n${JSON.stringify({ formData, aiContext }, null, 2)}`,
 *   outputDir: './docs/designs',
 *   filename: ({ formData, timestamp }) =>
 *     `${formData.overview?.title ?? 'untitled'}-${timestamp}.md`,
 * };
 * ```
 */
export type Scenario<
  TFormData extends Record<string, unknown> = Record<string, unknown>,
> = ScenarioBase & {
  /** Prompt template function */
  prompt: ScenarioPrompt<TFormData>;
  /** Directory where generated documents are saved */
  outputDir?: string;
  /** Custom filename for saved documents */
  filename?: ScenarioFilename<TFormData>;
};

// =============================================================================
// Type Inference Utilities
// =============================================================================

/**
 * Helper type to get the value type for a form field
 */
type FieldValueType<F> = F extends { type: 'checkbox' }
  ? boolean
  : F extends { type: 'select'; options: readonly { value: infer V }[] }
    ? V
    : string;

/**
 * Helper type to create an object type from FormField array
 */
type FormFieldsToObject<Fields extends readonly FormField[]> = {
  [F in Fields[number] as F['id']]: FieldValueType<F>;
};

/**
 * Helper type to merge union to intersection
 */
type UnionToIntersection<U> = (
  U extends unknown
    ? (k: U) => void
    : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Infer the formData type from a Scenario's steps
 *
 * Use this utility type to get type-safe access to raw form data
 * in hooks, prompts, and filename.
 *
 * **Note**: This utility works with FormField arrays only (not nested layouts).
 * Define fields with `as const` for literal type inference.
 *
 * @example
 * ```ts
 * const scenario = {
 *   id: 'design-doc',
 *   name: 'Design Document',
 *   steps: [
 *     {
 *       slug: 'overview',
 *       title: 'Overview',
 *       description: 'Project overview',
 *       name: 'overview',
 *       fields: [
 *         { id: 'title', type: 'input', label: 'Title', description: '' },
 *         { id: 'description', type: 'textarea', label: 'Description', description: '' },
 *       ] as const,
 *     },
 *   ],
 *   prompt: ({ formData, aiContext }) => '...',
 * } as const satisfies Scenario;
 *
 * type MyFormData = InferFormData<typeof scenario>;
 * // Result:
 * // {
 * //   overview: { title: string; description: string };
 * // }
 * ```
 */
export type InferFormData<T extends Scenario> =
  T['steps'] extends readonly (infer S)[]
    ? S extends { name: infer N extends string; fields: readonly FormField[] }
      ? { [K in N]: FormFieldsToObject<S['fields']> }
      : never
    : never;

/**
 * Infer the merged formData type from a Scenario
 *
 * This flattens all steps into a single object type.
 *
 * @example
 * ```ts
 * type MyFormData = InferFormDataMerged<typeof scenario>;
 * // {
 * //   overview: { title: string; description: string };
 * // }
 * ```
 */
export type InferFormDataMerged<T extends Scenario> = UnionToIntersection<
  InferFormData<T>
>;

/**
 * Helper type to extract FormField from Field (handling repeatable, group layouts)
 */
type ExtractFormFields<F> = F extends FormField
  ? F
  : F extends { type: 'repeatable'; field: infer RF }
    ? RF extends FormField
      ? RF
      : never
    : F extends { type: 'group'; fields: readonly (infer GF)[] }
      ? GF extends FormField
        ? GF
        : never
      : never;

/**
 * Helper type to create an object type from Field array (supporting layouts)
 */
type FieldsToObject<Fields extends readonly Field[]> = {
  [F in ExtractFormFields<Fields[number]> as F extends {
    id: infer ID extends string;
  }
    ? ID
    : never]?: F extends FormField ? FieldValueType<F> : unknown;
};

/**
 * Infer the formData type directly from a steps array
 *
 * Use this utility type when defining scenarios with `defineScenario`
 * for type-safe access to formData in hooks, prompts, and filename.
 *
 * **Note**: For best results, define steps with `as const satisfies Step[]`
 * to preserve literal types for step names and field IDs.
 *
 * @example
 * ```ts
 * const steps = [
 *   {
 *     slug: 'basic-info',
 *     title: 'Basic Info',
 *     description: 'Enter basic information',
 *     name: 'basicInfo',
 *     fields: [
 *       { id: 'title', type: 'input', label: 'Title', description: '' },
 *     ],
 *   },
 *   {
 *     slug: 'libraries',
 *     title: 'Libraries',
 *     description: 'Add libraries',
 *     name: 'libraries',
 *     fields: [
 *       {
 *         type: 'group',
 *         id: 'items',
 *         minCount: 1,
 *         fields: [
 *           { id: 'name', type: 'input', label: 'Name', description: '' },
 *         ],
 *       },
 *     ],
 *   },
 * ] as const satisfies Step[];
 *
 * type FormData = InferFormDataFromSteps<typeof steps>;
 * // {
 * //   basicInfo?: { title?: string };
 * //   libraries?: { items?: Array<{ name?: string }> };
 * // }
 * ```
 */
export type InferFormDataFromSteps<TSteps extends readonly Step[]> =
  UnionToIntersection<
    TSteps[number] extends infer S
      ? S extends { name: infer N extends string; fields: readonly Field[] }
        ? { [K in N]?: FieldsToObject<S['fields']> }
        : never
      : never
  > &
    Record<string, unknown>;

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Root configuration object
 *
 * This is the type for the config file exported from `config.ts`.
 *
 * @example
 * ```ts
 * // config.ts
 * import type { Config } from 'pre-claude';
 *
 * export default {
 *   scenarios: [
 *     { id: 'design-doc', name: 'Design Doc', ... }
 *   ],
 * } satisfies Config;
 * ```
 */
export type Config = {
  /** Available scenarios (each represents a document type) */
  scenarios: Scenario[];
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Helper function to define a scenario with type-safe formData
 *
 * This function uses TypeScript's const type parameters to infer
 * literal types from the steps array, enabling type-safe access
 * to formData in hooks, prompts, and filename.
 *
 * **Usage**: Define your steps with `as const satisfies Step[]` for best results.
 *
 * @example
 * ```ts
 * import { defineScenario, type Step, type Config } from 'pre-claude';
 *
 * const steps = [
 *   {
 *     slug: 'basic-info',
 *     title: 'Basic Info',
 *     description: 'Enter basic information',
 *     name: 'basicInfo',
 *     fields: [
 *       { id: 'projectName', type: 'input', label: 'Project Name', description: '' },
 *       { id: 'overview', type: 'textarea', label: 'Overview', description: '' },
 *     ],
 *   },
 *   {
 *     slug: 'features',
 *     title: 'Features',
 *     description: 'List features',
 *     name: 'features',
 *     fields: [
 *       {
 *         type: 'repeatable',
 *         id: 'items',
 *         minCount: 1,
 *         field: {
 *           type: 'group',
 *           fields: [
 *             { id: 'name', type: 'input', label: 'Feature Name', description: '' },
 *           ],
 *         },
 *       },
 *     ],
 *   },
 * ] as const satisfies Step[];
 *
 * const scenario = defineScenario({
 *   id: 'my-scenario',
 *   name: 'My Scenario',
 *   steps,
 *   prompt: ({ formData, aiContext }) =>
 *     `Generate document based on:\n${JSON.stringify({ formData, aiContext }, null, 2)}`,
 *   outputDir: 'docs',
 *   filename: ({ formData }) => {
 *     // formData is now type-safe!
 *     // formData.basicInfo?.projectName is typed as string | undefined
 *     return `${formData.basicInfo?.projectName ?? 'untitled'}.md`;
 *   },
 * });
 *
 * const config: Config = {
 *   scenarios: [scenario],
 *   permissions: { allowSave: true },
 * };
 * ```
 */
export function defineScenario<const TSteps extends readonly Step[]>(
  scenario: Omit<ScenarioBase, 'steps' | 'prompt'> & {
    steps: TSteps;
    prompt: ScenarioPrompt<InferFormDataFromSteps<TSteps>>;
    outputDir?: string;
    filename?: ScenarioFilename<InferFormDataFromSteps<TSteps>>;
  },
): Scenario {
  return scenario as unknown as Scenario;
}

/**
 * Helper function to define a config object
 *
 * This is a simple identity function that provides better type inference
 * and editor support when defining config files.
 *
 * @example
 * ```ts
 * import { defineConfig, defineScenario } from 'pre-claude';
 *
 * export default defineConfig({
 *   scenarios: [
 *     defineScenario({ ... }),
 *   ],
 * });
 * ```
 */
export function defineConfig(config: Config): Config {
  return config;
}
