# 開発ガイド

## セットアップ

### 必要な環境
- Node.js 18.x以上
- npm 9.x以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/mtsgi/gridia-copilot.git
cd gridia-copilot

# 依存関係のインストール
npm install
```

## 開発コマンド

### 開発サーバーの起動
```bash
npm run dev
```
- http://localhost:5173 でアクセス
- ホットリロード有効

### プロダクションビルド
```bash
npm run build
```
- TypeScriptのコンパイルと型チェック
- Viteによる本番用バンドル
- `dist/` フォルダに出力

### ビルドのプレビュー
```bash
npm run preview
```
- 本番ビルドをローカルで確認

### テスト
```bash
# ユニットテスト実行
npm test

# カバレッジレポート付きで実行
npm run test:coverage

# E2Eテスト実行
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui
```
- ユニットテスト: Vitest + @solidjs/testing-library
- E2Eテスト: Playwright
- カバレッジ目標: 70%以上

## テスト

### TypeScript
- 型は明示的に定義
- `any`の使用は避ける
- インターフェースは`types/`ディレクトリに配置

### コンポーネント
- 関数コンポーネントを使用
- Propsはインターフェースで定義
- スタイルは同名のCSSファイルで管理

### ファイル命名
- コンポーネント: PascalCase (例: `BookmarkCard.tsx`)
- サービス: camelCase (例: `bookmarkDB.ts`)
- 型定義: camelCase (例: `bookmark.ts`)

## プロジェクト構造の拡張

### 新しいコンポーネントの追加

1. `src/components/`にファイル作成
```typescript
// src/components/NewComponent.tsx
import { type Component } from 'solid-js';
import './NewComponent.css';

interface NewComponentProps {
  // props定義
}

const NewComponent: Component<NewComponentProps> = (props) => {
  return (
    <div class="new-component">
      {/* JSX */}
    </div>
  );
};

export default NewComponent;
```

2. CSSファイルの作成
```css
/* src/components/NewComponent.css */
.new-component {
  /* スタイル */
}
```

### 新しいサービスの追加

1. `src/services/`にファイル作成
```typescript
// src/services/newService.ts
export class NewService {
  // サービスロジック
}

