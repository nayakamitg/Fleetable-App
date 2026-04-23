import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Tire } from '../../../../store/fleetStore';
import apiClient from '../../../apiClient';

export const getTyres = createAsyncThunk(
  'tyres/getTyres',
  async ({ vehicleId }: { vehicleId: string }, { rejectWithValue }: any) => {
    try {
      const data = await apiClient.get(`/Tyre/vehicle/${vehicleId}`);
      return data.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const getTyresPossition = createAsyncThunk(
  'tyres/getTyresPossition',
  async (vehicleId: string, { rejectWithValue }: any) => {
    try {
      console.log('vehicleId', vehicleId);
      const data = await apiClient.get(`/TyrePlacement/vehicle/${vehicleId}`);

      //        data.data=     {
      //   "success": true,
      //   "vehicleNo": "KK12BK1234",
      //   "count": 3,
      //   "data": [
      //     {
      //       "truckNo": "KK12BK1234",
      //       "tyreId": "6",
      //       "position": "P6",
      //       "assignPoint": "FLEET",
      //       "assignBy": "e000001",
      //       "assignDate": "2026-02-09T19:08:06",
      //       "assignOdo": "504000",
      //       "deassignPoint": null,
      //       "deassignBy": null,
      //       "deassignDate": null,
      //       "deassignOdo": null,
      //       "removalDate": null,
      //       "fitmentDate": "2026-02-09T19:08:06",
      //       "odometerId": null,
      //       "assignOdometerId": "odo0000152",
      //       "deassignOdometerId": null,
      //       "deallotmentReason": null,
      //       "nsd": "20",
      //       "divisionId": "divR1",
      //       "positionCode": "1R",
      //       "positionName": "1 RIGHT",
      //       "modelId": "M0024",
      //       "assignDateFormatted": "09/02/2026",
      //       "deassignDateFormatted": null,
      //       "removalDateFormatted": null,
      //       "fitmentDateFormatted": "09/02/2026",
      //       "isActive": true,
      //       "statusText": "Active",
      //       "daysInService": 0,
      //       "odoRun": null
      //     },
      //     {
      //       "truckNo": "KK12BK1234",
      //       "tyreId": "1",
      //       "position": "P3",
      //       "assignPoint": "FLEET",
      //       "assignBy": "E000028",
      //       "assignDate": "2025-08-06T22:11:56",
      //       "assignOdo": "66000",
      //       "deassignPoint": null,
      //       "deassignBy": null,
      //       "deassignDate": null,
      //       "deassignOdo": null,
      //       "removalDate": null,
      //       "fitmentDate": "2025-08-06T22:11:56",
      //       "odometerId": null,
      //       "assignOdometerId": "odo0000094",
      //       "deassignOdometerId": null,
      //       "deallotmentReason": null,
      //       "nsd": "20",
      //       "divisionId": "divL14",
      //       "positionCode": "2LO",
      //       "positionName": "2 LEFT OUTER",
      //       "modelId": "M0024",
      //       "assignDateFormatted": "06/08/2025",
      //       "deassignDateFormatted": null,
      //       "removalDateFormatted": null,
      //       "fitmentDateFormatted": "06/08/2025",
      //       "isActive": true,
      //       "statusText": "Active",
      //       "daysInService": 186,
      //       "odoRun": null
      //     },
      //     {
      //       "truckNo": "KK12BK1234",
      //       "tyreId": "7",
      //       "position": "P11",
      //       "assignPoint": "FLEET",
      //       "assignBy": "e000001",
      //       "assignDate": "2026-02-09T19:22:59",
      //       "assignOdo": "750000",
      //       "deassignPoint": null,
      //       "deassignBy": null,
      //       "deassignDate": null,
      //       "deassignOdo": null,
      //       "removalDate": null,
      //       "fitmentDate": "2026-02-09T19:22:59",
      //       "odometerId": null,
      //       "assignOdometerId": "odo0000153",
      //       "deassignOdometerId": null,
      //       "deallotmentReason": null,
      //       "nsd": "20",
      //       "divisionId": "divS1",
      //       "positionCode": "SNEY",
      //       "positionName": "Stepney Tire",
      //       "modelId": "M0024",
      //       "assignDateFormatted": "09/02/2026",
      //       "deassignDateFormatted": null,
      //       "removalDateFormatted": null,
      //       "fitmentDateFormatted": "09/02/2026",
      //       "isActive": true,
      //       "statusText": "Active",
      //       "daysInService": 0,
      //       "odoRun": null
      //     }
      //   ]
      // }

      return data.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

interface TireInspectionPayload {
  inspectionNo: string;
  inspectionDate: string;
  inspectionFor: string;
  action: string;
  details: Array<{
    tyreId: number;
    nsd: string;
    nsdAt: string;
    truckNo: string;
    tyrePosition: string;
    nsdDate: string;
    leftNsd: string;
    rightNsd: string;
    truckOdo: string;
    psi: string;
    valveCap: string;
    remark1: string;
    remark2: string;
    tyrePics: string;
    odometerId: string;
  }>;
}

export const addTireInspection = createAsyncThunk(
  'tyres/addTireInspection',
  async (payload: TireInspectionPayload, { rejectWithValue }: any) => {
    try {
      console.log(
        'Dispatching Tire Inspection Payload:',
        JSON.stringify(payload, null, 2),
      );

      const response = await apiClient.post(`/TyreInspection`, payload);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      console.log('Tire Inspection Error:', message);
      return rejectWithValue(message);
    }
  },
);

const tyreSlice = createSlice({
  name: 'tyres',
  initialState: {
    loading: false,
    error: null as string | null,
    tyres: [] as Tire[],
    tyresPossition: [] as Tire[],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getTyres.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTyres.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.tyres = action.payload;
      })
      .addCase(getTyres.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tyres';
      })
      .addCase(getTyresPossition.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTyresPossition.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.tyresPossition = action.payload;
      })
      .addCase(getTyresPossition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tyres';
      })
      .addCase(addTireInspection.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTireInspection.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.tyres = action.payload;
      })
      .addCase(addTireInspection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tyres';
      });
  },
});

export default tyreSlice.reducer;
