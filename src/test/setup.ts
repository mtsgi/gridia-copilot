import { afterEach } from 'vitest';
import { cleanup } from '@solidjs/testing-library';
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';

// SolidJSコンポーネントのクリーンアップ
afterEach(() => {
  cleanup();
});
