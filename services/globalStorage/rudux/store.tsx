import { configureStore } from '@reduxjs/toolkit';
import vehiclesReducer from './slices/vehiclesSlice';
import vehicleIssuesReducer from './slices/vehicleIssueSlice';
import fuelEntryReducer from './slices/fuelEntrySlice';
import tyreReducer from './slices/tyreSlice';
import loginReducer from './slices/loginSlice';
import dashboardReducer from './slices/DashboardSlice';
import slipReducer from './slices/SlipSlice';
const store = configureStore({
  reducer: {
    vehicles: vehiclesReducer,
    vehicleIssues: vehicleIssuesReducer,
    fuelEntry: fuelEntryReducer,
    tyres: tyreReducer,
    login: loginReducer,
    dashboard: dashboardReducer,
    slip: slipReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
