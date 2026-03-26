// src/models/QualityMongoose.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuality extends Document {
  batchId: string;
  inspectionDate: Date;
  inspectedBy: string;
  defectType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

const QualitySchema = new Schema({
  batchId: {
    type: String,
    required: true
  },
  inspectionDate: {
    type: Date,
    required: true
  },
  inspectedBy: {
    type: String,
    required: true,
    ref: 'Employee'
  },
  defectType: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    required: true,
    default: 'open'
  }
});

export default mongoose.model<IQuality>('Quality', QualitySchema);