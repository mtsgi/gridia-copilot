import { type Component } from 'solid-js';
import type { Bookmark } from '../types/bookmark';
import './BookmarkCard.css';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (bookmark: Bookmark) => void;
}

const BookmarkCard: Component<BookmarkCardProps> = (props) => {
  const handleClick = () => {
    window.open(props.bookmark.url, '_blank');
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    props.onEdit(props.bookmark);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (confirm('このブックマークを削除してもよろしいですか？')) {
      props.onDelete(props.bookmark.id!);
    }
  };

  const handleToggleFavorite = (e: MouseEvent) => {
    e.stopPropagation();
    props.onToggleFavorite(props.bookmark);
  };

  return (
    <div class="bookmark-card" onClick={handleClick}>
      <div class="bookmark-header">
        <h3 class="bookmark-title">{props.bookmark.title}</h3>
        <button 
          class={`favorite-btn ${props.bookmark.isFavorite ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          title={props.bookmark.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          ★
        </button>
      </div>
      <p class="bookmark-url">{props.bookmark.url}</p>
      <div class="bookmark-footer">
        <span class="bookmark-category">{props.bookmark.category}</span>
        <div class="bookmark-actions">
          <button class="edit-btn" onClick={handleEdit} title="編集">✎</button>
          <button class="delete-btn" onClick={handleDelete} title="削除">🗑</button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
