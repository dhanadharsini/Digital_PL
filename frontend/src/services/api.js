import axios from 'axios';

// Determine if we are running locally
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use local backend URL if on localhost, otherwise use the environment variable
const VITE_API_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : (import.meta.env.VITE_API_URL || 'https://digital-pl-backend.onrender.com/api');

// Export base URLs for use in components (e.g., for profile photos)
export const BASE_API_URL = VITE_API_URL;
export const BASE_URL = VITE_API_URL.replace(/\/api$/, '');

export const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);