# サンプル

pre-claude の設定例です。

## ファイル

- `pre-claude.config.ts` - 英語版
- `pre-claude-ja.config.ts` - 日本語版

## 使い方

```bash
npm install -g pre-claude
pre-claude run --config examples/pre-claude.config.ts
```

## 設定例の内容

- フォームフィールド: input, textarea, select, checkbox
- 条件付き表示: `when` による `is`, `isNot`, `isEmpty`, `isNotEmpty`
- 複合条件: `and` / `or`
- 繰り返しフィールド: repeatable + group
- ネスト構造: repeatable > group > repeatable
- オートコンプリート: input の `suggestions`
- AI 連携: Figma MCP, WebSearch, WebFetch
