# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

pre-claude is a TUI tool for building structured prompts for Claude. Users define form structures in TypeScript config files, fill them out interactively in the terminal, and generate documents using their local Claude Code settings. Built with Ink (React for CLI) and Claude Agent SDK.

## Commands

```bash
# Install dependencies
pnpm install

# Build the CLI (outputs to dist/cli.js)
pnpm build

# Run the TUI with a config file
pnpm dev  # Uses examples/pre-claude-ja.config.ts

# Run with a custom config
pre-claude run --config path/to/config.ts
# or after build:
node dist/cli.js run --config path/to/config.ts

# Initialize a new config file
pre-claude init [-o filename] [-f]

# Lint and format
pnpm lint:check
pnpm lint:fix

# Type check
pnpm typecheck
```

## Architecture

### Entry Points

- `src/cli/commands/run.tsx` - Main CLI command that loads config and renders the TUI
- `src/cli/commands/init.ts` - Scaffolds a new config file
- `src/types.ts` - Core type definitions (exported as the public API)
- `src/schema.ts` - Valibot schemas for runtime validation
- `src/definitions.ts` - Re-exports types and schema for convenience

### TUI Structure (Ink/React)

```
src/tui/
├── App.tsx              # Root component managing screen navigation (select → form → preview)
├── views/               # Screen components
│   ├── SelectScenario/  # Scenario selection and document listing
│   ├── ScenarioForm/    # Multi-step form wizard with field editing
│   │   └── -internal/   # Internal components (StepSelector, FieldSelector, FieldEditor)
│   └── Preview/         # AI generation preview and document saving
├── features/            # Feature-based modules
│   ├── form/            # Form field components and utilities
│   │   ├── components/  # TextField, Checkbox, Select, SimpleTextInput
│   │   ├── types.ts     # Form-related type definitions
│   │   ├── services.ts  # Form data processing (aiContext, condition evaluation)
│   │   └── utils.ts     # Utility functions
│   ├── document/        # Document save/load services
│   │   ├── types.ts     # Document type definitions
│   │   └── services.ts  # File I/O operations
│   └── generation/      # AI generation services
│       ├── types.ts     # Generation type definitions
│       └── services.ts  # Streaming via Claude Agent SDK
├── components/          # Shared UI components
│   ├── Header/          # Header component
│   ├── StatusBar/       # Status display
│   └── ControlBar/      # Keyboard shortcut hints
├── layouts/             # Layout components
│   ├── CommonLayout/    # Base layout wrapper
│   └── ScenarioLayout/  # Scenario-specific layout
└── hooks/               # Custom hooks
    ├── useFormState.ts  # Form data state management
    ├── useControl.ts    # Keyboard control management
    └── useMount.ts      # Mount lifecycle hook
```

### Configuration System

Configs are TypeScript files using `defineConfig` and `defineScenario` helpers:

- **Scenario**: A document type with steps, prompt function, and output settings
- **Step**: A wizard page with fields (slug, title, description, name, fields)
- **Field types**: input, textarea, select, checkbox
- **Layout types**: repeatable, group
- **Field conditions**: Declarative `when` clauses for conditional field visibility
  - Single conditions: `is`, `isNot`, `isEmpty`, `isNotEmpty`
  - Composite conditions: `and`, `or` (supports nesting)
  - Cross-section references via dot notation (e.g., `overview.priority`)

### Key Types

- `Config` - Root configuration with scenarios array
- `Scenario<TFormData>` - Document template with type-safe form data
- `Step` - Wizard step with slug, title, description, name, and fields array
- `Field` - Union of FormField (input, textarea, select, checkbox) and LayoutField (repeatable, group)
- `FieldCondition` - Declarative condition for field visibility
- `AiContext` - Metadata for form fields passed to AI (labels, descriptions)
- `InferFormDataFromSteps<T>` - Utility type for type-safe formData inference

### Build

The CLI is bundled with esbuild (`scripts/build-cli.ts`). Dependencies are external (resolved at runtime). Types are built separately via tsc.

## Code Style

- Biome for linting/formatting (2-space indent, single quotes, semicolons)
- Strict TypeScript with `noUncheckedIndexedAccess`
- React JSX for TUI components (Ink framework)
- Valibot for runtime validation
- Feature-based directory structure with `-internal/` for non-exported components
- Service files (`services.ts`) for business logic, separate from types (`types.ts`)
