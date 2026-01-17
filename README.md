# pre-claude

[日本語版](./README-ja.md)

A TUI tool for efficiently creating complex prompts with structured forms for Claude Code.
Define templates in TypeScript config files to share with your team and enable reproducible prompt workflows.
Works seamlessly with your existing Claude Code setup including MCP and Skills.

| Scenario Selection | Form Input | Preview |
|:---:|:---:|:---:|
| ![select](docs/assets/select.gif) | ![edit](docs/assets/edit.gif) | ![preview](docs/assets/preview.gif) |

## Requirements

- Node.js 18+
- Claude Code

## Installation

```bash
npm install pre-claude
```

## Usage

```bash
# Try the example
npx pre-claude example
npx pre-claude example --lang ja

# Create a config file
npx pre-claude init

# Run the TUI
npx pre-claude run --config ./pre-claude.config.ts
```

## Screens

The TUI consists of 3 screens.

### Scenario Selection Screen

A 2-pane screen displayed at startup. Select a scenario in the left pane, then choose to create new or edit an existing document in the right pane.

![select](docs/assets/select.gif)

| Key | Action |
|-----|--------|
| `↑↓` / `j/k` | Navigate items |
| `→` / `l` / `Enter` | Select / Move to right pane |
| `←` / `h` / `Esc` | Move to left pane |
| `q` | Quit |

### Form Input Screen

A 3-panel layout with step tabs at the top, field list on the left, and editing area on the right.

![edit](docs/assets/edit.gif)

| Key | Action |
|-----|--------|
| `←→` / `h/l` | Navigate steps |
| `↑↓` / `j/k` | Navigate fields |
| `Enter` | Start editing / Confirm |
| `Esc` | Cancel |
| `n` / `p` | Next / Previous step |
| `d` | Delete repeatable item |
| `g` | Generate preview |
| `q` | Go back |

### Preview Screen

AI generates the document and displays the result with streaming.

![preview](docs/assets/preview.gif)

| Key | Action |
|-----|--------|
| `↑↓` / `j/k` | Scroll |
| `r` | Regenerate |
| `s` | Save |
| `c` | Continue in Claude Code |
| `i` | Show formData / aiContext |
| `Esc` / `q` | Go back |

Press `c` to continue the conversation in Claude Code, inheriting the current session.

## Configuration

### Basic Structure

```typescript
import { defineConfig, defineScenario, type Step } from 'pre-claude';

const steps = [
  {
    slug: 'overview',
    title: 'Overview',
    description: 'Basic project information',
    name: 'overview',
    fields: [
      {
        id: 'title',
        type: 'input',
        label: 'Title',
        description: 'Project name',
        required: true,
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

### Scenario

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `id` | `string` | ○ | Unique identifier |
| `name` | `string` | ○ | Display name |
| `steps` | `Step[]` | ○ | Form wizard steps |
| `prompt` | `(params) => string` | ○ | Prompt generator function |
| `outputDir` | `string` | | Output directory |
| `filename` | `string \| function` | | Filename |

The `prompt` function receives `formData` (input values) and `aiContext` (field labels and descriptions).

### Step

| Property | Type | Description |
|----------|------|-------------|
| `slug` | `string` | URL-friendly identifier |
| `title` | `string` | Title |
| `description` | `string` | Description |
| `name` | `string` | Key name in formData |
| `fields` | `Field[]` | Field array |

### Field Types

#### input

```typescript
{
  id: 'title',
  type: 'input',
  label: 'Title',
  description: 'Description',
  placeholder: 'Placeholder',
  required: true,
  inputType: 'text', // 'text' | 'date' | 'url'
  suggestions: ['Option 1', 'Option 2'], // Autocomplete
  default: 'Default value',
}
```

#### textarea

```typescript
{
  id: 'description',
  type: 'textarea',
  label: 'Description',
  description: 'Detailed description',
  rows: 5,
}
```

#### select

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

#### checkbox

```typescript
{
  id: 'agree',
  type: 'checkbox',
  label: 'I agree',
  description: 'Agreement to terms',
  required: true,
}
```

### Layouts

#### repeatable

A repeatable field that can be dynamically added or removed.

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
      { id: 'desc', type: 'textarea', label: 'Description', description: '', rows: 2 },
    ],
  },
}
```

formData becomes an array:

```typescript
{
  features: [
    { name: 'Feature 1', desc: 'Description 1' },
    { name: 'Feature 2', desc: 'Description 2' },
  ]
}
```

#### group

Groups multiple fields together. Used within repeatable.

### Conditional Display

Use the `when` property to specify display conditions for fields.

```typescript
// Simple conditions
{ ..., when: { field: 'priority', is: 'high' } }
{ ..., when: { field: 'priority', is: ['high', 'medium'] } }
{ ..., when: { field: 'priority', isNot: 'low' } }
{ ..., when: { field: 'title', isNotEmpty: true } }
{ ..., when: { field: 'notes', isEmpty: true } }

// AND condition
{
  ...,
  when: {
    and: [
      { field: 'priority', is: 'high' },
      { field: 'type', is: 'feature' }
    ]
  }
}

// OR condition
{
  ...,
  when: {
    or: [
      { field: 'priority', is: 'high' },
      { field: 'type', is: 'urgent' }
    ]
  }
}

// Reference fields from other steps
{ ..., when: { field: 'overview.priority', is: 'high' } }
```

### Type Safety

Using `defineScenario` with `as const satisfies Step[]` enables type inference for `formData`.

```typescript
const scenario = defineScenario({
  id: 'my-scenario',
  name: 'My Scenario',
  steps,
  prompt: ({ formData }) => {
    // formData.overview?.title is string | undefined
    return `Title: ${formData.overview?.title ?? 'Untitled'}`;
  },
  filename: ({ formData, timestamp }) =>
    `${formData.overview?.title ?? 'untitled'}-${timestamp}.md`,
});
```

## License

MIT
