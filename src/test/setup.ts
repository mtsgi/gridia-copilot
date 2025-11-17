import { afterEach } from 'vitest';
import { cleanup } from '@solidjs/testing-library';
import 'fake-indexeddb/auto';

// SolidJSコンポーネントのクリーンアップ
afterEach(() => {
  cleanup();
});
