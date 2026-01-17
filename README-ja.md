# pre-claude

Claude への構造化されたプロンプトを作成するための TUI ツール。設定ファイルでフォーム構造を定義し、ターミナルで対話的に入力し、ローカルの Claude Code 設定をそのまま使用してドキュメントを生成。

## 特徴

- TypeScript 設定ファイルでフォーム構造を定義
- TUI で対話的にプロンプトを入力
- ローカルの Claude Code 設定をそのまま利用

## 必要条件

- Node.js 18+
- Claude Code のインストール

## インストール

```bash
npm install pre-claude
# または
pnpm add pre-claude
```

## 使い方

### 設定ファイルの初期化

```bash
npx pre-claude init [-o ファイル名] [-f]
```

### TUI の実行

```bash
npx pre-claude run --config ./pre-claude.config.ts
# シナリオ ID を指定して実行
npx pre-claude run --config ./pre-claude.config.ts --scenario design-doc
```

## 設定

### 基本構造

```typescript
// pre-claude.config.ts
import { defineConfig, defineScenario, type Step } from 'pre-claude';

const steps = [
  {
    slug: 'overview',
    title: '概要',
    description: 'プロジェクトの基本情報',
    name: 'overview',
    fields: [
      {
        id: 'projectName',
        type: 'input',
        label: 'プロジェクト名',
        description: 'プロジェクトの名前を入力',
        required: true,
      },
      {
        id: 'description',
        type: 'textarea',
        label: '説明',
        description: 'プロジェクトを簡潔に説明',
        rows: 5,
      },
      {
        id: 'priority',
        type: 'select',
        label: '優先度',
        description: '優先度を選択',
        options: [
          { value: 'low', label: '低' },
          { value: 'medium', label: '中' },
          { value: 'high', label: '高' },
        ],
      },
    ],
  },
] as const satisfies Step[];

export default defineConfig({
  scenarios: [
    defineScenario({
      id: 'design-doc',
      name: '設計ドキュメント',
      steps,
      prompt: ({ formData, aiContext }) =>
        `以下の情報に基づいて設計ドキュメントを作成:\n${JSON.stringify({ formData, aiContext }, null, 2)}`,
      outputDir: './docs',
    }),
  ],
});
```

### シナリオのプロパティ

| プロパティ | 型 | 必須 | 説明 |
|----------|------|----------|-------------|
| `id` | `string` | はい | 一意識別子 |
| `name` | `string` | はい | 表示名 |
| `steps` | `Step[]` | はい | フォームウィザードのステップ |
| `prompt` | `function` | はい | プロンプト生成関数 |
| `outputDir` | `string` | いいえ | 保存先ディレクトリ |
| `filename` | `string \| function` | いいえ | カスタムファイル名 |

## フィールドタイプ

### input

テキスト入力フィールド。タイプバリエーションとオートコンプリート候補をサポート。

```typescript
{
  id: 'title',
  type: 'input',
  label: 'タイトル',
  description: 'タイトルを入力',
  placeholder: 'マイプロジェクト',
  required: true,
  inputType: 'text', // 'text' | 'date' | 'url'
  suggestions: ['選択肢A', '選択肢B'], // オートコンプリート候補
  default: 'デフォルト値',
}
```

### textarea

複数行テキスト入力。

```typescript
{
  id: 'description',
  type: 'textarea',
  label: '説明',
  description: '説明を入力',
  rows: 5,
  default: 'デフォルトテキスト',
}
```

### select

ドロップダウン選択。

```typescript
{
  id: 'priority',
  type: 'select',
  label: '優先度',
  description: '優先度を選択',
  options: [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
  ],
  default: 'medium',
}
```

### checkbox

チェックボックス。

```typescript
{
  id: 'agree',
  type: 'checkbox',
  label: '利用規約に同意する',
  description: '続行するには同意が必要です',
  required: true,
  default: false,
}
```

## レイアウト

### repeatable

フィールドを動的に追加/削除可能。

```typescript
{
  type: 'repeatable',
  id: 'features',
  label: '機能',
  minCount: 1,
  defaultCount: 2,
  field: {
    type: 'group',
    fields: [
      { id: 'name', type: 'input', label: '名前', description: '' },
      { id: 'description', type: 'textarea', label: '説明', description: '', rows: 2 },
    ],
  },
}
```

### group

フィールドの視覚的なグループ化。

```typescript
{
  type: 'group',
  fields: [
    { id: 'street', type: 'input', label: '番地', description: '' },
    { id: 'city', type: 'input', label: '市区町村', description: '' },
  ],
}
```

## 条件付き表示

`when` プロパティでフィールドの条件付き表示をサポート。

### 単純な条件

```typescript
// priority が 'high' のとき表示
{ ..., when: { field: 'priority', is: 'high' } }

// priority が 'high' または 'medium' のとき表示
{ ..., when: { field: 'priority', is: ['high', 'medium'] } }

// priority が 'low' でないとき表示
{ ..., when: { field: 'priority', isNot: 'low' } }

// チェックボックスがオンのとき表示
{ ..., when: { field: 'hasDeadline', is: true } }

// フィールドが空でないとき表示
{ ..., when: { field: 'title', isNotEmpty: true } }

// フィールドが空のとき表示
{ ..., when: { field: 'notes', isEmpty: true } }
```

### AND 条件

```typescript
// 両方の条件が true のとき表示
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

### OR 条件

```typescript
// いずれかの条件が true のとき表示
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

### ネストした条件

```typescript
// 複雑なネスト条件
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

### ステップ間参照

ドット記法で他のステップのフィールドを参照:

```typescript
{ ..., when: { field: 'overview.priority', is: 'high' } }
```

## 開発

```bash
pnpm install
pnpm build
pnpm dev
pnpm lint:fix
pnpm typecheck
```

## ライセンス

MIT
