import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../../apiClient';

export interface FuelEntryPayload {
  truckNo: string;
  odometerId: string;
  date: string;
  fuel: number;
  rateOfFuel: number;
  vendor: string;
  partialFill: boolean;
  tripId: string;
  note: string;
  amount: number;
  transactionId: string;
  importFrom: string;
  settlementId: string;
  ftlTripId: string;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  igstPercent: number;
  igstAmount: number;
  tax1Percent: number;
  tax1Amount: number;
  tax2Percent: number;
  tax2Amount: number;
  taxableAmount: number;
  netAmount: number;
  fuelType: string;
}

export const addFuelEntry = createAsyncThunk(
  'fuelEntry/addFuelEntry',
  async (payload: FuelEntryPayload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/FuelEntry`, payload);
      console.log('Fuel add success', JSON.stringify(res.data));
      const newResponce = {
        fuelId: '0',
        truckNo: payload.truckNo,
        date: payload.date,
        fuel: payload.fuel,
        amount: payload.amount,
        vendor: payload.vendor,
        fuelType: payload.fuelType,
        dateFormatted: payload.date,
      };
      return newResponce;
    } catch (error: any) {
      console.log('Fuel add error', JSON.stringify(error));
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to add fuel entry',
      );
    }
  },
);

export const fetchFuelHistory = createAsyncThunk(
  'fuelEntry/fetchFuelHistory',
  async (vehicleNo: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/FuelEntry/truck/${vehicleNo}`);
      console.log('Fuel history success', JSON.stringify(res.data));
      return res.data.data;
    } catch (error: any) {
      console.log('Fuel history error', JSON.stringify(error));
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch fuel history',
      );
    }
  },
);

const fuelEntrySlice = createSlice({
  name: 'fuelEntry',
  initialState: {
    loading: false,
    success: false,
    error: null as string | null,
    historyData: [] as any[],
    historyLoading: false,
    historyError: null as string | null,
  },
  reducers: {
    resetFuelEntryState: state => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
    resetFuelHistory: state => {
      state.historyData = [];
      state.historyLoading = false;
      state.historyError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addFuelEntry.pending, state => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addFuelEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.historyData = [action.payload, ...state.historyData];
        state.historyLoading = false;
        state.historyError = null;
      })
      .addCase(addFuelEntry.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFuelHistory.pending, state => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchFuelHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = action.payload || [];
        state.historyError = null;
      })
      .addCase(fetchFuelHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { resetFuelEntryState, resetFuelHistory } = fuelEntrySlice.actions;
export default fuelEntrySlice.reducer;
