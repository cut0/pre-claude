# pre-claude

Claude 向け構造化プロンプト作成用の TUI ツールです。TypeScript 設定ファイルでフォーム構造を定義し、対話的に入力して、Claude Code 経由でドキュメントを生成します。

## 特徴

- TypeScript ベースのフォーム設定
- 対話型 TUI フォームウィザード
- ローカル Claude Code 設定を使用

## 必要条件

- Node.js 18+
- Claude Code

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
# シナリオ ID 指定
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
    description: 'プロジェクト基本情報',
    name: 'overview',
    fields: [
      {
        id: 'projectName',
        type: 'input',
        label: 'プロジェクト名',
        description: 'プロジェクト名を入力',
        required: true,
      },
      {
        id: 'description',
        type: 'textarea',
        label: '説明',
        description: 'プロジェクトの概要',
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
        `以下に基づき設計ドキュメントを作成:\n${JSON.stringify({ formData, aiContext }, null, 2)}`,
      outputDir: './docs',
    }),
  ],
});
```

### シナリオプロパティ

| プロパティ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `id` | `string` | Yes | 一意識別子 |
| `name` | `string` | Yes | 表示名 |
| `steps` | `Step[]` | Yes | フォームステップ |
| `prompt` | `function` | Yes | プロンプト生成関数 |
| `outputDir` | `string` | No | 出力ディレクトリ |
| `filename` | `string \| function` | No | カスタムファイル名 |

## フィールドタイプ

### input

単一行テキスト入力です。タイプバリエーション（`text`、`date`、`url`）とオートコンプリート候補をサポートしています。

```typescript
{
  id: 'title',
  type: 'input',
  label: 'タイトル',
  description: 'タイトルを入力',
  placeholder: 'マイプロジェクト',
  required: true,
  inputType: 'text', // 'text' | 'date' | 'url'
  suggestions: ['選択肢A', '選択肢B'],
  default: 'デフォルト値',
}
```

### textarea

複数行テキスト入力です。`rows` プロパティで表示行数を制御できます。

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

定義済み選択肢からのドロップダウン選択です。

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

真偽値のトグルです。

```typescript
{
  id: 'agree',
  type: 'checkbox',
  label: '利用規約に同意',
  description: '続行に必須',
  required: true,
  default: false,
}
```

## レイアウト

### repeatable

フィールドを動的に追加・削除できます。`minCount` で最小数、`defaultCount` で初期数を設定します。

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

複数のフィールドを視覚的にグループ化します。データ構造には影響しません。

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

`when` プロパティで条件付き表示を設定できます。

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

### AND / OR 条件

```typescript
// AND: 両条件が true のとき表示
{
  ...,
  when: {
    and: [
      { field: 'priority', is: 'high' },
      { field: 'type', is: 'feature' }
    ]
  }
}

// OR: いずれかが true のとき表示
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

### ネスト条件

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

### ステップ間参照

ドット記法で他のステップのフィールドを参照できます。

```typescript
{ ..., when: { field: 'overview.priority', is: 'high' } }
```

## ライセンス

MIT
