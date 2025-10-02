# Gridia アーキテクチャドキュメント

## 概要
GridiaはSolidJSとIndexedDBを使用したモダンなブックマーク管理アプリケーションです。

## 技術スタック

### フロントエンド
- **SolidJS 1.9.9**: リアクティブUIフレームワーク
- **TypeScript**: 型安全性の確保
- **CSS3**: カスタムスタイリング

### ビルド・開発ツール
- **Vite 7.1.7**: 高速開発サーバー＆ビルドツール
- **TypeScript Compiler**: 型チェックとトランスパイル

### データストレージ
- **IndexedDB**: ブラウザ内永続ストレージ

## プロジェクト構造

```
src/
├── types/
│   └── bookmark.ts          # Bookmark型とCategory型の定義
├── services/
│   └── bookmarkDB.ts        # IndexedDB操作のラッパークラス
├── components/
│   ├── BookmarkCard.tsx     # ブックマークカードコンポーネント
│   ├── BookmarkCard.css     # カードのスタイル
│   ├── BookmarkForm.tsx     # 追加/編集フォームコンポーネント
│   └── BookmarkForm.css     # フォームのスタイル
├── App.tsx                  # メインアプリケーションコンポーネント
├── App.css                  # アプリ全体のスタイル
├── index.tsx               # エントリーポイント
└── index.css               # グローバルスタイル
```

## データモデル

### Bookmark
```typescript
interface Bookmark {
  id?: number;
  title: string;
  url: string;
  category: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  color?: string;
}
```

## 主要機能

### 1. ブックマーク管理
- **追加**: 新しいブックマークを作成
- **編集**: 既存のブックマークを更新
- **削除**: 不要なブックマークを削除
- **お気に入り**: 重要なブックマークにスターマーク

### 2. フィルタリング＆検索
- **カテゴリフィルター**: カテゴリ別に表示
- **お気に入りフィルター**: お気に入りのみ表示
- **検索**: タイトル、URL、カテゴリで検索

### 3. UI/UX
- **グリッドレイアウト**: レスポンシブなカード型表示
- **モーダルフォーム**: スムーズなアニメーション
- **ホバーエフェクト**: インタラクティブなフィードバック

## IndexedDB構造

### データベース: GridiaDB (version 1)

#### オブジェクトストア: bookmarks
- **キー**: id (自動インクリメント)
- **インデックス**:
  - category: カテゴリフィルタリング用
  - isFavorite: お気に入りフィルタリング用
  - title: 検索用

## コンポーネント設計

### App.tsx
- メインアプリケーションロジック
- 状態管理（bookmarks, filters, search）
- CRUD操作のハンドリング

### BookmarkCard.tsx
- 個別のブックマーク表示
- クリックでURLを開く
- 編集/削除/お気に入りトグル

### BookmarkForm.tsx
- モーダルフォーム
- 追加/編集モードの切り替え
- バリデーション

## レスポンシブデザイン

### ブレークポイント
- **Desktop**: > 768px (グリッド表示)
- **Tablet**: 481px - 768px (2カラム)
- **Mobile**: ≤ 480px (1カラム)

### モバイル最適化
- タッチフレンドリーなボタンサイズ
- フルスクリーンフォーム
- スタックレイアウト

## パフォーマンス最適化

1. **SolidJSのリアクティビティ**: 必要な部分のみ再レンダリング
2. **IndexedDB**: 非同期操作でUIブロッキングなし
3. **CSS Transitions**: ハードウェアアクセラレーション利用
4. **Viteの高速HMR**: 開発時の即座な反映

## セキュリティ

- **クライアントサイド完結**: サーバー不要
- **ローカルストレージ**: IndexedDBはブラウザ内で完結
- **XSS対策**: SolidJSの自動エスケープ

## 今後の拡張可能性

1. タグ機能の追加
2. エクスポート/インポート機能
3. ブックマークの並び替え
4. ダークモード対応
5. PWA化（オフライン完全対応）
6. クラウド同期（オプション）
