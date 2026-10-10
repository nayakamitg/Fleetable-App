import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { navigateToLogin } from '../navigation/navigationRef';

const API_BASE_URL = Config.API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach fresh token to every request
apiClient.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor — auto-logout on 401 (expired / invalid token)
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401) {
      // Clear stored session
      await AsyncStorage.multiRemove([
        'token',
        'user_credentials',
        'user_logged_in',
        'login_timestamp',
      ]);
      // Clear Redux state (dynamic require to avoid require cycle)
      const store = require('./globalStorage/rudux/store').default;
      const { logout } = require('./globalStorage/rudux/slices/loginSlice');
      store.dispatch(logout());
      // Navigate to Login screen
      navigateToLogin();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
