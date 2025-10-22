import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    // 環境の再利用を無効化してクリーンな状態で各テストファイルを実行
    isolate: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/public/',
        '**/*.css',
        'src/index.tsx', // エントリーポイントはE2Eでテスト
        'src/data/', // 静的データは除外
        'src/types/', // 型定義ファイルは除外
        'e2e/', // E2Eテストディレクトリを除外
        'src/App.tsx', // メインアプリケーションはE2Eでテスト
        'src/components/Menu.tsx', // メニューはE2Eでテスト
      ],
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});
