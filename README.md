# pre-claude

**Pre** Claude is a tool for creating prompts via TUI when running Claude.
You can define forms in TypeScript config files and share them with your team.

## Features

- TypeScript-based form configuration
- Interactive TUI form wizard
- Uses local Claude Code settings

## Requirements

- Node.js 18+
- Claude Code

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
| `outputDir` | `string` | No | Output directory |
| `filename` | `string \| function` | No | Custom filename |

## Field Types

### input

Single-line text input. Supports type variants (`text`, `date`, `url`) and autocomplete suggestions.

```typescript
{
  id: 'title',
  type: 'input',
  label: 'Title',
  description: 'Enter the title',
  placeholder: 'My Project',
  required: true,
  inputType: 'text', // 'text' | 'date' | 'url'
  suggestions: ['Option A', 'Option B'],
  default: 'Default Value',
}
```

### textarea

Multi-line text input. The `rows` property controls the display height.

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

Dropdown selection from predefined options.

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

Boolean toggle for true/false values.

```typescript
{
  id: 'agree',
  type: 'checkbox',
  label: 'I agree to the terms',
  description: 'Required to continue',
  required: true,
  default: false,
}
```

## Layouts

### repeatable

Allows dynamic addition and removal of field instances. Use `minCount` to set minimum items and `defaultCount` for initial count.

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

Groups multiple fields together visually without affecting data structure.

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

### Simple Conditions

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

### AND / OR Conditions

```typescript
// AND: both conditions must be true
{
  ...,
  when: {
    and: [
      { field: 'priority', is: 'high' },
      { field: 'type', is: 'feature' }
    ]
  }
}

// OR: either condition must be true
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

### Cross-Step References

Use dot notation to reference fields in other steps.

```typescript
{ ..., when: { field: 'overview.priority', is: 'high' } }
```

## License

MIT
