import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Vehicle } from '../../../../store/fleetStore';
import apiClient from '../../../apiClient';

export const getVehicles = createAsyncThunk(
  'vehicles/getVehicles',
  async (_, { rejectWithValue }: any) => {
    try {
      const data = await apiClient.get(`/Vehicle?Active=true`);
      console.log(data.data.data);

      return data.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const addVehicle = createAsyncThunk(
  'vehicles/addVehicle',
  async (vehicle: any, { rejectWithValue }: any) => {
    try {
      const data = vehicle;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeVehicle = createAsyncThunk(
  'vehicles/removeVehicle',
  async (vehicleId: string, { rejectWithValue }: any) => {
    try {
      const data = vehicleId;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState: {
    loading: false,
    error: null as string | null,
    vehicles: [] as Vehicle[],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getVehicles.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicles = action.payload;
      })
      .addCase(getVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vehicles';
      });

    builder
      .addCase(addVehicle.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicles = [action.payload, ...state.vehicles];
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add vehicle';
      });
    builder
      .addCase(removeVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicles = state.vehicles.filter(
          vehicle => vehicle.id !== action.payload,
        );
      })
      .addCase(removeVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove vehicle';
      })

      .addCase(removeVehicle.pending, state => {
        state.loading = true;
        state.error = null;
      });
  },
});

export default vehiclesSlice.reducer;
