import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchInventory, addInventoryItem } from '../actions/inventoryActions';
import { InventoryState, InventoryItem } from '../../types';

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  lowStockItems: [],
  categories: [],
  searchTerm: '',
  filters: {
    category: '',
    status: '',
    location: '',
  },
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<InventoryState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    updateItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        item.lastUpdated = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalItems = action.payload.length;
        state.lowStockItems = action.payload.filter((item: InventoryItem) => item.quantity <= item.minStock);
        // FIX: Replaced spread syntax with Array.from() for broader compatibility.
        state.categories = Array.from(new Set(action.payload.map((item: InventoryItem) => item.category)));
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      })
      .addCase(addInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.totalItems += 1;
      })
      .addCase(addInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add inventory item';
      });
  },
});

export const { setSearchTerm, setFilters, clearError, updateItemQuantity } = inventorySlice.actions;
export default inventorySlice.reducer;