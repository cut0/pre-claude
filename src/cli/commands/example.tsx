import { defineCommand } from 'citty';
import { consola } from 'consola';
import { render } from 'ink';

import type { Config, Step } from '../../definitions';
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

const enSteps = [
  {
    slug: 'libraries',
    title: 'Libraries',
    description: 'Libraries to introduce',
    name: 'libraries',
    fields: [
      {
        type: 'repeatable',
        id: 'items',
        label: 'Libraries',
        minCount: 1,
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
            },
            {
              type: 'input',
              id: 'url',
              label: 'URL',
              description: 'Link to documentation or repository',
              placeholder: 'https://...',
              inputType: 'url',
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
  return `You are a software architect. Create an introduction plan for the following libraries.

## Tasks

1. For each library URL provided, use WebFetch to retrieve and analyze the documentation
2. Based on the analysis, create an introduction plan including:
   - Library overview and purpose
   - Key features and benefits
   - Installation steps
   - Basic usage examples
   - Potential risks and considerations
   - Recommended adoption timeline

## Input Data

### Schema
${JSON.stringify(aiContext, null, 2)}

### Form Data
${JSON.stringify(formData, null, 2)}

Create a comprehensive library introduction plan based on the input above.`;
};

const enConfig: Config = {
  scenarios: [
    {
      id: 'default',
      name: 'Library Introduction Plan',
      steps: enSteps,
      prompt: enPrompt,
    },
  ],
};

// =============================================================================
// Japanese Config
// =============================================================================

const jaSteps = [
  {
    slug: 'libraries',
    title: 'ライブラリ',
    description: '導入するライブラリ',
    name: 'libraries',
    fields: [
      {
        type: 'repeatable',
        id: 'items',
        label: 'ライブラリ一覧',
        minCount: 1,
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
            },
            {
              type: 'input',
              id: 'url',
              label: 'URL',
              description: 'ドキュメントまたはリポジトリへのリンク',
              placeholder: 'https://...',
              inputType: 'url',
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
  return `あなたはソフトウェアアーキテクトです。以下のライブラリの導入プランを作成してください。

## タスク

1. 各ライブラリの URL が提供されている場合、WebFetch を使用してドキュメントを取得・分析してください
2. 分析結果に基づき、以下を含む導入プランを作成してください：
   - ライブラリの概要と目的
   - 主な機能とメリット
   - インストール手順
   - 基本的な使用例
   - 潜在的なリスクと考慮事項
   - 推奨される導入スケジュール

## 入力データ

### スキーマ
${JSON.stringify(aiContext, null, 2)}

### フォームデータ
${JSON.stringify(formData, null, 2)}

上記の入力に基づいて、包括的なライブラリ導入プランを作成してください。`;
};

const jaConfig: Config = {
  scenarios: [
    {
      id: 'default',
      name: 'ライブラリ導入プラン',
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
