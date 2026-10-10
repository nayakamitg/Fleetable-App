import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../../apiClient';
import { convertToStandardDate } from '../../../../components/Others/Functions';

export interface VehicleIssue {
  issueId: string;
  vehicleNo: string;
  dateOfReport: string;
  subject: string;
  note: string;
  odoRead: string;
  workshop: string;
  status: string;
  statusText: string;
  base64Image?: string | null;
  type?: string;
}

export const getVehicleIssues = createAsyncThunk(
  'vehicleIssue/getVehicleIssues',
  async (vehicleNo: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/VehicleIssue?VehicleNo=${vehicleNo}`);
      const data = res.data.data;
      return data as VehicleIssue[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get vehicle issues');
    }
  },
);

export const addVehicleIssue = createAsyncThunk(
  'vehicleIssue/addVehicleIssue',
  async (issues: Partial<VehicleIssue>[], { rejectWithValue }) => {
    try {
      console.log('Issues==>', issues);
      await Promise.all(
        issues.map(issue =>
          apiClient.post(`/VehicleIssue`, {
            vehicleNo: issue.vehicleNo,
            dateOfReport: convertToStandardDate(issue.dateOfReport),  // dd/mm/yyyy
            subject: issue.subject,
            note: issue.note,
            odoRead: issue.odoRead,
            workshop: issue.workshop,
            overdueDate: '',
            overdueOdo: '',
          }),
        ),
      );

      return issues;
    } catch (error: any) {
      console.log('AddVehicleIssueError==>', error);
      return rejectWithValue(
        JSON.stringify(error) || 'Failed to add vehicle issue',
      );
    }
  },
);

export const removeVehicleIssue = createAsyncThunk(
  'vehicleIssue/removeVehicleIssue',
  async (issueId: string, { rejectWithValue }) => {
    try {
      console.log('IssueId==>', issueId);
      const res = await apiClient.delete(`/VehicleIssue?IssueId=${issueId}`);
      if (res.status === 200 || res.status === 204) {
        return issueId;
      }
      return rejectWithValue('Failed to remove vehicle issue');
    } catch (error: any) {
      console.log('RemoveVehicleIssueError==>', error);
      return rejectWithValue(error.message || 'Failed to remove vehicle issue');
    }
  },
);

export const updateVehicleIssue = createAsyncThunk(
  'vehicleIssue/updateVehicleIssue',
  async (issue: VehicleIssue, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/VehicleIssue`, issue);
      const data = res.data.data;
      return data as VehicleIssue;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update vehicle issue');
    }
  },
);

const vehicleIssueSlice = createSlice({
  name: 'vehicleIssue',
  initialState: {
    vehicleIssues: [] as VehicleIssue[],
    loading: false,
    addLoading: false,
    added: false,
    error: null as string | null,
  },
  reducers: {
    resetAdded: state => {
      state.added = false;
    },
    resetError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getVehicleIssues.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehicleIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicleIssues = action.payload;
      })
      .addCase(getVehicleIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to get vehicle issues';
      })
      .addCase(addVehicleIssue.pending, state => {
        console.log('Pending==>');
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addVehicleIssue.fulfilled, (state, action) => {
        console.log('Success==>', action.payload);
        state.addLoading = false;
        state.error = null;
        state.vehicleIssues = [
          ...(action.payload as VehicleIssue[]),
          ...state.vehicleIssues,
        ];
        state.added = true;
      })
      .addCase(addVehicleIssue.rejected, (state, action) => {
        console.log('Failed==>', action.payload);
        state.addLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to add vehicle issue';
      })
      .addCase(removeVehicleIssue.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeVehicleIssue.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicleIssues = state.vehicleIssues.filter(
          issue => issue.issueId !== action.payload,
        );
      })
      .addCase(removeVehicleIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to remove vehicle issue';
      })
      .addCase(updateVehicleIssue.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicleIssue.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicleIssues = state.vehicleIssues.map(issue =>
          issue.issueId === action.payload.issueId ? action.payload : issue,
        );
      })
      .addCase(updateVehicleIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to update vehicle issue';
      });
  },
});

export const { resetAdded, resetError } = vehicleIssueSlice.actions;
const { reducer } = vehicleIssueSlice;
export default reducer;
