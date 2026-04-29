// src/routes/inventory.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import StockController from '../controllers/inventory/StockController';
import SupplierController from '../controllers/inventory/SupplierController';
import Inventory from '../models/InventoryMongoose.model';

const router = Router();

router.use(authMiddleware);

// ─── Stock / Items ────────────────────────────────────────────────────────────
router.get('/stock', StockController.getStock);
router.put('/stock/:id', StockController.updateStock);

// /items alias (maps to same model as stock)
router.get('/items', StockController.getStock);
router.post('/items', async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ message: 'Item added', data: item });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
});
router.put('/items/:id', StockController.updateStock);

// ─── Suppliers ────────────────────────────────────────────────────────────────
router.get('/suppliers', SupplierController.getSuppliers);
router.post('/suppliers', SupplierController.addSupplier);
router.put('/suppliers/:id', async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
});

// ─── Material Requests ────────────────────────────────────────────────────────
// Using a simple document store — requests stored in inventory with type field
router.get('/requests', async (req, res) => {
  try {
    const requests = await Inventory.find({ type: 'material_request' }).sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});
router.post('/requests', async (req, res) => {
  try {
    const request = await Inventory.create({
      ...req.body,
      type: 'material_request',
      itemName: req.body.item ?? req.body.itemName ?? 'Unknown',
      quantity: req.body.quantityRequested ?? req.body.quantity ?? 0,
      minQuantity: 0,
      location: req.body.department ?? 'N/A',
      supplier: req.body.requestedBy ?? 'Internal',
      unitPrice: 0,
    });
    res.status(201).json({ message: 'Request submitted', data: request });
  } catch (error: any) {
    res.status(500).json({ message: 'Error submitting request', error: error.message });
  }
});

// ─── Overview ────────────────────────────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const total = await Inventory.countDocuments();
    const lowStock = await Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$minQuantity'] } });
    res.json({ total, lowStock });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching overview', error: error.message });
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────
router.get('/reports/export', async (req, res) => {
  try {
    const items = await Inventory.find({});
    const headers = ['itemName,quantity,minQuantity,location,supplier,unitPrice'];
    const rows = items.map(i => `${i.itemName},${i.quantity},${i.minQuantity},${i.location},${i.supplier},${i.unitPrice}`);
    const csv = [...headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting', error: error.message });
  }
});

export default router;