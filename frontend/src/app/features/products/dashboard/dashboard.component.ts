import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { DashboardStats, Product } from '../../../core/models/product.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <section class="border-b border-[#e3e9e5] pb-6">
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div class="max-w-2xl">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#718078]">Inventory operations</span>
            </div>
            <h1 class="text-3xl font-bold leading-tight text-[#1e2b26] md:text-[34px]">Inventory overview</h1>
            <p class="mt-1.5 max-w-xl text-sm text-slate-400">An at-a-glance view of your catalog, stock levels, and items that need attention.</p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <a
              routerLink="/products/new"
              class="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-500"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Add product</span>
            </a>

            <a
              routerLink="/products"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <span>Manage inventory</span>
              <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <div *ngIf="isLoading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div *ngFor="let i of [1,2,3,4]" class="glass-panel h-34 animate-pulse rounded-2xl p-6">
          <div class="mb-4 h-4 w-1/2 rounded bg-slate-700/60"></div>
          <div class="mb-2 h-8 w-1/3 rounded bg-slate-700/80"></div>
          <div class="h-3 w-3/4 rounded bg-slate-800"></div>
        </div>
      </div>

      <div *ngIf="hasError && !isLoading" class="glass-panel rounded-2xl border border-rose-500/30 p-8 text-center">
        <svg class="mx-auto mb-3 h-12 w-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="mb-1 text-lg font-bold text-white">Unable to load dashboard statistics</h3>
        <p class="mb-4 text-sm text-slate-400">Verify the backend API and database are online before retrying.</p>
        <button
          (click)="loadStats()"
          class="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Retry load
        </button>
      </div>

      <div *ngIf="!isLoading && !hasError" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <a routerLink="/products" class="dashboard-action-card glass-panel group relative block overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-sky-500/40" aria-label="View all products">
          <div class="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-sky-500/10 blur-xl group-hover:bg-sky-500/20"></div>
          <div class="relative mb-2 flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total items</span>
            <div class="rounded-xl bg-sky-500/10 p-2.5 text-sky-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
          <div class="relative text-3xl font-extrabold text-white">{{ stats?.totalProducts || 0 }}</div>
          <p class="relative mt-1 text-xs text-slate-400">Catalog entries</p>
        </a>

        <a routerLink="/products" [queryParams]="{ status: 'In Stock' }" class="dashboard-action-card glass-panel group relative block overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-500/40" aria-label="View in-stock products">
          <div class="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20"></div>
          <div class="relative mb-2 flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">In stock</span>
            <div class="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="relative text-3xl font-extrabold text-emerald-300">{{ stats?.inStock || 0 }}</div>
          <p class="relative mt-1 text-xs text-emerald-400/80">Above reorder point</p>
        </a>

        <a routerLink="/products" [queryParams]="{ status: 'Low Stock' }" class="dashboard-action-card glass-panel group relative block overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-amber-500/40" aria-label="View low-stock products">
          <div class="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-500/20"></div>
          <div class="relative mb-2 flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Reorder alerts</span>
            <div class="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
          <div class="relative text-3xl font-extrabold text-amber-300">{{ stats?.lowStock || 0 }}</div>
          <p class="relative mt-1 text-xs text-amber-400/80">Items needing review</p>
        </a>

        <a routerLink="/products" [queryParams]="{ status: 'Out of Stock' }" class="dashboard-action-card glass-panel group relative block overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-rose-500/40" aria-label="View out-of-stock products">
          <div class="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-rose-500/10 blur-xl group-hover:bg-rose-500/20"></div>
          <div class="relative mb-2 flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">Critical stock</span>
            <div class="rounded-xl bg-rose-500/10 p-2.5 text-rose-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
            </div>
          </div>
          <div class="relative text-3xl font-extrabold text-rose-300">{{ stats?.outOfStock || 0 }}</div>
          <p class="relative mt-1 text-xs text-rose-400/80">Stock at zero</p>
        </a>
      </div>

      <div *ngIf="!isLoading && !hasError" class="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div class="glass-panel rounded-2xl p-5">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Stock profile</p>
              <h2 class="mt-2 text-xl font-bold text-white">Stock coverage</h2>
            </div>
            <span class="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">{{ healthScore }}% of catalog</span>
          </div>

          <div class="space-y-4">
            <div>
              <div class="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Products with more than 10 units</span>
                <span>{{ healthScore }}%</span>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-400" [style.width.%]="healthScore"></div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Retail value on hand</p>
                <p class="mt-3 text-2xl font-bold text-white">₹{{ inventoryValue | number:'1.0-0' }}</p>
              </div>
              <div class="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Avg. price</p>
                <p class="mt-3 text-2xl font-bold text-sky-300">₹{{ averagePrice | number:'1.0-0' }}</p>
              </div>
              <div class="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Priority items</p>
                <p class="mt-3 text-2xl font-bold text-amber-300">{{ priorityItems }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-panel rounded-2xl p-5">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Category mix</p>
          <h2 class="mt-2 text-xl font-bold text-white">By category</h2>

          <div class="mt-4 space-y-3">
            <a *ngFor="let category of categoryBreakdown" routerLink="/products" [queryParams]="{ category: category.name }" class="dashboard-action-card block space-y-1.5 rounded-md p-1 no-underline transition hover:bg-slate-50">
              <div class="flex items-center justify-between text-xs text-slate-300">
                <span>{{ category.name }}</span>
                <span>{{ category.count }}</span>
              </div>
              <div class="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div class="h-full rounded-full" [style.width.%]="category.share" [style.background]="category.color"></div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !hasError" class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div class="glass-panel rounded-2xl p-5">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Actions needed</p>
              <h2 class="mt-2 text-xl font-bold text-white">Stock to review</h2>
            </div>
          </div>

          <div class="space-y-3">
            <div *ngIf="criticalProducts.length === 0" class="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-400">
              No stock risks detected. Inventory is in a healthy state.
            </div>

            <a *ngFor="let item of criticalProducts" [routerLink]="['/products', item._id]" class="dashboard-action-card flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/30 p-3 no-underline transition hover:bg-slate-50">
              <div>
                <p class="font-semibold text-white">{{ item.name }}</p>
                <p class="text-xs text-slate-400">{{ item.category }} • {{ item.stockQuantity }} units</p>
              </div>
              <span
                class="rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]"
                [ngClass]="{
                  'border-amber-500/30 bg-amber-500/10 text-amber-300': item.stockStatus === 'Low Stock',
                  'border-rose-500/30 bg-rose-500/10 text-rose-300': item.stockStatus === 'Out of Stock'
                }"
              >
                {{ item.stockStatus }}
              </span>
            </a>
          </div>
        </div>

        <div class="glass-panel rounded-2xl p-5">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Latest updates</p>
              <h2 class="mt-2 text-xl font-bold text-white">Recent products</h2>
            </div>
            <a routerLink="/products" class="text-xs font-semibold text-sky-300 hover:text-sky-200">View all</a>
          </div>

          <div class="space-y-3">
            <a *ngFor="let product of recentProducts" [routerLink]="['/products', product._id]" class="dashboard-action-card flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/30 p-3 no-underline transition hover:bg-slate-50">
              <div>
                <p class="font-semibold text-white">{{ product.name }}</p>
                <p class="text-xs text-slate-400">{{ product.category }} • {{ product.stockQuantity }} in stock</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-emerald-400">₹{{ product.price | number:'1.2-2' }}</p>
                <p class="text-[10px] uppercase tracking-[0.15em] text-slate-500">{{ product.stockStatus }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  products: Product[] = [];
  isLoading = true;
  hasError = false;

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  get inventoryValue(): number {
    return this.stats?.retailValue ?? 0;
  }

  get averagePrice(): number {
    if (this.products.length === 0) return 0;
    return this.products.reduce((sum, product) => sum + product.price, 0) / this.products.length;
  }

  get healthScore(): number {
    if (!this.stats || this.stats.totalProducts === 0) return 0;
    const score = (this.stats.inStock / this.stats.totalProducts) * 100;
    return Math.min(100, Math.round(score));
  }

  get priorityItems(): number {
    return this.products.filter((product) => product.stockStatus !== 'In Stock').length;
  }

  get criticalProducts(): Product[] {
    return this.products
      .filter((product) => product.stockStatus !== 'In Stock')
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 4);
  }

  get recentProducts(): Product[] {
    return [...this.products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }

  get categoryBreakdown(): Array<{ name: string; count: number; share: number; color: string }> {
    const counts = this.products.reduce<Record<string, number>>((memo, product) => {
      memo[product.category] = (memo[product.category] || 0) + 1;
      return memo;
    }, {});

    const entries = Object.entries(counts)
      .map(([name, count], index) => ({
        name,
        count,
        share: this.products.length ? (count / this.products.length) * 100 : 0,
        color: ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf'][index % 6],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return entries;
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.hasError = false;

    this.productService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadProductSnapshot();
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
        this.isLoading = false;
        this.hasError = true;
        this.toastService.showError('Unable to load real-time statistics from backend API.');
      },
    });
  }

  private loadProductSnapshot(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load product snapshot:', err);
        this.isLoading = false;
        this.hasError = true;
        this.toastService.showError('Unable to load inventory snapshot.');
      },
    });
  }
}
