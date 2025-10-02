export interface Bookmark {
  id?: number;
  title: string;
  url: string;
  category: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}
