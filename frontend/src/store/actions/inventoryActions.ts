// store/actions/inventoryActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { InventoryItem } from '../../types';

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async () => {
    const response = await fetch('/api/inventory');
    return response.json();
  }
);

export const addInventoryItem = createAsyncThunk(
  'inventory/addItem',
  async (item: Partial<InventoryItem>) => {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return response.json();
  }
);
