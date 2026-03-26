import { Request, Response } from 'express';
import Inventory from '../../models/InventoryMongoose.model';

class StockController {
  async getStock(req: Request, res: Response) {
    try {
      const stock = await Inventory.find();
      res.json(stock);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching stock', error: error.message });
    }
  }

  async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await Inventory.findByIdAndUpdate(id, req.body, { new: true });
      if (updated) {
        const inventory = await Inventory.findById(updated._id);
        res.json(inventory);
      } else {
        res.status(404).json({ message: 'Inventory item not found' });
      }
    } catch (error: any) {
      res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
  }
}

export default new StockController();
