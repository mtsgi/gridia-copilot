import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import BookmarkForm from './BookmarkForm';
import type { Bookmark } from '../types/bookmark';

describe('BookmarkForm', () => {
  const mockCategories = ['Tech', 'News', 'Entertainment'];
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    categories: mockCategories,
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('新規作成モードで表示される', () => {
    render(() => <BookmarkForm {...defaultProps} />);
    
    expect(screen.getByText('ブックマークを追加')).toBeInTheDocument();
    expect(screen.getByLabelText('タイトル')).toHaveValue('');
    expect(screen.getByLabelText('URL')).toHaveValue('');
    expect(screen.getByLabelText('カテゴリ')).toHaveValue('');
  });

  it('編集モードで既存データが表示される', () => {
    const existingBookmark: Bookmark = {
      id: 1,
      title: 'Existing Bookmark',
      url: 'https://example.com',
      category: 'Tech',
      isFavorite: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    render(() => <BookmarkForm {...defaultProps} bookmark={existingBookmark} />);
    
    expect(screen.getByText('ブックマークを編集')).toBeInTheDocument();
    expect(screen.getByLabelText('タイトル')).toHaveValue('Existing Bookmark');
    expect(screen.getByLabelText('URL')).toHaveValue('https://example.com');
    expect(screen.getByLabelText('カテゴリ')).toHaveValue('Tech');
    expect(screen.getByLabelText('お気に入り')).toBeChecked();
  });

  it('フォームに入力できる', () => {
    render(() => <BookmarkForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
    const categoryInput = screen.getByLabelText('カテゴリ') as HTMLInputElement;
    const favoriteCheckbox = screen.getByLabelText('お気に入り') as HTMLInputElement;

    fireEvent.input(titleInput, { target: { value: 'New Bookmark' } });
    fireEvent.input(urlInput, { target: { value: 'https://new.com' } });
    fireEvent.input(categoryInput, { target: { value: 'New Category' } });
    fireEvent.change(favoriteCheckbox, { target: { checked: true } });

    expect(titleInput.value).toBe('New Bookmark');
    expect(urlInput.value).toBe('https://new.com');
    expect(categoryInput.value).toBe('New Category');
    expect(favoriteCheckbox.checked).toBe(true);
  });

  it('新規ブックマークを保存できる', () => {
    render(() => <BookmarkForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
    const categoryInput = screen.getByLabelText('カテゴリ') as HTMLInputElement;
    const saveButton = screen.getByText('保存');

    fireEvent.input(titleInput, { target: { value: 'Test Bookmark' } });
    fireEvent.input(urlInput, { target: { value: 'https://test.com' } });
    fireEvent.input(categoryInput, { target: { value: 'Test' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Test Bookmark',
      url: 'https://test.com',
      category: 'Test',
      isFavorite: false,
    });
  });

  it('既存ブックマークを更新できる', () => {
    const existingBookmark: Bookmark = {
      id: 1,
      title: 'Original',
      url: 'https://original.com',
      category: 'Original',
      isFavorite: false,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000,
    };

    render(() => <BookmarkForm {...defaultProps} bookmark={existingBookmark} />);
    
    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const saveButton = screen.getByText('保存');

    fireEvent.input(titleInput, { target: { value: 'Updated' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
    const savedData = mockOnSave.mock.calls[0][0];
    expect(savedData.id).toBe(1);
    expect(savedData.title).toBe('Updated');
    expect(savedData.createdAt).toBe(existingBookmark.createdAt);
  });

  it('空のフィールドで保存するとアラートが表示される', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(() => <BookmarkForm {...defaultProps} />);
    
    // タイトルだけ入力して他のフィールドを空にする
    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    fireEvent.input(titleInput, { target: { value: 'Title Only' } });
    
    const saveButton = screen.getByText('保存');
    const form = saveButton.closest('form') as HTMLFormElement;
    
    // フォームの送信イベントを直接トリガー
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(alertSpy).toHaveBeenCalledWith('すべてのフィールドを入力してください');
    expect(mockOnSave).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('キャンセルボタンをクリックすると onCancel が呼ばれる', () => {
    render(() => <BookmarkForm {...defaultProps} />);
    
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('オーバーレイをクリックすると onCancel が呼ばれる', () => {
    render(() => <BookmarkForm {...defaultProps} />);
    
    const overlay = document.querySelector('.bookmark-form-overlay') as HTMLElement;
    fireEvent.click(overlay);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('フォームコンテナをクリックしてもイベントが伝播しない', () => {
    render(() => <BookmarkForm {...defaultProps} />);
    
    const container = document.querySelector('.bookmark-form-container') as HTMLElement;
    fireEvent.click(container);

    // onCancelが呼ばれないことを確認（イベント伝播が停止される）
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('入力値の前後の空白が削除される', () => {
    render(() => <BookmarkForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
    const categoryInput = screen.getByLabelText('カテゴリ') as HTMLInputElement;
    const saveButton = screen.getByText('保存');

    fireEvent.input(titleInput, { target: { value: '  Trimmed  ' } });
    fireEvent.input(urlInput, { target: { value: '  https://trim.com  ' } });
    fireEvent.input(categoryInput, { target: { value: '  Trim  ' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'Trimmed',
      url: 'https://trim.com',
      category: 'Trim',
      isFavorite: false,
    });
  });
});
