import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../shared/services/toast.service';

/**
 * Custom Validator to check if a string contains non-whitespace content
 */
function nonWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const isWhitespace = (control.value || '').trim().length === 0;
  return isWhitespace ? { whitespace: true } : null;
}

/**
 * Custom Validator to verify integer value
 */
function integerValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value === null || control.value === undefined || control.value === '') return null;
  const isInt = Number.isInteger(Number(control.value));
  return isInt ? null : { notInteger: true };
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <!-- Navigation Header -->
      <div class="flex items-center justify-between">
        <a
          routerLink="/products"
          class="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Cancel & Return</span>
        </a>
      </div>

      <!-- Loading State for Edit mode -->
      <div *ngIf="isLoadingProduct" class="glass-panel p-12 rounded-3xl text-center space-y-4">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
        <p class="text-slate-400 text-sm font-medium">Fetching existing product details for editing...</p>
      </div>

      <!-- Form Panel -->
      <div *ngIf="!isLoadingProduct" class="glass-panel p-8 rounded-3xl border-slate-700/60 shadow-2xl space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">
            {{ isEditMode ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT' }}
          </h1>
          <p class="text-xs text-slate-400 mt-1">
            {{ isEditMode ? 'Modify product details in MongoDB persistence' : 'Enter complete details to register a new product item' }}
          </p>
        </div>

        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Product Name Field -->
          <div class="space-y-1.5">
            <label for="name" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Product Name <span class="text-rose-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="e.g. Wireless Headphones"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border text-white text-sm focus:outline-none transition"
              [ngClass]="{
                'border-rose-500/80 focus:ring-1 focus:ring-rose-500': isFieldInvalid('name'),
                'border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500': !isFieldInvalid('name')
              }"
            />
            <div *ngIf="isFieldInvalid('name')" class="text-xs text-rose-400 space-y-0.5 pt-0.5">
              <p *ngIf="productForm.get('name')?.hasError('required') || productForm.get('name')?.hasError('whitespace')">
                Product name is required and cannot be empty whitespace.
              </p>
              <p *ngIf="productForm.get('name')?.hasError('maxlength')">
                Product name cannot exceed 100 characters.
              </p>
            </div>
          </div>

          <!-- Category Field -->
          <div class="space-y-1.5">
            <label for="category" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Category <span class="text-rose-400">*</span>
            </label>
            <select
              id="category"
              formControlName="category"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border text-white text-sm focus:outline-none transition"
              [ngClass]="{
                'border-rose-500/80 focus:ring-1 focus:ring-rose-500': isFieldInvalid('category'),
                'border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500': !isFieldInvalid('category')
              }"
            >
              <option value="" disabled selected>Select a product category</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
            <div *ngIf="isFieldInvalid('category')" class="text-xs text-rose-400 pt-0.5">
              <p>Category is required.</p>
            </div>
          </div>

          <!-- Price & Stock Quantity Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <!-- Price Field -->
            <div class="space-y-1.5">
              <label for="price" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Price (₹) <span class="text-rose-400">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                formControlName="price"
                placeholder="e.g. 2499"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border text-white text-sm focus:outline-none transition"
                [ngClass]="{
                  'border-rose-500/80 focus:ring-1 focus:ring-rose-500': isFieldInvalid('price'),
                  'border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500': !isFieldInvalid('price')
                }"
              />
              <div *ngIf="isFieldInvalid('price')" class="text-xs text-rose-400 space-y-0.5 pt-0.5">
                <p *ngIf="productForm.get('price')?.hasError('required')">Price is required.</p>
                <p *ngIf="productForm.get('price')?.hasError('min')">Price must be greater than 0.</p>
              </div>
            </div>

            <!-- Stock Quantity Field -->
            <div class="space-y-1.5">
              <label for="stockQuantity" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Stock Quantity <span class="text-rose-400">*</span>
              </label>
              <input
                id="stockQuantity"
                type="number"
                step="1"
                formControlName="stockQuantity"
                placeholder="e.g. 25"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border text-white text-sm focus:outline-none transition"
                [ngClass]="{
                  'border-rose-500/80 focus:ring-1 focus:ring-rose-500': isFieldInvalid('stockQuantity'),
                  'border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500': !isFieldInvalid('stockQuantity')
                }"
              />
              <div *ngIf="isFieldInvalid('stockQuantity')" class="text-xs text-rose-400 space-y-0.5 pt-0.5">
                <p *ngIf="productForm.get('stockQuantity')?.hasError('required')">Stock quantity is required.</p>
                <p *ngIf="productForm.get('stockQuantity')?.hasError('min')">Stock quantity cannot be negative.</p>
                <p *ngIf="productForm.get('stockQuantity')?.hasError('notInteger')">Stock quantity must be a whole number.</p>
              </div>
            </div>

            <div class="space-y-1.5">
              <label for="reorderPoint" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Low-stock point <span class="text-rose-400">*</span>
              </label>
              <input
                id="reorderPoint"
                type="number"
                step="1"
                formControlName="reorderPoint"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border text-white text-sm focus:outline-none transition"
                [ngClass]="{
                  'border-rose-500/80 focus:ring-1 focus:ring-rose-500': isFieldInvalid('reorderPoint'),
                  'border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500': !isFieldInvalid('reorderPoint')
                }"
              />
              <div *ngIf="isFieldInvalid('reorderPoint')" class="text-xs text-rose-400 pt-0.5">
                Use a non-negative whole number.
              </div>
            </div>
          </div>

          <!-- Description Field -->
          <div class="space-y-1.5">
            <label for="description" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Description <span class="text-rose-400">*</span>
            </label>
            <textarea
              id="description"
              rows="4"
              formControlName="description"
              placeholder="Provide clear product features and details..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border text-white text-sm focus:outline-none transition"
              [ngClass]="{
                'border-rose-500/80 focus:ring-1 focus:ring-rose-500': isFieldInvalid('description'),
                'border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500': !isFieldInvalid('description')
              }"
            ></textarea>
            <div *ngIf="isFieldInvalid('description')" class="text-xs text-rose-400 space-y-0.5 pt-0.5">
              <p *ngIf="productForm.get('description')?.hasError('required') || productForm.get('description')?.hasError('whitespace')">
                Description is required and cannot be empty whitespace.
              </p>
              <p *ngIf="productForm.get('description')?.hasError('maxlength')">
                Description cannot exceed 1000 characters.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
            <a
              routerLink="/products"
              class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
            >
              Cancel
            </a>

            <button
              type="submit"
              [disabled]="isSubmitting"
              class="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/30 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Product' : 'Create Product') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  isLoadingProduct = false;
  isSubmitting = false;

  categories: string[] = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = id;
      this.loadProductData(id);
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100), nonWhitespaceValidator]],
      category: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stockQuantity: ['', [Validators.required, Validators.min(0), integerValidator]],
      reorderPoint: [10, [Validators.required, Validators.min(0), integerValidator]],
      description: ['', [Validators.required, Validators.maxLength(1000), nonWhitespaceValidator]],
    });
  }

  private loadProductData(id: string): void {
    this.isLoadingProduct = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          category: product.category,
          price: product.price,
          stockQuantity: product.stockQuantity,
          reorderPoint: product.reorderPoint ?? 10,
          description: product.description,
        });
        this.isLoadingProduct = false;
      },
      error: (err) => {
        console.error('Failed to load product for editing:', err);
        this.isLoadingProduct = false;
        this.toastService.showError('Unable to load product for editing.');
        this.router.navigate(['/products']);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.isSubmitting));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toastService.showError('Please fix all validation errors before submitting.');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      name: this.productForm.value.name.trim(),
      category: this.productForm.value.category.trim(),
      price: Number(this.productForm.value.price),
      stockQuantity: Number(this.productForm.value.stockQuantity),
      reorderPoint: Number(this.productForm.value.reorderPoint),
      description: this.productForm.value.description.trim(),
    };

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Product updated successfully.');
          this.isSubmitting = false;
          this.router.navigate(['/products', this.productId]);
        },
        error: (err) => {
          console.error('Failed to update product:', err);
          this.isSubmitting = false;
          const msg = err.error?.message || 'Unable to update product.';
          this.toastService.showError(msg);
        },
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: (created) => {
          this.toastService.showSuccess('Product created successfully.');
          this.isSubmitting = false;
          this.router.navigate(['/products', created._id]);
        },
        error: (err) => {
          console.error('Failed to create product:', err);
          this.isSubmitting = false;
          const msg = err.error?.message || 'Unable to create product.';
          this.toastService.showError(msg);
        },
      });
    }
  }
}
