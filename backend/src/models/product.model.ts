import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  reorderPoint: number;
  stockAdjustments: Array<{
    delta: number;
    reason: string;
    createdAt: Date;
  }>;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  stockStatus: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock quantity must be a whole number',
      },
    },
    reorderPoint: {
      type: Number,
      default: 10,
      min: [0, 'Reorder point cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Reorder point must be a whole number',
      },
    },
    stockAdjustments: [
      {
        delta: { type: Number, required: true },
        reason: { type: String, required: true, trim: true, maxlength: 160 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual for status based on the product-specific reorder point.
productSchema.virtual('stockStatus').get(function (this: IProduct) {
  if (this.stockQuantity === 0) {
    return 'Out of Stock';
  }
  if (this.stockQuantity >= 1 && this.stockQuantity <= (this.reorderPoint ?? 10)) {
    return 'Low Stock';
  }
  return 'In Stock';
});

// Index for efficient search queries on name and filtering on category
productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

export const Product = model<IProduct>('Product', productSchema);
