# サンプル

[English](./README.md)

pre-claude の設定例を収録したディレクトリです。

## ファイル一覧

| ファイル | 説明 |
|----------|------|
| `pre-claude.config.ts` | 英語版 |
| `pre-claude-ja.config.ts` | 日本語版 |

両ファイルは同じ機能をデモしており、ローカライズのみ異なります。

## クイックスタート

```bash
# サンプルを直接実行
npx pre-claude example --lang ja

# または設定ファイルを指定して実行
npx pre-claude run --config examples/pre-claude-ja.config.ts
```

## デモ内容

これらの設定例は「設計ドキュメント生成」シナリオを通じて、pre-claude の主要機能をすべてデモしています。

### フォームフィールド

| タイプ | 説明 | 使用例 |
|--------|------|--------|
| `input` | 単一行テキスト入力 | タイトル、締め切り |
| `textarea` | 複数行テキスト入力 | 説明、メモ |
| `select` | ドロップダウン選択 | 優先度（高/中/低） |
| `checkbox` | 真偽値トグル | *（このサンプルでは未使用）* |

### 条件付き表示（`when`）

他のフィールドの値に基づいてフィールドの表示/非表示を制御できます：

```typescript
// 優先度が「高」の場合に表示
{ ..., when: { field: 'priority', is: 'high' } }

// 優先度が「高」または「中」の場合に表示
{ ..., when: { field: 'priority', is: ['high', 'medium'] } }

// タイトルが空でない場合に表示
{ ..., when: { field: 'title', isNotEmpty: true } }
```

### 複合条件（`and` / `or`）

複数の条件を組み合わせることができます：

```typescript
// AND: 優先度が「高」かつタイトルが空でない場合に表示
{
  when: {
    and: [
      { field: 'priority', is: 'high' },
      { field: 'title', isNotEmpty: true },
    ],
  },
}

// OR: 優先度が「高」または説明が空でない場合に表示
{
  when: {
    or: [
      { field: 'priority', is: 'high' },
      { field: 'description', isNotEmpty: true },
    ],
  },
}

// ネスト: (優先度が「高」) または (優先度が「中」かつ締め切りが設定されている)
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

### 繰り返し + グループ

動的に追加・削除できるフィールドのリストを作成できます：

```typescript
{
  type: 'repeatable',
  id: 'items',
  label: 'ライブラリ一覧',
  minCount: 1,
  field: {
    type: 'group',
    fields: [
      { type: 'input', id: 'name', label: 'ライブラリ名', ... },
      { type: 'input', id: 'url', label: 'URL', ... },
      { type: 'textarea', id: 'reason', label: '選定理由', ... },
    ],
  },
}
```

### ネストした繰り返し

繰り返しフィールドはグループ内にネストできます：

```typescript
// 構造: repeatable > group > repeatable
// 各モジュールは複数の機能を持つことができる
{
  type: 'repeatable',
  id: 'items',
  label: 'モジュール一覧',
  field: {
    type: 'group',
    fields: [
      { type: 'input', id: 'name', label: 'モジュール名', ... },
      {
        type: 'repeatable',
        id: 'features',
        label: '機能一覧',
        field: {
          type: 'group',
          fields: [
            { type: 'input', id: 'feature_name', label: '機能名', ... },
          ],
        },
      },
    ],
  },
}
```

### オートコンプリート（サジェスト）

入力フィールドにオートコンプリート候補を設定できます：

```typescript
{
  type: 'input',
  id: 'name',
  label: 'ライブラリ名',
  suggestions: [
    'react-query',
    'zod',
    'zustand',
    'react-hook-form',
    'tailwindcss',
  ],
}
```

入力中に `Tab` キーを押すと、マッチする候補を順に選択できます。

### プロンプトでの AI 連携

プロンプト関数では外部ツールとの連携方法をデモしています：

#### Figma MCP

```typescript
const prompt = ({ aiContext, formData }) => `
Figma リンクが提供されている場合:
1. Figma MCP ツールを使用してデザイン情報を取得
2. デザイン構造とコンポーネントを分析

利用可能な Figma MCP ツール:
- mcp__figma__get_design_context
- mcp__figma__get_variable_defs
- mcp__figma__get_screenshot
- mcp__figma__get_metadata

入力: ${JSON.stringify({ aiContext, formData }, null, 2)}
`;
```

#### WebSearch / WebFetch

```typescript
const prompt = ({ aiContext, formData }) => `
ライブラリが提供されている場合:
1. WebSearch でドキュメントを検索
2. WebFetch で URL から詳細情報を取得

入力: ${JSON.stringify({ aiContext, formData }, null, 2)}
`;
```

## ステップ構成

サンプルは 4 つのステップで構成されています：

| ステップ | 名前 | 説明 |
|----------|------|------|
| 1 | 概要 | 機能の基本情報（タイトル、説明、優先度） |
| 2 | デザイン | Figma リンクとデザインメモ |
| 3 | ライブラリ | 外部ライブラリ依存関係（オートコンプリート付き） |
| 4 | モジュール | ネストした機能を持つモジュール構成 |

## カスタマイズ

これらのサンプルをコピーして、独自の設定を作成できます：

```bash
# テンプレートから新しい設定ファイルを作成
npx pre-claude init -o my-config.ts

# またはサンプルをコピー
cp examples/pre-claude-ja.config.ts my-config.ts
```
