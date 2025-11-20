import { describe, it, expect, beforeEach } from 'vitest';
import { BookmarkDB } from '../services/bookmarkDB';
import type { Bookmark } from '../types/bookmark';

describe('BookmarkDB', () => {
  let db: BookmarkDB;

  beforeEach(async () => {
    // 各テストで一意のデータベース名を使用
    const uniqueDbName = `GridiaTestDB_${Date.now()}_${Math.random()}`;
    db = new BookmarkDB(uniqueDbName);
    await db.init();
  });

  describe('init', () => {
    it('データベースを初期化できる', async () => {
      const uniqueDbName = `GridiaTestDB_${Date.now()}_${Math.random()}`;
      const newDb = new BookmarkDB(uniqueDbName);
      await expect(newDb.init()).resolves.toBeUndefined();
    });
  });

  describe('addBookmark', () => {
    it('新しいブックマークを追加できる', async () => {
      const bookmark = {
        title: 'Test Bookmark',
        url: 'https://example.com',
        category: 'Test',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const id = await db.addBookmark(bookmark);
      expect(id).toBeGreaterThan(0);

      const bookmarks = await db.getAllBookmarks();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].title).toBe('Test Bookmark');
    });

    it('複数のブックマークを追加できる', async () => {
      const bookmark1 = {
        title: 'Bookmark 1',
        url: 'https://example1.com',
        category: 'Test',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const bookmark2 = {
        title: 'Bookmark 2',
        url: 'https://example2.com',
        category: 'Test',
        isFavorite: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.addBookmark(bookmark1);
      await db.addBookmark(bookmark2);

      const bookmarks = await db.getAllBookmarks();
      expect(bookmarks).toHaveLength(2);
    });
  });

  describe('updateBookmark', () => {
    it('既存のブックマークを更新できる', async () => {
      const bookmark = {
        title: 'Original Title',
        url: 'https://example.com',
        category: 'Test',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const id = await db.addBookmark(bookmark);

      const updatedBookmark: Bookmark = {
        id,
        title: 'Updated Title',
        url: 'https://example.com',
        category: 'Test',
        isFavorite: true,
        createdAt: bookmark.createdAt,
        updatedAt: Date.now(),
      };

      await db.updateBookmark(updatedBookmark);

      const bookmarks = await db.getAllBookmarks();
      expect(bookmarks[0].title).toBe('Updated Title');
      expect(bookmarks[0].isFavorite).toBe(true);
    });
  });

  describe('deleteBookmark', () => {
    it('ブックマークを削除できる', async () => {
      const bookmark = {
        title: 'Test Bookmark',
        url: 'https://example.com',
        category: 'Test',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const id = await db.addBookmark(bookmark);
      await db.deleteBookmark(id);

      const bookmarks = await db.getAllBookmarks();
      expect(bookmarks).toHaveLength(0);
    });
  });

  describe('getAllBookmarks', () => {
    it('すべてのブックマークを取得できる', async () => {
      const bookmarks = [
        {
          title: 'Bookmark 1',
          url: 'https://example1.com',
          category: 'Category1',
          isFavorite: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          title: 'Bookmark 2',
          url: 'https://example2.com',
          category: 'Category2',
          isFavorite: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      for (const bookmark of bookmarks) {
        await db.addBookmark(bookmark);
      }

      const result = await db.getAllBookmarks();
      expect(result).toHaveLength(2);
    });

    it('空の配列を返すことができる', async () => {
      const bookmarks = await db.getAllBookmarks();
      expect(bookmarks).toHaveLength(0);
      expect(bookmarks).toEqual([]);
    });
  });

  describe('getBookmarksByCategory', () => {
    it('指定したカテゴリのブックマークを取得できる', async () => {
      await db.addBookmark({
        title: 'Bookmark 1',
        url: 'https://example1.com',
        category: 'Tech',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.addBookmark({
        title: 'Bookmark 2',
        url: 'https://example2.com',
        category: 'News',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const techBookmarks = await db.getBookmarksByCategory('Tech');
      expect(techBookmarks).toHaveLength(1);
      expect(techBookmarks[0].category).toBe('Tech');
    });
  });

  describe('getFavoriteBookmarks', () => {
    it('お気に入りのブックマークのみを取得できる', async () => {
      await db.addBookmark({
        title: 'Favorite 1',
        url: 'https://example1.com',
        category: 'Test',
        isFavorite: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.addBookmark({
        title: 'Not Favorite',
        url: 'https://example2.com',
        category: 'Test',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const favorites = await db.getFavoriteBookmarks();
      expect(favorites).toHaveLength(1);
      expect(favorites[0].isFavorite).toBe(true);
    });
  });

  describe('searchBookmarks', () => {
    beforeEach(async () => {
      await db.addBookmark({
        title: 'JavaScript Guide',
        url: 'https://developer.mozilla.org/javascript',
        category: 'Programming',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.addBookmark({
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs',
        category: 'Programming',
        isFavorite: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.addBookmark({
        title: 'News Site',
        url: 'https://news.example.com',
        category: 'News',
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    it('タイトルで検索できる', async () => {
      const results = await db.searchBookmarks('JavaScript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('JavaScript Guide');
    });

    it('URLで検索できる', async () => {
      const results = await db.searchBookmarks('mozilla');
      expect(results).toHaveLength(1);
      expect(results[0].url).toContain('mozilla');
    });

    it('カテゴリで検索できる', async () => {
      const results = await db.searchBookmarks('Programming');
      expect(results).toHaveLength(2);
    });

    it('大文字小文字を区別しない', async () => {
      const results = await db.searchBookmarks('javascript');
      expect(results).toHaveLength(1);
    });

    it('部分一致で検索できる', async () => {
      const results = await db.searchBookmarks('Script');
      expect(results).toHaveLength(2); // JavaScript and TypeScript
    });

    it('検索結果がない場合は空配列を返す', async () => {
      const results = await db.searchBookmarks('NonExistent');
      expect(results).toHaveLength(0);
      expect(results).toEqual([]);
    });
  });
});
