import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import {
  validateBulkProductAction,
  validateProductInput,
  validateStockAdjustment,
  validateObjectId,
} from '../validators/product.validator';

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isValid, errors } = validateProductInput(req.body);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }

      const newProduct = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: newProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category, sort, status, page, limit } = req.query;

      const products = await productService.getProducts({
        search: typeof search === 'string' ? search : undefined,
        category: typeof category === 'string' ? category : undefined,
        sort: typeof sort === 'string' ? sort : undefined,
        status: typeof status === 'string' ? status : undefined,
        page: typeof page === 'string' ? Number(page) : undefined,
        limit: typeof limit === 'string' ? Number(limit) : undefined,
      });

      res.status(200).json({
        success: true,
        data: products.products,
        count: products.total,
        pagination: {
          page: products.page,
          limit: products.limit,
          totalPages: products.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!validateObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid product ID format' });
        return;
      }

      const { isValid, errors } = validateStockAdjustment(req.body);
      if (!isValid) {
        res.status(400).json({ success: false, message: 'Validation failed', errors });
        return;
      }

      const product = await productService.adjustStock(id, req.body.delta, req.body.reason);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      if (product === 'insufficient-stock') {
        res.status(409).json({ success: false, message: 'Adjustment would make stock negative' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async bulkAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isValid, errors } = validateBulkProductAction(req.body);
      if (!isValid) {
        res.status(400).json({ success: false, message: 'Validation failed', errors });
        return;
      }

      const result = await productService.bulkAction(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async importProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { products } = req.body;
      if (!Array.isArray(products) || products.length === 0 || products.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Import must contain between 1 and 500 products',
        });
        return;
      }

      const rowErrors = products.flatMap((product, index) => {
        const validation = validateProductInput(product);
        return validation.errors.map((error) => ({ ...error, row: index + 1 }));
      });
      if (rowErrors.length > 0) {
        res.status(400).json({ success: false, message: 'Import validation failed', errors: rowErrors });
        return;
      }

      const created = await productService.importProducts(products);
      res.status(201).json({ success: true, data: { importedCount: created.length } });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await productService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID format',
        });
        return;
      }

      const product = await productService.getProductById(id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID format',
        });
        return;
      }

      const { isValid, errors } = validateProductInput(req.body);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }

      const updatedProduct = await productService.updateProduct(id, req.body);
      if (!updatedProduct) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid product ID format',
        });
        return;
      }

      const deletedProduct = await productService.deleteProduct(id);
      if (!deletedProduct) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
