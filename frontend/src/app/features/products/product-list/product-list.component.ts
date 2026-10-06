import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Papa from 'papaparse';
import { ProductService } from '../../../core/services/product.service';
import { ProductPdfService } from '../../../core/services/product-pdf.service';
import { BulkProductAction, DashboardStats, Product, ProductCreatePayload } from '../../../core/models/product.model';
import { ToastService } from '../../../shared/services/toast.service';
import { DeleteConfirmModalComponent } from '../../../shared/components/delete-confirm-modal/delete-confirm-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DeleteConfirmModalComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="border-b border-slate-200 pb-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Inventory operations</p>
            <h1 class="text-3xl font-bold tracking-tight text-[#1e2b26]">Products</h1>
            <p class="mt-1 text-sm text-slate-400">Review stock levels, product details, and pricing in one place.</p>
          </div>

          <a
            routerLink="/products/new"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-500"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Add product</span>
          </a>
        </div>
      </div>

      <div *ngIf="!isLoading && !hasError" class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="glass-panel rounded-2xl p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Active items</p>
          <div class="mt-3 flex items-end justify-between">
            <span class="text-2xl font-bold text-white">{{ stats?.totalProducts || 0 }}</span>
          </div>
        </div>
        <div class="glass-panel rounded-2xl p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">In stock</p>
          <div class="mt-3 flex items-end justify-between">
            <span class="text-2xl font-bold text-emerald-300">{{ inStockCount }}</span>
          </div>
        </div>
        <div class="glass-panel rounded-2xl p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Low stock</p>
          <div class="mt-3 flex items-end justify-between">
            <span class="text-2xl font-bold text-amber-300">{{ lowStockCount }}</span>
          </div>
        </div>
        <div class="glass-panel rounded-2xl p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Inventory value</p>
          <div class="mt-3 flex items-end justify-between">
            <span class="text-2xl font-bold text-rose-300">₹{{ inventoryValue | number:'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <div class="glass-panel rounded-2xl p-4">
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="setStatusFilter('All')"
            class="rounded px-3 py-1.5 text-xs font-semibold transition"
            [ngClass]="statusFilter === 'All' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            All
          </button>
          <button
            type="button"
            (click)="setStatusFilter('In Stock')"
            class="rounded px-3 py-1.5 text-xs font-semibold transition"
            [ngClass]="statusFilter === 'In Stock' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            In stock
          </button>
          <button
            type="button"
            (click)="setStatusFilter('Low Stock')"
            class="rounded px-3 py-1.5 text-xs font-semibold transition"
            [ngClass]="statusFilter === 'Low Stock' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            Low stock
          </button>
          <button
            type="button"
            (click)="setStatusFilter('Out of Stock')"
            class="rounded px-3 py-1.5 text-xs font-semibold transition"
            [ngClass]="statusFilter === 'Out of Stock' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
          >
            Out of stock
          </button>
        </div>

        <div class="flex flex-col gap-4 md:flex-row">
          <div class="relative w-full md:w-1/3">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
              placeholder="Search products by name..."
              class="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <svg class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          <div class="w-full md:w-1/4">
            <select
              [(ngModel)]="selectedCategory"
              (change)="onFilterChange()"
              class="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-2.5 text-sm text-white transition focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All categories</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="w-full md:w-1/4">
            <select
              [(ngModel)]="selectedSort"
              (change)="onFilterChange()"
              class="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-2.5 text-sm text-white transition focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <button
            *ngIf="searchQuery || selectedCategory !== 'All' || selectedSort || statusFilter !== 'All'"
            (click)="resetFilters()"
            class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 md:w-auto"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div class="glass-panel flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <label class="primary-action inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold hover:bg-[#124b3a]">
            <span>{{ isImporting ? 'Importing...' : 'Import CSV' }}</span>
            <input type="file" accept=".csv,text/csv" class="sr-only" [disabled]="isImporting" (change)="importCsv($event)" />
          </label>
          <button type="button" (click)="downloadCsvTemplate()" class="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">CSV template</button>
          <button type="button" (click)="exportPdf()" [disabled]="isExportingPdf" class="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{{ isExportingPdf ? 'Preparing PDF...' : 'Export PDF' }}</button>
        </div>

        <div *ngIf="selectedIds.size > 0" class="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 md:border-0 md:pt-0">
          <span class="mr-1 text-xs font-semibold text-slate-600">{{ selectedIds.size }} selected</span>
          <select [(ngModel)]="bulkActionType" class="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800">
            <option value="category">Set category</option>
            <option value="adjustStock">Adjust stock</option>
            <option value="delete">Delete selected</option>
          </select>
          <select *ngIf="bulkActionType === 'category'" [(ngModel)]="bulkCategory" class="rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800">
            <option value="">Choose category</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
          <ng-container *ngIf="bulkActionType === 'adjustStock'">
            <input type="number" step="1" [(ngModel)]="bulkDelta" aria-label="Stock adjustment" placeholder="Change +/-" class="w-24 rounded-md border border-slate-300 px-2.5 py-2 text-xs" />
            <input type="text" [(ngModel)]="bulkReason" aria-label="Adjustment reason" placeholder="Reason" class="w-32 rounded-md border border-slate-300 px-2.5 py-2 text-xs" />
          </ng-container>
          <button type="button" (click)="runBulkAction()" [disabled]="isBulkRunning" class="primary-action rounded-md px-3 py-2 text-xs font-semibold hover:bg-[#124b3a] disabled:opacity-50">{{ isBulkRunning ? 'Applying...' : 'Apply' }}</button>
          <button type="button" (click)="clearSelection()" class="rounded-md px-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Clear</button>
        </div>
      </div>

      <div *ngIf="!isLoading && !hasError" class="flex items-center justify-between text-xs text-slate-400">
        <span>Showing {{ rangeStart }}-{{ rangeEnd }} of {{ totalProducts }} matching products</span>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2">Rows per page
            <select [ngModel]="pageSize" (ngModelChange)="changePageSize($event)" class="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
              <option [ngValue]="10">10</option>
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
            </select>
          </label>
          <button type="button" (click)="loadProducts()" class="inline-flex items-center gap-1.5 font-semibold text-[#17634c] transition hover:text-[#124b3a]">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 7v5h-5M4 17v-5h5m-3.2-3A7 7 0 0118.3 7L20 12M4 12l1.7 5a7 7 0 0012.6-2"/></svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="glass-panel rounded-2xl p-12 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
        <p class="mt-4 text-sm font-medium text-slate-400">Loading inventory records...</p>
      </div>

      <div *ngIf="hasError && !isLoading" class="glass-panel rounded-2xl border border-rose-500/30 p-8 text-center">
        <svg class="mx-auto h-10 w-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="mt-3 text-base font-bold text-white">Unable to load inventory records.</h3>
        <p class="mt-1 text-xs text-slate-400">The API is unavailable or the server is not responding.</p>
        <button
          (click)="loadProducts()"
          class="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Retry load
        </button>
      </div>

      <div *ngIf="!isLoading && !hasError && filteredProducts.length === 0" class="glass-panel rounded-2xl p-12 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/80 text-slate-400">
          <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>

        <h3 class="mt-4 text-lg font-bold text-white">No matching products found.</h3>
        <p class="mx-auto mt-2 max-w-md text-sm text-slate-400">Adjust the filters or add a new product to update your catalog.</p>

        <div class="mt-5 flex justify-center gap-3">
          <button
            *ngIf="searchQuery || selectedCategory !== 'All' || statusFilter !== 'All'"
            (click)="resetFilters()"
            class="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            Clear filters
          </button>
          <a
            routerLink="/products/new"
            class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-sky-500"
          >
            Create product
          </a>
        </div>
      </div>

      <div *ngIf="!isLoading && !hasError && filteredProducts.length > 0" class="catalog-table-scroll hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
        <table class="catalog-table w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-slate-700 bg-slate-800/80 text-slate-300">
              <th class="w-10 px-3 py-3.5"><input type="checkbox" [checked]="allPageSelected" (change)="togglePageSelection($event)" aria-label="Select all products on this page" /></th>
              <th class="px-5 py-3.5">Product name</th>
              <th class="px-4 py-3.5">Category</th>
              <th class="px-4 py-3.5">Price</th>
              <th class="px-4 py-3.5">Stock</th>
              <th class="px-4 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr *ngFor="let product of filteredProducts" class="transition hover:bg-slate-800/35">
              <td class="px-3 py-4"><input type="checkbox" [checked]="selectedIds.has(product._id)" (change)="toggleSelection(product._id, $event)" [attr.aria-label]="'Select ' + product.name" /></td>
              <td class="px-5 py-4 font-semibold text-white">
                <a [routerLink]="['/products', product._id]" class="transition hover:text-sky-400">
                  {{ product.name }}
                </a>
              </td>
              <td class="px-4 py-4 text-slate-300">
                <span class="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-4 py-4 font-semibold text-emerald-400">₹{{ product.price | number:'1.2-2' }}</td>
              <td class="px-4 py-4 font-medium text-slate-300">{{ product.stockQuantity }} units</td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold"
                  [ngClass]="{
                    'border-emerald-500/30 bg-emerald-500/10 text-emerald-400': product.stockStatus === 'In Stock',
                    'border-amber-500/30 bg-amber-500/10 text-amber-400': product.stockStatus === 'Low Stock',
                    'border-rose-500/30 bg-rose-500/10 text-rose-400': product.stockStatus === 'Out of Stock'
                  }"
                >
                  <span
                    class="mr-1.5 h-1.5 w-1.5 rounded-full"
                    [ngClass]="{
                      'bg-emerald-400': product.stockStatus === 'In Stock',
                      'bg-amber-400': product.stockStatus === 'Low Stock',
                      'bg-rose-400': product.stockStatus === 'Out of Stock'
                    }"
                  ></span>
                  {{ product.stockStatus }}
                </span>
              </td>
              <td class="space-x-2 px-5 py-4 text-right">
                <a
                  [routerLink]="['/products', product._id]"
                  class="inline-flex items-center rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  View
                </a>
                <a
                  [routerLink]="['/products', product._id, 'edit']"
                  class="inline-flex items-center rounded-lg border border-sky-500/30 bg-sky-950/60 px-2.5 py-1.5 text-xs font-medium text-sky-300 transition hover:bg-sky-900/80"
                >
                  Edit
                </a>
                <button
                  type="button"
                  (click)="openDeleteModal(product)"
                  class="inline-flex items-center rounded-lg border border-rose-500/30 bg-rose-950/60 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-900/80"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!isLoading && !hasError && filteredProducts.length > 0" class="grid gap-4 md:hidden">
        <div *ngFor="let product of filteredProducts" class="glass-panel space-y-3 rounded-2xl p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <label class="mb-2 flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" [checked]="selectedIds.has(product._id)" (change)="toggleSelection(product._id, $event)" [attr.aria-label]="'Select ' + product.name" />Select</label>
              <span class="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">{{ product.category }}</span>
              <h3 class="mt-1.5 text-lg font-bold text-white">
                <a [routerLink]="['/products', product._id]" class="transition hover:text-sky-400">
                  {{ product.name }}
                </a>
              </h3>
            </div>
            <span
              class="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold"
              [ngClass]="{
                'border-emerald-500/30 bg-emerald-500/10 text-emerald-400': product.stockStatus === 'In Stock',
                'border-amber-500/30 bg-amber-500/10 text-amber-400': product.stockStatus === 'Low Stock',
                'border-rose-500/30 bg-rose-500/10 text-rose-400': product.stockStatus === 'Out of Stock'
              }"
            >
              {{ product.stockStatus }}
            </span>
          </div>

          <div class="flex items-center justify-between border-t border-slate-800 pt-2 text-sm">
            <div>
              <span class="block text-xs text-slate-400">Price</span>
              <span class="text-base font-bold text-emerald-400">₹{{ product.price | number:'1.2-2' }}</span>
            </div>
            <div class="text-right">
              <span class="block text-xs text-slate-400">Stock quantity</span>
              <span class="font-medium text-slate-200">{{ product.stockQuantity }} units</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <a
              [routerLink]="['/products', product._id]"
              class="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
            >
              View
            </a>
            <a
              [routerLink]="['/products', product._id, 'edit']"
              class="rounded-xl border border-sky-500/30 bg-sky-950/60 px-3 py-1.5 text-xs font-medium text-sky-300 transition hover:bg-sky-900/80"
            >
              Edit
            </a>
            <button
              type="button"
              (click)="openDeleteModal(product)"
              class="rounded-xl border border-rose-500/30 bg-rose-950/60 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-900/80"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !hasError && totalPages > 1" class="flex items-center justify-between border-t border-slate-200 pt-4">
        <span class="text-xs text-slate-500">Page {{ page }} of {{ totalPages }}</span>
        <div class="flex gap-2">
          <button type="button" (click)="goToPage(page - 1)" [disabled]="page === 1" class="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Previous</button>
          <button type="button" (click)="goToPage(page + 1)" [disabled]="page === totalPages" class="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>

    <app-delete-confirm-modal
      [isOpen]="isDeleteModalOpen"
      [productName]="isBulkDeletePending ? selectedIds.size + ' selected products' : productToDelete?.name || ''"
      [isDeleting]="isDeleting"
      (confirm)="confirmDelete()"
      (cancel)="closeDeleteModal()"
    ></app-delete-confirm-modal>
  `,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  stats: DashboardStats | null = null;
  totalProducts = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  isLoading = true;
  hasError = false;

  searchQuery = '';
  selectedCategory = 'All';
  selectedSort = '';
  statusFilter = 'All';
  selectedIds = new Set<string>();
  bulkActionType: BulkProductAction['action'] = 'category';
  bulkCategory = '';
  bulkDelta: number | null = null;
  bulkReason = '';
  isImporting = false;
  isExportingPdf = false;
  isBulkRunning = false;
  isBulkDeletePending = false;

  categories: string[] = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];

  isDeleteModalOpen = false;
  productToDelete: Product | null = null;
  isDeleting = false;

  private filterTimeout: any;
  private queryInitialized = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private productPdfService: ProductPdfService,
    private toastService: ToastService
  ) {}

  get inStockCount(): number {
    return this.stats?.inStock ?? 0;
  }

  get lowStockCount(): number {
    return this.stats?.lowStock ?? 0;
  }

  get inventoryValue(): number {
    return this.stats?.retailValue ?? 0;
  }

  get rangeStart(): number {
    return this.totalProducts === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.totalProducts);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const status = params.get('status');
      const nextStatus = status === 'In Stock' || status === 'Low Stock' || status === 'Out of Stock' ? status : 'All';
      const nextCategory = params.get('category') || 'All';
      const changed = !this.queryInitialized || nextStatus !== this.statusFilter || nextCategory !== this.selectedCategory;
      this.queryInitialized = true;

      if (!changed) return;
      this.statusFilter = nextStatus;
      this.selectedCategory = nextCategory;
      if (nextCategory !== 'All' && !this.categories.includes(nextCategory)) this.categories.push(nextCategory);
      this.page = 1;
      this.clearSelection();
      this.loadProducts();
    });
    this.loadStats();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.hasError = false;

    this.productService.getProductsPage({
      search: this.searchQuery,
      category: this.selectedCategory,
      sort: this.selectedSort,
      status: this.statusFilter,
      page: this.page,
      limit: this.pageSize,
    }).subscribe({
      next: (result) => {
        const lastPage = Math.max(1, result.totalPages);
        if (this.page > lastPage) {
          this.page = lastPage;
          this.loadProducts();
          return;
        }
        this.products = result.products;
        this.filteredProducts = result.products;
        this.totalProducts = result.total;
        this.page = result.page;
        this.totalPages = result.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.isLoading = false;
        this.hasError = true;
        this.toastService.showError('Unable to load products. Please check server connection.');
      },
    });
  }

  private loadStats(): void {
    this.productService.getDashboardStats().subscribe({
      next: (stats) => this.stats = stats,
      error: () => this.toastService.showError('Unable to load inventory summary.'),
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.clearSelection();
    this.syncQueryParams();
    this.loadProducts();
  }

  private syncQueryParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.statusFilter === 'All' ? null : this.statusFilter,
        category: this.selectedCategory === 'All' ? null : this.selectedCategory,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onFilterChange(): void {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      this.applyFilters();
    }, 250);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.selectedSort = '';
    this.statusFilter = 'All';
    this.page = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.loadProducts();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.loadProducts();
  }

  toggleSelection(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked && this.selectedIds.size >= 100 && !this.selectedIds.has(id)) {
      (event.target as HTMLInputElement).checked = false;
      this.toastService.showError('Bulk actions are limited to 100 products.');
      return;
    }
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
  }

  get allPageSelected(): boolean {
    return this.products.length > 0 && this.products.every((product) => this.selectedIds.has(product._id));
  }

  togglePageSelection(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const newSelections = this.products.filter((product) => !this.selectedIds.has(product._id)).length;
    if (checked && this.selectedIds.size + newSelections > 100) {
      (event.target as HTMLInputElement).checked = false;
      this.toastService.showError('Bulk actions are limited to 100 products.');
      return;
    }
    for (const product of this.products) {
      if (checked) this.selectedIds.add(product._id);
      else this.selectedIds.delete(product._id);
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  runBulkAction(): void {
    if (this.selectedIds.size === 0 || this.isBulkRunning) return;
    if (this.bulkActionType === 'delete') {
      this.isBulkDeletePending = true;
      this.isDeleteModalOpen = true;
      return;
    }

    const payload: BulkProductAction = { ids: [...this.selectedIds], action: this.bulkActionType };
    if (this.bulkActionType === 'category') {
      if (!this.bulkCategory.trim()) {
        this.toastService.showError('Choose a category before applying the bulk action.');
        return;
      }
      payload.category = this.bulkCategory.trim();
    } else {
      if (!this.bulkDelta || !Number.isInteger(this.bulkDelta) || !this.bulkReason.trim()) {
        this.toastService.showError('Enter a non-zero whole-number adjustment and a reason.');
        return;
      }
      payload.delta = this.bulkDelta;
      payload.reason = this.bulkReason.trim();
    }

    this.submitBulkAction(payload);
  }

  private submitBulkAction(payload: BulkProductAction): void {
    this.isBulkRunning = true;
    this.productService.bulkAction(payload).subscribe({
      next: (result) => {
        this.isBulkRunning = false;
        this.isDeleting = false;
        const skippedMessage = result.skippedCount > 0 ? `; ${result.skippedCount} skipped` : '';
        this.toastService.showSuccess(`${result.affectedCount} products updated${skippedMessage}.`);
        this.clearSelection();
        this.isBulkDeletePending = false;
        this.isDeleteModalOpen = false;
        this.loadProducts();
        this.loadStats();
      },
      error: (error) => {
        this.isBulkRunning = false;
        this.isDeleting = false;
        this.toastService.showError(error.error?.message || 'Unable to apply bulk action.');
      },
    });
  }

  importCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isImporting = true;
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => this.normalizeCsvHeader(header),
      complete: (result) => {
        if (result.errors.length > 0 || result.data.length === 0) {
          this.isImporting = false;
          this.toastService.showError('CSV could not be read. Check its headers and rows.');
          input.value = '';
          return;
        }

        const payload = result.data.map((row) => ({
          name: String(row['name'] ?? '').trim(),
          category: String(row['category'] ?? '').trim(),
          price: Number(row['price']),
          stockQuantity: Number(row['stockQuantity']),
          reorderPoint: row['reorderPoint'] === undefined || row['reorderPoint'] === '' ? 10 : Number(row['reorderPoint']),
          description: String(row['description'] ?? '').trim(),
        }));

        this.productService.importProducts(payload).subscribe({
          next: (count) => {
            this.isImporting = false;
            this.page = 1;
            this.loadProducts();
            this.loadStats();
            this.toastService.showSuccess(`${count} products imported.`);
            input.value = '';
          },
          error: (error) => {
            this.isImporting = false;
            const row = error.error?.errors?.[0]?.row;
            this.toastService.showError(row ? `Import validation failed at row ${row}.` : error.error?.message || 'Unable to import CSV.');
            input.value = '';
          },
        });
      },
    });
  }

  exportPdf(): void {
    this.isExportingPdf = true;
    this.productService.getAllProducts({
      search: this.searchQuery,
      category: this.selectedCategory,
      sort: this.selectedSort,
      status: this.statusFilter,
    }).subscribe({
      next: (products) => {
        if (products.length === 0) {
          this.isExportingPdf = false;
          this.toastService.showError('There are no matching products to export.');
          return;
        }
        this.productPdfService.exportInventory(products).then(() => {
          this.isExportingPdf = false;
        }).catch(() => {
          this.isExportingPdf = false;
          this.toastService.showError('Unable to generate the inventory PDF.');
        });
      },
      error: () => {
        this.isExportingPdf = false;
        this.toastService.showError('Unable to export the filtered inventory.');
      },
    });
  }

  downloadCsvTemplate(): void {
    const csv = Papa.unparse({ fields: ['name', 'category', 'price', 'stockQuantity', 'reorderPoint', 'description'], data: [] });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'gupio-import-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private normalizeCsvHeader(header: string): string {
    const words = header.trim().replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/[\s_-]+/);
    return words[0] + words.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.productToDelete = null;
    this.isDeleting = false;
    this.isBulkDeletePending = false;
  }

  confirmDelete(): void {
    if (this.isBulkDeletePending) {
      this.submitBulkAction({ ids: [...this.selectedIds], action: 'delete' });
      return;
    }
    if (!this.productToDelete) return;

    this.isDeleting = true;

    this.productService.deleteProduct(this.productToDelete._id).subscribe({
      next: () => {
        this.toastService.showSuccess('Product deleted successfully.');
        this.closeDeleteModal();
        this.loadProducts();
        this.loadStats();
      },
      error: (err) => {
        console.error('Failed to delete product:', err);
        this.isDeleting = false;
        this.toastService.showError('Unable to delete product. Please try again.');
      },
    });
  }
}
