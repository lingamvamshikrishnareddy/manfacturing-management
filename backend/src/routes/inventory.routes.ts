// src/routes/Inventory.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import StockController from '../controllers/inventory/StockController';
import SupplierController from '../controllers/inventory/SupplierController';

const router = Router();

router.use(authMiddleware);

// Stock routes
router.get('/stock', StockController.getStock);
router.put('/stock/:id', StockController.updateStock);

// Supplier routes
router.get('/suppliers', SupplierController.getSuppliers);
router.post('/suppliers', SupplierController.addSupplier);

export default router;