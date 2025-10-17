import type { Bookmark } from '../types/bookmark';

const DB_NAME = 'GridiaDB';
const DB_VERSION = 1;
const STORE_NAME = 'bookmarks';

export class BookmarkDB {
  private db: IDBDatabase | null = null;
  private dbName: string;

  constructor(dbName: string = DB_NAME) {
    this.dbName = dbName;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
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
    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
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
    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
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
    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    const transaction = this.db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBookmarksByCategory(category: string): Promise<Bookmark[]> {
    const transaction = this.db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
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

export const bookmarkDB = new BookmarkDB();
