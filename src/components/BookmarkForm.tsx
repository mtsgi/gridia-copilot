import { type Component, createSignal, Show } from 'solid-js';
import type { Bookmark } from '../types/bookmark';
import './BookmarkForm.css';

interface BookmarkFormProps {
  bookmark?: Bookmark;
  categories: string[];
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'> | Bookmark) => void;
  onCancel: () => void;
}

const BookmarkForm: Component<BookmarkFormProps> = (props) => {
  const [title, setTitle] = createSignal(props.bookmark?.title || '');
  const [url, setUrl] = createSignal(props.bookmark?.url || '');
  const [category, setCategory] = createSignal(props.bookmark?.category || '');
  const [isFavorite, setIsFavorite] = createSignal(props.bookmark?.isFavorite || false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (!title().trim() || !url().trim() || !category().trim()) {
      alert('すべてのフィールドを入力してください');
      return;
    }

    const bookmarkData = {
      title: title().trim(),
      url: url().trim(),
      category: category().trim(),
      isFavorite: isFavorite()
    };

    if (props.bookmark?.id) {
      props.onSave({
        ...bookmarkData,
        id: props.bookmark.id,
        createdAt: props.bookmark.createdAt,
        updatedAt: Date.now()
      });
    } else {
      props.onSave(bookmarkData);
    }
  };

  return (
    <div class="bookmark-form-overlay" onClick={props.onCancel}>
      <div class="bookmark-form-container" onClick={(e) => e.stopPropagation()}>
        <h2>{props.bookmark ? 'ブックマークを編集' : 'ブックマークを追加'}</h2>
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="title">タイトル</label>
            <input
              id="title"
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder="ブックマークのタイトル"
              required
            />
          </div>

          <div class="form-group">
            <label for="url">URL</label>
            <input
              id="url"
              type="url"
              value={url()}
              onInput={(e) => setUrl(e.currentTarget.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="category">カテゴリ</label>
            <input
              id="category"
              type="text"
              list="categories"
              value={category()}
              onInput={(e) => setCategory(e.currentTarget.value)}
              placeholder="カテゴリ名"
              required
            />
            <datalist id="categories">
              <Show when={props.categories.length > 0}>
                {props.categories.map(cat => (
                  <option value={cat} />
                ))}
              </Show>
            </datalist>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isFavorite()}
                onChange={(e) => setIsFavorite(e.currentTarget.checked)}
              />
              お気に入り
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" onClick={props.onCancel}>
              キャンセル
            </button>
            <button type="submit" class="save-btn">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookmarkForm;
