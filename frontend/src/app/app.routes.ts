import { Routes } from '@angular/router';
import { adminAuthGuard, signedOutGuard } from './core/auth/admin-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [signedOutGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Admin Sign In - Gupio Inventory Workspace',
  },
  {
    path: 'dashboard',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/products/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard - Gupio Product Management System',
  },
  {
    path: 'products',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/products/product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Products Catalog - Gupio Product Management System',
  },
  {
    path: 'products/new',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'Add Product - Gupio Product Management System',
  },
  {
    path: 'products/:id',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/products/product-details/product-details.component').then((m) => m.ProductDetailsComponent),
    title: 'Product Details - Gupio Product Management System',
  },
  {
    path: 'products/:id/edit',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/products/product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'Edit Product - Gupio Product Management System',
  },
  { path: '**', redirectTo: 'products' },
];