export const newService = new NewService();
```

### 新しい型の追加

1. `src/types/`にファイル作成
```typescript
// src/types/newType.ts
export interface NewType {
  // 型定義
}
```

## デバッグ

### ブラウザDevTools
- **Console**: ログとエラーの確認
- **Application > IndexedDB**: データベースの内容確認
- **Network**: APIリクエストの監視（将来の拡張用）

### IndexedDBの確認
1. Chrome DevToolsを開く
2. Application タブ
3. IndexedDB > GridiaDB > bookmarks

### SolidJSのデバッグ
- Solid DevTools拡張機能の使用を推奨
- コンポーネントの状態確認

## テスト

### ビルドエラー
```bash
# node_modulesをクリーンアップ
rm -rf node_modules package-lock.json
npm install
```

### IndexedDBエラー
- ブラウザのプライベートモードでは制限あり
- ブラウザのストレージをクリア

### 型エラー
```bash
# TypeScriptの再コンパイル
npm run build
```

## Git フロー

### ブランチ戦略
- `master`: 安定版
- `develop`: 開発版
- `feature/*`: 新機能
- `fix/*`: バグ修正

### コミットメッセージ
```
<type>: <subject>

<body>

<footer>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加
- `chore`: ビルド・設定

## デプロイ

### 静的ホスティング
```bash
npm run build
# dist/ フォルダをデプロイ
```

### GitHub Pages（自動デプロイ）

このリポジトリは、`main`ブランチへのプッシュ時に自動的にGitHub Pagesにデプロイされるように設定されています。

#### CI/CDワークフロー

`.github/workflows/deploy.yml`により、以下の処理が自動実行されます：

1. **ビルドジョブ**
   - Node.js 18環境のセットアップ
   - 依存関係のインストール（`npm ci`）
   - プロダクションビルドの実行（`npm run build`）
   - ビルド成果物のアップロード

2. **デプロイジョブ**
   - GitHub Pagesへの自動デプロイ
   - デプロイURLの取得

#### デプロイURL
- https://mtsgi.github.io/gridia-copilot/

#### 初回セットアップ

GitHub Pagesを有効化するには、リポジトリで以下の設定を行います：

1. Settings → Pages
2. Build and deployment → Source: "GitHub Actions"を選択
3. `main`ブランチへのプッシュで自動デプロイが開始されます

#### ワークフローの確認

- **Actions**タブでビルドとデプロイのログを確認できます
- 各ステップの実行状態と所要時間が表示されます
- エラーが発生した場合は詳細なログが確認できます

#### セキュリティ

ワークフローは以下のベストプラクティスに従っています：

- 最小権限の原則（`contents: read`, `pages: write`, `id-token: write`）
- 最新の安定版アクションを使用
- ビルドとデプロイジョブの分離
- 並行実行の制御

### 推奨プラットフォーム
- **GitHub Pages**: 無料ホスティング（このリポジトリで使用中）
- **Vercel**: 自動デプロイ
- **Netlify**: 継続的デプロイ
- **Cloudflare Pages**: エッジデプロイ

## テスト

### テストフレームワーク

このプロジェクトでは以下のテストフレームワークを使用しています:

#### ユニットテスト
- **Vitest**: Vite統合のテストランナー
- **@solidjs/testing-library**: Solidコンポーネントのテスト用ライブラリ
- **fake-indexeddb**: IndexedDBのモック

#### E2Eテスト
- **Playwright**: ブラウザ自動化テストフレームワーク

### テストの実行

```bash
# ユニットテストを実行
npm test

# ウォッチモードで実行
npm test -- --watch

# カバレッジレポート付きで実行
npm run test:coverage

# E2Eテストを実行
npm run test:e2e

# E2EテストをUIモードで実行
npm run test:e2e:ui
```

### テスト構成

```
src/
├── test/
│   └── setup.ts              # テストセットアップファイル
├── services/
│   └── bookmarkDB.test.ts    # bookmarkDBサービスのテスト
└── components/
    ├── BookmarkCard.test.tsx # BookmarkCardコンポーネントのテスト
    └── BookmarkForm.test.tsx # BookmarkFormコンポーネントのテスト

e2e/
├── bookmark.spec.ts          # ブックマーク機能のE2Eテスト
└── menu.spec.ts              # メニュー機能のE2Eテスト
```

### テストカバレッジ

現在のカバレッジ目標: **70%以上**

カバレッジレポートは `coverage/` ディレクトリに生成されます。

### 新しいテストの追加

#### ユニットテストの追加

1. テスト対象ファイルと同じディレクトリに `.test.ts` または `.test.tsx` ファイルを作成
2. Vitestの `describe`, `it`, `expect` を使用してテストを記述
3. SolidJSコンポーネントのテストには `@solidjs/testing-library` を使用

例:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(() => <MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### E2Eテストの追加

1. `e2e/` ディレクトリに `.spec.ts` ファイルを作成
2. Playwrightの `test`, `expect` を使用してテストを記述

例:
```typescript
import { test, expect } from '@playwright/test';

test('should display title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Gridia');
});
```

## トラブルシューティング

### Lighthouse
```bash
# Chromeで実行
1. DevTools > Lighthouse
2. Generate report
```

### バンドルサイズ
```bash
npm run build
# dist/assets/ のファイルサイズを確認
```

## コントリビューション

1. Issueを作成
2. フォークしてブランチ作成
3. 変更をコミット
4. プルリクエストを作成

## リソース

- [SolidJS Documentation](https://www.solidjs.com)
- [Vite Documentation](https://vitejs.dev)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
