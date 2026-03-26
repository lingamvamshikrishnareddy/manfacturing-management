import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductionBatch } from '../../types';

export const fetchBatches = createAsyncThunk(
  'production/fetchBatches',
  async () => {
    const response = await fetch('/api/batches');
    return response.json();
  }
);

export const addBatch = createAsyncThunk(
  'production/addBatch',
  async (batch: Partial<ProductionBatch>) => {
    const response = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    return response.json();
  }
);
