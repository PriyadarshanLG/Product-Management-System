import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/products/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard - Gupio Product Management System',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Products Catalog - Gupio Product Management System',
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./features/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'Add Product - Gupio Product Management System',
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-details/product-details.component').then((m) => m.ProductDetailsComponent),
    title: 'Product Details - Gupio Product Management System',
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./features/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'Edit Product - Gupio Product Management System',
  },
  { path: '**', redirectTo: 'products' },
];
