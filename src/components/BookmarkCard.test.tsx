import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import BookmarkCard from './BookmarkCard';
import type { Bookmark } from '../types/bookmark';

describe('BookmarkCard', () => {
  const mockBookmark: Bookmark = {
    id: 1,
    title: 'Test Bookmark',
    url: 'https://example.com',
    category: 'Test Category',
    isFavorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleFavorite: vi.fn(),
  };

  it('ブックマーク情報が正しく表示される', () => {
    render(() => <BookmarkCard bookmark={mockBookmark} {...mockHandlers} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('お気に入りボタンをクリックすると onToggleFavorite が呼ばれる', () => {
    render(() => <BookmarkCard bookmark={mockBookmark} {...mockHandlers} />);
    
    const favoriteButton = screen.getByTitle('お気に入りに追加');
    fireEvent.click(favoriteButton);
    
    expect(mockHandlers.onToggleFavorite).toHaveBeenCalledWith(mockBookmark);
  });

  it('お気に入り状態が正しく表示される', () => {
    const favoriteBookmark: Bookmark = { ...mockBookmark, isFavorite: true };
    render(() => <BookmarkCard bookmark={favoriteBookmark} {...mockHandlers} />);
    
    const favoriteButton = screen.getByTitle('お気に入りから削除');
    expect(favoriteButton.className).toContain('active');
  });

  it('編集ボタンをクリックすると onEdit が呼ばれる', () => {
    render(() => <BookmarkCard bookmark={mockBookmark} {...mockHandlers} />);
    
    const editButton = screen.getByTitle('編集');
    fireEvent.click(editButton);
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockBookmark);
  });

  it('削除ボタンをクリックすると確認ダイアログが表示される', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(() => <BookmarkCard bookmark={mockBookmark} {...mockHandlers} />);
    
    const deleteButton = screen.getByTitle('削除');
    fireEvent.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalledWith('このブックマークを削除してもよろしいですか？');
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockBookmark.id);
    
    confirmSpy.mockRestore();
  });

  it('削除確認をキャンセルすると onDelete が呼ばれない', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockHandlers.onDelete.mockClear();
    
    render(() => <BookmarkCard bookmark={mockBookmark} {...mockHandlers} />);
    
    const deleteButton = screen.getByTitle('削除');
    fireEvent.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  it('カードをクリックすると新しいタブでURLが開く', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    
    render(() => <BookmarkCard bookmark={mockBookmark} {...mockHandlers} />);
    
    const card = screen.getByText('Test Bookmark').closest('.bookmark-card')!;
    fireEvent.click(card);
    
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
    
    openSpy.mockRestore();
  });
});
