import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  ApiResponse,
  ApiListResponse,
  DashboardStats,
  BulkActionResult,
  BulkProductAction,
  PaginatedProducts,
  ProductFilters,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all products with optional search, category, and sorting filters
   */
  getProducts(filters?: ProductFilters): Observable<Product[]> {
    return this.getProductsPage({ ...filters, page: 1, limit: 100 }).pipe(map((result) => result.products));
  }

  getProductsPage(filters?: ProductFilters): Observable<PaginatedProducts> {
    let params = new HttpParams();

    if (filters?.search && filters.search.trim() !== '') {
      params = params.set('search', filters.search.trim());
    }

    if (filters?.category && filters.category !== 'All') {
      params = params.set('category', filters.category);
    }

    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }
    if (filters?.status && filters.status !== 'All') {
      params = params.set('status', filters.status);
    }
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.limit) params = params.set('limit', filters.limit);

    return this.http
      .get<ApiListResponse<Product>>(this.baseUrl, { params })
      .pipe(map((response) => ({
        products: response.data,
        total: response.count,
        page: response.pagination?.page ?? 1,
        limit: response.pagination?.limit ?? response.count,
        totalPages: response.pagination?.totalPages ?? 1,
      })));
  }

  getAllProducts(filters?: Omit<ProductFilters, 'page' | 'limit'>): Observable<Product[]> {
    return this.getProductsPage({ ...filters, page: 1, limit: 100 }).pipe(
      expand((result) => result.page < result.totalPages
        ? this.getProductsPage({ ...filters, page: result.page + 1, limit: 100 })
        : EMPTY),
      reduce((products, result) => products.concat(result.products), [] as Product[])
    );
  }

  importProducts(products: ProductCreatePayload[]): Observable<number> {
    return this.http
      .post<ApiResponse<{ importedCount: number }>>(`${this.baseUrl}/import`, { products })
      .pipe(map((response) => response.data.importedCount));
  }

  bulkAction(payload: BulkProductAction): Observable<BulkActionResult> {
    return this.http
      .post<ApiResponse<BulkActionResult>>(`${this.baseUrl}/bulk`, payload)
      .pipe(map((response) => response.data));
  }

  adjustStock(id: string, delta: number, reason: string): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(`${this.baseUrl}/${id}/adjustments`, { delta, reason })
      .pipe(map((response) => response.data));
  }

  /**
   * Fetch real-time dynamic dashboard status statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.baseUrl}/stats`)
      .pipe(map((response) => response.data));
  }

  /**
   * Fetch a single product by ObjectId
   */
  getProductById(id: string): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Create a new product
   */
  createProduct(payload: ProductCreatePayload): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  /**
   * Update an existing product by ObjectId
   */
  updateProduct(id: string, payload: ProductUpdatePayload): Observable<Product> {
    return this.http
      .put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  /**
   * Delete a product by ObjectId
   */
  deleteProduct(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.baseUrl}/${id}`)
      .pipe(map(() => void 0));
  }
}
