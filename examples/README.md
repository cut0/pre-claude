# Examples

[日本語版](./README.ja.md)

This directory contains example configurations for pre-claude.

## Files

| File | Description |
|------|-------------|
| `pre-claude.config.ts` | English version |
| `pre-claude-ja.config.ts` | Japanese version |

Both files demonstrate the same features with different localizations.

## Quick Start

```bash
# Run the example directly
npx pre-claude example

# Or specify a config file
npx pre-claude run --config examples/pre-claude.config.ts
```

## What's Demonstrated

These example configs showcase a "Design Document Generator" scenario that demonstrates all major features of pre-claude.

### Form Fields

| Type | Description | Example |
|------|-------------|---------|
| `input` | Single-line text input | Title, Deadline |
| `textarea` | Multi-line text input | Description, Notes |
| `select` | Dropdown selection | Priority (High/Medium/Low) |
| `checkbox` | Boolean toggle | *(not used in this example)* |

### Conditional Display (`when`)

Fields can be shown/hidden based on other field values:

```typescript
// Show when priority is 'high'
{ ..., when: { field: 'priority', is: 'high' } }

// Show when priority is 'high' or 'medium'
{ ..., when: { field: 'priority', is: ['high', 'medium'] } }

// Show when title is not empty
{ ..., when: { field: 'title', isNotEmpty: true } }
```

### Composite Conditions (`and` / `or`)

Combine multiple conditions:

```typescript
// AND: Show when priority is 'high' AND title is not empty
{
  when: {
    and: [
      { field: 'priority', is: 'high' },
      { field: 'title', isNotEmpty: true },
    ],
  },
}

// OR: Show when priority is 'high' OR description is not empty
{
  when: {
    or: [
      { field: 'priority', is: 'high' },
      { field: 'description', isNotEmpty: true },
    ],
  },
}

// Nested: (priority is 'high') OR (priority is 'medium' AND deadline is set)
{
  when: {
    or: [
      { field: 'priority', is: 'high' },
      {
        and: [
          { field: 'priority', is: 'medium' },
          { field: 'deadline', isNotEmpty: true },
        ],
      },
    ],
  },
}
```

### Repeatable + Group

Create dynamic lists of grouped fields:

```typescript
{
  type: 'repeatable',
  id: 'items',
  label: 'Libraries',
  minCount: 1,
  field: {
    type: 'group',
    fields: [
      { type: 'input', id: 'name', label: 'Library Name', ... },
      { type: 'input', id: 'url', label: 'URL', ... },
      { type: 'textarea', id: 'reason', label: 'Reason', ... },
    ],
  },
}
```

### Nested Repeatable

Repeatable fields can be nested inside groups:

```typescript
// Structure: repeatable > group > repeatable
// Each module can have multiple features
{
  type: 'repeatable',
  id: 'items',
  label: 'Modules',
  field: {
    type: 'group',
    fields: [
      { type: 'input', id: 'name', label: 'Module Name', ... },
      {
        type: 'repeatable',
        id: 'features',
        label: 'Features',
        field: {
          type: 'group',
          fields: [
            { type: 'input', id: 'feature_name', label: 'Feature Name', ... },
          ],
        },
      },
    ],
  },
}
```

### Autocomplete (Suggestions)

Input fields can have autocomplete suggestions:

```typescript
{
  type: 'input',
  id: 'name',
  label: 'Library Name',
  suggestions: [
    'react-query',
    'zod',
    'zustand',
    'react-hook-form',
    'tailwindcss',
  ],
}
```

Press `Tab` while typing to cycle through matching suggestions.

### AI Integration in Prompt

The prompt function demonstrates how to integrate with external tools:

#### Figma MCP

```typescript
const prompt = ({ aiContext, formData }) => `
If a Figma link is provided:
1. Use Figma MCP tools to fetch design information
2. Analyze the design structure and components

Available Figma MCP tools:
- mcp__figma__get_design_context
- mcp__figma__get_variable_defs
- mcp__figma__get_screenshot
- mcp__figma__get_metadata

Input: ${JSON.stringify({ aiContext, formData }, null, 2)}
`;
```

#### WebSearch / WebFetch

```typescript
const prompt = ({ aiContext, formData }) => `
If libraries are provided:
1. Use WebSearch to find documentation
2. Use WebFetch to get detailed information from URLs

Input: ${JSON.stringify({ aiContext, formData }, null, 2)}
`;
```

## Step Structure

The example has 4 steps:

| Step | Name | Description |
|------|------|-------------|
| 1 | Overview | Basic feature information (title, description, priority) |
| 2 | Design | Figma link and design notes |
| 3 | Libraries | External library dependencies with autocomplete |
| 4 | Modules | Module structure with nested features |

## Customization

Copy and modify these examples to create your own configurations:

```bash
# Create a new config from template
npx pre-claude init -o my-config.ts

# Or copy an example
cp examples/pre-claude.config.ts my-config.ts
```
