import { Request, Response } from 'express';
// Assuming Supplier model doesn't exist, using Inventory for now
import Inventory from '../../models/InventoryMongoose.model';

class SupplierController {
  async getSuppliers(req: Request, res: Response) {
    try {
      // For now, return empty array or implement supplier logic
      const suppliers = await Inventory.find({ type: 'supplier' });
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
  }

  async addSupplier(req: Request, res: Response) {
    try {
      const supplier = await Inventory.create({ ...req.body, type: 'supplier' });
      res.status(201).json(supplier);
    } catch (error: any) {
      res.status(500).json({ message: 'Error adding supplier', error: error.message });
    }
  }
}

export default new SupplierController();
