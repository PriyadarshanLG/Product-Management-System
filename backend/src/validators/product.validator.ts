import { isValidObjectId } from 'mongoose';

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  reorderPoint?: number;
  description: string;
}

export interface BulkProductActionInput {
  ids: string[];
  action: 'delete' | 'category' | 'adjustStock';
  category?: string;
  delta?: number;
  reason?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export const validateProductInput = (data: any): { isValid: boolean; errors: ValidationErrorDetail[] } => {
  const errors: ValidationErrorDetail[] = [];

  // Name validation
  if (data.name === undefined || data.name === null || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Product name is required.' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Product name cannot exceed 100 characters.' });
  }

  // Category validation
  if (data.category === undefined || data.category === null || typeof data.category !== 'string' || data.category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required.' });
  }

  // Price validation
  if (data.price === undefined || data.price === null || typeof data.price !== 'number' || isNaN(data.price)) {
    errors.push({ field: 'price', message: 'Price is required and must be a valid number.' });
  } else if (data.price <= 0) {
    errors.push({ field: 'price', message: 'Price must be greater than 0.' });
  }

  // Stock Quantity validation
  if (data.stockQuantity === undefined || data.stockQuantity === null || typeof data.stockQuantity !== 'number' || isNaN(data.stockQuantity)) {
    errors.push({ field: 'stockQuantity', message: 'Stock quantity is required and must be a valid number.' });
  } else {
    if (data.stockQuantity < 0) {
      errors.push({ field: 'stockQuantity', message: 'Stock quantity cannot be negative.' });
    }
    if (!Number.isInteger(data.stockQuantity)) {
      errors.push({ field: 'stockQuantity', message: 'Stock quantity must be a whole number.' });
    }
  }

  if (data.reorderPoint !== undefined) {
    if (typeof data.reorderPoint !== 'number' || !Number.isInteger(data.reorderPoint) || data.reorderPoint < 0) {
      errors.push({ field: 'reorderPoint', message: 'Reorder point must be a non-negative whole number.' });
    }
  }

  // Description validation
  if (data.description === undefined || data.description === null || typeof data.description !== 'string' || data.description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required.' });
  } else if (data.description.trim().length > 1000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateStockAdjustment = (data: any): { isValid: boolean; errors: ValidationErrorDetail[] } => {
  const errors: ValidationErrorDetail[] = [];

  if (typeof data.delta !== 'number' || !Number.isInteger(data.delta) || data.delta === 0) {
    errors.push({ field: 'delta', message: 'Adjustment must be a non-zero whole number.' });
  }
  if (typeof data.reason !== 'string' || data.reason.trim() === '' || data.reason.trim().length > 160) {
    errors.push({ field: 'reason', message: 'A reason of 1 to 160 characters is required.' });
  }

  return { isValid: errors.length === 0, errors };
};

export const validateBulkProductAction = (data: any): { isValid: boolean; errors: ValidationErrorDetail[] } => {
  const errors: ValidationErrorDetail[] = [];
  const allowedActions = ['delete', 'category', 'adjustStock'];

  if (!Array.isArray(data.ids) || data.ids.length === 0 || data.ids.length > 100) {
    errors.push({ field: 'ids', message: 'Select between 1 and 100 products.' });
  } else {
    if (data.ids.some((id: unknown) => typeof id !== 'string' || !isValidObjectId(id))) {
      errors.push({ field: 'ids', message: 'Every product ID must be valid.' });
    }
    if (new Set(data.ids).size !== data.ids.length) {
      errors.push({ field: 'ids', message: 'Product IDs must be unique.' });
    }
  }

  if (!allowedActions.includes(data.action)) {
    errors.push({ field: 'action', message: 'Choose a supported bulk action.' });
  }
  if (data.action === 'category' && (typeof data.category !== 'string' || data.category.trim() === '' || data.category.trim().length > 100)) {
    errors.push({ field: 'category', message: 'A category of 1 to 100 characters is required.' });
  }
  if (data.action === 'adjustStock') {
    const adjustment = validateStockAdjustment(data);
    errors.push(...adjustment.errors);
  }

  return { isValid: errors.length === 0, errors };
};

export const validateObjectId = (id: string): boolean => {
  return isValidObjectId(id);
};
