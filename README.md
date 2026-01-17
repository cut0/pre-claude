# pre-claude

A TUI tool for building structured prompts for Claude. Define form structures in config files, fill them out interactively in the terminal, and generate documents using your local Claude Code settings.

## Features

- Form structure defined in TypeScript config files
- Interactive TUI for filling out prompts
- Uses your local Claude Code configuration as-is

## Requirements

- Node.js 18+
- Claude Code installed

## Installation

```bash
npm install pre-claude
# or
pnpm add pre-claude
```

## Usage

### Initialize Config

```bash
npx pre-claude init [-o filename] [-f]
```

### Run TUI

```bash
npx pre-claude run --config ./pre-claude.config.ts
# or with scenario ID
npx pre-claude run --config ./pre-claude.config.ts --scenario design-doc
```

## Configuration

### Basic Structure

```typescript
// pre-claude.config.ts
import { defineConfig, defineScenario, type Step } from 'pre-claude';

const steps = [
  {
    slug: 'overview',
    title: 'Overview',
    description: 'Basic project information',
    name: 'overview',
    fields: [
      {
        id: 'projectName',
        type: 'input',
        label: 'Project Name',
        description: 'Enter the name of your project',
        required: true,
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        description: 'Describe the project briefly',
        rows: 5,
      },
      {
        id: 'priority',
        type: 'select',
        label: 'Priority',
        description: 'Select the priority level',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ],
      },
    ],
  },
] as const satisfies Step[];

export default defineConfig({
  scenarios: [
    defineScenario({
      id: 'design-doc',
      name: 'Design Document',
      steps,
      prompt: ({ formData, aiContext }) =>
        `Create a design document based on:\n${JSON.stringify({ formData, aiContext }, null, 2)}`,
      outputDir: './docs',
    }),
  ],
});
```

### Scenario Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `name` | `string` | Yes | Display name |
| `steps` | `Step[]` | Yes | Form wizard steps |
| `prompt` | `function` | Yes | Prompt generator function |
| `outputDir` | `string` | No | Directory for saved documents |
| `filename` | `string \| function` | No | Custom filename for saved documents |

## Field Types

### input

Text input field with optional type variants and autocomplete suggestions.

```typescript
{
  id: 'title',
  type: 'input',
  label: 'Title',
  description: 'Enter the title',
  placeholder: 'My Project',
  required: true,
  inputType: 'text', // 'text' | 'date' | 'url'
  suggestions: ['Option A', 'Option B'], // autocomplete suggestions
  default: 'Default Value',
}
```

### textarea

Multi-line text input.

```typescript
{
  id: 'description',
  type: 'textarea',
  label: 'Description',
  description: 'Enter description',
  rows: 5,
  default: 'Default text',
}
```

### select

Dropdown selection.

```typescript
{
  id: 'priority',
  type: 'select',
  label: 'Priority',
  description: 'Select priority',
  options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ],
  default: 'medium',
}
```

### checkbox

Boolean toggle.

```typescript
{
  id: 'agree',
  type: 'checkbox',
  label: 'I agree to the terms',
  description: 'You must agree to continue',
  required: true,
  default: false,
}
```

## Layouts

### repeatable

Dynamically add/remove field instances.

```typescript
{
  type: 'repeatable',
  id: 'features',
  label: 'Features',
  minCount: 1,
  defaultCount: 2,
  field: {
    type: 'group',
    fields: [
      { id: 'name', type: 'input', label: 'Name', description: '' },
      { id: 'description', type: 'textarea', label: 'Description', description: '', rows: 2 },
    ],
  },
}
```

### group

Visual grouping of fields.

```typescript
{
  type: 'group',
  fields: [
    { id: 'street', type: 'input', label: 'Street', description: '' },
    { id: 'city', type: 'input', label: 'City', description: '' },
  ],
}
```

## Conditional Display

Fields support conditional visibility via the `when` property.

### Simple Condition

```typescript
// Show when priority is 'high'
{ ..., when: { field: 'priority', is: 'high' } }

// Show when priority is 'high' or 'medium'
{ ..., when: { field: 'priority', is: ['high', 'medium'] } }

// Show when priority is NOT 'low'
{ ..., when: { field: 'priority', isNot: 'low' } }

// Show when checkbox is checked
{ ..., when: { field: 'hasDeadline', is: true } }

// Show when field is not empty
{ ..., when: { field: 'title', isNotEmpty: true } }

// Show when field is empty
{ ..., when: { field: 'notes', isEmpty: true } }
```

### AND Condition

```typescript
// Show when both conditions are true
{
  ...,
  when: {
    and: [
      { field: 'priority', is: 'high' },
      { field: 'type', is: 'feature' }
    ]
  }
}
```

### OR Condition

```typescript
// Show when either condition is true
{
  ...,
  when: {
    or: [
      { field: 'priority', is: 'high' },
      { field: 'type', is: 'urgent' }
    ]
  }
}
```

### Nested Conditions

```typescript
// Complex nested condition
{
  ...,
  when: {
    or: [
      { field: 'priority', is: 'high' },
      {
        and: [
          { field: 'type', is: 'feature' },
          { field: 'status', is: 'approved' }
        ]
      }
    ]
  }
}
```

### Cross-Section References

Use dot notation to reference fields in other steps:

```typescript
{ ..., when: { field: 'overview.priority', is: 'high' } }
```

## Development

```bash
pnpm install
pnpm build
pnpm dev
pnpm lint:fix
pnpm typecheck
```

## License

MIT
