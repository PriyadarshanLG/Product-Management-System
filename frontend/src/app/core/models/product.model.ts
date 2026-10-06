export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  reorderPoint: number;
  stockAdjustments: StockAdjustment[];
  description: string;
  createdAt: string;
  updatedAt: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | string;
}

export interface StockAdjustment {
  delta: number;
  reason: string;
  createdAt: string;
}

export type ProductCreatePayload = Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'stockStatus' | 'stockAdjustments' | 'reorderPoint'> & {
  reorderPoint?: number;
};
export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkProductAction {
  ids: string[];
  action: 'delete' | 'category' | 'adjustStock';
  category?: string;
  delta?: number;
  reason?: string;
}

export interface BulkActionResult {
  affectedCount: number;
  skippedCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: { field: string; message: string }[];
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  retailValue: number;
}
