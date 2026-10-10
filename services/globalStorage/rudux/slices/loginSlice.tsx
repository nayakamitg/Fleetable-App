import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../../apiClient';

interface UserCredentials {
  username: string;
  password: string;
  companyId: string;
  userId: string;
  captchaToken: string;
}

interface Company {
  companyId: string;
  companyName: string;
  userId: string;
  userName: string;
}

export const Login = createAsyncThunk(
  'login',
  async (userCredentials: UserCredentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/Auth/login`, userCredentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    user: null as any,
    loading: false,
    error: null as string | null,
    loggedIn: false,
    requiresCompanySelection: false,
    companies: [] as Company[],
  },
  reducers: {
    // Restores full user object from AsyncStorage into Redux on app reopen
    setUser: (state, action) => {
      state.user = action.payload;
      state.loggedIn = !!action.payload;
    },
    clearLoginState: state => {
      state.error = null;
      state.requiresCompanySelection = false;
      state.companies = [];
    },
    logout: state => {
      state.user = null;
      state.loggedIn = false;
      state.requiresCompanySelection = false;
      state.companies = [];
      // Fire-and-forget: clear all persisted session data
      AsyncStorage.multiRemove([
        'token',
        'user_credentials',
        'user_logged_in',
        'login_timestamp',
      ]);
    },
  },
  extraReducers: builder => {
    builder.addCase(Login.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(Login.fulfilled, (state, action) => {
      state.loading = false;
      const data = action.payload;

      if (data.isSuccess && data.requiresCompanySelection) {
        state.requiresCompanySelection = true;
        state.companies = data.companies;
      } else if (data.isSuccess && data.token) {
        state.user = data;
        state.loggedIn = true;
        state.requiresCompanySelection = false;
        state.companies = [];

        // Persist full user data so it can be restored on app reopen
        AsyncStorage.setItem('token', data.token);
        AsyncStorage.setItem('user_credentials', JSON.stringify(data)); // save full data, not just sessionData
        AsyncStorage.setItem('user_logged_in', 'true');
        AsyncStorage.setItem('login_timestamp', Date.now().toString());
      } else {
        state.error = data.message || 'Login failed';
      }
    });
    builder.addCase(Login.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) ||
        action.error.message ||
        'An error occurred';
    });
  },
});

export const { setUser, clearLoginState, logout } = loginSlice.actions;
export default loginSlice.reducer;
