// jest-domのマッチャーを遅延ロード
// CI環境でのimportエラーを回避するため、環境が完全に初期化された後に読み込む
import '@testing-library/jest-dom/vitest';
