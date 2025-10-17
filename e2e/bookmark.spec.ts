import { test, expect } from '@playwright/test';

test.describe('ブックマーク管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // アプリにアクセス
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // IndexedDBをクリア（新鮮な状態でテスト開始）
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        try {
          const req = indexedDB.deleteDatabase('GridiaDB');
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        } catch (error) {
          // IndexedDBが利用できない場合もエラーにしない
          resolve();
        }
      });
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    // アプリケーションが完全にロードされるまで待つ
    await page.waitForSelector('h1', { state: 'visible', timeout: 10000 });
  });

  test('アプリケーションが正しく表示される', async ({ page }) => {
    // ヘッダーが表示されている
    await expect(page.locator('h1')).toHaveText('Gridia');
    await expect(page.locator('.app-subtitle')).toHaveText('ブックマーク管理アプリ');
    
    // 検索ボックスが表示されている
    await expect(page.locator('input[placeholder="ブックマークを検索..."]')).toBeVisible();
    
    // 追加ボタンが表示されている
    await expect(page.locator('button:has-text("追加")')).toBeVisible();
    
    // 空の状態メッセージが表示されている
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state p')).toHaveText('ブックマークがありません');
  });

  test('ブックマークを追加できる', async ({ page }) => {
    // 追加ボタンをクリック
    await page.click('button:has-text("追加")');
    
    // フォームが表示される
    await expect(page.locator('.bookmark-form-container h2')).toHaveText('ブックマークを追加');
    
    // フォームに入力
    await page.fill('#title', 'テストブックマーク');
    await page.fill('#url', 'https://test.example.com');
    await page.fill('#category', 'テストカテゴリ');
    
    // 保存ボタンをクリック
    await page.click('button:has-text("保存")');
    
    // フォームが閉じる
    await expect(page.locator('.bookmark-form-container')).not.toBeVisible();
    
    // ブックマークカードが表示される
    await expect(page.locator('.bookmark-card')).toBeVisible();
    await expect(page.locator('.bookmark-title')).toHaveText('テストブックマーク');
    await expect(page.locator('.bookmark-url')).toHaveText('https://test.example.com');
    await expect(page.locator('.bookmark-category')).toHaveText('テストカテゴリ');
  });

  test('ブックマークを編集できる', async ({ page }) => {
    // 最初にブックマークを追加
    await page.click('button:has-text("追加")');
    await page.fill('#title', '元のタイトル');
    await page.fill('#url', 'https://original.com');
    await page.fill('#category', '元のカテゴリ');
    await page.click('button:has-text("保存")');
    
    // 編集ボタンをクリック
    await page.click('button[title="編集"]');
    
    // フォームが編集モードで表示される
    await expect(page.locator('.bookmark-form-container h2')).toHaveText('ブックマークを編集');
    await expect(page.locator('#title')).toHaveValue('元のタイトル');
    
    // タイトルを変更
    await page.fill('#title', '更新されたタイトル');
    await page.click('button:has-text("保存")');
    
    // 更新された内容が表示される
    await expect(page.locator('.bookmark-title')).toHaveText('更新されたタイトル');
  });

  test('ブックマークを削除できる', async ({ page }) => {
    // ブックマークを追加
    await page.click('button:has-text("追加")');
    await page.fill('#title', '削除テスト');
    await page.fill('#url', 'https://delete.com');
    await page.fill('#category', 'テスト');
    await page.click('button:has-text("保存")');
    
    // ブックマークが表示されている
    await expect(page.locator('.bookmark-card')).toBeVisible();
    
    // 削除ボタンをクリック（確認ダイアログを処理）
    page.once('dialog', dialog => dialog.accept());
    await page.click('button[title="削除"]');
    
    // ブックマークが削除され、空の状態メッセージが表示される
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('お気に入りの切り替えができる', async ({ page }) => {
    // ブックマークを追加
    await page.click('button:has-text("追加")');
    await page.fill('#title', 'お気に入りテスト');
    await page.fill('#url', 'https://favorite.com');
    await page.fill('#category', 'テスト');
    await page.click('button:has-text("保存")');
    
    // お気に入りボタンをクリック
    const favoriteButton = page.locator('button[title="お気に入りに追加"]');
    await favoriteButton.click();
    
    // activeクラスが追加される
    await expect(page.locator('.favorite-btn.active')).toBeVisible();
    
    // もう一度クリックするとactiveクラスが削除される
    await page.locator('button[title="お気に入りから削除"]').click();
    await expect(page.locator('.favorite-btn.active')).not.toBeVisible();
  });

  test('検索機能が動作する', async ({ page }) => {
    // 複数のブックマークを追加
    const bookmarks = [
      { title: 'JavaScript Guide', url: 'https://js.com', category: 'Programming' },
      { title: 'TypeScript Docs', url: 'https://ts.com', category: 'Programming' },
      { title: 'News Site', url: 'https://news.com', category: 'News' },
    ];
    
    for (const bookmark of bookmarks) {
      await page.click('button:has-text("追加")');
      await page.fill('#title', bookmark.title);
      await page.fill('#url', bookmark.url);
      await page.fill('#category', bookmark.category);
      await page.click('button:has-text("保存")');
    }
    
    // 検索ボックスに入力
    await page.fill('input[placeholder="ブックマークを検索..."]', 'JavaScript');
    
    // 該当するブックマークのみ表示される
    await expect(page.locator('.bookmark-card')).toHaveCount(1);
    await expect(page.locator('.bookmark-title')).toHaveText('JavaScript Guide');
    
    // 検索をクリア
    await page.fill('input[placeholder="ブックマークを検索..."]', '');
    
    // すべてのブックマークが表示される
    await expect(page.locator('.bookmark-card')).toHaveCount(3);
  });

  test('カテゴリフィルターが動作する', async ({ page }) => {
    // 複数のカテゴリのブックマークを追加
    const bookmarks = [
      { title: 'Tech 1', url: 'https://tech1.com', category: 'Tech' },
      { title: 'Tech 2', url: 'https://tech2.com', category: 'Tech' },
      { title: 'News 1', url: 'https://news1.com', category: 'News' },
    ];
    
    for (const bookmark of bookmarks) {
      await page.click('button:has-text("追加")');
      await page.fill('#title', bookmark.title);
      await page.fill('#url', bookmark.url);
      await page.fill('#category', bookmark.category);
      await page.click('button:has-text("保存")');
    }
    
    // カテゴリフィルターを選択
    await page.selectOption('select', 'Tech');
    
    // Techカテゴリのブックマークのみ表示される
    await expect(page.locator('.bookmark-card')).toHaveCount(2);
    
    // すべてのカテゴリに戻す
    await page.selectOption('select', 'all');
    await expect(page.locator('.bookmark-card')).toHaveCount(3);
  });

  test('お気に入りフィルターが動作する', async ({ page }) => {
    // ブックマークを追加（1つはお気に入り）
    await page.click('button:has-text("追加")');
    await page.fill('#title', 'お気に入り1');
    await page.fill('#url', 'https://fav1.com');
    await page.fill('#category', 'テスト');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("保存")');
    
    await page.click('button:has-text("追加")');
    await page.fill('#title', '通常のブックマーク');
    await page.fill('#url', 'https://normal.com');
    await page.fill('#category', 'テスト');
    await page.click('button:has-text("保存")');
    
    // すべてのブックマークが表示されている
    await expect(page.locator('.bookmark-card')).toHaveCount(2);
    
    // お気に入りフィルターをクリック
    await page.click('button:has-text("お気に入り")');
    
    // お気に入りのブックマークのみ表示される
    await expect(page.locator('.bookmark-card')).toHaveCount(1);
    await expect(page.locator('.bookmark-title')).toHaveText('お気に入り1');
    
    // お気に入りフィルターを解除
    await page.click('button:has-text("お気に入り")');
    await expect(page.locator('.bookmark-card')).toHaveCount(2);
  });

  test('ブックマークカードをクリックすると新しいタブで開く', async ({ page, context }) => {
    // ブックマークを追加
    await page.click('button:has-text("追加")');
    await page.fill('#title', 'リンクテスト');
    await page.fill('#url', 'https://example.com');
    await page.fill('#category', 'テスト');
    await page.click('button:has-text("保存")');
    
    // 新しいページが開くのを待つ
    const pagePromise = context.waitForEvent('page');
    await page.click('.bookmark-card');
    const newPage = await pagePromise;
    
    // 新しいタブのURLを確認
    await newPage.waitForLoadState();
    expect(newPage.url()).toBe('https://example.com/');
    
    await newPage.close();
  });

  test('フォームのバリデーションが動作する', async ({ page }) => {
    // 追加ボタンをクリック
    await page.click('button:has-text("追加")');
    
    // タイトルのみ入力して保存をクリック
    await page.fill('#title', 'タイトルのみ');
    
    page.once('dialog', dialog => {
      expect(dialog.message()).toBe('すべてのフィールドを入力してください');
      dialog.accept();
    });
    
    // フォームの送信イベントをトリガー
    await page.evaluate(() => {
      const form = document.querySelector('form');
      const event = new Event('submit', { bubbles: true, cancelable: true });
      form?.dispatchEvent(event);
    });
  });

  test('キャンセルボタンでフォームが閉じる', async ({ page }) => {
    // フォームを開く
    await page.click('button:has-text("追加")');
    await expect(page.locator('.bookmark-form-container')).toBeVisible();
    
    // キャンセルボタンをクリック
    await page.click('button:has-text("キャンセル")');
    
    // フォームが閉じる
    await expect(page.locator('.bookmark-form-container')).not.toBeVisible();
  });

  test('オーバーレイクリックでフォームが閉じる', async ({ page }) => {
    // フォームを開く
    await page.click('button:has-text("追加")');
    await expect(page.locator('.bookmark-form-container')).toBeVisible();
    
    // オーバーレイをクリック
    await page.locator('.bookmark-form-overlay').click({ position: { x: 10, y: 10 } });
    
    // フォームが閉じる
    await expect(page.locator('.bookmark-form-container')).not.toBeVisible();
  });
});
