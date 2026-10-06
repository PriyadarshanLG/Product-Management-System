import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const controller = new ProductController();

router.post('/', (req, res, next) => controller.createProduct(req, res, next));
router.post('/import', (req, res, next) => controller.importProducts(req, res, next));
router.post('/bulk', (req, res, next) => controller.bulkAction(req, res, next));
router.get('/', (req, res, next) => controller.getProducts(req, res, next));
router.get('/stats', (req, res, next) => controller.getDashboardStats(req, res, next));
router.post('/:id/adjustments', (req, res, next) => controller.adjustStock(req, res, next));
router.get('/:id', (req, res, next) => controller.getProductById(req, res, next));
router.put('/:id', (req, res, next) => controller.updateProduct(req, res, next));
router.delete('/:id', (req, res, next) => controller.deleteProduct(req, res, next));

export default router;
