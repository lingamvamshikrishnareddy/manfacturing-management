// src/models/ShiftMongoose.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  shiftName: string;
  startTime: string;
  endTime: string;
  description?: string;
  isActive: boolean;
}

const ShiftSchema = new Schema({
  shiftName: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IShift>('Shift', ShiftSchema);