import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import type { Bookmark } from './types/bookmark';
import { bookmarkDB } from './services/bookmarkDB';
import BookmarkCard from './components/BookmarkCard';
import BookmarkForm from './components/BookmarkForm';
import Menu from './components/Menu';
import './App.css';

const App: Component = () => {
  const [bookmarks, setBookmarks] = createSignal<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = createSignal<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedCategory, setSelectedCategory] = createSignal<string>('all');
  const [showFavorites, setShowFavorites] = createSignal(false);
  const [showForm, setShowForm] = createSignal(false);
  const [editingBookmark, setEditingBookmark] = createSignal<Bookmark | undefined>();
  const [categories, setCategories] = createSignal<string[]>([]);
  const [showMenu, setShowMenu] = createSignal(false);

  onMount(async () => {
    await bookmarkDB.init();
    await loadBookmarks();
  });

  const loadBookmarks = async () => {
    const allBookmarks = await bookmarkDB.getAllBookmarks();
    setBookmarks(allBookmarks);
    updateCategories(allBookmarks);
    filterBookmarks();
  };

  const updateCategories = (bookmarkList: Bookmark[]) => {
    const uniqueCategories = Array.from(
      new Set(bookmarkList.map(b => b.category))
    ).sort();
    setCategories(uniqueCategories);
  };

  const filterBookmarks = () => {
    let filtered = bookmarks();

    if (showFavorites()) {
      filtered = filtered.filter(b => b.isFavorite);
    } else if (selectedCategory() !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory());
    }

    if (searchQuery().trim()) {
      const query = searchQuery().toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query)
      );
    }

    setFilteredBookmarks(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterBookmarks();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setShowFavorites(false);
    filterBookmarks();
  };

  const handleShowFavorites = () => {
    setShowFavorites(!showFavorites());
    setSelectedCategory('all');
    filterBookmarks();
  };

  const handleAddBookmark = () => {
    setEditingBookmark(undefined);
    setShowForm(true);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setShowForm(true);
  };

  const handleSaveBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'> | Bookmark) => {
    try {
      if ('id' in bookmark && bookmark.id) {
        await bookmarkDB.updateBookmark(bookmark as Bookmark);
      } else {
        const newBookmark: Omit<Bookmark, 'id'> = {
          ...bookmark,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await bookmarkDB.addBookmark(newBookmark);
      }
      await loadBookmarks();
      setShowForm(false);
      setEditingBookmark(undefined);
    } catch (error) {
      console.error('Error saving bookmark:', error);
      alert('ブックマークの保存に失敗しました');
    }
  };

  const handleDeleteBookmark = async (id: number) => {
    try {
      await bookmarkDB.deleteBookmark(id);
      await loadBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('ブックマークの削除に失敗しました');
    }
  };

  const handleToggleFavorite = async (bookmark: Bookmark) => {
    try {
      await bookmarkDB.updateBookmark({
        ...bookmark,
        isFavorite: !bookmark.isFavorite
      });
      await loadBookmarks();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <button class="menu-toggle-btn" onClick={() => setShowMenu(true)} title="メニュー">
            ☰
          </button>
          <div class="header-title">
            <h1>Gridia</h1>
            <p class="app-subtitle">ブックマーク管理アプリ</p>
          </div>
        </div>
      </header>

      <div class="app-toolbar">
        <div class="search-box">
          <input
            type="text"
            placeholder="ブックマークを検索..."
            value={searchQuery()}
            onInput={(e) => handleSearch(e.currentTarget.value)}
          />
        </div>

        <div class="filter-controls">
          <select
            value={selectedCategory()}
            onChange={(e) => handleCategoryChange(e.currentTarget.value)}
            disabled={showFavorites()}
          >
            <option value="all">すべてのカテゴリ</option>
            <For each={categories()}>
              {(category) => <option value={category}>{category}</option>}
            </For>
          </select>

          <button
            class={`favorites-btn ${showFavorites() ? 'active' : ''}`}
            onClick={handleShowFavorites}
            title="お気に入りのみ表示"
          >
            ★ お気に入り
          </button>

          <button class="add-btn" onClick={handleAddBookmark}>
            + 追加
          </button>
        </div>
      </div>

      <main class="bookmarks-grid">
        <Show
          when={filteredBookmarks().length > 0}
          fallback={
            <div class="empty-state">
              <p>ブックマークがありません</p>
              <button onClick={handleAddBookmark}>最初のブックマークを追加</button>
            </div>
          }
        >
          <For each={filteredBookmarks()}>
            {(bookmark) => (
              <BookmarkCard
                bookmark={bookmark}
                onEdit={handleEditBookmark}
                onDelete={handleDeleteBookmark}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </For>
        </Show>
      </main>

      <Show when={showForm()}>
        <BookmarkForm
          bookmark={editingBookmark()}
          categories={categories()}
          onSave={handleSaveBookmark}
          onCancel={() => {
            setShowForm(false);
            setEditingBookmark(undefined);
          }}
        />
      </Show>

      <Show when={showMenu()}>
        <Menu onClose={() => setShowMenu(false)} />
      </Show>
    </div>
  );
};

export default App;
