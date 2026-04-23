import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_BASE_URL = Config.API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AsyncStorage.getItem('token')}`,
  },
});

// Request interceptor to add the token to every request
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
  error => {
    return Promise.reject(error);
  },
);

export default apiClient;
