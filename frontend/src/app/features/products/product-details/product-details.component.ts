import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductPdfService } from '../../../core/services/product-pdf.service';
import { Product, StockAdjustment } from '../../../core/models/product.model';
import { ToastService } from '../../../shared/services/toast.service';
import { DeleteConfirmModalComponent } from '../../../shared/components/delete-confirm-modal/delete-confirm-modal.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DeleteConfirmModalComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <!-- Top Navigation -->
      <div class="flex items-center justify-between">
        <a
          routerLink="/products"
          class="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Back to Product List</span>
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="glass-panel p-12 rounded-2xl text-center space-y-4">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
        <p class="text-slate-400 text-sm font-medium">Fetching product details from server...</p>
      </div>

      <!-- Error / Missing Record State -->
      <div *ngIf="hasError && !isLoading" class="glass-panel p-10 rounded-2xl text-center space-y-4 border-rose-500/30">
        <div class="p-4 rounded-full bg-rose-500/10 text-rose-400 w-16 h-16 mx-auto flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-white">{{ errorMessage }}</h2>
        <p class="text-slate-400 text-sm max-w-md mx-auto">
          The requested product document does not exist in MongoDB or the ID format is invalid.
        </p>
        <div class="pt-2">
          <a
            routerLink="/products"
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
          >
            Return to Products Catalog
          </a>
        </div>
      </div>

      <!-- Details Card -->
      <div *ngIf="!isLoading && !hasError && product" class="glass-panel p-8 rounded-3xl space-y-8 border-slate-700/60 shadow-2xl relative overflow-hidden">
        <!-- Title & Badges Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span class="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
              {{ product.category }}
            </span>
            <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">
              {{ product.name }}
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Document ID: <code class="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">{{ product._id }}</code>
            </p>
          </div>

          <!-- Stock Badge -->
          <div class="shrink-0">
            <span
              class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border"
              [ngClass]="{
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': product.stockStatus === 'In Stock',
                'bg-amber-500/10 text-amber-400 border-amber-500/30': product.stockStatus === 'Low Stock',
                'bg-rose-500/10 text-rose-400 border-rose-500/30': product.stockStatus === 'Out of Stock'
              }"
            >
              <span
                class="w-2.5 h-2.5 rounded-full mr-2"
                [ngClass]="{
                  'bg-emerald-400': product.stockStatus === 'In Stock',
                  'bg-amber-400': product.stockStatus === 'Low Stock',
                  'bg-rose-400': product.stockStatus === 'Out of Stock'
                }"
              ></span>
              {{ product.stockStatus }}
            </span>
          </div>
        </div>

        <!-- Metrics Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Unit Price</span>
            <span class="text-3xl font-extrabold text-emerald-400">₹{{ product.price | number:'1.2-2' }}</span>
          </div>

          <div class="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Stock Quantity</span>
            <span class="text-3xl font-extrabold text-white">{{ product.stockQuantity }}</span>
            <span class="text-xs text-slate-400 ml-1">units available</span>
          </div>

          <div class="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 sm:col-span-2 lg:col-span-1">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Low-stock point</span>
            <span class="text-xl font-bold text-sky-300">{{ product.reorderPoint }} units</span>
          </div>
        </div>

        <section class="border-t border-slate-800 pt-6">
          <div class="mb-4">
            <h2 class="text-lg font-bold text-white">Adjust stock</h2>
            <p class="mt-1 text-sm text-slate-400">Record a received, issued, or corrected quantity with its reason.</p>
          </div>
          <form (ngSubmit)="submitStockAdjustment()" class="grid gap-3 md:grid-cols-[150px_1fr_auto]">
            <label class="text-xs font-semibold text-slate-500">
              Quantity change
              <input name="adjustmentDelta" type="number" step="1" [(ngModel)]="adjustmentDelta" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800" placeholder="e.g. 12 or -3" />
            </label>
            <label class="text-xs font-semibold text-slate-500">
              Reason
              <input name="adjustmentReason" type="text" maxlength="160" [(ngModel)]="adjustmentReason" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800" placeholder="Purchase order, damaged goods, count correction..." />
            </label>
            <button type="submit" [disabled]="isAdjusting" class="self-end rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {{ isAdjusting ? 'Saving...' : 'Record adjustment' }}
            </button>
          </form>
        </section>

        <section class="border-t border-slate-800 pt-6">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-bold text-white">Adjustment history</h2>
            <span class="text-xs text-slate-400">{{ adjustmentHistory.length }} entries</span>
          </div>
          <p *ngIf="adjustmentHistory.length === 0" class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No stock adjustments recorded yet.</p>
          <div *ngIf="adjustmentHistory.length > 0" class="overflow-x-auto rounded-lg border border-slate-200">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs text-slate-500">
                <tr><th class="px-4 py-2.5">Change</th><th class="px-4 py-2.5">Reason</th><th class="px-4 py-2.5">Recorded</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr *ngFor="let entry of adjustmentHistory">
                  <td class="px-4 py-3 font-semibold" [ngClass]="entry.delta > 0 ? 'text-emerald-700' : 'text-rose-700'">{{ entry.delta > 0 ? '+' : '' }}{{ entry.delta }} units</td>
                  <td class="px-4 py-3 text-slate-700">{{ entry.reason }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ entry.createdAt | date:'medium' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Description Section -->
        <div class="space-y-2">
          <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider">Product Description</h3>
          <div class="p-5 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-slate-200 leading-relaxed text-sm whitespace-pre-line">
            {{ product.description }}
          </div>
        </div>

        <!-- Timestamps Audit Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800">
          <div>
            <span class="text-slate-500 font-semibold block">Created Timestamp:</span>
            <span>{{ product.createdAt | date:'medium' }}</span>
          </div>
          <div class="sm:text-right">
            <span class="text-slate-500 font-semibold block">Last Updated:</span>
            <span>{{ product.updatedAt | date:'medium' }}</span>
          </div>
        </div>

        <!-- Action Buttons Footer -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <a
            routerLink="/products"
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition inline-flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span>Back</span>
          </a>

          <div class="flex items-center space-x-3">
            <button
              type="button"
              (click)="exportProductPdf()"
              [disabled]="isExportingPdf"
              class="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
            >
              {{ isExportingPdf ? 'Preparing PDF...' : 'Export PDF' }}
            </button>
            <a
              [routerLink]="['/products', product._id, 'edit']"
              class="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-600/30 transition inline-flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Edit Product</span>
            </a>

            <button
              type="button"
              (click)="isDeleteModalOpen = true"
              class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition inline-flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span>Delete Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal Component -->
    <app-delete-confirm-modal
      [isOpen]="isDeleteModalOpen"
      [productName]="product?.name || ''"
      [isDeleting]="isDeleting"
      (confirm)="confirmDelete()"
      (cancel)="isDeleteModalOpen = false"
    ></app-delete-confirm-modal>
  `,
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  hasError = false;
  errorMessage = 'Product Not Found';

  isDeleteModalOpen = false;
  isDeleting = false;
  isExportingPdf = false;
  adjustmentDelta: number | null = null;
  adjustmentReason = '';
  isAdjusting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private productPdfService: ProductPdfService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }
    this.loadProduct(id);
  }

  get adjustmentHistory(): StockAdjustment[] {
    return [...(this.product?.stockAdjustments ?? [])].reverse();
  }

  exportProductPdf(): void {
    if (!this.product || this.isExportingPdf) return;
    this.isExportingPdf = true;
    this.productPdfService.exportProduct(this.product).then(() => {
      this.isExportingPdf = false;
    }).catch(() => {
      this.isExportingPdf = false;
      this.toastService.showError('Unable to generate the product PDF.');
    });
  }

  submitStockAdjustment(): void {
    const delta = Number(this.adjustmentDelta);
    const reason = this.adjustmentReason.trim();
    if (!this.product || !Number.isInteger(delta) || delta === 0 || !reason) {
      this.toastService.showError('Enter a non-zero whole-number change and a reason.');
      return;
    }

    this.isAdjusting = true;
    this.productService.adjustStock(this.product._id, delta, reason).subscribe({
      next: (updated) => {
        this.product = updated;
        this.adjustmentDelta = null;
        this.adjustmentReason = '';
        this.isAdjusting = false;
        this.toastService.showSuccess('Stock adjustment recorded.');
      },
      error: (error) => {
        this.isAdjusting = false;
        this.toastService.showError(error.status === 409 ? 'Adjustment would make stock negative.' : 'Unable to record stock adjustment.');
      },
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
        this.isLoading = false;
        this.hasError = true;
        if (err.status === 404) {
          this.errorMessage = 'Product Not Found';
        } else if (err.status === 400) {
          this.errorMessage = 'Invalid Product ID Format';
        } else {
          this.errorMessage = 'Unable to Load Product Details';
        }
      },
    });
  }

  confirmDelete(): void {
    if (!this.product) return;

    this.isDeleting = true;

    this.productService.deleteProduct(this.product._id).subscribe({
      next: () => {
        this.toastService.showSuccess('Product deleted successfully.');
        this.isDeleteModalOpen = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Failed to delete product:', err);
        this.isDeleting = false;
        this.toastService.showError('Unable to delete product. Please try again.');
      },
    });
  }
}
