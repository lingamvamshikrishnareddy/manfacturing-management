import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchBatches, addBatch } from '../actions/productionActions';
import { ProductionState, ProductionBatch } from '../../types';

const initialState: ProductionState = {
  batches: [],
  orders: [],
  loading: false,
  error: null,
  totalBatches: 0,
  activeBatches: [],
  completedBatches: [],
  schedules: [],
  currentShift: undefined,
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    setCurrentShift: (state, action) => {
      state.currentShift = action.payload;
    },
    updateBatchStatus: (state, action: PayloadAction<{ id: string; status: ProductionBatch['status'] }>) => {
      const batch = state.batches.find(batch => batch.id === action.payload.id);
      if (batch) {
        batch.status = action.payload.status;
        if (action.payload.status === 'completed') {
          batch.actualEndDate = new Date().toISOString();
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload;
        state.totalBatches = action.payload.length;
        state.activeBatches = action.payload.filter((batch: ProductionBatch) => 
          batch.status === 'in-progress' || batch.status === 'planned'
        );
        state.completedBatches = action.payload.filter((batch: ProductionBatch) => 
          batch.status === 'completed'
        );
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch batches';
      })
      .addCase(addBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.push(action.payload);
        state.totalBatches += 1;
      })
      .addCase(addBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add batch';
      });
  },
});

export const { setCurrentShift, updateBatchStatus, clearError } = productionSlice.actions;
export default productionSlice.reducer;