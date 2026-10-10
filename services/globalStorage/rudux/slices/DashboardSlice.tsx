import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../../apiClient';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async ({ branch }: { branch: string }, { rejectWithValue }) => {
    console.log('Dashboard Branch=', branch);
    try {
      // https://aiapi.dishaayein.com/api/Dashboard?branch=FLEET
      const response = await apiClient.get(`/Dashboard?branch=${branch}`);
      const data = response.data;
      console.log('Dashboard Data=', data);
      return data.data;
    } catch (error: any) {
      console.log('Dashboard Error=', error.response);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch dashboard data';
      return rejectWithValue(message);
    }
  },
);

const DashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    totalVehicles: 0,
    tyresInStock: 0,
    tyreFitments: {
      required: 0,
      fitted: 0,
    },
    pendingFitments: 0,
    statistics: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.statistics = action.payload;
    });
    builder.addCase(fetchDashboardData.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchDashboardData.pending, state => {
      state.loading = true;
      state.error = null;
    });
  },
});

export default DashboardSlice.reducer;
