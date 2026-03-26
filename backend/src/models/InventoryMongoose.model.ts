// src/models/InventoryMongoose.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  itemName: string;
  quantity: number;
  minQuantity: number;
  location: string;
  supplier: string;
  unitPrice: number;
}

const InventorySchema = new Schema({
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  minQuantity: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  supplier: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  }
});

export default mongoose.model<IInventory>('Inventory', InventorySchema);