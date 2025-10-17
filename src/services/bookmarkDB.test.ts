import { describe, it, expect, beforeEach } from 'vitest';
import type { Bookmark } from '../types/bookmark';

// テスト用のBookmarkDBクラス（データベース名をカスタマイズ可能）
class TestBookmarkDB {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'bookmarks';

  constructor(dbName: string = 'GridiaDB') {
    this.dbName = dbName;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('isFavorite', 'isFavorite', { unique: false });
          store.createIndex('title', 'title', { unique: false });
        }
      };
    });
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id'>): Promise<number> {
    const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    
    const request = store.add({
      ...bookmark,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async updateBookmark(bookmark: Bookmark): Promise<void> {
    const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    
    const request = store.put({
      ...bookmark,
      updatedAt: Date.now()
    });

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBookmark(id: number): Promise<void> {
    const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBookmarksByCategory(category: string): Promise<Bookmark[]> {
    const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);
    const index = store.index('category');
    const request = index.getAll(category);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFavoriteBookmarks(): Promise<Bookmark[]> {
    const allBookmarks = await this.getAllBookmarks();
    return allBookmarks.filter(bookmark => bookmark.isFavorite);
  }

  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const allBookmarks = await this.getAllBookmarks();
    const lowerQuery = query.toLowerCase();
    
    return allBookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery) ||
      bookmark.category.toLowerCase().includes(lowerQuery)
    );
  }
}

describe('BookmarkDB', () => {
  let db: TestBookmarkDB;

  beforeEach(async () => {
    // 各テストで一意のデータベース名を使用
    const uniqueDbName = `GridiaTestDB_${Date.now()}_${Math.random()}`;
    db = new TestBookmarkDB(uniqueDbName);
    await db.init();
  });

  describe('init', () => {
    it('データベースを初期化できる', async () => {
      const uniqueDbName = `GridiaTestDB_${Date.now()}_${Math.random()}`;
      const newDb = new TestBookmarkDB(uniqueDbName);
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
