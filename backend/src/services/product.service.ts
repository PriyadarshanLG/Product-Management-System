import { Product, IProduct } from '../models/product.model';
import { BulkProductActionInput, ProductInput } from '../validators/product.validator';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  sort?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProductPage {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  retailValue: number;
}

export class ProductService {
  async createProduct(data: ProductInput): Promise<IProduct> {
    const product = new Product({
      name: data.name.trim(),
      category: data.category.trim(),
      price: data.price,
      stockQuantity: data.stockQuantity,
      reorderPoint: data.reorderPoint,
      description: data.description.trim(),
    });
    return await product.save();
  }

  async getProducts(params: ProductQueryParams): Promise<ProductPage> {
    const filter: Record<string, any> = {};

    if (params.search && params.search.trim() !== '') {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.name = searchRegex;
    }

    if (params.category && params.category.trim() !== '' && params.category !== 'All') {
      filter.category = params.category.trim();
    }

    if (params.status === 'Out of Stock') {
      filter.stockQuantity = 0;
    } else if (params.status === 'Low Stock') {
      filter.$expr = {
        $and: [
          { $gt: ['$stockQuantity', 0] },
          { $lte: ['$stockQuantity', { $ifNull: ['$reorderPoint', 10] }] },
        ],
      };
    } else if (params.status === 'In Stock') {
      filter.$expr = { $gt: ['$stockQuantity', { $ifNull: ['$reorderPoint', 10] }] };
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (params.sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (params.sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    const requestedPage = Number(params.page);
    const requestedLimit = Number(params.limit);
    const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, Math.floor(requestedLimit))) : 25;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOptions).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async updateProduct(id: string, data: ProductInput): Promise<IProduct | null> {
    const update: Record<string, unknown> = {
      name: data.name.trim(),
      category: data.category.trim(),
      price: data.price,
      stockQuantity: data.stockQuantity,
      description: data.description.trim(),
    };
    if (data.reorderPoint !== undefined) update.reorderPoint = data.reorderPoint;

    return await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  async adjustStock(id: string, delta: number, reason: string): Promise<IProduct | null | 'insufficient-stock'> {
    const product = await Product.findOneAndUpdate(
      { _id: id, ...(delta < 0 ? { stockQuantity: { $gte: Math.abs(delta) } } : {}) },
      {
        $inc: { stockQuantity: delta },
        $push: { stockAdjustments: { $each: [{ delta, reason: reason.trim(), createdAt: new Date() }], $slice: -100 } },
      },
      { new: true, runValidators: true }
    );

    if (product) return product;
    return (await Product.exists({ _id: id })) ? 'insufficient-stock' : null;
  }

  async bulkAction(data: BulkProductActionInput): Promise<{ affectedCount: number; skippedCount: number }> {
    const ids = data.ids;

    if (data.action === 'delete') {
      const result = await Product.deleteMany({ _id: { $in: ids } });
      return { affectedCount: result.deletedCount, skippedCount: ids.length - result.deletedCount };
    }

    if (data.action === 'category') {
      const result = await Product.updateMany({ _id: { $in: ids } }, { $set: { category: data.category!.trim() } });
      return { affectedCount: result.modifiedCount, skippedCount: ids.length - result.modifiedCount };
    }

    const delta = data.delta!;
    const filter = { _id: { $in: ids }, ...(delta < 0 ? { stockQuantity: { $gte: Math.abs(delta) } } : {}) };
    const result = await Product.updateMany(
      filter,
      {
        $inc: { stockQuantity: delta },
        $push: {
          stockAdjustments: {
            $each: [{ delta, reason: data.reason!.trim(), createdAt: new Date() }],
            $slice: -100,
          },
        },
      }
    );
    return { affectedCount: result.modifiedCount, skippedCount: ids.length - result.modifiedCount };
  }

  async importProducts(data: ProductInput[]): Promise<IProduct[]> {
    return await Product.insertMany(data.map((item) => ({
      name: item.name.trim(),
      category: item.category.trim(),
      price: item.price,
      stockQuantity: item.stockQuantity,
      reorderPoint: item.reorderPoint ?? 10,
      description: item.description.trim(),
    })));
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return await Product.findByIdAndDelete(id);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const allProducts = await Product.find({}, 'stockQuantity reorderPoint price');
    const totalProducts = allProducts.length;

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let retailValue = 0;

    for (const p of allProducts) {
      retailValue += p.price * p.stockQuantity;
      if (p.stockQuantity === 0) {
        outOfStock++;
      } else if (p.stockQuantity >= 1 && p.stockQuantity <= (p.reorderPoint ?? 10)) {
        lowStock++;
      } else {
        inStock++;
      }
    }

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      retailValue,
    };
  }
}
