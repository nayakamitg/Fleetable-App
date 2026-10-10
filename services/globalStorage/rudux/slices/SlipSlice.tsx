import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../../apiClient';

export const uploadSlip = createAsyncThunk(
  'slip/uploadSlip',
  async ({ imageUri, promptId }: { imageUri: string, promptId?: string }, { rejectWithValue }) => {
    try {
      const formDataBody = new FormData();
      formDataBody.append('image', {
        uri: imageUri,
        name: 'trip_slip_' + Date.now() + '.jpg',
        type: 'image/jpeg',
      } as any);

      if (promptId) {
        formDataBody.append('promptId', promptId);
      }

      const response = await apiClient.post(
        '/SlipToTrip/smart/ocr/upload',
        formDataBody,
        {
          headers: {
            accept: 'text/plain',
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const data = response.data;
      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.error || 'Failed to extract data');
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'An error occurred during slip analysis.',
      );
    }
  },
);

export const saveSlip = createAsyncThunk(
  'slip/saveSlip',
  async (payload: any, { rejectWithValue }) => {
    try {
     
      const response = await apiClient.post('/SlipToTrip/postscan', payload);
      const data = response.data;
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to save slip';
      console.log('error',error.response);
      return rejectWithValue(message);
    }
  },
);

export const getPrompts = createAsyncThunk(
  'slip/getPrompts',
  async (_, { rejectWithValue }) => {
    try {
     
      const response = await apiClient.get('/SlipToTrip/prompts');
      console.log('Prompt response.data:', response.data);
      const data = response.data?.data || response.data || [];
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get prompts';
      console.log('error',error.response);
      return rejectWithValue(message);
    }
  },
);

const slipSlice = createSlice({
  name: 'slip',
  initialState: {
    loading: false,
    saving: false,
    error: null as string | null,
    slipData: null as any,
    prompts:[] as any[],
    promptLoading:false,
    promptError:null as any | null,
    
  },
  reducers: {
    clearSlipData: state => {
      state.slipData = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadSlip.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadSlip.fulfilled, (state, action) => {
        state.loading = false;
        state.slipData = action.payload;
        state.error = null;
      })
      .addCase(uploadSlip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveSlip.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveSlip.fulfilled, state => {
        state.saving = false;
        state.error = null;
      })
      .addCase(saveSlip.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(getPrompts.pending, state => {
        state.promptLoading = true;
        state.promptError = null;
      })
      .addCase(getPrompts.fulfilled, (state, action) => {
        state.promptLoading = false;
        state.prompts = action.payload;
        state.promptError = null;
      })
      .addCase(getPrompts.rejected, (state, action) => {
        state.promptLoading = false;
        state.promptError = action.payload as any;
      });
  },
});

export const { clearSlipData } = slipSlice.actions;
export default slipSlice.reducer;
