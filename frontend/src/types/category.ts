export type CategoryStatus = 'ACTIVE' | 'HIDDEN';

export interface Category {
  id: number;
  parentId: number | null;
  title: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  level: number;
  isActive: boolean;
  productCount: number;
  
  // For UI Tree structure
  children?: Category[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFormInput {
  id?: number;
  title: string;
  parentId: number | null;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean | string; // true = Active, false = Hidden (string for radio form binding)
  updateSubProducts?: boolean;
}
