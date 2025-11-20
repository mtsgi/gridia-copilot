import { test, expect } from '@playwright/test';

test.describe('メニュー機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // アプリケーションが完全にロードされるまで待つ
    await page.waitForSelector('h1', { state: 'visible', timeout: 10000 });
  });

  test('メニューボタンをクリックするとメニューが開く', async ({ page }) => {
    // メニューボタンをクリック
    await page.click('button[title="メニュー"]');
    
    // メニューが表示される
    await expect(page.locator('.menu-overlay')).toBeVisible();
    await expect(page.locator('.menu-container')).toBeVisible();
  });

  test('メニューを閉じることができる', async ({ page }) => {
    // メニューを開く
    await page.click('button[title="メニュー"]');
    await expect(page.locator('.menu-container')).toBeVisible();
    
    // 閉じるボタンをクリック
    await page.click('button[title="閉じる"]');
    
    // メニューが閉じる
    await expect(page.locator('.menu-overlay')).not.toBeVisible();
  });

  test('オーバーレイをクリックするとメニューが閉じる', async ({ page }) => {
    // メニューを開く
    await page.click('button[title="メニュー"]');
    await expect(page.locator('.menu-container')).toBeVisible();
    
    // オーバーレイをクリック
    await page.locator('.menu-overlay').click({ position: { x: 10, y: 10 } });
    
    // メニューが閉じる
    await expect(page.locator('.menu-overlay')).not.toBeVisible();
  });

  test('メニューにアプリ情報が表示される', async ({ page }) => {
    // メニューを開く
    await page.click('button[title="メニュー"]');
    
    // アプリ情報が表示されている
    await expect(page.locator('.menu-container h2')).toHaveText('Gridiaについて');
    await expect(page.locator('.menu-container p')).toContainText('ブックマーク管理アプリ');
  });

  test('メニューにライセンス情報が表示される', async ({ page }) => {
    // メニューを開く
    await page.click('button[title="メニュー"]');
    
    // ライセンス情報セクションが表示されている
    await expect(page.locator('h3:has-text("ライセンス")')).toBeVisible();
  });
});
