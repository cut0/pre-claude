import { defineCommand } from 'citty';
import { consola } from 'consola';
import { render } from 'ink';

import type { Config, SelectOption, Step } from '../../definitions';
import { App } from '../../tui/App';

const enterAlternateScreen = () => {
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[H');
};

const exitAlternateScreen = () => {
  process.stdout.write('\x1b[?1049l');
};

// =============================================================================
// English Config
// =============================================================================

const enPriorityOptions: SelectOption[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const enSteps = [
  {
    slug: 'overview',
    title: 'Overview',
    description: 'Basic information about the feature',
    name: 'overview',
    fields: [
      {
        type: 'input',
        id: 'title',
        label: 'Title',
        description: 'Feature title',
        placeholder: 'Enter feature title',
        required: true,
      },
      {
        type: 'textarea',
        id: 'description',
        label: 'Description',
        description: 'Detailed description of the feature',
        placeholder: 'Describe the feature...',
        rows: 4,
      },
      {
        type: 'select',
        id: 'priority',
        label: 'Priority',
        description: 'Feature priority level',
        placeholder: 'Select priority',
        options: enPriorityOptions,
      },
      {
        type: 'input',
        id: 'deadline',
        label: 'Deadline',
        description: 'Target completion date (required for high priority)',
        placeholder: 'YYYY-MM-DD',
        inputType: 'date',
        required: true,
        when: { field: 'priority', is: 'high' },
      },
      {
        type: 'textarea',
        id: 'risk_assessment',
        label: 'Risk Assessment',
        description: 'Potential risks and mitigation strategies',
        placeholder: 'Describe potential risks...',
        rows: 3,
        when: { field: 'priority', is: ['high', 'medium'] },
      },
    ],
  },
  {
    slug: 'design',
    title: 'Design',
    description: 'Design references and mockups',
    name: 'design',
    fields: [
      {
        type: 'input',
        id: 'figma_link',
        label: 'Figma Link',
        description: 'Link to Figma design file or frame',
        placeholder: 'https://www.figma.com/design/...',
        inputType: 'url',
      },
      {
        type: 'textarea',
        id: 'design_notes',
        label: 'Design Notes',
        description: 'Additional notes about the design',
        placeholder: 'Any specific design considerations...',
        rows: 3,
      },
    ],
  },
  {
    slug: 'libraries',
    title: 'Libraries',
    description: 'External libraries and dependencies',
    name: 'libraries',
    fields: [
      {
        type: 'repeatable',
        id: 'items',
        label: 'Libraries',
        minCount: 0,
        field: {
          type: 'group',
          fields: [
            {
              type: 'input',
              id: 'name',
              label: 'Library Name',
              description: 'Name of the library',
              placeholder: 'e.g., react-query, zod',
              required: true,
              suggestions: [
                'react-query',
                'zod',
                'zustand',
                'react-hook-form',
                'tailwindcss',
                'axios',
                'lodash',
              ],
            },
            {
              type: 'input',
              id: 'url',
              label: 'URL',
              description: 'Link to documentation or repository',
              placeholder: 'https://...',
              inputType: 'url',
              when: { field: 'name', isNotEmpty: true },
            },
            {
              type: 'textarea',
              id: 'reason',
              label: 'Reason',
              description: 'Why this library is needed',
              placeholder: 'Explain why this library is chosen...',
              rows: 2,
            },
          ],
        },
      },
    ],
  },
] as const satisfies Step[];

const enPrompt = ({
  aiContext,
  formData,
}: {
  aiContext: unknown;
  formData: unknown;
}) => {
  return `You are a technical writer assistant. Generate a design document based on the following input.

## Input Data

### Schema
${JSON.stringify(aiContext, null, 2)}

### Form Data
${JSON.stringify(formData, null, 2)}

Generate a design document based on the input above.`;
};

const enConfig: Config = {
  scenarios: [
    {
      id: 'default',
      name: 'Design Doc Generator',
      steps: enSteps,
      prompt: enPrompt,
    },
  ],
};

// =============================================================================
// Japanese Config
// =============================================================================

const jaPriorityOptions: SelectOption[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const jaSteps = [
  {
    slug: 'overview',
    title: '概要',
    description: '機能の基本情報',
    name: 'overview',
    fields: [
      {
        type: 'input',
        id: 'title',
        label: 'タイトル',
        description: '機能のタイトル',
        placeholder: '機能名を入力',
        required: true,
      },
      {
        type: 'textarea',
        id: 'description',
        label: '説明',
        description: '機能の詳細説明',
        placeholder: '機能について説明してください...',
        rows: 4,
      },
      {
        type: 'select',
        id: 'priority',
        label: '優先度',
        description: '機能の優先度',
        placeholder: '優先度を選択',
        options: jaPriorityOptions,
      },
      {
        type: 'input',
        id: 'deadline',
        label: '締め切り',
        description: '目標完了日（高優先度の場合は必須）',
        placeholder: 'YYYY-MM-DD',
        inputType: 'date',
        required: true,
        when: { field: 'priority', is: 'high' },
      },
      {
        type: 'textarea',
        id: 'risk_assessment',
        label: 'リスク評価',
        description: '想定されるリスクと対策',
        placeholder: '想定されるリスクを記述...',
        rows: 3,
        when: { field: 'priority', is: ['high', 'medium'] },
      },
    ],
  },
  {
    slug: 'design',
    title: 'デザイン',
    description: 'デザインリファレンスとモックアップ',
    name: 'design',
    fields: [
      {
        type: 'input',
        id: 'figma_link',
        label: 'Figma リンク',
        description: 'Figma デザインファイルまたはフレームへのリンク',
        placeholder: 'https://www.figma.com/design/...',
        inputType: 'url',
      },
      {
        type: 'textarea',
        id: 'design_notes',
        label: 'デザインメモ',
        description: 'デザインに関する補足事項',
        placeholder: 'デザインで考慮すべき点など...',
        rows: 3,
      },
    ],
  },
  {
    slug: 'libraries',
    title: 'ライブラリ',
    description: '外部ライブラリと依存関係',
    name: 'libraries',
    fields: [
      {
        type: 'repeatable',
        id: 'items',
        label: 'ライブラリ一覧',
        minCount: 0,
        field: {
          type: 'group',
          fields: [
            {
              type: 'input',
              id: 'name',
              label: 'ライブラリ名',
              description: 'ライブラリの名前',
              placeholder: '例: react-query, zod',
              required: true,
              suggestions: [
                'react-query',
                'zod',
                'zustand',
                'react-hook-form',
                'tailwindcss',
                'axios',
                'lodash',
              ],
            },
            {
              type: 'input',
              id: 'url',
              label: 'URL',
              description: 'ドキュメントまたはリポジトリへのリンク',
              placeholder: 'https://...',
              inputType: 'url',
              when: { field: 'name', isNotEmpty: true },
            },
            {
              type: 'textarea',
              id: 'reason',
              label: '選定理由',
              description: 'このライブラリが必要な理由',
              placeholder: 'このライブラリを選んだ理由を説明...',
              rows: 2,
            },
          ],
        },
      },
    ],
  },
] as const satisfies Step[];

const jaPrompt = ({
  aiContext,
  formData,
}: {
  aiContext: unknown;
  formData: unknown;
}) => {
  return `あなたはテクニカルライターアシスタントです。以下の入力に基づいて設計ドキュメントを生成してください。

## 入力データ

### スキーマ
${JSON.stringify(aiContext, null, 2)}

### フォームデータ
${JSON.stringify(formData, null, 2)}

上記の入力に基づいて設計ドキュメントを生成してください。`;
};

const jaConfig: Config = {
  scenarios: [
    {
      id: 'default',
      name: '設計ドキュメント生成',
      steps: jaSteps,
      prompt: jaPrompt,
    },
  ],
};

// =============================================================================
// Command
// =============================================================================

export const exampleCommand = defineCommand({
  meta: {
    name: 'example',
    description: 'Run pre-claude with an example config to try it out',
  },
  args: {
    lang: {
      type: 'string',
      description: 'Language for example config (en or ja)',
      alias: 'l',
      default: 'en',
    },
  },
  async run({ args }) {
    const lang = args.lang;

    if (lang !== 'en' && lang !== 'ja') {
      consola.error(`Invalid language: ${lang}. Use 'en' or 'ja'.`);
      process.exit(1);
    }

    const config = lang === 'ja' ? jaConfig : enConfig;

    try {
      if (process.stdin.isTTY !== true) {
        throw new Error(
          'TUI requires an interactive terminal. Please run this command in a terminal that supports raw mode.',
        );
      }

      consola.info(
        `Running example with ${lang === 'ja' ? 'Japanese' : 'English'} config...`,
      );

      enterAlternateScreen();

      const { waitUntilExit } = render(<App config={config} />);

      await waitUntilExit();
      exitAlternateScreen();
    } catch (error) {
      exitAlternateScreen();
      if (error instanceof Error) {
        consola.error(error.message);
      } else {
        consola.error('Failed to run example:', error);
      }
      process.exit(1);
    }
  },
});
